import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { CookieService } from "core/config/cookies/cookies.service";
import express from "express";
import { AuthService } from "./auth.service";
import { LoginUserDto } from "./dto/login-user.dto";
import { RegisterAuthDto } from "./dto/register-user.dto";
import { JwtAuthGuard } from "./guard/jwt-auth.guard";
import { AuthInterface } from "./interface/auth.interface";

@Controller("auth")
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly cookieService: CookieService,
	) {}

	@Post("login")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { limit: 3, ttl: 60000 * 10 } }) // 5 intentos por 10 minutos
	async login(
		@Res({ passthrough: true }) res: express.Response,
		@Body() loginUserDto: LoginUserDto,
	) {
		const userJwt = await this.authService.login(loginUserDto);

		if (!userJwt) {
			throw new UnauthorizedException("Invalid credentials");
		}

		const { AccessToken, ...UserPayload } = userJwt;
		// Logging de seguridad (sin exponer datos sensibles)
		this.cookieService.setAuthToken(res, AccessToken);

		return {
			data: UserPayload,
		};
	}

	@Post("register")
	@HttpCode(HttpStatus.CREATED)
	@Throttle({ default: { limit: 5, ttl: 60000 * 5 } }) // 5 intentos por 5 minutos
	async register(
		@Res({ passthrough: true }) res: express.Response,
		@Body() registerAuth: RegisterAuthDto,
	) {
		const userJwt = await this.authService.register(registerAuth);

		if (!userJwt) {
			throw new BadRequestException("Registration failed");
		}

		const { AccessToken, ...UserPayload } = userJwt;
		this.cookieService.setAuthToken(res, AccessToken);
		return {
			data: UserPayload,
		};
	}

	@UseGuards(JwtAuthGuard)
	@Post("logout")
	@HttpCode(HttpStatus.OK)
	async logout(@Res({ passthrough: true }) res: express.Response) {
		this.cookieService.clearAuthToken(res);
		return { message: "Logout successful" };
	}

	@UseGuards(JwtAuthGuard)
	@Post("refresh")
	@HttpCode(HttpStatus.OK)
	@Throttle({ default: { limit: 3, ttl: 60000 * 10 } }) // 3 intentos por 10 minutos
	async refresh(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
		const user = req.user as AuthInterface;

		if (!user) {
			throw new UnauthorizedException("Invalid user session");
		}

		const refreshedData = await this.authService.refreshToken(user);
		if (!refreshedData) {
			throw new UnauthorizedException("Failed to refresh token");
		}

		const { AccessToken, ...UserPayload } = refreshedData;
		this.cookieService.setAuthToken(res, AccessToken);
		return {
			message: "Token refreshed successfully",
			data: UserPayload,
		};
	}
}
