// import {
// 	Column,
// 	CreateDateColumn,
// 	Entity,
// 	JoinColumn,
// 	OneToOne,
// 	PrimaryGeneratedColumn,
// 	UpdateDateColumn,
// } from "typeorm";
// import { Order } from "../../orders/entities/order.entity";

// export enum PaymentStatus {
// 	PENDING = "pending", // Esperando pago
// 	PROCESSING = "processing", // Procesando pago
// 	APPROVED = "approved", // Pago aprobado
// 	REJECTED = "rejected", // Pago rechazado
// 	CANCELLED = "cancelled", // Pago cancelado
// 	REFUNDED = "refunded", // Pago reembolsado
// }

// export enum PaymentMethod {
// 	CREDIT_CARD = "credit_card",
// 	DEBIT_CARD = "debit_card",
// 	MERCADOPAGO = "mercadopago",
// 	PAYPAL = "paypal",
// 	BANK_TRANSFER = "bank_transfer",
// 	CASH_ON_DELIVERY = "cash_on_delivery",
// }

// @Entity("payments")
// export class Payment {
// 	@PrimaryGeneratedColumn("uuid")
// 	id: string;

// 	@Column({ type: "uuid", unique: true })
// 	orderId: string;

// 	@Column({
// 		type: "enum",
// 		enum: PaymentStatus,
// 		default: PaymentStatus.PENDING,
// 	})
// 	status: PaymentStatus;

// 	@Column({
// 		type: "enum",
// 		enum: PaymentMethod,
// 	})
// 	method: PaymentMethod;

// 	@Column({ type: "decimal", precision: 10, scale: 2 })
// 	amount: number;

// 	@Column({  length: 10, default: "ARS" })
// 	currency: string;

// 	// IDs externos de la pasarela de pago
// 	@Column({  length: 255, nullable: true })
// 	externalPaymentId: string; // ID de MercadoPago, Stripe, etc.

// 	@Column({  length: 255, nullable: true })
// 	externalPreferenceId: string; // ID de preferencia de pago

// 	// Metadata adicional de la pasarela
// 	@Column({ type: "jsonb", nullable: true })
// 	metadata: Record<string, any>;

// 	// Información de la transacción
// 	@Column({ type: "timestamp", nullable: true })
// 	paidAt: Date;

// 	@Column({  nullable: true })
// 	failureReason: string;

// 	@CreateDateColumn()
// 	createdAt: Date;

// 	@UpdateDateColumn()
// 	updatedAt: Date;

// 	// * Relations
// 	@OneToOne(
// 		() => Order,
// 		(order) => order.payment,
// 		{ onDelete: "CASCADE" },
// 	)
// 	@JoinColumn({ name: "orderId" })
// 	order: Order;
// }
