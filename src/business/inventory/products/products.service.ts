import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Repository, FindManyOptions } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginationDto } from "core/dto/pagination.dto";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/index.entity";
import { Category } from "./enum/category.enum";
import { ProductImagesManager } from "./helpers/product-images.manager";
import { ProductQueryBuilder } from "./helpers/product-query.builder";
import { ProductFactoryService } from "./helpers/product-factory.service";
import { getPaginationOptions } from "core/utils/paginatioFindAll";
import { ImageOrderDto } from "./dto/image-order.dto";

@Injectable()
export class ProductsService {
	private readonly logger = new Logger(ProductsService.name);

	constructor(
		@InjectRepository(Product)
		private readonly productRepository: Repository<Product>,
		private readonly imagesManager: ProductImagesManager,
		private readonly queryBuilder: ProductQueryBuilder,
		private readonly factoryService: ProductFactoryService,
	) {}

	// ========== CRUD Básico ==========
	async create(createProductDto: CreateProductDto, photos?: Express.Multer.File[] | string[]) {
		const queryRunner = this.productRepository.manager.connection.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const product = await this.factoryService.createProductWithRelations(
				queryRunner,
				createProductDto,
			);

			await queryRunner.commitTransaction();

			this.imagesManager.processImagesAsync(product.id_product, photos);

			return this.findOne(product.id_product);
		} catch (error) {
			await queryRunner.rollbackTransaction();
			this.logger.error(`Error creando producto: ${error.message}`, error.stack);
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	async findAll(paginationDto?: PaginationDto) {
		const options = this.queryBuilder.getDefaultOptions();
		return this.executeQueryWithEnrichment(options, paginationDto);
	}

	async findActive(paginationDto?: PaginationDto) {
		return this.executeQueryWithEnrichment(this.queryBuilder.getActiveOptions(), paginationDto);
	}

	async findFeatured(paginationDto?: PaginationDto) {
		return this.executeQueryWithEnrichment(this.queryBuilder.getFeaturedOptions(), paginationDto);
	}

	async findByCategory(category: Category, paginationDto?: PaginationDto) {
		return this.executeQueryWithEnrichment(
			this.queryBuilder.getCategoryOptions(category),
			paginationDto,
		);
	}

	async findInStock(paginationDto?: PaginationDto) {
		return this.executeQueryWithEnrichment(this.queryBuilder.getInStockOptions(), paginationDto);
	}

	async findOne(id_product: string) {
		const product = await this.getProductOrFail(id_product, ["dimension", "tags"]);
		return this.imagesManager.enrichProductWithImages(product);
	}

	async update(
		id_product: string,
		updateProductDto: UpdateProductDto,
		photos?: Express.Multer.File[] | string[],
	) {
		const queryRunner = this.productRepository.manager.connection.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const product = await this.getProductOrFail(id_product, ["dimension", "tags"]);

			await this.factoryService.updateProductWithRelations(queryRunner, product, updateProductDto);
			await queryRunner.commitTransaction();

			this.imagesManager.processImagesAsync(id_product, photos);

			return this.findOne(id_product);
		} catch (error) {
			await queryRunner.rollbackTransaction();
			this.logger.error(`Error actualizando producto ${id_product}: ${error.message}`, error.stack);
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	async remove(id_product: string): Promise<void> {
		const product = await this.getProductOrFail(id_product);
		await this.imagesManager.deleteAllImages(id_product);
		await this.productRepository.remove(product);
	}

	// ========== Toggles ==========
	async toggleActive(id_product: string): Promise<Product> {
		const product = await this.getProductOrFail(id_product);
		product.active = !product.active;
		return this.productRepository.save(product);
	}

	async toggleFeatured(id_product: string): Promise<Product> {
		const product = await this.getProductOrFail(id_product);
		product.featured = !product.featured;
		return this.productRepository.save(product);
	}

	// ========== Gestión de Imágenes ==========
	async getProductImages(id_product: string) {
		await this.getProductOrFail(id_product);
		return this.imagesManager.getProductImages(id_product);
	}

	async addProductImages(id_product: string, photos: Express.Multer.File[] | string[]) {
		await this.getProductOrFail(id_product);
		return this.imagesManager.addImages(id_product, photos);
	}

	async reorderProductImages(id_product: string, imageOrders: ImageOrderDto[]) {
		await this.getProductOrFail(id_product);
		return this.imagesManager.reorderImages(id_product, imageOrders);
	}

	async deleteProductImage(id_product: string, id_image: string) {
		await this.getProductOrFail(id_product);
		return this.imagesManager.deleteImage(id_product, id_image);
	}

	// ========== Private Methods ==========
	private async getProductOrFail(id_product: string, relations: string[] = []): Promise<Product> {
		const product = await this.productRepository.findOne({
			where: { id_product },
			relations,
		});

		if (!product) {
			throw new NotFoundException(`Producto con ID "${id_product}" no encontrado`);
		}

		return product;
	}

	private async executeQueryWithEnrichment(
		queryOptions: FindManyOptions<Product>,
		paginationDto?: PaginationDto,
	) {
		if (paginationDto) {
			// Apply pagination to query options
			const paginatedOptions = getPaginationOptions(paginationDto, queryOptions);

			// Execute query with pagination - findAndCount returns [items, total]
			const [products, total] = await this.productRepository.findAndCount(paginatedOptions);

			// Enrich products with images
			const enriched = await this.imagesManager.enrichProductsWithImages(products);

			// Build meta information
			const { page, limit } = paginationDto;
			const meta = {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			};

			return { data: enriched, meta };
		}

		// Without pagination, return all products
		const products = await this.productRepository.find(queryOptions);
		return this.imagesManager.enrichProductsWithImages(products);
	}
}
