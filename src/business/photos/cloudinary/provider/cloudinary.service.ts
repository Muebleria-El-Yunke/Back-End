import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { v2 as cloudinary, UploadApiOptions } from "cloudinary";
import { Readable } from "stream";
import { CloudinaryResponse } from "../response/cloudinary.response";

@Injectable()
export class CloudinaryService {
	logger = new Logger("Cloudinary-Service");

	async uploadFile(file: Express.Multer.File, options: Record<string, undefined> = {}) {
		if (!file?.buffer) {
			this.logger.error("Upload failed: Invalid file data (no buffer)");
			throw new BadRequestException("Invalid file data");
		}
		return this.#handleUpload(file.buffer, options);
	}

	async updateImage(
		publicId: string,
		newFile: Express.Multer.File,
		options: Record<string, undefined> = {},
	) {
		if (!newFile?.buffer) {
			this.logger.error(`Update failed for ${publicId}: Invalid file data`);
			throw new BadRequestException("Invalid file data");
		}

		try {
			const exists = await this.#checkImageExists(publicId);
			if (!exists) {
				this.logger.error(`Update failed: Resource not found - ${publicId}`);
				throw new NotFoundException(`Image with public ID "${publicId}" not found`);
			}

			return this.#handleUpload(newFile.buffer, {
				...options,
				public_id: publicId,
				overwrite: true,
				invalidate: true,
			});
		} catch (error) {
			if (error instanceof NotFoundException) throw error;

			this.logger.error(`Update operation failed for ${publicId}:`, error);
			throw new InternalServerErrorException(`Failed to update image: ${error.message}`);
		}
	}

	async deleteImage(publicId: string): Promise<CloudinaryResponse> {
		try {
			const result = await cloudinary.uploader.destroy(publicId);
			if (result.result === "not found") {
				this.logger.error(`Delete failed: Resource not found - ${publicId}`);
				throw new NotFoundException(`Image with public ID "${publicId}" not found`);
			}

			if (result.result !== "ok") {
				this.logger.error(`Cloudinary deletion error for ${publicId}:`, result);
				throw new Error(`Cloudinary deletion failed: ${result.result}`);
			}

			return result;
		} catch (error) {
			if (error instanceof NotFoundException) throw error;

			this.logger.error(`Delete operation failed for ${publicId}:`, error);
			throw new InternalServerErrorException(`Failed to delete image: ${error.message}`);
		}
	}

	async #checkImageExists(publicId: string): Promise<boolean> {
		try {
			await cloudinary.api.resource(publicId);
			return true;
		} catch (error) {
			if (error.http_code === 404) {
				this.logger.error(`Resource check: 404 Not Found - ${publicId}`);
				return false;
			}

			this.logger.error(`Cloudinary API error for ${publicId}:`, error);
			throw new InternalServerErrorException(`Cloudinary existence check failed: ${error.message}`);
		}
	}

	async #handleUpload(
		buffer: Buffer,
		options: UploadApiOptions | undefined = {},
	): Promise<CloudinaryResponse> {
		try {
			return new Promise((resolve, reject) => {
				if (!buffer || buffer.length === 0) {
					this.logger.error("Upload attempt with empty buffer");
					return reject(new BadRequestException("Empty file buffer"));
				}

				const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
					if (error) {
						this.logger.error("Cloudinary upload stream error:", error);
						return reject(error);
					}
					if (!result) {
						this.logger.error("Cloudinary returned empty response", { options });
						return reject(new Error("Cloudinary returned empty response"));
					}
					resolve(result);
				});

				const readable = Readable.from(buffer);
				readable.on("error", (streamError) => {
					this.logger.error("Readable stream error:", streamError);
					reject(streamError);
				});
				readable.pipe(uploadStream);
			});
		} catch (error) {
			this.logger.error("Upload handler error:", error);
			throw new InternalServerErrorException(`Upload operation failed: ${error.message}`);
		}
	}
}
