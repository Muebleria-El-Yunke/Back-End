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
