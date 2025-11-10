import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean, IsNotEmpty, IsOptional, IsUrl, Matches } from "class-validator";
import { CreateProfileDto } from "./create-profile.dto";
import { Transform } from "class-transformer";

export class UpdateProfileDto extends PartialType(CreateProfileDto, {
	skipNullProperties: false,
}) {}

export class UpdateSellerDto extends UpdateProfileDto {
	@IsOptional()
	@IsBoolean()
	seller_principal: boolean;

	@IsOptional()
	@IsNotEmpty()
	@IsUrl()
	facebook: string;

	@IsOptional()
	@IsNotEmpty()
	@IsUrl()
	instagram: string;

	@IsOptional()
	@IsNotEmpty()
	@IsUrl()
	@Transform(({ value }: { value: string }) => {
		if (!value) return value;
		const transformedValue = value.toLowerCase().trim();
		if (transformedValue.endsWith("/")) {
			return transformedValue.slice(0, -1);
		}
		return transformedValue;
	})
	@Matches(/^https:\/\/wa\.me\/\d{10,12}$/)
	whatsapp: string;
}
