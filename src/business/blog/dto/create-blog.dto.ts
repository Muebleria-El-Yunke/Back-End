import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateBlogDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	@Transform(({ value }: { value: string }) => value.replace(/\s+/g, " "))
	title: string;

	@IsString()
	@IsOptional()
	@MaxLength(500)
	slug?: string;

	@IsString()
	@IsNotEmpty()
	content: string;

	@IsString()
	@IsOptional()
	@IsNotEmpty()
	excerpt: string;

	@IsString()
	@IsOptional()
	@MaxLength(100)
	category?: string;

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	target?: string[];

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	keywords?: string[];

	@IsBoolean()
	@IsOptional()
	active?: boolean;
}
