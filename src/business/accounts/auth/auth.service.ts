import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ErrorHandler } from "src/core/config/error/ErrorHandler";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { AuthUserService } from "../users/service/auth-user.service";
import { LoginUserDto } from "./dto/login-user.dto";
import { AuthInterface } from "./interface/auth.interface";

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		private readonly authUserService: AuthUserService,
		private readonly jwtService: JwtService,
	) {}

	async login(loginUserDto: LoginUserDto) {
		const userLogin = await this.authUserService.loginUser(loginUserDto);
		try {
			return this.#generateToken(userLogin);
		} catch (error) {
			this.logger.error(`Login failed: ${error.message}`);
			ErrorHandler(error);
		}
	}

	async register(createUserDto: CreateUserDto) {
		const userRegister = await this.authUserService.createUser(createUserDto);
		try {
			return this.#generateToken(userRegister);
		} catch (error) {
			this.logger.error(`Registration failed: ${error.message}`);
			ErrorHandler(error);
		}
	}

	async refreshToken(user: AuthInterface) {
		if (!user || !user.id_user || !user.role) {
			throw new UnauthorizedException("Invalid user data");
		}
		try {
			return this.#generateToken(user);
		} catch (_error) {
			throw new UnauthorizedException("Failed to refresh token");
		}
	}

	async verifyToken(token: string) {
		try {
			const payload = await this.jwtService.verifyAsync(token);
			return {
				id_user: payload.id_user,
				role: payload.role,
			};
		} catch (error) {
			throw error();
		}
	}

	#generateToken(user: AuthInterface) {
		if (!user || !user.id_user || !user.role) {
			return null;
		}

		const payload: AuthInterface = {
			id_user: user.id_user,
			role: user.role,
		};

		return { ...payload, AccessToken: this.jwtService.sign(payload) };
	}
}
