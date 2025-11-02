import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import cookieParser from "cookie-parser";
import express from "express";
import { AppModule } from "./app.module";
import { EnvService } from "./core/config/envs/env.service";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Obtener EnvService
	const envService = app.get(EnvService);

	// * CORS
	app.enableCors("*");

	// * Global Pipes
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

	// * Global Interceptors
	app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

	// * Middleware
	app.use(express.json({ limit: "10mb" }));
	app.use(express.urlencoded({ extended: true, limit: "10mb" }));
	app.use(cookieParser());

	// * Global Prefix
	app.setGlobalPrefix("api/v1");

	const port = envService.get("PORT");

	await app.listen(port);
}

bootstrap();
