// import { Profile } from "business/accounts/profile/entities/profile.entity";
// import { Payment } from "business/inventory/payment/entities/payment.entity";
// import {
// 	Column,
// 	CreateDateColumn,
// 	Entity,
// 	JoinColumn,
// 	ManyToOne,
// 	OneToMany,
// 	OneToOne,
// 	PrimaryGeneratedColumn,
// 	UpdateDateColumn,
// } from "typeorm";
// import { OrderStatus } from "../enum/order-status";
// import { OrderItem } from "./order-item.entity";

// @Entity("orders")
// export class Order {
// 	@PrimaryGeneratedColumn("uuid")
// 	id: string;

// 	@Column({ type: "varchar", length: 50, unique: true })
// 	orderNumber: string; // Ej: "ORD-2024-001234"

// 	@Column({ type: "uuid" })
// 	profileId: string;

// 	@Column({
// 		type: "enum",
// 		enum: OrderStatus,
// 		default: OrderStatus.PENDING,
// 	})
// 	status: OrderStatus;

// 	// Totales (copiados del carrito al momento de crear la orden)
// 	@Column({ type: "decimal", precision: 10, scale: 2 })
// 	subtotal: number;

// 	@Column({ type: "decimal", precision: 10, scale: 2 })
// 	tax: number;

// 	@Column({ type: "decimal", precision: 10, scale: 2 })
// 	shipping: number;

// 	@Column({ type: "decimal", precision: 10, scale: 2 })
// 	total: number;

// 	// Información de envío
// 	@Column({ type: "varchar", length: 500 })
// 	shippingAddress: string;

// 	@Column({ type: "varchar", length: 100 })
// 	shippingCity: string;

// 	@Column({ type: "varchar", length: 50 })
// 	shippingPostalCode: string;

// 	@Column({ type: "varchar", length: 100 })
// 	shippingCountry: string;

// 	@Column({ type: "varchar", length: 20, nullable: true })
// 	shippingPhone: string;

// 	// Notas adicionales
// 	@Column({ type: "text", nullable: true })
// 	notes: string;

// 	@CreateDateColumn()
// 	createdAt: Date;

// 	@UpdateDateColumn()
// 	updatedAt: Date;

// 	// * Relations
// 	@ManyToOne(() => Profile, { nullable: false })
// 	@JoinColumn({ name: "profileId" })
// 	profile: Profile;

// 	@OneToMany(
// 		() => OrderItem,
// 		(orderItem) => orderItem.order,
// 		{
// 			cascade: true,
// 			eager: true,
// 		},
// 	)
// 	items: OrderItem[];

// 	@OneToOne(
// 		() => Payment,
// 		(payment) => payment.order,
// 		{
// 			nullable: true,
// 			eager: true,
// 		},
// 	)
// 	payment: Payment;
// }
