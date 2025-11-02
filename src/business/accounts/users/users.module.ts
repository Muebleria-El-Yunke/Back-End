import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EnvModule } from "core/config/envs/env.module";
import { User } from "./entities/user.entity";
import { AuthUserService } from "./service/auth-user.service";
import { PasswordService } from "./service/password.service";
import { UsersService } from "./service/users.service";
import { UsersController } from "./users.controller";

@Module({
	imports: [TypeOrmModule.forFeature([User]), EnvModule],
	controllers: [UsersController],
	providers: [UsersService, AuthUserService, PasswordService],
	exports: [TypeOrmModule, UsersService, AuthUserService],
})
export class UsersModule {}
