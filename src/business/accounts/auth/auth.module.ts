import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { EnvModule } from "src/core/config/envs/env.module";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtConfig } from "./config/jwt.config";
import { JwtAuthGuard } from "./guard/jwt-auth.guard";
import { RolesGuard } from "./guard/role.guard";
import { JwtStrategy } from "./strategy/jwt.strategy";

@Global()
@Module({
	imports: [
		UsersModule,
		EnvModule,
		PassportModule.register({
			defaultStrategy: "jwt",
			session: false,
		}),
		JwtModule.registerAsync(JwtConfig),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
	exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule, PassportModule],
})
export class AuthModule {}
