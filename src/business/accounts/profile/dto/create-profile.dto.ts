import { Transform, TransformFnParams } from "class-transformer";
import { IsInt, IsString, Length, Max, Min } from "class-validator";
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
}
