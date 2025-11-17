import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { EnvModule } from "../envs/env.module";
import { EnvService } from "../envs/env.service";

export const TypeOrmConfig: TypeOrmModuleAsyncOptions = {
	imports: [EnvModule],
	inject: [EnvService],
	useFactory: async (envService: EnvService) => ({
		type: "mysql",
		host: envService.get("HOST_DB"),
		port: envService.get("PORT_DB"),
		username: envService.get("USERNAME_DB"),
		password: envService.get("PASSWORD_DB"),
		database: envService.get("NAME_DB"),
		entities: [`${__dirname}/../../../**/*.entity{.ts,.js}`],
		synchronize: !envService.inProduction(),
		//autoLoadEntities: true,
	}),
};
