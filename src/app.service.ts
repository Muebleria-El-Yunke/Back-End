import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
	getServer() {
		return { message: "server ok!", status: 200 };
	}
}
