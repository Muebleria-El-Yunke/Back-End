import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity("tags")
export class Tag {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ length: 100, nullable: false })
	name: string;

	@Column({ length: 7, nullable: true })
	color: string; // Color hex para la etiqueta (ej: #FF5733)

	// * Relations
	@ManyToOne(
		() => Product,
		(product) => product.tags,
		{ onDelete: "CASCADE" },
	)
	@JoinColumn({ name: "productId" })
	product: Product;
}
