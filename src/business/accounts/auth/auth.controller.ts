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
import { ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { CookieService } from "core/config/cookies/cookies.service";
import { ApiAuth, ApiJson, ApiPost } from "core/config/swagger/swagger.decorators";
import express from "express";
import { AuthService } from "./auth.service";
import { Admin } from "./decorators/index.decorator";
import { LoginUserDto } from "./dto/login-user.dto";
import { RegisterAuthDto } from "./dto/register-user.dto";
import { JwtAuthGuard } from "./guard/jwt-auth.guard";
import { AuthInterface } from "./interface/auth.interface";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly cookieService: CookieService,
	) {}

	@Post("login")
	@HttpCode(HttpStatus.OK)
	@ApiJson("Iniciar sesión", LoginUserDto, "Autentica al usuario y devuelve un token JWT")
	@Throttle({ default: { limit: 5, ttl: 60000 * 10 } }) // 5 intentos por 10 minutos
	async login(
		@Res({ passthrough: true }) res: express.Response,
		@Body() loginUserDto: LoginUserDto,
	) {
		const userJwt = await this.authService.login(loginUserDto);

		if (!userJwt) {
			throw new UnauthorizedException("Invalid credentials");
		}

		const { AccessToken, ...UserPayload } = userJwt;
		this.cookieService.setAuthToken(res, AccessToken);

		return {
			...UserPayload,
		};
	}

	@Admin()
	@Post("register")
	@HttpCode(HttpStatus.CREATED)
	@ApiConsumes("multipart/form-data")
	@ApiPost("Registrar usuario (Admin)", "Registra un nuevo usuario en el sistema")
	@ApiAuth()
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
	@ApiJson("Cerrar sesión", undefined, "Invalida la sesión del usuario")
	@ApiAuth()
	async logout(@Res({ passthrough: true }) res: express.Response) {
		this.cookieService.clearAuthToken(res);
		return { message: "Logout successful" };
	}

	@UseGuards(JwtAuthGuard)
	@Post("refresh")
	@HttpCode(HttpStatus.OK)
	@ApiJson("Refrescar token", undefined, "Renueva el token de acceso")
	@ApiAuth()
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
