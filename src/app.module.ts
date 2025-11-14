import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "business/accounts/auth/auth.module";
import { ProfileModule } from "business/accounts/profile/profile.module";
import { UsersModule } from "business/accounts/users/users.module";
import { BlogModule } from "business/blog/blog.module";
import { ProductsModule } from "business/inventory/products/products.module";
import { CloudinaryModule } from "business/photos/cloudinary/cloudinary.module";
import { ImagesModule } from "business/photos/images/images.module";
import { TypeOrmConfig } from "core/config/database/database.config";
import { EnvModule } from "core/config/envs/env.module";
import { AppSecure } from "core/config/security/security.config";
import { InitModule } from "core/init/init.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
	imports: [
		// * Config
		EnvModule,
		TypeOrmModule.forRootAsync(TypeOrmConfig),

		InitModule,
		ImagesModule,
		CloudinaryModule,
		// * User
		AuthModule,
		ProfileModule,
		UsersModule,
		// * Blogs
		BlogModule,
		// * E-Commerce
		ProductsModule,
		// TODO CartsModule,
		// TODO OrdersModule,
		// TODO ProfileModule,
		// TODO PaymentModule,
	],
	controllers: [AppController],
	providers: [...AppSecure, AppService],
})
export class AppModule {}
