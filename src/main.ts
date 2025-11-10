import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { EnvService } from "./core/config/envs/env.service";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Obtener EnvService
	const envService = app.get(EnvService);

	// Seguridad: Headers HTTP
	app.use(
		helmet({
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ["'self'"],
					styleSrc: ["'self'", "'unsafe-inline'"],
					scriptSrc: ["'self'"],
					imgSrc: ["'self'", "data:", "https:"],
				},
			},
			hsts: {
				maxAge: 31536000,
				includeSubDomains: true,
				preload: true,
			},
		}),
	);

	// Body parser middlewares
	app.use(express.json({ limit: "10mb" }));
	app.use(express.urlencoded({ extended: true, limit: "10mb" }));

	// Cookie parser
	app.use(cookieParser());

	// CORS configurado de forma segura
	app.enableCors({
		origin: envService.get("FRONTEND_URL") || "http://localhost:4200",
		credentials: true, // Necesario para cookies httpOnly
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		exposedHeaders: ["Set-Cookie"],
	});

	// Validación global
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true, // Elimina propiedades no definidas en DTOs
			forbidNonWhitelisted: true, // Rechaza requests con propiedades extra
			transform: true, // Transforma payloads a instancias de DTOs
			transformOptions: {
				enableImplicitConversion: true,
			},
		}),
	);

	// * Global Prefix
	app.setGlobalPrefix("api/v1");

	const port = envService.get("PORT") || 3000;

	await app.listen(port);
}

bootstrap();
