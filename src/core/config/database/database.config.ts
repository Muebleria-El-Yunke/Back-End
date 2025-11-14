import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { EnvModule } from "../envs/env.module";
import { EnvService } from "../envs/env.service";

export const TypeOrmConfig: TypeOrmModuleAsyncOptions = {
	imports: [EnvModule],
	inject: [EnvService],
	useFactory: async (envService: EnvService) => {
		const sslConfig = envService.inProduction()
			? {
					ssl: true,
					extra: {
						ssl: {
							rejectUnauthorized: false,
						},
					},
				}
			: {};

		return {
			type: "postgres",
			host: envService.get("HOST_DB"),
			port: envService.get("PORT_DB"),
			username: envService.get("USERNAME_DB"),
			password: envService.get("PASSWORD_DB"),
			database: envService.get("NAME_DB"),

			// Let TypeORM auto-discover entities from modules
			autoLoadEntities: true,

			// Synchronize schema in development
			synchronize: !envService.inProduction(),

			// Enable logging to debug
			logging: !envService.inProduction() ? ["query", "error", "schema"] : ["error"],

			entities: [`${__dirname}/../../../../entities/*.entity{.ts,.js}`],

			...sslConfig,
		};
	},
};
