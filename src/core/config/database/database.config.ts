import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { EnvModule } from "../envs/env.module";
import { EnvService } from "../envs/env.service";

export const TypeOrmConfig: TypeOrmModuleAsyncOptions = {
	imports: [EnvModule],
	inject: [EnvService],
	useFactory: async (envService: EnvService) => {
		const isProduction = envService.inProduction();
		const databaseUrl = envService.get("DATABASE_URL");

		let dbConfig: any;
		if (databaseUrl) {
			console.log("📦 Using DATABASE_URL for connection");
			dbConfig = {
				url: databaseUrl,
			};
		} else {
			console.log("📦 Using individual DB credentials");
			dbConfig = {
				host: envService.get("HOST_DB"),
				port: envService.get("PORT_DB"),
				username: envService.get("USERNAME_DB"),
				password: envService.get("PASSWORD_DB"),
				database: envService.get("NAME_DB"),
			};
		}

		const sslConfig = isProduction
			? {
					ssl: true,
					extra: {
						ssl: {
							rejectUnauthorized: false,
						},
					},
				}
			: {};

		console.log("🔧 Database Configuration:");
		console.log(`   Environment: ${envService.get("NODE_ENV")}`);
		console.log(`   Using DATABASE_URL: ${!!databaseUrl}`);
		console.log(`   SSL Enabled: ${isProduction}`);

		return {
			type: "postgres",
			...dbConfig,

			// Use autoLoadEntities for automatic entity discovery
			autoLoadEntities: true,

			// NEVER synchronize in production
			synchronize: !isProduction,

			// Logging
			logging: !isProduction ? ["query", "error", "schema"] : ["error"],

			// Connection pool settings for production
			...(isProduction && {
				poolSize: 10,
				connectTimeoutMS: 10000,
			}),

			...sslConfig,
		};
	},
};
