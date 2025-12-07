import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Env } from "./util/env.schema";

@Injectable()
export class EnvService {
	constructor(private readonly configService: ConfigService<Env, true>) {}

	get<T extends keyof Env>(key: T): Env[T] {
		return this.configService.get(key, { infer: true });
	}

	inProduction() {
		return this.configService.get("NODE_ENV") === "production";
	}

	isDevelopment(): boolean {
		return this.configService.get("NODE_ENV", { infer: true }) === "development";
	}
}
