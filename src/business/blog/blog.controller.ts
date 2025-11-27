import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Put,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { SellerOrAdmin } from "business/accounts/auth/decorators/index.decorator";
import { JwtAuthGuard } from "business/accounts/auth/guard/jwt-auth.guard";
import { RolesGuard } from "business/accounts/auth/guard/role.guard";
import { imageUploadOptions } from "core/config/multer/image-upload.config";
import { BlogService } from "./blog.service";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";

@ApiTags("Blog")
@Controller("blog")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BlogController {
	constructor(private readonly blogService: BlogService) {}

	// ========== CREATE BLOG POST ==========
	@SellerOrAdmin()
	@Post()
	@HttpCode(HttpStatus.CREATED)
	@UseInterceptors(FileInterceptor("photo", imageUploadOptions))
	@ApiOperation({ summary: "Crear post de blog" })
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				title: {
					type: "string",
					maxLength: 255,
					description: "Título del blog",
					example: "My First Blog Post",
				},
				slug: {
					type: "string",
					maxLength: 500,
					description: "Slug del blog (opcional)",
					example: "my-first-blog-post",
					nullable: true,
				},
				content: {
					type: "string",
					description: "Contenido del blog",
					example: "Content of the blog post...",
				},
				excerpt: {
					type: "string",
					description: "Extracto del blog (opcional)",
					example: "Short summary...",
					nullable: true,
				},
				category: {
					type: "string",
					maxLength: 100,
					description: "Categoría del blog (opcional)",
					example: "Technology",
					nullable: true,
				},
				target: {
					type: "array",
					items: { type: "string" },
					description: "Audiencia objetivo (opcional)",
					example: ["tech", "news"],
					nullable: true,
				},
				keywords: {
					type: "array",
					items: { type: "string" },
					description: "Palabras clave (opcional)",
					example: ["nestjs", "swagger"],
					nullable: true,
				},
				active: {
					type: "boolean",
					description: "¿Está activo el blog? (opcional)",
					example: true,
					nullable: true,
				},
				photo: {
					type: "string",
					format: "binary",
					description: "Imagen de portada (opcional)",
					nullable: true,
				},
			},
			required: ["title", "content"],
		},
	})
	@ApiResponse({ status: 201, description: "Post creado exitosamente" })
	@ApiResponse({ status: 400, description: "Datos inválidos" })
	@ApiResponse({ status: 401, description: "No autorizado" })
	create(@Body() createBlogDto: CreateBlogDto, @UploadedFile() photo?: Express.Multer.File) {
		return this.blogService.create(createBlogDto, photo ? [photo] : undefined);
	}

	// ========== GET ALL POSTS ==========
	@Get()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Obtener todos los posts" })
	@ApiResponse({ status: 200, description: "Lista de posts" })
	findAll() {
		return this.blogService.findAll();
	}

	// ========== GET PUBLISHED POSTS ==========
	@Get("published")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Obtener posts publicados" })
	@ApiResponse({ status: 200, description: "Lista de posts publicados" })
	findPublished() {
		return this.blogService.findPublished();
	}

	// ========== GET POSTS BY CATEGORY ==========
	@Get("category/:category")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Obtener posts por categoría" })
	@ApiResponse({ status: 200, description: "Posts de la categoría" })
	findByCategory(@Param("category") category: string) {
		return this.blogService.findByCategory(category);
	}

	// ========== GET POSTS BY TARGET ==========
	@Get("tag/:target")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Obtener posts por target" })
	@ApiResponse({ status: 200, description: "Posts del target" })
	findByTarget(@Param("target") target: string) {
		return this.blogService.findByTarget(target);
	}

	// ========== GET POST BY SLUG ==========
	@Get("slug/:slug")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Obtener post por slug" })
	@ApiResponse({ status: 200, description: "Post encontrado" })
	@ApiResponse({ status: 404, description: "Post no encontrado" })
	findBySlug(@Param("slug") slug: string) {
		return this.blogService.findBySlug(slug);
	}

	// ========== GET POST BY ID ==========
	@Get(":id_post")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Obtener post por ID" })
	@ApiResponse({ status: 200, description: "Post encontrado" })
	@ApiResponse({ status: 404, description: "Post no encontrado" })
	findOne(@Param("id_post", ParseUUIDPipe) id_post: string) {
		return this.blogService.findOne(id_post);
	}

	// ========== UPDATE POST (SOLO DATOS) ==========
	@SellerOrAdmin()
	@Patch(":id_post")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Actualizar datos del post (sin imágenes)" })
	@ApiBody({ type: UpdateBlogDto })
	@ApiResponse({ status: 200, description: "Post actualizado exitosamente" })
	@ApiResponse({ status: 400, description: "Datos inválidos" })
	@ApiResponse({ status: 404, description: "Post no encontrado" })
	update(@Param("id_post", ParseUUIDPipe) id_post: string, @Body() updateBlogDto: UpdateBlogDto) {
		return this.blogService.update(id_post, updateBlogDto);
	}

	// ========== ADD IMAGES TO POST ==========
	@SellerOrAdmin()
	@Post(":id_post/images")
	@HttpCode(HttpStatus.CREATED)
	@UseInterceptors(FileInterceptor("photo", imageUploadOptions))
	@ApiOperation({ summary: "Añadir imágenes a un post existente" })
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				photo: {
					type: "string",
					format: "binary",
					description: "Imagen a añadir",
				},
			},
			required: ["photo"],
		},
	})
	@ApiResponse({ status: 201, description: "Imagen añadida exitosamente" })
	@ApiResponse({ status: 404, description: "Post no encontrado" })
	addImages(
		@Param("id_post", ParseUUIDPipe) id_post: string,
		@UploadedFile() photo: Express.Multer.File,
	) {
		return this.blogService.addImages(id_post, [photo]);
	}

	// ========== REPLACE ALL IMAGES ==========
	@SellerOrAdmin()
	@Put(":id_post/images")
	@HttpCode(HttpStatus.OK)
	@UseInterceptors(FileInterceptor("photo", imageUploadOptions))
	@ApiOperation({ summary: "Reemplazar todas las imágenes del post" })
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				photo: {
					type: "string",
					format: "binary",
					description: "Nueva imagen (reemplazará todas las existentes)",
				},
			},
			required: ["photo"],
		},
	})
	@ApiResponse({ status: 200, description: "Imágenes reemplazadas exitosamente" })
	@ApiResponse({ status: 404, description: "Post no encontrado" })
	replaceImages(
		@Param("id_post", ParseUUIDPipe) id_post: string,
		@UploadedFile() photo: Express.Multer.File,
	) {
		return this.blogService.replaceImages(id_post, [photo]);
	}

	// ========== DELETE SPECIFIC IMAGE ==========
	@SellerOrAdmin()
	@Delete(":id_post/images/:id_image")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Eliminar una imagen específica del post" })
	@ApiResponse({ status: 204, description: "Imagen eliminada exitosamente" })
	@ApiResponse({ status: 404, description: "Post o imagen no encontrada" })
	removeImage(
		@Param("id_post", ParseUUIDPipe) id_post: string,
		@Param("id_image", ParseUUIDPipe) id_image: string,
	) {
		return this.blogService.removeImage(id_post, id_image);
	}

	// ========== DELETE ALL IMAGES ==========
	@SellerOrAdmin()
	@Delete(":id_post/images")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Eliminar todas las imágenes del post" })
	@ApiResponse({ status: 204, description: "Imágenes eliminadas exitosamente" })
	@ApiResponse({ status: 404, description: "Post no encontrado" })
	removeAllImages(@Param("id_post", ParseUUIDPipe) id_post: string) {
		return this.blogService.removeAllImages(id_post);
	}

	// ========== DELETE POST ==========
	@SellerOrAdmin()
	@Delete(":id_post")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Eliminar post" })
	@ApiResponse({ status: 204, description: "Post eliminado exitosamente" })
	@ApiResponse({ status: 404, description: "Post no encontrado" })
	remove(@Param("id_post", ParseUUIDPipe) id_post: string) {
		return this.blogService.remove(id_post);
	}
}
