import { Module } from "@nestjs/common";
import { EnvModule } from "../envs/env.module";
import { CookieService } from "./cookies.service";

@Module({
	imports: [EnvModule],
	providers: [CookieService],
	exports: [CookieService],
})
export class CookieModule {}
