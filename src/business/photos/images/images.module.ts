import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EnvModule } from "src/core/config/envs/env.module";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { Image } from "./entities/image.entity";
import { ImagesService } from "./images.service";

@Module({
	imports: [TypeOrmModule.forFeature([Image]), CloudinaryModule, EnvModule],
	providers: [ImagesService],
	exports: [ImagesService],
})
export class ImagesModule {}
