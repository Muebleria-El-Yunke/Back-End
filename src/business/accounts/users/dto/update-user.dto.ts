import { PartialType } from "@nestjs/mapped-types";
import { IsEnum, IsOptional } from "class-validator";
import { ROLE } from "core/enum/role.enum";
import { CreateUserDto } from "./create-user.dto";

export class UpdateUsersDto extends PartialType(CreateUserDto, {
	skipNullProperties: false,
}) {
	@IsOptional()
	@IsEnum(ROLE)
	role?: ROLE;
}
