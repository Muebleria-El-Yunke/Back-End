import { Exclude } from "class-transformer";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity()
export class Profile {
	@PrimaryGeneratedColumn("uuid")
	id_profile: string;

	@Column({ nullable: false })
	last_name: string;

	@Column({ nullable: false })
	name: string;

	@Column({ nullable: false })
	age: number;

	@Column({ default: false })
	seller_principal: boolean;

	// * Social Networks
	@Column({ nullable: true })
	country_prefix: string;

	@Column({ nullable: true })
	phone_number: string;

	@Column({ nullable: true })
	facebook: string;

	@Column({ nullable: true })
	instagram: string;

	@Column({ nullable: true })
	whatsapp: string;

	// ! Relations
	@Exclude()
	@OneToOne(
		() => User,
		(user) => user.profile,
		{
			nullable: false,
		},
	)
	user: User;

	// @OneToMany(
	// 	() => Cart,
	// 	(cart) => cart.profile,
	// )
	// carts: Cart[];

	// ! Retions Polimorphy
	@Column({ type: "uuid", unique: true })
	id_image: string;
}
