import { Injectable, BadRequestException } from "@nestjs/common";
import { FindManyOptions, Repository } from "typeorm";
import { Product } from "../entities/index.entity";
import { Category } from "../enum/category.enum";
import { PaginationDto } from "core/dto/pagination.dto";

interface PaginationMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

@Injectable()
export class ProductQueryBuilder {
	private static readonly MAX_LIMIT = 100;
	private static readonly DEFAULT_LIMIT = 10;
	private static readonly DEFAULT_PAGE = 1;

	validateAndNormalizePagination(dto?: PaginationDto): { page: number; limit: number } {
		const page = dto?.page ?? ProductQueryBuilder.DEFAULT_PAGE;
		const limit = dto?.limit ?? ProductQueryBuilder.DEFAULT_LIMIT;

		if (page < 1) {
			throw new BadRequestException("El número de página debe ser mayor o igual a 1");
		}
		if (limit < 1) {
			throw new BadRequestException("El límite debe ser mayor o igual a 1");
		}
		if (limit > ProductQueryBuilder.MAX_LIMIT) {
			throw new BadRequestException(
				`El límite no puede exceder ${ProductQueryBuilder.MAX_LIMIT} elementos`,
			);
		}

		return { page, limit };
	}

	buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
		const totalPages = Math.ceil(total / limit);

		return {
			total,
			page,
			limit,
			totalPages,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
		};
	}

	getDefaultOptions(): FindManyOptions<Product> {
		return {
			order: { createdAt: "DESC" },
			relations: ["dimension", "tags"],
		};
	}

	getActiveOptions(): FindManyOptions<Product> {
		return {
			where: { active: true },
			order: { createdAt: "DESC" },
			relations: ["dimension", "tags"],
		};
	}

	getFeaturedOptions(): FindManyOptions<Product> {
		return {
			where: { active: true, featured: true },
			order: { createdAt: "DESC" },
			relations: ["dimension", "tags"],
		};
	}

	getCategoryOptions(category: Category): FindManyOptions<Product> {
		return {
			where: { category, active: true },
			order: { createdAt: "DESC" },
			relations: ["dimension", "tags"],
		};
	}

	getInStockOptions(): FindManyOptions<Product> {
		// Alias de getActiveOptions() - mantener por compatibilidad
		return this.getActiveOptions();
	}

	async executeQuery(
		repository: Repository<Product>,
		options: FindManyOptions<Product>,
		paginationDto?: PaginationDto,
	) {
		if (!paginationDto) {
			return repository.find(options);
		}

		const { page, limit } = this.validateAndNormalizePagination(paginationDto);
		const skip = (page - 1) * limit;

		const [products, total] = await repository.findAndCount({
			...options,
			skip,
			take: limit,
		});

		return {
			products,
			meta: this.buildPaginationMeta(total, page, limit),
		};
	}
}
