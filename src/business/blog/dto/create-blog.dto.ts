import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateBlogDto {
	@ApiProperty({ example: "My First Blog Post", description: "Blog title" })
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	@Transform(({ value }: { value: string }) => value.replace(/\s+/g, " "))
	title: string;

	@ApiProperty({ example: "my-first-blog-post", description: "Blog slug", required: false })
	@IsString()
	@IsOptional()
	@MaxLength(500)
	slug?: string;

	@ApiProperty({ example: "Content of the blog post...", description: "Blog content" })
	@IsString()
	@IsNotEmpty()
	content: string;

	@ApiProperty({ example: "Short summary...", description: "Blog excerpt", required: false })
	@IsString()
	@IsOptional()
	@IsNotEmpty()
	excerpt: string;

	@ApiProperty({ example: "Technology", description: "Blog category", required: false })
	@IsString()
	@IsOptional()
	@MaxLength(100)
	category?: string;

	@ApiProperty({
		example: ["tech", "news"],
		description: "Target audience",
		required: false,
		type: [String],
	})
	@Transform(
		({ value }) => {
			if (!value) return undefined;
			if (Array.isArray(value)) return value;
			if (typeof value === "string") {
				return value
					.split(",")
					.map((item) => item.trim())
					.filter(Boolean);
			}
			return [value];
		},
		{ toClassOnly: true },
	)
	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	target?: string[];

	@ApiProperty({
		example: ["nestjs", "swagger"],
		description: "Keywords",
		required: false,
		type: [String],
	})
	@Transform(
		({ value }) => {
			if (!value) return undefined;
			if (Array.isArray(value)) return value;
			if (typeof value === "string") {
				return value
					.split(",")
					.map((item) => item.trim())
					.filter(Boolean);
			}
			return [value];
		},
		{ toClassOnly: true },
	)
	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	keywords?: string[];

	@ApiProperty({ example: true, description: "Is blog active?", required: false })
	@IsBoolean()
	@IsOptional()
	@Transform(({ value }) => {
		if (value === "true" || value === true) return true;
		if (value === "false" || value === false) return false;
		return value;
	})
	active?: boolean;
}
