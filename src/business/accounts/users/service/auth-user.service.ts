import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LoginUserDto } from "src/business/accounts/auth/dto/login-user.dto";
import { ErrorHandler } from "src/core/config/error/ErrorHandler";
import { Repository } from "typeorm";
import { CreateUserDto } from "../dto/create-user.dto";
import { User } from "../entities/user.entity";
import { ExistUserInterface } from "../interfaces/users.interfaces";
import { PasswordService } from "./password.service";
import { UsersService } from "./users.service";

@Injectable()
export class AuthUserService {
	constructor(
		@InjectRepository(User)
		private readonly usersRepository: Repository<User>,
		private readonly usersService: UsersService,
		private readonly passwordService: PasswordService,
	) {}

	// * LoginUser
	async loginUser(loginUserDto: LoginUserDto) {
		try {
			// ! Find User
			const foundUser = await this.usersService.findByNameOrEmail(loginUserDto.content, true);
			if (!foundUser) {
				throw new UnauthorizedException("Invalid username, email, or password");
			}
			// ! Verify password
			const { password: plainPassword } = loginUserDto;
			const { password: encryptPassword, id_user, role } = foundUser;
			const passwordVerify = await this.passwordService.verify(plainPassword, encryptPassword);
			if (!passwordVerify) throw new UnauthorizedException("Invalid username, email or password");
			return { id_user, role };
		} catch (error) {
			ErrorHandler(error);
		}
	}

	// * RegisterUser
	async createUser(createUserDto: CreateUserDto) {
		try {
			const { ...userData } = createUserDto;
			const [_validationResult, encryptedPassword] = await Promise.all([
				this.#validateUserUniqueness({ email: userData.email, user_name: userData.user_name }),
				this.passwordService.encrypt(userData.password),
			]);
			userData.password = encryptedPassword;
			// * CreateUser
			const newUser = this.usersRepository.create(userData);
			await this.usersRepository.save(newUser);
			const { id_user, role } = newUser;
			return { id_user, role };
		} catch (error) {
			ErrorHandler(error);
		}
	}

	// ! Private Method
	async #validateUserUniqueness(UserInput: ExistUserInterface): Promise<void> {
		const { email, user_name } = UserInput;
		const existingUser = await this.usersService.findExistUser({
			email,
			user_name,
		});
		if (!existingUser) return;

		const emailConflict = existingUser.email === email ? `email "${email}"` : "";
		const usernameConflict = existingUser.user_name === user_name ? `username "${user_name}"` : "";

		let message = emailConflict;

		if (emailConflict && usernameConflict) {
			message = `${emailConflict} and ${usernameConflict}`;
		} else if (!emailConflict) {
			message = usernameConflict;
		}

		throw new BadRequestException(`User with ${message} already exists`);
	}
}
