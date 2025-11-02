import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EnvService } from "./env.service";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: process.env.NODE_ENV === "production" ? ".env" : ".env.dev",
		}),
	],
	providers: [EnvService],
	exports: [EnvService],
})
export class EnvModule {}
