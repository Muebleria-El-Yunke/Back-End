import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsUrl, Matches } from "class-validator";
import { CreateProfileDto } from "./create-profile.dto";
import { PartialType } from "@nestjs/mapped-types";

const REGEX = {
	WHATSAPP: /^https:\/\/wa\.me\/\d{10,12}$/,
} as const;

const transformWhatsApp = ({ value }: { value: string }) => {
	if (!value) return value;
	const transformed = value.toLowerCase().trim();
	return transformed.endsWith("/") ? transformed.slice(0, -1) : transformed;
};

export class UpdateProfileDto extends PartialType(CreateProfileDto) {}

export class UpdateSellerDto extends UpdateProfileDto {
	@ApiProperty({
		description: "Indica si es el vendedor principal",
		required: false,
	})
	@IsOptional()
	@IsBoolean()
	seller_principal: boolean;

	@ApiProperty({
		description: "URL del perfil de Facebook",
		required: false,
	})
	@IsOptional()
	@IsNotEmpty()
	@IsUrl()
	facebook: string;

	@ApiProperty({
		description: "URL del perfil de Instagram",
		required: false,
	})
	@IsOptional()
	@IsNotEmpty()
	@IsUrl()
	instagram: string;

	@ApiProperty({
		description: "URL de WhatsApp (formato: https://wa.me/número)",
		required: false,
		pattern: REGEX.WHATSAPP.source,
	})
	@IsOptional()
	@IsNotEmpty()
	@IsUrl()
	@Transform(transformWhatsApp)
	@Matches(REGEX.WHATSAPP, {
		message: "WhatsApp URL must match format: https://wa.me/[10-12 digits]",
	})
	whatsapp: string;
}
