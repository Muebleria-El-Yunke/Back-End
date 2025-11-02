import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ErrorHandler } from "src/core/config/error/ErrorHandler";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { AuthUserService } from "../users/service/auth-user.service";
import { LoginUserDto } from "./dto/login-user.dto";
import { AuthInterface } from "./interface/auth.interface";

@Injectable()
export class AuthService {
	constructor(
		private readonly authUserService: AuthUserService,
		private readonly jwtService: JwtService,
	) {}

	async login(loginUserDto: LoginUserDto) {
		try {
			const userLogin = await this.authUserService.loginUser(loginUserDto);
			return this.#authManagement(userLogin);
		} catch (error) {
			ErrorHandler(error);
		}
	}

	async register(createUserDto: CreateUserDto) {
		try {
			const userRegister = await this.authUserService.createUser(createUserDto);
			return this.#authManagement(userRegister);
		} catch (error) {
			ErrorHandler(error);
		}
	}

	#authManagement(user: AuthInterface) {
		if (!user) {
			return null;
		}
		const jwtAuth = this.jwtService.sign(user);
		return jwtAuth;
	}
}
