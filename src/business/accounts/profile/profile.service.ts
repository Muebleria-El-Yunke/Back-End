import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PhotoOfEnum } from "business/common/photo.type";
import { ImagesService } from "business/photos/images/images.service";
import { ErrorHandler } from "src/core/config/error/ErrorHandler";
import { Repository } from "typeorm";
import { UsersService } from "../users/service/users.service";
import { CreateProfileDto } from "./dto/create-profile.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { Profile } from "./entities/profile.entity";
import { IdsProfileInterface } from "./interface/profile.interface";

@Injectable()
export class ProfileService {
	private readonly logger = new Logger(ProfileService.name);

	constructor(
		@InjectRepository(Profile)
		private readonly profileRepository: Repository<Profile>,
		private readonly userService: UsersService,
		private readonly imagesService: ImagesService,
	) {}

	// * <<- Find ->>
	async findAll(withImage: boolean = true) {
		try {
			const profiles = await this.profileRepository.find();

			if (!withImage) {
				return profiles;
			}

			// Usar Promise.all para consultas paralelas en lugar de secuenciales
			const profilesWithImages = await Promise.all(
				profiles.map(async (profile) => {
					const image = await this.imagesService.findOneById({
						id_image: profile.id_image,
						photoOf: PhotoOfEnum.PROFILE,
					});
					const { id_image, ...profileNormalize } = profile;

					return {
						...profileNormalize,
						image: { url: image?.url as string, id_image },
					};
				}),
			);

			return profilesWithImages;
		} catch (error) {
			ErrorHandler(error);
			throw error;
		}
	}

	async findOneByProfile(id_profile: string, withImage: boolean = true) {
		try {
			const profile = await this.profileRepository.findOneBy({ id_profile });
			if (!profile) {
				throw new NotFoundException("Profile not found");
			}

			if (withImage) {
				const image = await this.imagesService.findOneById({
					id_image: profile.id_image,
					photoOf: PhotoOfEnum.PROFILE,
				});
				const { id_image, ...profileNormalize } = profile;
				return {
					...profileNormalize,
					image: { url: image?.url as string, id_image },
				};
			}
			return profile;
		} catch (error) {
			ErrorHandler(error);
		}
	}

	// * <<- Create ->>
	async create(createProfileDto: CreateProfileDto, id_user: string, photo?: Express.Multer.File) {
		try {
			const user = await this.userService.findOneById(id_user, false);
			if (!user) {
				throw new BadRequestException(`User ID ${id_user} is invalid`);
			}

			const imageSource =
				photo ??
				`https://avatar.iran.liara.run/username?username=${createProfileDto.name}+${createProfileDto.last_name}`;

			// Crear imagen sin id_relation (null o 'pending')
			const { id_image, url } = await this.imagesService.createImage(
				imageSource,
				PhotoOfEnum.PROFILE,
			);

			// Crear y guardar perfil
			const profile = this.profileRepository.create({
				...createProfileDto,
				user,
				id_image,
			});

			const savedProfile = await this.profileRepository.save(profile);

			// El ImagesService actualiza su propia relación
			await this.imagesService.updateImageRelation(id_image, savedProfile.id_profile);
			const { id_image: _id_image, ...profileNormalize } = profile;

			return {
				...profileNormalize,
				image: { id_image, url },
			};
		} catch (error) {
			ErrorHandler(error);
		}
	}

	// * <<- Update ->>
	async update(
		updateProfileDto: UpdateProfileDto,
		idsProfile: IdsProfileInterface,
		photo?: Express.Multer.File,
	): Promise<Profile | undefined> {
		const { id_profile, id_user } = idsProfile;
		try {
			if (!Object.keys(updateProfileDto).length || !photo)
				throw new BadRequestException("No property was inserted to update");

			// ! Profile
			const profileDB = await this.#findOneByUser(id_profile);
			if (!profileDB) {
				throw new NotFoundException(`Profile with ID ${id_profile} not found`);
			}

			// ! Verify
			const id_user_db = profileDB.user.id_user;
			if (id_user_db !== id_user)
				throw new ForbiddenException("Profile does not belong to this user");

			// ! Update
			this.profileRepository.update(profileDB, updateProfileDto);
			if (photo) {
				const { id_image } = profileDB;
				await this.imagesService.update(id_image, photo);
			}

			return profileDB;
		} catch (error) {
			ErrorHandler(error);
			throw error;
		}
	}

	// * <<- Delete ->>
	async removeMy(id_user: string) {
		const profile = await this.#findOneByUser(id_user);
		if (!profile) {
			throw new NotFoundException(`Profile not found`);
		}
		const { id_profile } = profile;
		try {
			await this.imagesService.deleteRelation(profile.id_profile, PhotoOfEnum.PROFILE, false);
			await this.profileRepository.delete(profile.id_profile);
			return { message: "It was successfully removed" };
		} catch (error) {
			this.logger.error(`Failed to delete profile ${id_profile}:`);
			this.logger.verbose(error.stack);
			ErrorHandler(error);
		}
	}

	// ! private
	async #findOneByUser(id_user: string): Promise<Profile | undefined> {
		try {
			const profile = await this.profileRepository.findOne({
				where: {
					user: { id_user },
				},
				relations: {
					user: true,
				},
			});

			if (!profile) {
				throw new NotFoundException("Profile not found");
			}

			return profile;
		} catch (error) {
			ErrorHandler(error);
		}
	}
}
