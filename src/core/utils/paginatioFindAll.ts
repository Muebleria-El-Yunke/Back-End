import { FindManyOptions } from "typeorm";

export interface PaginationOptions {
	page: number;
	limit: number;
}

export function getPaginationOptions<T>(
	paginationOptions: PaginationOptions,
	options?: FindManyOptions<T>,
) {
	const { limit, page } = paginationOptions;
	const skip = (page - 1) * limit;
	return {
		...options,
		skip,
		take: limit,
	};
}
