import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateCartDto {
	@IsUUID()
	@IsOptional()
	profileId?: string;

	@IsString()
	@IsOptional()
	sessionId?: string;
}
