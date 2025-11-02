import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateOrderDto {
	@IsUUID()
	@IsNotEmpty()
	cartId: string;

	@IsString()
	@IsNotEmpty()
	shippingAddress: string;

	@IsString()
	@IsNotEmpty()
	shippingCity: string;

	@IsString()
	@IsNotEmpty()
	shippingPostalCode: string;

	@IsString()
	@IsNotEmpty()
	shippingCountry: string;

	@IsString()
	@IsOptional()
	shippingPhone?: string;

	@IsString()
	@IsOptional()
	notes?: string;
}
