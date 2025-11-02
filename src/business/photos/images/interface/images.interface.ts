import { PhotoOfEnum } from "business/common/photo.type";
import { Image } from "../entities/image.entity";

export interface ImageResult {
	fileName: string;
	image: Image;
	status: string;
}

export interface ImageError {
	id_image?: string;
	fileName?: string;
	error: any;
}

export interface UploadResponse {
	successCount?: number;
	totalFiles: number;
	errorCount?: number;
	successfulUploads?: ImageResult[];
	failedUploads?: ImageError[];
}

export interface GetImage {
	photoOf: PhotoOfEnum;
	id_image: string;
}

export interface RelationImages {
	photoOf: PhotoOfEnum;
	id_relation: string;
}
