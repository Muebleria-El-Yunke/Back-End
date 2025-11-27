import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail } from "class-validator";
import { IsPassword } from "./decorator/password.decorator";
import { IsUserName } from "./decorator/user-name.decorator";

export class CreateUserDto {
	@ApiProperty({ example: "user@example.com", description: "The email of the user" })
	@IsEmail()
	@Transform(({ value }: { value: string }) => value.toLowerCase())
	email: string;

	@ApiProperty({ example: "password123", description: "The password of the user" })
	@IsPassword()
	password: string;

	@ApiProperty({ example: "john_doe", description: "The username of the user" })
	@IsUserName()
	user_name: string;
}
