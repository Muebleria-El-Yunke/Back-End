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
			logging: !isProduction,

			// Configuraciones importantes para Railway
			extra: {
				connectionLimit: 5, // Límite del plan gratuito
				connectTimeout: 60000,
				acquireTimeout: 60000,
				timeout: 60000,
			},

			// Retry logic para conexiones inestables
			retryAttempts: 3,
			retryDelay: 3000,
		};
	},
};
