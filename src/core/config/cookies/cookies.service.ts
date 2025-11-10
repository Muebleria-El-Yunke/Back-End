import { Injectable, Logger } from "@nestjs/common";
import { MAX_AGE } from "core/constants/max-age.constants";
import { USER_TOKEN } from "core/constants/user-token.constants";
import { Response } from "express";
import { EnvService } from "../envs/env.service";

export interface CookieConfig {
	httpOnly?: boolean;
	secure?: boolean;
	sameSite?: "strict" | "lax" | "none";
	maxAge?: number;
	domain?: string;
	path?: string;
}

@Injectable()
export class CookieService {
	private readonly logger = new Logger(CookieService.name);
	private readonly isProduction: boolean;
	private readonly defaultConfig: CookieConfig;

	constructor(private readonly envService: EnvService) {
		this.isProduction = this.envService.get("NODE_ENV") === "production";

		this.defaultConfig = {
			httpOnly: true,
			secure: this.isProduction,
			sameSite: this.isProduction ? "strict" : "lax",
			maxAge: MAX_AGE,
			path: "/",
		};

		this.logger.log(
			`Cookie service initialized in ${this.isProduction ? "production" : "development"} mode`,
		);
	}

	/**
	 * Establece el token de autenticación en una cookie
	 */
	setAuthToken(res: Response, token: string, customConfig?: Partial<CookieConfig>) {
		const config = { ...this.defaultConfig, ...customConfig };
		res.cookie(USER_TOKEN, token, config);
	}

	/**
	 * Limpia el token de autenticación
	 */
	clearAuthToken(res: Response) {
		res.clearCookie(USER_TOKEN, {
			httpOnly: this.defaultConfig.httpOnly,
			secure: this.defaultConfig.secure,
			sameSite: this.defaultConfig.sameSite,
			path: this.defaultConfig.path,
		});
	}

	/**
	 * Establece una cookie genérica
	 */
	setCookie(res: Response, name: string, value: string, customConfig?: Partial<CookieConfig>) {
		const config = { ...this.defaultConfig, ...customConfig };

		res.cookie(name, value, config);
	}

	/**
	 * Limpia una cookie específica
	 */
	clearCookie(res: Response, name: string) {
		res.clearCookie(name, {
			httpOnly: this.defaultConfig.httpOnly,
			secure: this.defaultConfig.secure,
			sameSite: this.defaultConfig.sameSite,
			path: this.defaultConfig.path,
		});
	}

	/**
	 * Obtiene la configuración por defecto
	 */
	getDefaultConfig(): CookieConfig {
		return { ...this.defaultConfig };
	}
}
