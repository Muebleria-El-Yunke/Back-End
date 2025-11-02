import { Provider } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";
import { EnvService } from "src/core/config/envs/env.service";

export const CloudinaryProvider: Provider = {
	provide: "CLOUDINARY",
	inject: [EnvService],
	useFactory: (envService: EnvService) => {
		const cloudName = envService.get("CLOUDINARY_NAME");
		const apiKey = envService.get("CLOUDINARY_API_KEY");
		const apiSecret = envService.get("CLOUDINARY_API_SECRET");

		if (!cloudName || !apiKey || !apiSecret) {
			throw new Error("Missing Cloudinary environment variables");
		}

		return cloudinary.config({
			cloud_name: cloudName,
			api_key: apiKey,
			api_secret: apiSecret,
			secure: envService.inProduction(),
		});
	},
};
