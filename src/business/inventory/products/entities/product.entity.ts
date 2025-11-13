import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { Category } from "../enum/category.enum";
import { Dimension } from "./dimension.entity";
import { Tag } from "./tag.entity";

@Entity("products")
export class Product {
	@PrimaryGeneratedColumn("uuid")
	id_product: string;

	@Column({ length: 255, nullable: false })
	title: string;

	@Column({ nullable: false })
	description: string;

	@Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
	price: number;

	@Column({
		type: "nvarchar",
		length: 20,
		nullable: false,
		transformer: {
			to: (value: Category) => value,
			from: (value: string) => value as Category,
		},
	})
	category: Category;

	@Column({ type: "int", default: 0 })
	stock: number;

	@Column({ type: "decimal", precision: 8, scale: 2, nullable: false })
	weight: number;

	@Column({ type: "simple-array", nullable: true })
	imageIds: string[]; // Array de IDs de imágenes

	@Column({ default: true })
	active: boolean;

	@Column({ default: false })
	featured: boolean; // Producto destacado

	@Column({ length: 500, unique: true, nullable: true })
	slug: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	// * Relations
	@OneToOne(
		() => Dimension,
		(dimension) => dimension.product,
		{ cascade: true, eager: true },
	)
	dimension: Dimension;

	@OneToMany(
		() => Tag,
		(tag) => tag.product,
		{ cascade: ["remove", "insert", "update"], eager: true },
	)
	tags: Tag[];

	// @OneToMany(
	// 	() => CartItem,
	// 	(cartItem) => cartItem.product,
	// )
	// CartsItems: CartItem;
}
