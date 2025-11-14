import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,50}$/;

export const envSchema = z
	.object({
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

		// * Database - Support both individual vars and DATABASE_URL
		DATABASE_URL: z.string().url().optional(),
		USERNAME_DB: z.string().optional(),
		PASSWORD_DB: z.string().optional(),
		NAME_DB: z.string().optional(),
		PORT_DB: z.coerce.number().int().positive().optional().default(5432),
		HOST_DB: z.string().optional().default("localhost"),

		FRONTEND_URL: z.string().url().optional(),
	})
	.refine(
		(data) => {
			// Either DATABASE_URL or individual DB credentials must be provided
			if (data.DATABASE_URL) return true;
			return !!(data.USERNAME_DB && data.PASSWORD_DB && data.NAME_DB && data.HOST_DB);
		},
		{
			message:
				"Either DATABASE_URL or all individual database credentials (USERNAME_DB, PASSWORD_DB, NAME_DB, HOST_DB) must be provided",
		},
	);

export type Env = z.infer<typeof envSchema>;