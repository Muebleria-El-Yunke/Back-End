import { Logger, ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { EnvService } from "./core/config/envs/env.service";
import { SwaggerConfig } from "core/config/swagger/swagger.config";
import { PREFIX } from "core/constants/prefix-url.constants";

async function bootstrap() {
	const isProduction = process.env.NODE_ENV === "production";
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		logger: isProduction ? ["error", "warn"] : ["log", "error", "warn", "debug", "verbose"],
		bufferLogs: isProduction,
		cors: false,
	});

	const logger = new Logger("Bootstrap");
	const envService = app.get(EnvService);

	// ==========================================
	// 🛡️ SEGURIDAD
	// ==========================================

	app.use(
		helmet({
			contentSecurityPolicy: isProduction
				? {
						directives: {
							defaultSrc: ["'self'"],
							styleSrc: ["'self'", "'unsafe-inline'"],
							scriptSrc: ["'self'"],
							imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
							connectSrc: ["'self'"],
							fontSrc: ["'self'"],
							objectSrc: ["'none'"],
							mediaSrc: ["'self'"],
							frameSrc: ["'none'"],
						},
					}
				: false,
			hsts: isProduction
				? {
						maxAge: 31536000,
						includeSubDomains: true,
						preload: true,
					}
				: false,
			noSniff: true,
			xssFilter: true,
			hidePoweredBy: true,
			frameguard: { action: "deny" },
		}),
	);

	app.disable("x-powered-by");

	if (isProduction) {
		app.set("trust proxy", 1);
	}

	// ==========================================
	// 📦 RENDIMIENTO
	// ==========================================

	app.use(
		compression({
			threshold: 1024,
			level: isProduction ? 6 : 1,
			filter: (req, res) => {
				if (req.headers["x-no-compression"]) {
					return false;
				}
				return compression.filter(req, res);
			},
		}),
	);

	// ✅ Límites diferenciados por ambiente
	app.useBodyParser("json", {
		limit: isProduction ? "5mb" : "10mb",
	});
	app.useBodyParser("urlencoded", {
		extended: true,
		limit: isProduction ? "5mb" : "10mb",
		parameterLimit: isProduction ? 10000 : 50000,
	});

	const cookieSecret = envService.get("SECRET_COOKIE");
	app.use(cookieParser(isProduction ? cookieSecret : undefined));

	// ==========================================
	// 🌐 CORS
	// ==========================================

	// ✅ Obtener FRONTEND_URL con fallback seguro
	const frontendUrl = envService.get("FRONTEND_URL");
	const allowedOrigins = frontendUrl
		? frontendUrl
				.split(",")
				.map((url) => url.trim())
				.filter(Boolean)
		: ["http://localhost:4200"];

	app.enableCors({
		origin: (origin, callback) => {
			if (!origin) {
				return callback(null, true);
			}

			if (isProduction) {
				if (allowedOrigins.includes(origin)) {
					callback(null, true);
				} else {
					logger.warn(`🚫 Blocked CORS request from: ${origin}`);
					callback(new Error("Not allowed by CORS"));
				}
			} else {
				callback(null, true);
			}
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
		exposedHeaders: ["Set-Cookie"],
		maxAge: isProduction ? 86400 : 3600,
		preflightContinue: false,
		optionsSuccessStatus: 204,
	});

	// ==========================================
	// ✅ VALIDACIÓN GLOBAL
	// ==========================================

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
			disableErrorMessages: isProduction,
			validateCustomDecorators: true,
			stopAtFirstError: isProduction,
		}),
	);

	// ==========================================
	// 🔢 VERSIONADO
	// ==========================================

	app.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: "1",
	});

	app.setGlobalPrefix(PREFIX, {
		exclude: ["/", "/health"],
	});

	// ==========================================
	// 📚 SWAGGER
	// ==========================================

	const port = envService.get("PORT");

	if (!isProduction) {
		SwaggerConfig.setup(app, {
			title: "API Documentation",
			description: "Documentación completa de la API REST",
			version: "1.0.0",
			apiPrefix: "api/docs",
		});
		setTimeout(() => {
			logger.debug(`📚 Swagger UI: http://localhost:${port}/api/docs`);
		}, 200);
	}

	// ==========================================
	// 🚀 SERVIDOR
	// ==========================================

	await app.listen(port, "0.0.0.0", async () => {
		const server = app.getHttpServer();
		server.keepAliveTimeout = isProduction ? 65000 : 5000;
		server.headersTimeout = isProduction ? 66000 : 6000;
		server.requestTimeout = isProduction ? 30000 : 120000;
		server.timeout = isProduction ? 30000 : 120000;

		if (isProduction) {
			server.maxConnections = 1000;
		}
	});

	// ==========================================
	// 📊 LOGS
	// ==========================================

	const logConfig = () => {
		logger.log(`🚀 Application started on port ${port}`);
		logger.log(`🌍 Environment: ${envService.get("NODE_ENV")}`);
		logger.log(`🔌 WebSocket Gateway: ws://localhost:${port}/${PREFIX}/health`);

		if (!isProduction) {
			logger.debug(`🌐 Allowed Origins: ${allowedOrigins.join(", ")}`);
			logger.debug(`📦 Compression: GZIP enabled (level ${isProduction ? 6 : 1})`);
			logger.debug(`🛡️ Helmet: CSP disabled for development`);
			logger.debug(`📏 Body limit: 10mb`);
		} else {
			logger.log(`🔒 Security headers: Enabled`);
			logger.log(`🗜️ Compression: Level 6`);
			logger.log(`⚡ Trust proxy: Enabled`);
			logger.log(`📏 Body limit: 5mb`);
		}
	};

	setTimeout(logConfig, 300);

	// ==========================================
	// 🛑 GRACEFUL SHUTDOWN (Corregido)
	// ==========================================

	const gracefulShutdown = async (signal: string) => {
		logger.warn(`🛑 Received ${signal}, starting graceful shutdown...`);

		const server = app.getHttpServer();

		// ✅ Detener de aceptar nuevas conexiones
		server.close(() => {
			logger.log("✅ HTTP server closed (no longer accepting connections)");
		});

		// ✅ Timeout de seguridad (forzar cierre después de 30s)
		const forceShutdownTimer = setTimeout(() => {
			logger.warn("⏰ Forcing shutdown after 30s timeout");
			process.exit(1);
		}, 30000);

		// ✅ Intentar cerrar gracefully
		try {
			await app.close();
			clearTimeout(forceShutdownTimer); // ✅ Cancelar timeout si cierra a tiempo
			logger.log("✅ Application closed gracefully");
			process.exit(0);
		} catch (error) {
			clearTimeout(forceShutdownTimer);
			logger.error("❌ Error during shutdown:", error);
			process.exit(1);
		}
	};

	// ✅ Señales de terminación
	process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
	process.on("SIGINT", () => gracefulShutdown("SIGINT"));

	// ✅ Errores no capturados
	process.on("unhandledRejection", (reason, promise) => {
		logger.error("🔥 Unhandled Rejection at:", promise, "reason:", reason);
		if (isProduction) {
			gracefulShutdown("unhandledRejection");
		}
	});

	process.on("uncaughtException", (error) => {
		logger.error("🔥 Uncaught Exception:", error);
		if (isProduction) {
			gracefulShutdown("uncaughtException");
		}
	});
}

bootstrap().catch((error) => {
	console.error("💥 Fatal error during bootstrap:", error);
	process.exit(1);
});
