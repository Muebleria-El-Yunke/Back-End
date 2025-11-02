import { IsInt, IsNotEmpty, IsUUID, Min } from "class-validator";

export class AddItemToCartDto {
	@IsUUID()
	@IsNotEmpty()
	productId: string;

	@IsInt()
	@Min(1)
	quantity: number;
}
