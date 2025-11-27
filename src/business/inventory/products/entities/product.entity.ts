import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { Category } from "../enum/category.enum";
import { Dimension, Tag } from "./index.entity";

@Entity("products")
export class Product {
	@PrimaryGeneratedColumn("uuid")
	id_product: string;

	@Column({ type: "varchar", length: 255, nullable: false })
	title: string;

	@Column({ type: "text", nullable: false })
	description: string;

	@Column({
		type: "decimal",
		precision: 10,
		scale: 2,
		nullable: false,
		transformer: {
			to: (value: number) => value,
			from: (value: string) => parseFloat(value),
		},
	})
	price: number;

	@Column({ type: "enum", enum: Category, nullable: false })
	category: Category;

	@Column({
		type: "decimal",
		precision: 8,
		scale: 2,
		nullable: false,
		transformer: {
			to: (value: number) => value,
			from: (value: string) => parseFloat(value),
		},
	})
	weight: number;

	@Column({ type: "boolean", default: true })
	active: boolean;

	@Column({ type: "boolean", default: false })
	featured: boolean;

	// Array de UUIDs de imágenes - CORRECCIÓN CRÍTICA
	@Column({ type: "simple-array", nullable: true })
	id_images: string[];

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt: Date;

	// * Relations
	@OneToOne(
		() => Dimension,
		(dimension) => dimension.product,
		{
			cascade: true,
			eager: false, // Cambiar a false para mejor performance
			onDelete: "CASCADE",
		},
	)
	@JoinColumn({ name: "dimension_id" })
	dimension: Dimension;

	@OneToMany(
		() => Tag,
		(tag) => tag.product,
		{
			cascade: ["insert", "update", "remove"],
			eager: false, // Cambiar a false, cargar cuando sea necesario
			onDelete: "CASCADE",
		},
	)
	tags: Tag[];

	// * Métodos útiles
	/**
	 * Calcula el precio con descuento
	 */
	getPriceWithDiscount(discountPercentage: number): number {
		return this.price * (1 - discountPercentage / 100);
	}
}
