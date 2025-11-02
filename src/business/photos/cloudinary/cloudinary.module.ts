import { Module } from "@nestjs/common";
import { EnvModule } from "src/core/config/envs/env.module";
import { CloudinaryProvider } from "./provider/cloudinary.provider";
import { CloudinaryService } from "./provider/cloudinary.service";

@Module({
	imports: [EnvModule],
	providers: [CloudinaryProvider, CloudinaryService],
	exports: [CloudinaryService],
})
export class CloudinaryModule {}
