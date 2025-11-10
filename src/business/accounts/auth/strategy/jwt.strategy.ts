import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { EnvService } from "core/config/envs/env.service";
import { USER_TOKEN } from "core/constants/user-token.constants";
import { ROLE } from "core/enum/role.enum";
import { Request } from "express";
import { ExtractJwt, Strategy, StrategyOptions } from "passport-jwt";
import { JWT_AUTH_GUARD } from "../guard/guard.constants";
import { AuthInterface } from "../interface/auth.interface";

interface JwtPayload {
	id_user: string;
	role: ROLE;
	iat?: number;
	exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_AUTH_GUARD) {
	constructor(private readonly envService: EnvService) {
		const options: StrategyOptions = {
			jwtFromRequest: ExtractJwt.fromExtractors([
				ExtractJwt.fromAuthHeaderAsBearerToken(),
				(req: Request) => JwtStrategy.extractTokenFromCookie(req),
			]),
			secretOrKey: envService.get("JWT_SECRET"),
			ignoreExpiration: false,
		};

		super(options);
	}

	async validate(payload: JwtPayload): Promise<AuthInterface> {
		this.#validatePayload(payload);

		return {
			id_user: payload.id_user,
			role: payload.role,
		};
	}

	#validatePayload(payload: JwtPayload): void {
		if (!payload) {
			throw new UnauthorizedException("Invalid token: Empty payload");
		}

		if (!payload.id_user) {
			throw new UnauthorizedException("Invalid token: Missing user ID");
		}

		if (!payload.role) {
			throw new UnauthorizedException("Invalid token: Missing user role");
		}

		if (!Object.values(ROLE).includes(payload.role)) {
			throw new UnauthorizedException(`Invalid token: Unknown role "${payload.role}"`);
		}

		// Validación adicional de expiración
		if (payload.exp && payload.exp * 1000 < Date.now()) {
			throw new UnauthorizedException("Token expired");
		}
	}

	/**
	 * Extrae el token JWT de cookies (más seguro que query params)
	 * REMOVIDO: Extracción desde query parameters por razones de seguridad
	 */
	static extractTokenFromCookie(req: Request): string | null {
		const cookieToken = req.cookies?.[USER_TOKEN];

		if (!cookieToken || typeof cookieToken !== "string") {
			return null;
		}

		const trimmedToken = cookieToken.trim();
		return trimmedToken || null;
	}
}
