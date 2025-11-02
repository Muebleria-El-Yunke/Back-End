import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CloudinaryModule } from "src/business/photos/cloudinary/cloudinary.module";
import { ImagesModule } from "src/business/photos/images/images.module";
import { EnvModule } from "src/core/config/envs/env.module";
import { UsersModule } from "../users/users.module";
import { Profile } from "./entities/profile.entity";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([Profile]),
		UsersModule,
		ImagesModule,
		EnvModule,
		CloudinaryModule,
	],
	controllers: [ProfileController],
	providers: [ProfileService],
	exports: [ProfileService, TypeOrmModule],
})
export class ProfileModule {}
