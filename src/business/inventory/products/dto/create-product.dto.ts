import { ApiProperty } from "@nestjs/swagger";
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
	@ApiProperty({ example: 10, description: "Width of the product" })
	@IsNumber()
	@Min(0)
	width: number;

	@ApiProperty({ example: 20, description: "Height of the product" })
	@IsNumber()
	@Min(0)
	height: number;

	@ApiProperty({ example: 5, description: "Depth of the product" })
	@IsNumber()
	@Min(0)
	depth: number;

	@ApiProperty({ example: "cm", description: "Unit of measurement", required: false })
	@IsString()
	@IsOptional()
	@MaxLength(10)
	unit?: string;
}

class TagDto {
	@ApiProperty({ example: "New", description: "Tag name" })
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name: string;

	@ApiProperty({ example: "#FF0000", description: "Tag color hex code", required: false })
	@IsString()
	@IsOptional()
	@MaxLength(7)
	color?: string;
}

export class CreateProductDto {
	@ApiProperty({ example: "Modern Chair", description: "Product title" })
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	title: string;

	@ApiProperty({ example: "A comfortable modern chair", description: "Product description" })
	@IsString()
	@IsNotEmpty()
	description: string;

	@ApiProperty({ example: 150.00, description: "Product price" })
	@IsNumber()
	@Min(0)
	price: number;

	@ApiProperty({ enum: Category, example: Category.Furniture, description: "Product category" })
	@IsEnum(Category)
	@IsNotEmpty()
	category: Category;

	@ApiProperty({ example: 5.5, description: "Product weight" })
	@IsNumber()
	@Min(0)
	weight: number;

	@ApiProperty({ example: true, description: "Is product active?", required: false })
	@IsBoolean()
	@IsOptional()
	active?: boolean;

	@ApiProperty({ example: false, description: "Is product featured?", required: false })
	@IsBoolean()
	@IsOptional()
	featured?: boolean;

	@ApiProperty({ type: DimensionDto, required: false })
	@ValidateNested()
	@Type(() => DimensionDto)
	@IsOptional()
	dimension?: DimensionDto;

	@ApiProperty({ type: [TagDto], required: false })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => TagDto)
	@IsOptional()
	tags?: TagDto[];

	@ApiProperty({
		type: "array",
		items: { type: "string", format: "binary" },
		description: "Product images",
		required: false,
	})
	@IsOptional()
	photos?: any[];
}
