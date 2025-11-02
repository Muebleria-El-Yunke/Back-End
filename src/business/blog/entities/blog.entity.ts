import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity()
export class Blog {
	@PrimaryGeneratedColumn("uuid")
	id_blog: string;

	@Column({ type: "varchar", length: 255 })
	title: string;

	@Column({ type: "varchar", length: 500, nullable: true })
	slug?: string;

	@Column({ type: "text" })
	content: string;

	@Column({ type: "varchar", length: 500, nullable: true })
	excerpt: string; // short summary

	@Column({ type: "varchar", length: 500, nullable: true })
	category?: string;

	@Column({ type: "simple-array", nullable: true })
	target?: string[];

	@Column({ type: "simple-array", nullable: true })
	keywords?: string[]; // Words SEO

	@Column({ type: "boolean", default: true })
	active: boolean;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	// * Relations
	// TODO Products:
	@Column({ type: "uuid", nullable: true })
	id_images: string[];
}
