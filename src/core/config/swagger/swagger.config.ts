import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export interface SwaggerConfigOptions {
	title: string;
	description: string;
	version: string;
	apiPrefix?: string;
	tags?: string[];
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class SwaggerConfig {
	/**
	 * Configura Swagger en la aplicación NestJS
	 */
	static setup(app: INestApplication, options: SwaggerConfigOptions): void {
		const config = new DocumentBuilder()
			.setTitle(options.title)
			.setDescription(options.description)
			.setVersion(options.version)
			.addTag("Users", "Gestión de usuarios")
			.addTag("Profile", "Perfil de usuario")
			.addTag("Blog", "Artículos del blog")
			.addTag("Products", "Productos del e-commerce")
			.addTag("Images", "Gestión de imágenes")
			.addServer(process.env.API_URL || "http://localhost:3000", "Servidor de desarrollo")
			.build();

		// Agregar tags adicionales si se proporcionan
		if (options.tags && options.tags.length > 0) {
			options.tags.forEach((tag) => {
				config.tags?.push({ name: tag });
			});
		}

		const document = SwaggerModule.createDocument(app, config, {
			deepScanRoutes: true,
		});

		// Personalizar opciones de Swagger UI
		const customOptions = {
			swaggerOptions: {
				persistAuthorization: true,
				docExpansion: "none",
				filter: true,
				showRequestDuration: true,
				syntaxHighlight: {
					activate: true,
					theme: "monokai",
				},
			},
			customSiteTitle: options.title,
			customfavIcon: "/favicon.ico",
			customCss: `
				.swagger-ui .topbar { display: none }
				.swagger-ui .info { margin: 20px 0 }
				.swagger-ui .scheme-container { margin: 20px 0 }
			`,
		};

		SwaggerModule.setup(options.apiPrefix || "api/docs", app, document, customOptions);
	}

	/**
	 * Genera documentación JSON de Swagger
	 */
	static generateDocument(app: INestApplication, options: SwaggerConfigOptions) {
		const config = new DocumentBuilder()
			.setTitle(options.title)
			.setDescription(options.description)
			.setVersion(options.version)
			.build();

		return SwaggerModule.createDocument(app, config);
	}
}
