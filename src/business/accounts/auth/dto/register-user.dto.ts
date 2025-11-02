import { Transform } from "class-transformer";
import { IsEmail } from "class-validator";
import { IsPassword } from "../../users/dto/decorator/password.decorator";
import { IsUserName } from "../../users/dto/decorator/user-name.decorator";

export class RegisterAuthDto {
	@IsEmail()
	@Transform(({ value }: { value: string }) => value.toLowerCase())
	email: string;

	@IsPassword()
	password: string;

	@IsUserName()
	user_name: string;
}
