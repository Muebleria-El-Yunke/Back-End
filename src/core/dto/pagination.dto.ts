import { Type } from "class-transformer";
import { IsNumber, IsPositive } from "class-validator";

export class PaginationDto {
	@IsNumber()
	@IsPositive()
	@Type(() => Number)
	page: number = 1;

	@IsNumber()
	@IsPositive()
	@Type(() => Number)
	limit: number = 12;
}
