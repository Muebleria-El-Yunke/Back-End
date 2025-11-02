import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PhotoOfEnum } from "business/common/photo.type";
import { ImagesService } from "business/photos/images/images.service";
import { ErrorHandler } from "core/config/error/ErrorHandler";
import { Repository } from "typeorm";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";
import { Blog } from "./entities/blog.entity";

@Injectable()
export class BlogService {
	constructor(
		@InjectRepository(Blog)
		private readonly blogRepository: Repository<Blog>,
		private readonly imagesService: ImagesService,
	) {}

	async create(createBlogDto: CreateBlogDto, photos?: Express.Multer.File[] | string[]) {
		try {
			// Generar slug único
			const slug = createBlogDto.slug || (await this.generateUniqueSlug(createBlogDto.title));

			// Crear blog
			const blog = this.blogRepository.create({
				...createBlogDto,
				slug,
			});

			const savedBlog = await this.blogRepository.save(blog);

			// Crear imágenes si existen
			let imageData: { id_image: string; url: string }[] = [];

			if (photos && photos.length > 0) {
				const { results } = await this.imagesService.createManyImages(
					photos,
					PhotoOfEnum.BLOG,
					savedBlog.id_blog,
				);

				imageData = results || [];

				// Actualizar el blog con los IDs de las imágenes
				if (imageData.length > 0) {
					await this.blogRepository.update(savedBlog.id_blog, {
						id_images: imageData.map((img) => img.id_image),
					});
				}
			}

			// Retornar blog con imágenes
			return {
				...savedBlog,
				id_images: imageData.map((img) => img.id_image),
				images: imageData,
			};
		} catch (error) {
			ErrorHandler(error);
			throw error;
		}
	}

	// * <<- Update solo datos del blog ->>
	async update(id_blog: string, updateBlogDto: UpdateBlogDto): Promise<Blog> {
		try {
			const blog = await this.blogRepository.findOne({ where: { id_blog } });

			if (!blog) {
				throw new NotFoundException(`Blog with ID ${id_blog} not found`);
			}

			// Actualizar slug si se cambia el título
			if (updateBlogDto.title && !updateBlogDto.slug && updateBlogDto.title !== blog.title) {
				updateBlogDto.slug = await this.generateUniqueSlug(updateBlogDto.title);
			}

			// Actualizar blog
			Object.assign(blog, updateBlogDto);
			return await this.blogRepository.save(blog);
		} catch (error) {
			ErrorHandler(error);
			throw error;
		}
	}

	// * <<- Añadir imágenes a un blog existente ->>
	async addImages(
		id_blog: string,
		photos: Express.Multer.File[] | string[],
	): Promise<{ id_image: string; url: string }[]> {
		try {
			const blog = await this.blogRepository.findOne({ where: { id_blog } });

			if (!blog) {
				throw new NotFoundException(`Blog with ID ${id_blog} not found`);
			}

			// Crear nuevas imágenes
			const { results } = await this.imagesService.createManyImages(
				photos,
				PhotoOfEnum.BLOG,
				id_blog,
			);

			const newImages = results || [];

			// Actualizar id_images en el blog
			if (newImages.length > 0) {
				const currentImages = blog.id_images || [];
				const updatedImages = [...currentImages, ...newImages.map((img) => img.id_image)];

				await this.blogRepository.update(id_blog, {
					id_images: updatedImages,
				});
			}

			return newImages;
		} catch (error) {
			ErrorHandler(error);
			throw error;
		}
	}

	// * <<- Eliminar una imagen específica ->>
	async removeImage(id_blog: string, id_image: string): Promise<void> {
		try {
			const blog = await this.blogRepository.findOne({ where: { id_blog } });

			if (!blog) {
				throw new NotFoundException(`Blog with ID ${id_blog} not found`);
			}

			// Verificar que la imagen pertenece al blog
			if (!blog.id_images?.includes(id_image)) {
				throw new NotFoundException(`Image ${id_image} not found in blog ${id_blog}`);
			}

			// Eliminar la imagen de Cloudinary y DB
			const image = await this.imagesService.findOneById({
				id_image,
				photoOf: PhotoOfEnum.BLOG,
			});

			if (image?.id_public) {
				await this.imagesService.delete({
					id_relation: id_blog,
					photoOf: PhotoOfEnum.BLOG,
				});
			}

			// Actualizar id_images del blog
			const updatedImages = blog.id_images.filter((img) => img !== id_image);
			await this.blogRepository.update(id_blog, {
				id_images: updatedImages,
			});
		} catch (error) {
			ErrorHandler(error);
			throw error;
		}
	}

	// * <<- Eliminar todas las imágenes de un blog ->>
	async removeAllImages(id_blog: string): Promise<void> {
		try {
			const blog = await this.blogRepository.findOne({ where: { id_blog } });

			if (!blog) {
				throw new NotFoundException(`Blog with ID ${id_blog} not found`);
			}

			// Eliminar todas las imágenes
			await this.imagesService.deleteRelation(id_blog, PhotoOfEnum.BLOG, false);

			// Limpiar id_images del blog
			await this.blogRepository.update(id_blog, {
				id_images: [],
			});
		} catch (error) {
			ErrorHandler(error);
			throw error;
		}
	}

	// * <<- Reemplazar todas las imágenes ->>
	async replaceImages(
		id_blog: string,
		photos: Express.Multer.File[] | string[],
	): Promise<{ id_image: string; url: string }[]> {
		try {
			// Primero eliminar todas las imágenes existentes
			await this.removeAllImages(id_blog);

			// Luego añadir las nuevas
			return await this.addImages(id_blog, photos);
		} catch (error) {
			ErrorHandler(error);
			throw error;
		}
	}

	async findAll(withImages: boolean = true) {
		try {
			const blogs = await this.blogRepository.find({
				order: { createdAt: "DESC" },
			});

			if (!withImages) {
				return blogs;
			}

			return await Promise.all(
				blogs.map(async (blog) => {
					const images = await this.imagesService.findRelationsById({
						id_relation: blog.id_blog,
						photoOf: PhotoOfEnum.BLOG,
					});

					return {
						...blog,
						images: images.map((img) => ({
							id_image: img.id_image,
							url: img.url,
						})),
					};
				}),
			);
		} catch (error) {
			ErrorHandler(error);
			throw error;
		}
	}

	async findPublished(withImages: boolean = true) {
		try {
			const blogs = await this.blogRepository.find({
				where: { active: true },
				order: { createdAt: "DESC" },
			});

			if (!withImages) {
				return blogs;
			}

			return await Promise.all(
				blogs.map(async (blog) => {
					const images = await this.imagesService.findRelationsById({
						id_relation: blog.id_blog,
						photoOf: PhotoOfEnum.BLOG,
					});

					return {
						...blog,
						images: images.map((img) => ({
							id_image: img.id_image,
							url: img.url,
						})),
					};
				}),
			);
		} catch (error) {
			ErrorHandler(error);
			throw error;
		}
	}

	async findByCategory(category: string, withImages: boolean = true) {
		try {
			const blogs = await this.blogRepository.find({
				where: { category, active: true },
				order: { createdAt: "DESC" },
			});

			if (!withImages) {
				return blogs;
			}

			return await Promise.all(
				blogs.map(async (blog) => {
					const images = await this.imagesService.findRelationsById({
						id_relation: blog.id_blog,
						photoOf: PhotoOfEnum.BLOG,
					});

					return {
						...blog,
						images: images.map((img) => ({
							id_image: img.id_image,
							url: img.url,
						})),
					};
				}),
			);
		} catch (error) {
			ErrorHandler(error);
			throw error;
		}
	}

	async findByTarget(tag: string, withImages: boolean = true) {
		try {
			const blogs = await this.blogRepository.find({
				where: { active: true },
				order: { createdAt: "DESC" },
			});

			const filteredBlogs = blogs.filter((blog) => blog.target?.includes(tag));

			if (!withImages) {
				return filteredBlogs;
			}

			return await Promise.all(
				filteredBlogs.map(async (blog) => {
					const images = await this.imagesService.findRelationsById({
						id_relation: blog.id_blog,
						photoOf: PhotoOfEnum.BLOG,
					});

					return {
						...blog,
						images: images.map((img) => ({
							id_image: img.id_image,
							url: img.url,
						})),
					};
				}),
			);
		} catch (error) {
			ErrorHandler(error);
			throw error;
		}
	}

	async findOne(id_blog: string, withImages: boolean = true) {
		try {
			const blog = await this.blogRepository.findOne({ where: { id_blog } });

			if (!blog) {
				throw new NotFoundException(`Blog with ID ${id_blog} not found`);
			}

			// Incrementar vistas
			await this.blogRepository.save(blog);

			if (!withImages) {
				return blog;
			}

			const images = await this.imagesService.findRelationsById({
				id_relation: blog.id_blog,
				photoOf: PhotoOfEnum.BLOG,
			});

			return {
				...blog,
				images: images.map((img) => ({
					id_image: img.id_image,
					url: img.url,
				})),
			};
		} catch (error) {
			ErrorHandler(error);
			throw error;
		}
	}

	async findBySlug(slug: string, withImages: boolean = true) {
		try {
			const blog = await this.blogRepository.findOne({ where: { slug } });

			if (!blog) {
				throw new NotFoundException(`Blog with slug "${slug}" not found`);
			}

			// Incrementar vistas
			await this.blogRepository.save(blog);

			if (!withImages) {
				return blog;
			}

			const images = await this.imagesService.findRelationsById({
				id_relation: blog.id_blog,
				photoOf: PhotoOfEnum.BLOG,
			});

			return {
				...blog,
				images: images.map((img) => ({
					id_image: img.id_image,
					url: img.url,
				})),
			};
		} catch (error) {
			ErrorHandler(error);
			throw error;
		}
	}

	async remove(id_blog: string): Promise<void> {
		try {
			const blog = await this.blogRepository.findOne({ where: { id_blog } });

			if (!blog) {
				throw new NotFoundException(`Blog with ID ${id_blog} not found`);
			}

			// Eliminar imágenes asociadas
			await this.imagesService.deleteRelation(blog.id_blog, PhotoOfEnum.BLOG, false);

			// Eliminar blog
			await this.blogRepository.remove(blog);
		} catch (error) {
			ErrorHandler(error);
			throw error;
		}
	}

	private async generateUniqueSlug(title: string): Promise<string> {
		let slug = this.#slugify(title);
		let counter = 1;
		let uniqueSlug = slug;

		while (await this.blogRepository.findOne({ where: { slug: uniqueSlug } })) {
			uniqueSlug = `${slug}-${counter}`;
			counter++;
		}

		return uniqueSlug;
	}

	#slugify(text: string): string {
		return text
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/[^\w\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.trim();
	}
}
