import { PhotoOfEnum } from "business/common/photo.type";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@Index(["photoOf", "id_relation"])
export class Image {
	@PrimaryGeneratedColumn("uuid")
	id_image: string;

	@Column({ nullable: true })
	id_public: string;

	@Column({ nullable: false, unique: true })
	url: string;

	// * Polymorphic relations
	@Column({ nullable: true, enum: PhotoOfEnum, type: "enum" })
	photoOf: PhotoOfEnum;
	@Column({ type: "uuid", nullable: true })
	id_relation: string;
}
