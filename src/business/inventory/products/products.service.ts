import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Dimension } from "./entities/dimension.entity";
import { Product } from "./entities/product.entity";
import { Tag } from "./entities/tag.entity";
import { Category } from "./enum/category.enum";

@Injectable()
export class ProductsService {
	constructor(
		@InjectRepository(Product)
		private readonly productRepository: Repository<Product>,
		@InjectRepository(Dimension)
		private readonly dimensionRepository: Repository<Dimension>,
		@InjectRepository(Tag)
		private readonly tagRepository: Repository<Tag>,
	) {}

	async create(createProductDto: CreateProductDto): Promise<Product> {
		// Generar slug si no se proporciona
		if (!createProductDto.slug && createProductDto.title) {
			createProductDto.slug = await this.generateUniqueSlug(createProductDto.title);
		}

		// Crear producto
		const product = this.productRepository.create({
			title: createProductDto.title,
			description: createProductDto.description,
			price: createProductDto.price,
			category: createProductDto.category,
			stock: createProductDto.stock,
			weight: createProductDto.weight,
			imageIds: createProductDto.imageIds,
			active: createProductDto.active,
			featured: createProductDto.featured,
			slug: createProductDto.slug,
		});

		const savedProduct = await this.productRepository.save(product);

		// Crear dimensiones si existen
		if (createProductDto.dimension) {
			const dimension = this.dimensionRepository.create({
				...createProductDto.dimension,
				product: savedProduct,
			});
			await this.dimensionRepository.save(dimension);
		}

		// Crear tags si existen
		if (createProductDto.tags && createProductDto.tags.length > 0) {
			const tags = createProductDto.tags.map((tagDto) =>
				this.tagRepository.create({
					name: tagDto.name,
					color: tagDto.color,
					product: savedProduct,
				}),
			);
			await this.tagRepository.save(tags);
		}

		return this.findOne(savedProduct.id_product);
	}

	async findAll(): Promise<Product[]> {
		return await this.productRepository.find({
			order: { createdAt: "DESC" },
		});
	}

	async findActive(): Promise<Product[]> {
		return await this.productRepository.find({
			where: { active: true },
			order: { createdAt: "DESC" },
		});
	}

	async findFeatured(): Promise<Product[]> {
		return await this.productRepository.find({
			where: { active: true, featured: true },
			order: { createdAt: "DESC" },
		});
	}

	async findByCategory(category: Category): Promise<Product[]> {
		return await this.productRepository.find({
			where: { category, active: true },
			order: { createdAt: "DESC" },
		});
	}

	async findInStock(): Promise<Product[]> {
		return await this.productRepository
			.createQueryBuilder("product")
			.where("product.active = :active", { active: true })
			.andWhere("product.stock > :stock", { stock: 0 })
			.orderBy("product.createdAt", "DESC")
			.getMany();
	}

	async findOne(id_product: string): Promise<Product> {
		const product = await this.productRepository.findOne({
			where: { id_product },
			relations: ["dimension", "tags"],
		});

		if (!product) {
			throw new NotFoundException(`Producto con ID ${id_product} no encontrado`);
		}

		return product;
	}

	async findBySlug(slug: string): Promise<Product> {
		const product = await this.productRepository.findOne({
			where: { slug },
			relations: ["dimension", "tags"],
		});

		if (!product) {
			throw new NotFoundException(`Producto con slug "${slug}" no encontrado`);
		}

		return product;
	}

	async update(id_product: string, updateProductDto: UpdateProductDto): Promise<Product> {
		const product = await this.findOne(id_product);

		// Actualizar slug si se cambia el título
		if (
			updateProductDto.title &&
			!updateProductDto.slug &&
			updateProductDto.title !== product.title
		) {
			updateProductDto.slug = await this.generateUniqueSlug(updateProductDto.title, id_product);
		}

		// Actualizar producto
		Object.assign(product, {
			title: updateProductDto.title ?? product.title,
			description: updateProductDto.description ?? product.description,
			price: updateProductDto.price ?? product.price,
			category: updateProductDto.category ?? product.category,
			stock: updateProductDto.stock ?? product.stock,
			weight: updateProductDto.weight ?? product.weight,
			imageIds: updateProductDto.imageIds ?? product.imageIds,
			active: updateProductDto.active ?? product.active,
			featured: updateProductDto.featured ?? product.featured,
			slug: updateProductDto.slug ?? product.slug,
		});

		await this.productRepository.save(product);

		// Actualizar dimensiones
		if (updateProductDto.dimension && product.dimension) {
			Object.assign(product.dimension, updateProductDto.dimension);
			await this.dimensionRepository.save(product.dimension);
		} else if (updateProductDto.dimension && !product.dimension) {
			const dimension = this.dimensionRepository.create({
				...updateProductDto.dimension,
				product,
			});
			await this.dimensionRepository.save(dimension);
		}

		// Actualizar tags
		if (updateProductDto.tags) {
			// Eliminar tags existentes
			await this.tagRepository.delete({ product: { id_product } });

			// Crear nuevos tags
			if (updateProductDto.tags.length > 0) {
				const tags = updateProductDto.tags.map((tagDto) =>
					this.tagRepository.create({
						name: tagDto.name,
						color: tagDto.color,
						product,
					}),
				);
				await this.tagRepository.save(tags);
			}
		}

		return this.findOne(id_product);
	}

	async remove(id_product: string): Promise<void> {
		const product = await this.findOne(id_product);
		await this.productRepository.remove(product);
	}

	async toggleActive(id: string): Promise<Product> {
		const product = await this.findOne(id);
		product.active = !product.active;
		return await this.productRepository.save(product);
	}

	async toggleFeatured(id: string): Promise<Product> {
		const product = await this.findOne(id);
		product.featured = !product.featured;
		return await this.productRepository.save(product);
	}

	async updateStock(id: string, quantity: number): Promise<Product> {
		const product = await this.findOne(id);
		product.stock = quantity;
		return await this.productRepository.save(product);
	}

	async decrementStock(id: string, quantity: number): Promise<Product> {
		const product = await this.findOne(id);

		if (product.stock < quantity) {
			throw new NotFoundException(`Stock insuficiente. Disponible: ${product.stock}`);
		}

		product.stock -= quantity;
		return await this.productRepository.save(product);
	}

	async incrementStock(id: string, quantity: number): Promise<Product> {
		const product = await this.findOne(id);
		product.stock += quantity;
		return await this.productRepository.save(product);
	}

	private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
		const slug = this.slugify(title);
		let counter = 1;
		let uniqueSlug = slug;

		while (true) {
			const existing = await this.productRepository.findOne({ where: { slug: uniqueSlug } });

			if (!existing || existing.id_product === excludeId) {
				break;
			}

			uniqueSlug = `${slug}-${counter}`;
			counter++;
		}

		return uniqueSlug;
	}

	private slugify(text: string): string {
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
