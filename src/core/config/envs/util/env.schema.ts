import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,50}$/;

export const envSchema = z.object({
	// * Server
	PORT: z.coerce.number().min(1000).positive().int().default(3000),
	JWT_SECRET: z.string().min(8),
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	REFRESH_JWT: z.string().min(8),
	SECRET_COOKIE: z.string().min(8),
	PASSWORD_ADMIN: z.string().regex(passwordRegex),
	NAME_ADMIN: z.string().regex(passwordRegex),
	EMAIL_ADMIN: z.string().email(),

	// * Api Image
	CLOUDINARY_API_KEY: z.string().min(8).max(24),
	CLOUDINARY_API_SECRET: z.string().min(19).max(30),
	CLOUDINARY_NAME: z.string().min(2),

	// * Database
	USERNAME_DB: z.string().nonempty({ message: "DB_USER is required" }),
	PASSWORD_DB: z
		.string()
		.min(8, { message: "Password must be at least 8 characters long" })
		.max(42, { message: "Password must be at most 42 characters long" })
		.refine((val) => /[A-Z]/.test(val), {
			message: "Password must contain at least one uppercase letter",
		})
		.refine((val) => /[a-z]/.test(val), {
			message: "Password must contain at least one lowercase letter",
		})
		.refine((val) => /[0-9]/.test(val), {
			message: "Password must contain at least one number",
		})
		.refine((val) => /[^A-Za-z0-9]/.test(val), {
			message: "Password must contain at least one symbol",
		}),
	NAME_DB: z.string().nonempty({ message: "DB_NAME is required" }),
	PORT_DB: z.coerce.number().int().positive({ message: "DB_PORT must be a positive integer" }),
	HOST_DB: z.string().nonempty({ message: "DB_HOST is required" }).default("localhost"),
	FRONTEND_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;
