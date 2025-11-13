import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { EnvModule } from "../envs/env.module";
import { EnvService } from "../envs/env.service";

export const TypeOrmConfig: TypeOrmModuleAsyncOptions = {
	imports: [EnvModule],
	inject: [EnvService],
	useFactory: async (envService: EnvService) => {
		const isProduction = envService.inProduction();
		const host = envService.get("HOST_DB");
		const isAzure = host.includes("database.windows.net");

		return {
			type: "mssql",
			host,
			port: +envService.get("PORT_DB"),
			username: envService.get("USERNAME_DB"),
			password: envService.get("PASSWORD_DB"),
			database: envService.get("NAME_DB"),
			entities: [`${__dirname}/../../../**/*.entity{.ts,.js}`],
			synchronize: !isProduction,
			autoLoadEntities: true,
			options: {
				encrypt: isAzure,
				trustServerCertificate: !isAzure,
				enableArithAbort: true,
			},
			logging: !isProduction ? ["query", "error"] : ["error"],
		};
	},
};
