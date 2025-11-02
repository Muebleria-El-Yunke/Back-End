import { PartialType } from "@nestjs/mapped-types";
import { IsOptional } from "class-validator";
import { CreateUserDto } from "./create-user.dto";
import { IsPassword } from "./decorator/password.decorator";

export class UpdateUsersDto extends PartialType(CreateUserDto, {
	skipNullProperties: false,
}) {
	@IsPassword()
	@IsOptional()
	new_password?: string;
}
