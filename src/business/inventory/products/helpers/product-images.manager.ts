import {
	Injectable,
	Logger,
	BadRequestException,
	NotFoundException,
	InternalServerErrorException,
} from "@nestjs/common";
import { ImagesService } from "business/photos/images/images.service";
import { PhotoOfEnum } from "business/common/photo.type";
import { Product } from "../entities/index.entity";
import { ImageOrderDto } from "../dto/image-order.dto";

@Injectable()
export class ProductImagesManager {
	private readonly logger = new Logger(ProductImagesManager.name);

	constructor(private readonly imagesService: ImagesService) {}

	/**
	 * Obtiene todas las imágenes de un producto ordenadas por prioridad
	 */
	async getProductImages(id_product: string) {
		return this.imagesService.findRelationsByIdOrdered({
			photoOf: PhotoOfEnum.PRODUCTS,
			id_relation: id_product,
		});
	}

	/**
	 * Agrega nuevas imágenes a un producto
	 * @returns Resultado con imágenes creadas y errores si los hay
	 */
	async addImages(id_product: string, photos: Express.Multer.File[] | string[]) {
		if (!photos?.length) {
			throw new BadRequestException("Debe proporcionar al menos una imagen");
		}

		return this.imagesService.createManyImages(photos, PhotoOfEnum.PRODUCTS, id_product);
	}

	/**
	 * Reordena las imágenes de un producto
	 */
	async reorderImages(id_product: string, imageOrders: ImageOrderDto[]) {
		if (!imageOrders?.length) {
			throw new BadRequestException("Debe proporcionar al menos un cambio de orden");
		}

		return this.imagesService.reorderImages(id_product, PhotoOfEnum.PRODUCTS, imageOrders);
	}

	/**
	 * Actualiza el orden de una imagen específica
	 */
	async updateImageOrder(id_image: string, newOrder: number) {
		if (newOrder < 0) {
			throw new BadRequestException("El orden debe ser un número positivo");
		}

		return this.imagesService.updateImageOrder(id_image, newOrder);
	}

	/**
	 * Elimina una imagen específica de un producto
	 */
	async deleteImage(id_product: string, id_image: string) {
		const image = await this.imagesService.findOneById(
			{
				id_image,
				photoOf: PhotoOfEnum.PRODUCTS,
			},
			false,
		);

		if (!image) {
			throw new NotFoundException(`Imagen con ID "${id_image}" no encontrada`);
		}

		if (image.id_relation !== id_product) {
			throw new BadRequestException(`La imagen no pertenece al producto con ID "${id_product}"`);
		}

		// deleteRelation espera id_image como id_relation cuando se elimina una imagen individual
		return this.imagesService.deleteRelation(id_image, PhotoOfEnum.PRODUCTS);
	}

	/**
	 * Elimina todas las imágenes de un producto (usado al eliminar producto)
	 */
	async deleteAllImages(id_product: string): Promise<void> {
		try {
			await this.imagesService.deleteRelation(id_product, PhotoOfEnum.PRODUCTS, false);
		} catch (error) {
			throw error();
		}
	}

	/**
	 * Procesa imágenes de forma asíncrona (para create/update)
	 * No bloquea la respuesta al usuario
	 */
	processImagesAsync(productId: string, photos?: Express.Multer.File[] | string[]) {
		if (!photos?.length) return;

		this.imagesService
			.createManyImages(photos, PhotoOfEnum.PRODUCTS, productId)
			.then((result) => {
				const hasErrors = "errors" in result && result.errors && result.errors?.length > 0;

				if (hasErrors) {
					this.logger.warn(
						`Imágenes procesadas con ${result.errors!.length} errores para producto ${productId}`,
					);
				} else {
					this.logger.log(
						`${result.results.length} imágenes procesadas exitosamente para producto ${productId}`,
					);
				}
			})
			.catch((error) => {
				this.logger.error(
					`Error procesando imágenes para producto ${productId}: ${error.message}`,
					error.stack,
				);
			});
	}

	/**
	 * Enriquece un producto con sus imágenes
	 */
	async enrichProductWithImages(product: Product) {
		try {
			const images = await this.getProductImages(product.id_product);

			return {
				...product,
				images: images.map((img) => ({
					id_image: img.id_image,
					url: img.url,
					order: img.order,
				})),
			};
		} catch (error) {
			this.logger.warn(
				`Error cargando imágenes para producto ${product.id_product}: ${error.message}`,
			);
			return { ...product, images: [] };
		}
	}

	/**
	 * Enriquece múltiples productos con sus imágenes en paralelo
	 */
	async enrichProductsWithImages(products: Product[]) {
		if (!products.length) return [];

		return Promise.all(products.map((product) => this.enrichProductWithImages(product)));
	}

	/**
	 * Verifica si un producto tiene imágenes
	 */
	async hasImages(id_product: string): Promise<boolean> {
		const images = await this.getProductImages(id_product);
		return images.length > 0;
	}

	/**
	 * Obtiene el conteo de imágenes de un producto
	 */
	async getImageCount(id_product: string): Promise<number> {
		const images = await this.getProductImages(id_product);
		return images.length;
	}
}
