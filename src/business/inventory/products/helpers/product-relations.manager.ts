import { Injectable } from "@nestjs/common";
import { QueryRunner } from "typeorm";
import { Product, Tag, Dimension } from "../entities/index.entity";

interface DimensionDto {
	width: number;
	height: number;
	depth: number;
	unit?: string;
}

interface TagDto {
	name: string;
	color?: string;
}

@Injectable()
export class ProductRelationsManager {
	async createDimension(
		queryRunner: QueryRunner,
		dimensionDto: DimensionDto,
		product: Product,
	): Promise<Dimension> {
		const dimension = queryRunner.manager.create(Dimension, {
			...dimensionDto,
			product,
		});
		return queryRunner.manager.save(dimension);
	}

	async updateOrCreateDimension(
		queryRunner: QueryRunner,
		product: Product,
		dimensionDto: DimensionDto,
	): Promise<void> {
		if (product.dimension) {
			Object.assign(product.dimension, dimensionDto);
			await queryRunner.manager.save(product.dimension);
		} else {
			await this.createDimension(queryRunner, dimensionDto, product);
		}
	}

	async createTags(queryRunner: QueryRunner, tagsDto: TagDto[], product: Product): Promise<Tag[]> {
		if (!tagsDto.length) return [];

		const tags = tagsDto.map((tagDto) =>
			queryRunner.manager.create(Tag, {
				name: tagDto.name,
				color: tagDto.color,
				product,
			}),
		);
		return queryRunner.manager.save(tags);
	}

	async replaceTags(queryRunner: QueryRunner, product: Product, tagsDto: TagDto[]): Promise<void> {
		// Eliminar tags existentes
		if (product.tags?.length) {
			await queryRunner.manager.delete(Tag, { product: { id_product: product.id_product } });
		}

		// Crear nuevos tags
		if (tagsDto.length) {
			await this.createTags(queryRunner, tagsDto, product);
		}
	}
}
