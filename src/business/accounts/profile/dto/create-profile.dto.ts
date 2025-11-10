import { Transform, TransformFnParams } from "class-transformer";
import { IsInt, IsOptional, IsString, Length, Matches, Max, Min } from "class-validator";
import { formatFullName } from "src/core/utils/works";

export class CreateProfileDto {
	@Transform(({ value }: TransformFnParams) => formatFullName(value))
	@IsString()
	@Length(4, 50)
	name: string;

	@Transform(({ value }: TransformFnParams) => formatFullName(value))
	@IsString()
	@Length(4, 50)
	last_name: string;

	@IsInt()
	@Min(16)
	@Max(118)
	age: number;

	@IsOptional()
	@IsString()
	@Transform(({ value }: { value: string }) => {
		if (!value) return value;
		const cleaned = value.trim().replace(/^\+/, "");
		return `+${cleaned}`;
	})
	@Matches(/^\+\d{1,3}$/, {
		message: "Country prefix must be 1-3 digits",
	})
	country_prefix: string = "+54";

	@IsOptional()
	@IsString()
	@Transform(({ value }: { value: string }) => {
		if (!value) return value;
		// Limpiar el número
		const cleaned = value.trim().replace(/[\s\-().]/g, "");
		// Rellenar con ceros a la izquierda hasta 8 dígitos
		return cleaned.padStart(8, "0");
	})
	@Matches(/^\d{8}$/, {
		message: "Phone number must be 6-8 digits (will be padded to 8 with zeros)",
	})
	phone_number: string;
}
