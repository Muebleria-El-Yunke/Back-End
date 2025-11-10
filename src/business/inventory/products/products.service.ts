import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PhotoOfEnum } from "business/common/photo.type";
import { Image } from "business/photos/images/entities/image.entity";
import { ImagesService } from "business/photos/images/images.service";
import { PaginationDto } from "core/dto/pagination.dto";
import { PaginationOptions } from "core/utils/paginatioFindAll";
import { FindManyOptions, MoreThan, Repository } from "typeorm";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Dimension } from "./entities/dimension.entity";
import { Product } from "./entities/product.entity";
import { Tag } from "./entities/tag.entity";
import { Category } from "./enum/category.enum";

@Injectable()
export class ProductsService {
	constructor(
		@InjectRepository(Product)
		private readonly productRepository: Repository<Product>,
		@InjectRepository(Dimension)
		private readonly dimensionRepository: Repository<Dimension>,
		@InjectRepository(Tag)
		private readonly tagRepository: Repository<Tag>,
		private readonly imagesService: ImagesService,
	) {}

	async create(createProductDto: CreateProductDto) {
		// Generar slug si no se proporciona
		if (!createProductDto.slug && createProductDto.title) {
			createProductDto.slug = await this.#generateUniqueSlug(createProductDto.title);
		}

		// Crear producto
		const product = this.productRepository.create({
			title: createProductDto.title,
			description: createProductDto.description,
			price: createProductDto.price,
			category: createProductDto.category,
			stock: createProductDto.stock,
			weight: createProductDto.weight,
			imageIds: createProductDto.imageIds,
			active: createProductDto.active,
			featured: createProductDto.featured,
			slug: createProductDto.slug,
		});

		const savedProduct = await this.productRepository.save(product);

		// Crear dimensiones si existen
		if (createProductDto.dimension) {
			const dimension = this.dimensionRepository.create({
				...createProductDto.dimension,
				product: savedProduct,
			});
			await this.dimensionRepository.save(dimension);
		}

		// Crear tags si existen
		if (createProductDto.tags && createProductDto.tags.length > 0) {
			const tags = createProductDto.tags.map((tagDto) =>
				this.tagRepository.create({
					name: tagDto.name,
					color: tagDto.color,
					product: savedProduct,
				}),
			);
			await this.tagRepository.save(tags);
		}

		return this.findOne(savedProduct.id_product);
	}

	async findAll(paginationDto?: PaginationDto) {
		return this.#findProductsWithOptions({ order: { createdAt: "DESC" } }, paginationDto);
	}

	async findActive(paginationDto?: PaginationDto) {
		return this.#findProductsWithOptions(
			{
				where: { active: true },
				order: { createdAt: "DESC" },
			},
			paginationDto,
		);
	}

	async findFeatured(paginationDto?: PaginationDto) {
		return this.#findProductsWithOptions(
			{
				where: { active: true, featured: true },
				order: { createdAt: "DESC" },
			},
			paginationDto,
		);
	}

	async findByCategory(category: Category, paginationDto?: PaginationDto) {
		return this.#findProductsWithOptions(
			{
				where: { category, active: true },
				order: { createdAt: "DESC" },
			},
			paginationDto,
		);
	}
	async findInStock(paginationDto?: PaginationDto) {
		return this.#findProductsWithOptions(
			{
				where: { active: true, stock: MoreThan(0) },
				order: { createdAt: "DESC" },
			},
			paginationDto,
		);
	}

	async findBySlug(slug: string) {
		const product = await this.productRepository.findOne({
			where: { slug },
			relations: ["dimension", "tags"],
		});

		if (!product) {
			throw new NotFoundException(`Producto con slug ${slug} no encontrado`);
		}

		const enriched = await this.#enrichProductsWithImages([product]);
		return enriched[0];
	}

	async findOne(id_product: string) {
		const product = await this.productRepository.findOne({
			where: { id_product },
			relations: ["dimension", "tags"],
		});

		if (!product) {
			throw new NotFoundException(`Producto con ID ${id_product} no encontrado`);
		}

		// Enriquecer con imágenes ordenadas
		const enriched = await this.#enrichProductsWithImages([product]);
		return enriched[0];
	}
	async update(id_product: string, updateProductDto: UpdateProductDto) {
		const product = await this.findOne(id_product);

		// Actualizar slug si se cambia el título
		if (
			updateProductDto.title &&
			!updateProductDto.slug &&
			updateProductDto.title !== product.title
		) {
			updateProductDto.slug = await this.#generateUniqueSlug(updateProductDto.title, id_product);
		}

		// Actualizar producto
		Object.assign(product, {
			title: updateProductDto.title ?? product.title,
			description: updateProductDto.description ?? product.description,
			price: updateProductDto.price ?? product.price,
			category: updateProductDto.category ?? product.category,
			stock: updateProductDto.stock ?? product.stock,
			weight: updateProductDto.weight ?? product.weight,
			imageIds: updateProductDto.imageIds ?? product.imageIds,
			active: updateProductDto.active ?? product.active,
			featured: updateProductDto.featured ?? product.featured,
			slug: updateProductDto.slug ?? product.slug,
		});

		await this.productRepository.save(product);

		// Actualizar dimensiones
		if (updateProductDto.dimension && product.dimension) {
			Object.assign(product.dimension, updateProductDto.dimension);
			await this.dimensionRepository.save(product.dimension);
		} else if (updateProductDto.dimension && !product.dimension) {
			const dimension = this.dimensionRepository.create({
				...updateProductDto.dimension,
				product,
			});
			await this.dimensionRepository.save(dimension);
		}

		// Actualizar tags
		if (updateProductDto.tags) {
			// Eliminar tags existentes
			await this.tagRepository.delete({ product: { id_product } });

			// Crear nuevos tags
			if (updateProductDto.tags.length > 0) {
				const tags = updateProductDto.tags.map((tagDto) =>
					this.tagRepository.create({
						name: tagDto.name,
						color: tagDto.color,
						product,
					}),
				);
				await this.tagRepository.save(tags);
			}
		}

		return this.findOne(id_product);
	}

	async remove(id_product: string): Promise<void> {
		const product = await this.findOne(id_product);

		// Eliminar imágenes asociadas
		await this.imagesService.deleteRelation(
			id_product,
			PhotoOfEnum.PRODUCTS,
			false, // No lanzar error si no hay imágenes
		);

		await this.productRepository.remove(product);
	}

	async toggleActive(id: string) {
		const product = await this.findOne(id);
		product.active = !product.active;
		return await this.productRepository.save(product);
	}

	async toggleFeatured(id: string) {
		const product = await this.findOne(id);
		product.featured = !product.featured;
		return await this.productRepository.save(product);
	}

	async updateStock(id: string, quantity: number) {
		const product = await this.findOne(id);
		product.stock = quantity;
		return await this.productRepository.save(product);
	}

	async decrementStock(id: string, quantity: number) {
		const product = await this.findOne(id);

		if (product.stock < quantity) {
			throw new NotFoundException(`Stock insuficiente. Disponible: ${product.stock}`);
		}

		product.stock -= quantity;
		return await this.productRepository.save(product);
	}

	async incrementStock(id: string, quantity: number) {
		const product = await this.findOne(id);
		product.stock += quantity;
		return await this.productRepository.save(product);
	}

	// Métodos para gestionar imágenes del producto
	async getProductImages(id_product: string) {
		return await this.imagesService.findRelationsByIdOrdered({
			photoOf: PhotoOfEnum.PRODUCTS,
			id_relation: id_product,
		});
	}

	async addProductImages(id_product: string, photos: Express.Multer.File[] | string[]) {
		// Verificar que el producto existe
		await this.findOne(id_product);

		return await this.imagesService.createManyImages(photos, PhotoOfEnum.PRODUCTS, id_product);
	}

	async reorderProductImages(
		id_product: string,
		imageOrders: { id_image: string; order: number }[],
	) {
		// Verificar que el producto existe
		await this.findOne(id_product);

		return await this.imagesService.reorderImages(id_product, PhotoOfEnum.PRODUCTS, imageOrders);
	}

	async deleteProductImage(id_product: string, id_image: string) {
		// Verificar que el producto existe
		await this.findOne(id_product);

		const image = (await this.imagesService.findOneById({
			id_image,
			photoOf: PhotoOfEnum.PRODUCTS,
		})) as Image;

		if (image.id_relation !== id_product) {
			throw new NotFoundException(`La imagen no pertenece al producto con ID ${id_product}`);
		}

		return await this.imagesService.delete({
			photoOf: PhotoOfEnum.PRODUCTS,
			id_relation: id_product,
		});
	}

	// ! Private
	async #enrichProductsWithImages(products: Product[]): Promise<Product[]> {
		const enrichedProducts = await Promise.all(
			products.map(async (product) => {
				const images = await this.imagesService.findRelationsByIdOrdered({
					photoOf: PhotoOfEnum.PRODUCTS,
					id_relation: product.id_product,
				});

				return {
					...product,
					images: images.map((img) => ({
						id_image: img.id_image,
						url: img.url,
						order: img.order,
					})),
				};
			}),
		);

		return enrichedProducts as Product[];
	}

	async #generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
		const slug = this.#slugify(title);
		let counter = 1;
		let uniqueSlug = slug;

		while (true) {
			const existing = await this.productRepository.findOne({ where: { slug: uniqueSlug } });

			if (!existing || existing.id_product === excludeId) {
				break;
			}

			uniqueSlug = `${slug}-${counter}`;
			counter++;
		}

		return uniqueSlug;
	}

	#slugify(text: string): string {
		return text
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/[^\w\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.trim();
	}

	async #findProductsWithOptions(
		options: FindManyOptions<Product>,
		paginationOptions?: PaginationOptions,
	) {
		if (!paginationOptions) {
			const products = await this.productRepository.find(options);
			return this.#enrichProductsWithImages(products);
		}

		// Con paginación: retorna resultado estructurado
		const { page, limit } = paginationOptions;

		if (page < 1)
			// Normalizar valores (sin lanzar errores)
			throw new Error("El número de página debe ser mayor o igual a 1");
		if (limit < 1) throw new Error("El límite debe ser mayor o igual a 1");
		if (limit > 100) throw new Error("El límite no puede exceder 100 elementos");

		const skip = (page - 1) * limit;

		// Ejecutar consulta con paginación y obtener total
		const [products, total] = await this.productRepository.findAndCount({
			...options,
			skip,
			take: limit,
		});

		// Enriquecer productos con imágenes
		const enrichedProducts = await this.#enrichProductsWithImages(products);

		// Calcular metadatos
		const totalPages = Math.ceil(total / limit);

		return {
			data: enrichedProducts,
			meta: {
				total,
				page,
				limit,
				totalPages,
				hasNextPage: page < totalPages,
				hasPreviousPage: page > 1,
			},
		};
	}
}
