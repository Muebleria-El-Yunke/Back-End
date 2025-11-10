import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { UsersService } from "src/business/accounts/users/service/users.service";
import { EnvService } from "src/core/config/envs/env.service";
import { ErrorHandler } from "src/core/config/error/ErrorHandler";

@Injectable()
export class AdminService implements OnModuleInit {
	constructor(
		private readonly usersService: UsersService,
		private readonly envsService: EnvService,
	) {}
	async onModuleInit() {
		try {
			const admin = await this.#createAdmin();
			if (admin) Logger.log("Admin Created", "Initial Application...");
			return;
		} catch (error) {
			ErrorHandler(error);
		}
	}

	async #createAdmin() {
		const admin = {
			email: this.envsService.get("EMAIL_ADMIN"),
			password: this.envsService.get("PASSWORD_ADMIN"),
			user_name: this.envsService.get("NAME_ADMIN"),
		};
		const CreateAdmin = await this.usersService.createAdmin(admin);
		return CreateAdmin;
	}
}
