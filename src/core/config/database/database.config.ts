import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { EnvModule } from "../envs/env.module";
import { EnvService } from "../envs/env.service";

export const TypeOrmConfig: TypeOrmModuleAsyncOptions = {
	imports: [EnvModule],
	inject: [EnvService],
	useFactory: async (envService: EnvService) => {
		const isProduction = envService.inProduction();

		return {
			type: "mysql",
			host: envService.get("HOST_DB"),
			port: envService.get("PORT_DB"),
			username: envService.get("USERNAME_DB"),
			password: envService.get("PASSWORD_DB"),
			database: envService.get("NAME_DB"),
			entities: [`${__dirname}/../../../**/*.entity{.ts,.js}`],
			synchronize: !isProduction, // Solo en desarrollo

			// Configuraciones SOLO para MySQL2 driver
			extra: {
				connectionLimit: 5,
				waitForConnections: true,
				queueLimit: 0,
				enableKeepAlive: true,
				keepAliveInitialDelay: 0,
				// Estas son las opciones correctas de MySQL2 para timeouts
				connectTimeout: 60000, // MySQL2 sí acepta esto
			},

			// Retry logic para conexiones inestables (TypeORM nivel)
			retryAttempts: 3,
			retryDelay: 3000,

			// Logging para debugging (opcional)
			logging: !isProduction ? ["error", "warn"] : false,

			// Mantener conexiones vivas (TypeORM nivel)
			keepConnectionAlive: true,
		};
	},
};
