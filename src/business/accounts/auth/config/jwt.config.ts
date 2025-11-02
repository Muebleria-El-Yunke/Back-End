import { JwtModuleAsyncOptions } from "@nestjs/jwt";
import { EnvModule } from "src/core/config/envs/env.module";
import { EnvService } from "src/core/config/envs/env.service";

export const JwtConfig: JwtModuleAsyncOptions = {
	imports: [EnvModule],
	inject: [EnvService],
	useFactory: async (envService: EnvService) => ({
		secret: envService.get("JWT_SECRET"),
		global: true,
		signOptions: { expiresIn: "2h" },
	}),
	global: true,
};
