import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
	getServer(): string {
		return "server ok!";
	}
}
