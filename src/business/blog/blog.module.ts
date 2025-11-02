import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImagesModule } from "business/photos/images/images.module";
import { BlogController } from "./blog.controller";
import { BlogService } from "./blog.service";
import { Blog } from "./entities/blog.entity";

@Module({
	imports: [TypeOrmModule.forFeature([Blog]), ImagesModule],
	controllers: [BlogController],
	providers: [BlogService],
})
export class BlogModule {}
