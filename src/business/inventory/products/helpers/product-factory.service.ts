import { Injectable } from "@nestjs/common";
import { QueryRunner } from "typeorm";
import { Product } from "../entities/index.entity";
import { CreateProductDto } from "../dto/create-product.dto";
import { UpdateProductDto } from "../dto/update-product.dto";
import { ProductRelationsManager } from "./product-relations.manager";

@Injectable()
export class ProductFactoryService {
	constructor(private readonly relationsManager: ProductRelationsManager) {}

	async createProductWithRelations(
		queryRunner: QueryRunner,
		dto: CreateProductDto,
	): Promise<Product> {
		// Crear producto base
		const product = queryRunner.manager.create(Product, {
			title: dto.title,
			description: dto.description,
			price: dto.price,
			category: dto.category,
			weight: dto.weight,
			active: dto.active ?? true,
			featured: dto.featured ?? false,
		});

		const savedProduct = await queryRunner.manager.save(product);

		// Crear dimensiones
		if (dto.dimension) {
			await this.relationsManager.createDimension(queryRunner, dto.dimension, savedProduct);
		}

		// Crear tags
		if (dto.tags?.length) {
			await this.relationsManager.createTags(queryRunner, dto.tags, savedProduct);
		}

		return savedProduct;
	}

	async updateProductWithRelations(
		queryRunner: QueryRunner,
		product: Product,
		dto: UpdateProductDto,
	): Promise<void> {
		// Actualizar campos básicos
		Object.assign(product, {
			title: dto.title ?? product.title,
			description: dto.description ?? product.description,
			price: dto.price ?? product.price,
			category: dto.category ?? product.category,
			weight: dto.weight ?? product.weight,
			active: dto.active ?? product.active,
			featured: dto.featured ?? product.featured,
		});

		await queryRunner.manager.save(product);

		// Actualizar dimensiones
		if (dto.dimension) {
			await this.relationsManager.updateOrCreateDimension(queryRunner, product, dto.dimension);
		}

		// Actualizar tags
		if (dto.tags !== undefined) {
			await this.relationsManager.replaceTags(queryRunner, product, dto.tags);
		}
	}
}
