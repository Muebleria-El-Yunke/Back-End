import { Profile } from "business/accounts/profile/entities/profile.entity";
import { ROLE } from "src/core/enum/role.enum";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
	@PrimaryGeneratedColumn("uuid")
	id_user: string;

	@Column({ unique: true })
	email: string;

	@Column({ select: false })
	password: string;

	@Column({ unique: true })
	user_name: string;

	@Column({
		type: "nvarchar",
		length: 20,
		default: ROLE.BUYER,
		nullable: true,
		transformer: {
			to: (value: ROLE) => value,
			from: (value: string) => value as ROLE,
		},
	})
	role: ROLE;

	// ! Relations
	@OneToOne(
		() => Profile,
		(profile) => profile.user,
		{ nullable: true, onDelete: "SET NULL" },
	)
	@JoinColumn()
	profile: Profile;
}
