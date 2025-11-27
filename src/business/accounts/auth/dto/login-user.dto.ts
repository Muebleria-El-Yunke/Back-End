import { ApiProperty } from "@nestjs/swagger";
import { IsPassword } from "src/business/accounts/users/dto/decorator/password.decorator";
import { IsEmailOrName } from "src/business/accounts/users/dto/decorator/user-name.decorator";

export class LoginUserDto {
	@ApiProperty({ example: "user@example.com", description: "Email or Username" })
	@IsEmailOrName()
	content: string;

	@ApiProperty({ example: "password123", description: "User password" })
	@IsPassword()
	password: string;
}
