import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
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
	// Nombre explícito: 'jwt'

	constructor(private readonly envService: EnvService) {
		const options: StrategyOptions = {
			jwtFromRequest: ExtractJwt.fromExtractors([
				ExtractJwt.fromAuthHeaderAsBearerToken(),
				(req: Request) => JwtStrategy.extractTokenFromCookieOrQuery(req),
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
	}

	/**
	 * Extrae el token JWT de cookies o query parameters
	 * Prioridad: Cookie > Query Parameter
	 */
	static extractTokenFromCookieOrQuery(req: Request): string | null {
		const logger = new Logger(JwtStrategy.name);

		// Debug: Imprimir cookies disponibles
		logger.debug(`Cookies available: ${JSON.stringify(Object.keys(req.cookies || {}))}`);
		logger.debug(`Looking for cookie: ${USER_TOKEN}`);

		// 1. Intentar extraer de cookies
		const cookieToken = req.cookies?.[USER_TOKEN];
		if (cookieToken && typeof cookieToken === "string") {
			const trimmedToken = cookieToken.trim();
			if (trimmedToken) {
				logger.debug(`Token found in cookie: ${trimmedToken.substring(0, 20)}...`);
				return trimmedToken;
			}
		} else {
			logger.warn(`Cookie "${USER_TOKEN}" not found or invalid type`);
		}

		// 2. Intentar extraer de query parameters
		const queryToken = req.query?.token;
		if (!queryToken) {
			logger.debug("No token in query parameters");
			return null;
		}

		// Manejar token como string
		if (typeof queryToken === "string") {
			const trimmedToken = queryToken.trim();
			if (trimmedToken) {
				logger.debug(`Token found in query: ${trimmedToken.substring(0, 20)}...`);
				return trimmedToken;
			}
			return null;
		}

		// Manejar token como array (casos edge)
		if (Array.isArray(queryToken) && queryToken.length > 0) {
			const firstToken = queryToken[0];
			if (typeof firstToken === "string") {
				const trimmedToken = firstToken.trim();
				if (trimmedToken) {
					logger.debug(`Token found in query array: ${trimmedToken.substring(0, 20)}...`);
					return trimmedToken;
				}
			}
		}

		logger.warn("No valid token found in cookies or query");
		return null;
	}
}
