import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail } from "class-validator";
import { IsPassword } from "../../users/dto/decorator/password.decorator";
import { IsUserName } from "../../users/dto/decorator/user-name.decorator";

export class RegisterAuthDto {
	@ApiProperty({ example: "user@example.com", description: "User email" })
	@IsEmail()
	@Transform(({ value }: { value: string }) => value.toLowerCase())
	email: string;

	@ApiProperty({ example: "password123", description: "User password" })
	@IsPassword()
	password: string;

	@ApiProperty({ example: "john_doe", description: "Username" })
	@IsUserName()
	user_name: string;
}
