import { Provider } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard } from "@nestjs/throttler";
import { JwtAuthGuard } from "business/accounts/auth/guard/jwt-auth.guard";
import { RolesGuard } from "business/accounts/auth/guard/role.guard";
import { MAX_AGE } from "core/constants/max-age.constants";

export const AppSecure: Provider[] = [
	{
		provide: APP_GUARD,
		useClass: JwtAuthGuard, // Autenticación por defecto en todas las rutas
	},
	{
		provide: APP_GUARD,
		useClass: RolesGuard, // Autorización por roles
	},
	{
		provide: APP_GUARD,
		useClass: ThrottlerGuard, // Rate limiting global
	},
];
export interface SecurityConfig {
	jwt: {
		secret: string;
		expiresIn: string;
		refreshExpiresIn: string;
	};
	cookie: {
		httpOnly: boolean;
		secure: boolean;
		sameSite: "strict" | "lax" | "none";
		maxAge: number;
	};
	rateLimit: {
		ttl: number; // Time to live en segundos
		limit: number; // Número de requests
	};
	cors: {
		origin: string | string[];
		credentials: boolean;
	};
}

export const getSecurityConfig = (isProduction: boolean): SecurityConfig => ({
	jwt: {
		secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
		expiresIn: "7d",
		refreshExpiresIn: "30d",
	},
	cookie: {
		httpOnly: true,
		secure: isProduction,
		sameSite: isProduction ? "strict" : "lax",
		maxAge: MAX_AGE,
	},
	rateLimit: {
		ttl: 60,
		limit: 10,
	},
	cors: {
		origin: isProduction
			? process.env.FRONTEND_URL || "https://yourdomain.com"
			: ["http://localhost:3000", "http://localhost:3001"],
		credentials: true,
	},
});
