// import { Profile } from "business/accounts/profile/entities/profile.entity";
// import {
// 	Column,
// 	CreateDateColumn,
// 	Entity,
// 	JoinColumn,
// 	ManyToOne,
// 	OneToMany,
// 	PrimaryGeneratedColumn,
// 	UpdateDateColumn,
// } from "typeorm";
// import { CartItem } from "./cart-item.entity";

// @Entity("carts")
// export class Cart {
// 	@PrimaryGeneratedColumn("uuid")
// 	id: string;

// 	@Column({ type: "uuid", nullable: true })
// 	profileId: string;

// 	@Column({  length: 255, nullable: true, unique: true })
// 	sessionId: string;

// 	@Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
// 	subtotal: number;

// 	@Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
// 	tax: number;

// 	@Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
// 	shipping: number;

// 	@Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
// 	total: number;

// 	@Column({  default: true })
// 	active: boolean;

// 	@CreateDateColumn()
// 	createdAt: Date;

// 	@UpdateDateColumn()
// 	updatedAt: Date;

// 	// * Relations
// 	@OneToMany(
// 		() => CartItem,
// 		(cartItem) => cartItem.cart,
// 		{
// 			cascade: true,
// 			eager: true,
// 		},
// 	)
// 	items: CartItem[];

// 	@ManyToOne(() => Profile, { nullable: true })
// 	@JoinColumn({ name: "profileId" })
// 	profile: Profile;
// }
