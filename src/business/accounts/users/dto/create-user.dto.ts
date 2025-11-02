import { Transform } from "class-transformer";
import { IsEmail } from "class-validator";
import { IsPassword } from "./decorator/password.decorator";
import { IsUserName } from "./decorator/user-name.decorator";

export class CreateUserDto {
	@IsEmail()
	@Transform(({ value }: { value: string }) => value.toLowerCase())
	email: string;

	@IsPassword()
	password: string;

	@IsUserName()
	user_name: string;
}
