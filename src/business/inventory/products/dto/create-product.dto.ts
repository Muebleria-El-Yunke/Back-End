import { Type } from "class-transformer";
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength,
	Min,
	ValidateNested,
} from "class-validator";
import { Category } from "../enum/category.enum";

class DimensionDto {
	@IsNumber()
	@Min(0)
	width: number;

	@IsNumber()
	@Min(0)
	height: number;

	@IsNumber()
	@Min(0)
	depth: number;

	@IsString()
	@IsOptional()
	@MaxLength(10)
	unit?: string;
}

class TagDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name: string;

	@IsString()
	@IsOptional()
	@MaxLength(7)
	color?: string;
}

export class CreateProductDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	title: string;

	@IsString()
	@IsNotEmpty()
	description: string;

	@IsNumber()
	@Min(0)
	price: number;

	@IsEnum(Category)
	@IsNotEmpty()
	category: Category;

	@IsNumber()
	@IsOptional()
	@Min(0)
	stock?: number;

	@IsNumber()
	@Min(0)
	weight: number;

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	imageIds?: string[];

	@IsBoolean()
	@IsOptional()
	active?: boolean;

	@IsBoolean()
	@IsOptional()
	featured?: boolean;

	@IsString()
	@IsOptional()
	@MaxLength(500)
	slug?: string;

	@ValidateNested()
	@Type(() => DimensionDto)
	@IsOptional()
	dimension?: DimensionDto;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => TagDto)
	@IsOptional()
	tags?: TagDto[];
}
