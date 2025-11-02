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
import { Roles } from "business/accounts/auth/decorators/index.decorator";
import { JwtAuthGuard } from "business/accounts/auth/guard/jwt-auth.guard";
import { RolesGuard } from "business/accounts/auth/guard/role.guard";
import { imageUploadOptions } from "core/config/multer/image-upload.config";
import { ROLE } from "core/enum/role.enum";
import { BlogService } from "./blog.service";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";

@Controller("blog")
@UseGuards(JwtAuthGuard, RolesGuard)
export class BlogController {
	constructor(private readonly blogService: BlogService) {}

	@Roles(ROLE.ADMIN, ROLE.SELLER)
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

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.blogService.findOne(id);
	}

	@Roles(ROLE.ADMIN, ROLE.SELLER)
	@Patch(":id")
	update(@Param("id") id: string, @Body() updateBlogDto: UpdateBlogDto) {
		return this.blogService.update(id, updateBlogDto);
	}

	@Roles(ROLE.ADMIN, ROLE.SELLER)
	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.blogService.remove(id);
	}
}
