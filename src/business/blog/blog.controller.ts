import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { SellerOrAdmin } from "business/accounts/auth/decorators/index.decorator";
import { JwtAuthGuard } from "business/accounts/auth/guard/jwt-auth.guard";
import { RolesGuard } from "business/accounts/auth/guard/role.guard";
import { imageUploadOptions } from "core/config/multer/image-upload.config";
import { BlogService } from "./blog.service";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";

@Controller("blog")
@UseGuards(JwtAuthGuard, RolesGuard)
export class BlogController {
	constructor(private readonly blogService: BlogService) {}

	@SellerOrAdmin()
	@UseInterceptors(FileInterceptor("photo", imageUploadOptions))
	@Post()
	create(
		@Body() createBlogDto: CreateBlogDto,
		@UploadedFiles() photo?: Express.Multer.File[] | string[],
	) {
		return this.blogService.create(createBlogDto, photo);
	}

	@Get()
	findAll() {
		return this.blogService.findAll();
	}

	@Get("published")
	findPublished() {
		return this.blogService.findPublished();
	}

	@Get("category/:category")
	findByCategory(@Param("category") category: string) {
		return this.blogService.findByCategory(category);
	}

	@Get("tag/:target")
	findByTarget(@Param("target") target: string) {
		return this.blogService.findByTarget(target);
	}

	@Get("slug/:slug")
	findBySlug(@Param("slug") slug: string) {
		return this.blogService.findBySlug(slug);
	}

	@Get(":id_post")
	findOne(@Param("id_post") id_post: string) {
		return this.blogService.findOne(id_post);
	}

	@SellerOrAdmin()
	@Patch(":id_post")
	update(@Param("id_post") id_post: string, @Body() updateBlogDto: UpdateBlogDto) {
		return this.blogService.update(id_post, updateBlogDto);
	}

	@SellerOrAdmin()
	@Delete(":id_post")
	remove(@Param("id_post") id_post: string) {
		return this.blogService.remove(id_post);
	}
}
