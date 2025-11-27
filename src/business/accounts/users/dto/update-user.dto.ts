import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { ROLE } from "core/enum/role.enum";
import { CreateUserDto } from "./create-user.dto";

export class UpdateUsersDto extends PartialType(CreateUserDto, {
	skipNullProperties: false,
}) {
	@ApiProperty({ enum: ROLE, required: false, description: "The role of the user" })
	@IsOptional()
	@IsEnum(ROLE)
	role?: ROLE;
}
