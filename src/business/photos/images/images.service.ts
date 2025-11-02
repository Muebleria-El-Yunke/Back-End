import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PhotoOfEnum } from "business/common/photo.type";
import { isString, isURL } from "class-validator";
import { EnvService } from "src/core/config/envs/env.service";
import { ErrorHandler } from "src/core/config/error/ErrorHandler";
import { Repository } from "typeorm";
import { CloudinaryService } from "../cloudinary/provider/cloudinary.service";
import { Image } from "./entities/image.entity";
import { GetImage, ImageError, RelationImages, UploadResponse } from "./interface/images.interface";

@Injectable()
export class ImagesService {
	constructor(
		@InjectRepository(Image)
		private readonly imageRepository: Repository<Image>,
		private readonly cloudinaryService: CloudinaryService,
		private readonly envService: EnvService,
	) {}

	async deleteRelation(id_relation: string, photoOf: PhotoOfEnum, errorBadRequest = true) {
		const findImages = await this.imageRepository.findBy({ id_relation, photoOf });
		if (findImages.length === 0 && errorBadRequest)
			throw new BadRequestException("Entity ID was not found or was entered incorrectly.");
		if (findImages.length === 0) return; // ! No thrown errorBadRequest

		for (const image of findImages) {
			if (image.id_public) {
				await this.cloudinaryService.deleteImage(image.id_public);
			}
			// Remove from database
			await this.imageRepository.remove(image);
		}
		return { message: "Delete images" };
	}

	async update(id_image: string, photo: Express.Multer.File) {
		const findImage = (await this.imageRepository.findOneBy({ id_image })) as Image;
		if (!findImage) {
			throw new BadRequestException("Image Not found");
		}
		const { id_public } = findImage;
		const { url } = await this.cloudinaryService.updateImage(id_public, photo);
		this.imageRepository.save({ ...findImage, url });
		return;
	}

	async delete(relationImages: RelationImages) {
		const { photoOf, id_relation } = relationImages;
		const image = (await this.findRelationsById({ photoOf, id_relation })) as Image[];
		try {
			image.forEach(async (value: Image) => {
				const id_public = value.id_public ?? false;
				if (id_public) await this.cloudinaryService.deleteImage(id_public);
			});
			await this.imageRepository.remove(image);
			return { message: "Image was removed" };
		} catch (error) {
			ErrorHandler(error);
		}
	}

	async updateImageRelation(id_image: string, id_relation: string) {
		const result = await this.imageRepository.update(id_image, { id_relation });

		if (result.affected === 0) {
			throw new NotFoundException(`Image with ID ${id_image} not found`);
		}

		return result;
	}

	async createManyImages(
		photos: Express.Multer.File[] | string[],
		photoOf: PhotoOfEnum,
		id_relation: string,
	) {
		const errors: ImageError[] = [];
		let results: {
			id_image: string;
			url: string;
		}[] = [];

		for (const photo of photos) {
			try {
				const image = await this.createImage(photo, photoOf, id_relation);
				results.push(image);
			} catch (error) {
				errors.push({
					fileName: isString(photo) ? photo : photo.filename,
					error: error.message || "Failed to upload and save image",
				});
			}
		}

		const response: UploadResponse = {
			successCount: results.length as number,
			totalFiles: photos.length,
		};

		if (errors.length) {
			response.errorCount = errors.length;
			response.failedUploads = errors;
		}

		return errors ? { errors, results } : { results };
	}

	async createImage(
		photoFile: Express.Multer.File | string,
		photoOf: PhotoOfEnum,
		id_relation?: string,
	) {
		try {
			if (isString(photoFile)) {
				return await this.createImageByUrl(photoFile, photoOf);
			}

			const cloudinaryResponse = await this.cloudinaryService.uploadFile(photoFile);
			const { secure_url, public_id } = cloudinaryResponse;

			console.log("Creating image for:", { photoOf });

			const imageEntity = this.imageRepository.create({
				id_public: public_id,
				url: this.envService.inProduction() ? secure_url : cloudinaryResponse.url,
				id_relation,
				photoOf,
			});

			const { id_image, url } = await this.imageRepository.save(imageEntity);
			return { id_image, url };
		} catch (error) {
			console.error("Error creating image:", error);
			throw new BadRequestException(`Failed to create image: ${error.message}`);
		}
	}

	async createImageByUrl(photoUrl: string, photoOf: PhotoOfEnum) {
		if (!isURL(photoUrl)) {
			throw new BadRequestException("Incorrect requested URL");
		}

		// ? is url valid
		let contentType: string | null = null;
		try {
			const response = await fetch(photoUrl, { method: "HEAD" });

			if (!response.ok) {
				throw new BadRequestException(`URL not accessible: ${response.statusText}`);
			}

			contentType = response.headers.get("content-");
			if (!contentType || !contentType.startsWith("image/")) {
				throw new BadRequestException("The provided URL does not point to an image");
			}
		} catch (err) {
			throw new BadRequestException(`Unable to verify image URL: ${err.message}`);
		}

		// save url
		const imageEntity = this.imageRepository.create({ url: photoUrl, photoOf });
		return await this.imageRepository
			.save(imageEntity)
			.then((image) => {
				return { id_image: image.id_image, url: image.url };
			})
			.catch((e) => ErrorHandler(e));
	}

	async findOneById(getImage: GetImage, withError: boolean = true) {
		let image: Image | null = null;
		const { id_image, photoOf } = getImage;
		try {
			image = await this.imageRepository.findOneBy({ id_image, photoOf });
		} catch (error) {
			ErrorHandler(error);
		}
		if (withError && !image) throw new NotFoundException("Images not found");
		return image;
	}

	async findRelationsById(relationImages: RelationImages) {
		const { photoOf, id_relation } = relationImages;
		return await this.imageRepository.findBy({ id_relation, photoOf });
	}
}
