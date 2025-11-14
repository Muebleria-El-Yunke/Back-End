import { Provider } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { MAX_AGE } from "core/constants/max-age.constants";

export const AppSecure: Provider[] = [
	// Remove JwtAuthGuard and RolesGuard from global guards
	{
		provide: APP_GUARD,
		useClass: ThrottlerGuard, // Keep rate limiting global
	},
];

// Keep the SecurityConfig as is
export const getSecurityConfig = (isProduction: boolean) => {
	return {
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
	};
};
