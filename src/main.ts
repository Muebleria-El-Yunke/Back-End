import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { EnvService } from "./core/config/envs/env.service";
import { SwaggerConfig } from "core/config/swagger/swagger.config";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const logger = new Logger("NestApplication");

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
	const frontendUrl = envService.get("FRONTEND_URL") || "http://localhost:4200";
	app.enableCors({
		origin: frontendUrl.split(",").map((url) => url.trim()), // Permite múltiples orígenes
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		exposedHeaders: ["Set-Cookie"],
	});

	// Validación global
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
		}),
	);

	// Global Prefix
	app.setGlobalPrefix("api/v1");

	// Configuración de Swagger
	const isProduction = envService.inProduction();
	const port = envService.get("PORT") || 3000;

	if (!isProduction) {
		SwaggerConfig.setup(app, {
			title: "API Documentation",
			description: "Documentación completa de la API REST",
			version: "1.0.0",
			apiPrefix: "api/docs",
		});
		setTimeout(
			() => logger.localInstance.log(`Api Swagger: http://localhost:${port}/api/docs`),
			200,
		);
	}

	await app.listen(port, "0.0.0.0");

	logger.log(`🚀 Application is running on port ${port}`);
	logger.log(`🌍 Environment: ${envService.get("NODE_ENV")}`);
}

bootstrap();
