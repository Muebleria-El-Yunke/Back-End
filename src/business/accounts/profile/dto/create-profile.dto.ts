import { ApiProperty } from "@nestjs/swagger";
import { Transform, type TransformFnParams } from "class-transformer";
import { IsInt, IsOptional, IsString, Length, Matches, Max, Min } from "class-validator";
import { formatFullName } from "src/core/utils/works";

const VALIDATION = {
	NAME: { MIN: 4, MAX: 50 },
	AGE: { MIN: 16, MAX: 118 },
	PHONE: { MIN: 8, MAX: 11 },
	COUNTRY_PREFIX: { MIN: 2, MAX: 4 }, // +X hasta +XXX = 2-4 caracteres
} as const;

const REGEX = {
	COUNTRY_PREFIX: /^\+\d{1,3}$/,
} as const;

const transformFullName = ({ value }: TransformFnParams) => formatFullName(value);

const transformCountryPrefix = ({ value }: TransformFnParams) => {
	if (!value) return value;
	const trimmed = value.trim();
	// Si ya tiene +, lo dejamos; si no, lo agregamos
	return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
};

const transformPhoneNumber = ({ value }: TransformFnParams) => {
	if (!value) return value;
	// Elimina espacios, guiones, paréntesis y puntos
	const cleaned = value.trim().replace(/[\s\-().]/g, "");
	return cleaned;
};

export class CreateProfileDto {
	@ApiProperty({
		description: "Nombre del usuario",
		minLength: VALIDATION.NAME.MIN,
		maxLength: VALIDATION.NAME.MAX,
		example: "Juan Carlos",
	})
	@IsString()
	@Length(VALIDATION.NAME.MIN, VALIDATION.NAME.MAX)
	@Transform(transformFullName)
	name: string;

	@ApiProperty({
		description: "Apellido del usuario",
		minLength: VALIDATION.NAME.MIN,
		maxLength: VALIDATION.NAME.MAX,
		example: "García López",
	})
	@IsString()
	@Length(VALIDATION.NAME.MIN, VALIDATION.NAME.MAX)
	@Transform(transformFullName)
	last_name: string;

	@ApiProperty({
		description: "Edad del usuario",
		minimum: VALIDATION.AGE.MIN,
		maximum: VALIDATION.AGE.MAX,
		example: 25,
	})
	@IsInt()
	@Min(VALIDATION.AGE.MIN)
	@Max(VALIDATION.AGE.MAX)
	age: number;

	@ApiProperty({
		description: "Prefijo del país (código de marcación internacional)",
		required: false,
		default: "+54",
		pattern: REGEX.COUNTRY_PREFIX.source,
		example: "+54",
	})
	@IsOptional()
	@IsString()
	@Length(VALIDATION.COUNTRY_PREFIX.MIN, VALIDATION.COUNTRY_PREFIX.MAX)
	@Matches(REGEX.COUNTRY_PREFIX, {
		message: "Country prefix must start with + followed by 1-3 digits",
	})
	@Transform(transformCountryPrefix)
	country_prefix: string = "+54";

	@ApiProperty({
		description:
			"Número de teléfono (8 dígitos, se rellenará con ceros a la izquierda si es necesario)",
		required: false,
	})
	@IsOptional()
	@IsString()
	@Length(VALIDATION.PHONE.MIN, VALIDATION.PHONE.MAX, {
		message: `Phone number must be between ${VALIDATION.PHONE.MIN} and ${VALIDATION.PHONE.MAX} digits`,
	})
	@Transform(transformPhoneNumber)
	phone_number?: string;
}
