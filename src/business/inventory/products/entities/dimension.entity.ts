import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity("dimensions")
export class Dimension {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "decimal", precision: 8, scale: 2, nullable: false })
	width: number; // Ancho en cm

	@Column({ type: "decimal", precision: 8, scale: 2, nullable: false })
	height: number; // Alto en cm

	@Column({ type: "decimal", precision: 8, scale: 2, nullable: false })
	depth: number; // Profundidad en cm

	@Column({ type: "varchar", length: 10, default: "cm" })
	unit: string; // Unidad de medida

	// * Relations
	@OneToOne(
		() => Product,
		(product) => product.dimension,
		{ onDelete: "CASCADE" },
	)
	@JoinColumn()
	product: Product;
}
