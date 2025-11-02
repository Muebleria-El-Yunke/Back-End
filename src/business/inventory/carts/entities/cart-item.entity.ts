// import {
// 	Column,
// 	CreateDateColumn,
// 	Entity,
// 	JoinColumn,
// 	ManyToOne,
// 	PrimaryGeneratedColumn,
// 	UpdateDateColumn,
// } from "typeorm";
// import { Product } from "../../products/entities/product.entity";
// import { Cart } from "./cart.entity";

// @Entity("cart_items")
// export class CartItem {
// 	@PrimaryGeneratedColumn("uuid")
// 	id: string;

// 	@Column({ type: "uuid", nullable: false })
// 	productId: string;

// 	@Column({ type: "int", nullable: false })
// 	quantity: number;

// 	@Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
// 	price: number;

// 	@Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
// 	subtotal: number;

// 	@CreateDateColumn()
// 	createdAt: Date;

// 	@UpdateDateColumn()
// 	updatedAt: Date;

// 	// * Relations
// 	@ManyToOne(
// 		() => Cart,
// 		(cart) => cart.items,
// 		{ onDelete: "CASCADE" },
// 	)
// 	@JoinColumn()
// 	cart: Cart;

// 	@ManyToOne(() => Product, { eager: true })
// 	@JoinColumn()
// 	product: Product;
// }
