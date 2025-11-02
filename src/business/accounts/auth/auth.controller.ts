import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Res,
	UnauthorizedException,
} from "@nestjs/common";
import { CookieOptions, type Response } from "express";
import { EnvService } from "src/core/config/envs/env.service";
import { MAX_AGE } from "src/core/constants/max-age.constants";
import { USER_TOKEN } from "src/core/constants/user-token.constants";
import { AuthService } from "./auth.service";
import { LoginUserDto } from "./dto/login-user.dto";
import { RegisterAuthDto } from "./dto/register-user.dto";

@Controller("auth")
export class AuthController {
	readonly #isProduction: boolean;
	readonly #cookieBaseOptions: CookieOptions;

	constructor(
		private readonly authService: AuthService,
		private readonly envService: EnvService,
	) {
		this.#isProduction = this.envService.get("NODE_ENV") === "production";
		this.#cookieBaseOptions = {
			httpOnly: true,
			sameSite: this.#isProduction ? "strict" : "lax",
			secure: this.#isProduction,
			maxAge: MAX_AGE,
		};
	}

	@Post("login")
	@HttpCode(HttpStatus.ACCEPTED)
	async login(@Res({ passthrough: true }) res: Response, @Body() loginUserDto: LoginUserDto) {
		const userJwt = await this.authService.login(loginUserDto);
		if (!userJwt) {
			throw new UnauthorizedException("Invalid username, email or password");
		}
		this.#CookieAuth(res, userJwt);
		return { message: "Successful login" };
	}

	@Post("register")
	@HttpCode(HttpStatus.CREATED)
	async register(@Res({ passthrough: true }) res: Response, @Body() registerAuth: RegisterAuthDto) {
		const userJwt = await this.authService.register(registerAuth);
		if (!userJwt) {
			throw new BadRequestException("Could not log in with the entered user");
		}
		this.#CookieAuth(res, userJwt);
		return { message: "Registration successful" };
	}

	@Post("logout")
	@HttpCode(HttpStatus.NO_CONTENT)
	logout(@Res({ passthrough: true }) res: Response) {
		res.clearCookie(USER_TOKEN);
		return { message: "hola" };
	}

	// ! Private
	#CookieAuth(res: Response, token: string) {
		res.cookie(USER_TOKEN, token, {
			...this.#cookieBaseOptions,
		});
	}
}
