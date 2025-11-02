// src/core/config/multer/image-upload.config.ts
import { BadRequestException } from "@nestjs/common";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";

export const imageUploadOptions: MulterOptions = {
	limits: {
		fileSize: 1.3 * 1024 * 1024, // 1.3 MB
		files: 1,
	},
	fileFilter: (req, file, callback) => {
		const allowedMimeTypes = [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/gif",
			"image/webp",
			"image/svg+xml",
			"image/bmp",
			"image/tiff",
		];

		if (allowedMimeTypes.includes(file.mimetype)) {
			callback(null, true);
		} else {
			callback(
				new BadRequestException(
					`Invalid file type. Allowed formats: JPG, JPEG, PNG, GIF, WEBP, SVG, BMP, TIFF`,
				),
				false,
			);
		}
	},
};
