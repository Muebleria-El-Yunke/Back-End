import { IsPassword } from "src/business/accounts/users/dto/decorator/password.decorator";
import { IsEmailOrName } from "src/business/accounts/users/dto/decorator/user-name.decorator";

export class LoginUserDto {
	@IsEmailOrName()
	content: string;

	@IsPassword()
	password: string;
}
