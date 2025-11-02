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
// import { Order } from "./order.entity";

// @Entity("order_items")
// export class OrderItem {
// 	@PrimaryGeneratedColumn("uuid")
// 	id: string;

// 	@Column({ type: "uuid" })
// 	orderId: string;

// 	@Column({ type: "uuid" })
// 	productId: string;

// 	// Información del producto en el momento de la compra
// 	@Column({ type: "varchar", length: 255 })
// 	productTitle: string;

// 	@Column({ type: "int" })
// 	quantity: number;

// 	@Column({ type: "decimal", precision: 10, scale: 2 })
// 	price: number;

// 	@Column({ type: "decimal", precision: 10, scale: 2 })
// 	subtotal: number;

// 	@CreateDateColumn()
// 	createdAt: Date;

// 	@UpdateDateColumn()
// 	updatedAt: Date;

// 	// * Relations
// 	@ManyToOne(
// 		() => Order,
// 		(order) => order.items,
// 		{ onDelete: "CASCADE" },
// 	)
// 	@JoinColumn({ name: "orderId" })
// 	order: Order;

// 	@ManyToOne(() => Product, { eager: true, nullable: true })
// 	@JoinColumn({ name: "productId" })
// 	product: Product;
// }
