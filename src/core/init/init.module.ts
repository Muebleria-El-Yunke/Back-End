import { Module } from "@nestjs/common";
import { UsersModule } from "src/business/accounts/users/users.module";
import { EnvModule } from "../config/envs/env.module";
import { AdminService } from "./service/admin/admin.service";

@Module({
	imports: [UsersModule, EnvModule],
	providers: [AdminService],
})
export class InitModule {}
