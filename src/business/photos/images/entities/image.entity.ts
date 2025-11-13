import { PhotoOfEnum } from "business/common/photo.type";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@Index(["photoOf", "id_relation"])
@Index(["photoOf", "id_relation", "order"])
export class Image {
	@PrimaryGeneratedColumn("uuid")
	id_image: string;

	@Column({ nullable: true })
	id_public: string;

	@Column({ nullable: false, unique: true })
	url: string;

	// * Polymorphic relations
	@Column({
		type: "nvarchar",
		length: 20,
		nullable: true,
		transformer: {
			to: (value: PhotoOfEnum) => value,
			from: (value: string) => value as PhotoOfEnum,
		},
	})
	photoOf: PhotoOfEnum;

	@Column({ type: "uuid", nullable: true })
	id_relation: string;

	// * Order/Priority field
	@Column({ type: "int", default: 0 })
	order: number;
}
