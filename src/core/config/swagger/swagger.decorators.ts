import { applyDecorators, Type } from "@nestjs/common";
import {
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiQuery,
	ApiBearerAuth,
} from "@nestjs/swagger";

// ========== TIPOS Y CONSTANTES ==========

interface UniversalOptions {
	mode?: "json" | "formdata" | "image";
	fileField?: string;
	fileRequired?: boolean;
	description?: string;
}

interface ImageUploadOptions {
	fieldName?: string;
	required?: boolean;
	nullable?: boolean;
	maxFiles?: number;
	description?: string;
}

const COMMON_RESPONSES = {
	success: { status: 200, description: "Operación exitosa" },
	created: { status: 201, description: "Recurso creado exitosamente" },
	badRequest: { status: 400, description: "Datos inválidos" },
	unauthorized: { status: 401, description: "No autorizado" },
	forbidden: { status: 403, description: "Prohibido - No tienes permisos suficientes" },
	notFound: { status: 404, description: "Recurso no encontrado" },
	conflict: { status: 409, description: "Conflicto - El recurso ya existe" },
	payloadTooLarge: { status: 413, description: "Archivo demasiado grande" },
} as const;

// ========== HELPERS PRIVADOS ==========

const createFormDataSchema = (fileField: string, fileRequired: boolean, description: string) => ({
	type: "object" as const,
	required: fileRequired ? [fileField] : [],
	properties: {
		[fileField]: {
			type: "string" as const,
			format: "binary" as const,
			description,
		},
	},
});

const createImageResponseSchema = () => ({
	type: "object" as const,
	properties: {
		id: { type: "string" as const },
		url: { type: "string" as const },
		publicId: { type: "string" as const },
		filename: { type: "string" as const },
		size: { type: "number" as const },
		mimeType: { type: "string" as const },
	},
});

// ========== DECORADORES PRINCIPALES ==========

/**
 * Decorador universal para múltiples tipos de operaciones
 */
export const ApiUniversal = (summary: string, dto?: Type<any>, options: UniversalOptions = {}) => {
	const { mode = "json", fileField = "file", fileRequired = false, description } = options;

	const decorators = [
		ApiOperation({
			summary,
			description:
				description ||
				{
					formdata: "Operación con FormData",
					image: "Subida de imagen",
					json: "Operación estándar",
				}[mode],
		}),
	];

	if (mode === "json" && dto) {
		decorators.push(ApiBody({ type: dto }));
	} else if (mode === "formdata" || mode === "image") {
		decorators.push(
			ApiConsumes("multipart/form-data"),
			ApiBody({
				schema: createFormDataSchema(
					fileField,
					fileRequired,
					mode === "image" ? "Archivo de imagen" : "Archivo adjunto",
				),
			}),
		);
	}

	decorators.push(
		ApiResponse(COMMON_RESPONSES.success),
		ApiResponse(COMMON_RESPONSES.badRequest),
		ApiResponse(COMMON_RESPONSES.unauthorized),
		ApiResponse(COMMON_RESPONSES.notFound),
	);

	return applyDecorators(...decorators);
};

// ========== SHORTCUTS ==========

export const ApiJson = (summary: string, dto?: Type<any>, description?: string) =>
	ApiUniversal(summary, dto, { mode: "json", description });

export const ApiForm = (
	summary: string,
	dto?: Type<any>,
	fileField = "file",
	description?: string,
) => ApiUniversal(summary, dto, { mode: "formdata", fileField, description });

export const ApiImage = (
	summary: string,
	fileField = "file",
	required = true,
	description?: string,
) =>
	ApiUniversal(summary, undefined, {
		mode: "image",
		fileField,
		fileRequired: required,
		description,
	});

// ========== DECORADORES HTTP ==========

export const ApiGet = (summary: string, description?: string) =>
	applyDecorators(
		ApiOperation({ summary, description }),
		ApiResponse(COMMON_RESPONSES.success),
		ApiResponse(COMMON_RESPONSES.unauthorized),
		ApiResponse(COMMON_RESPONSES.notFound),
	);

export const ApiPost = (summary: string, description?: string) =>
	applyDecorators(
		ApiOperation({ summary, description }),
		ApiResponse(COMMON_RESPONSES.created),
		ApiResponse(COMMON_RESPONSES.badRequest),
		ApiResponse(COMMON_RESPONSES.unauthorized),
		ApiResponse(COMMON_RESPONSES.conflict),
	);

export const ApiUpdate = (summary: string, description?: string) =>
	applyDecorators(
		ApiOperation({ summary, description }),
		ApiResponse({ status: 200, description: "Recurso actualizado exitosamente" }),
		ApiResponse(COMMON_RESPONSES.badRequest),
		ApiResponse(COMMON_RESPONSES.unauthorized),
		ApiResponse(COMMON_RESPONSES.notFound),
	);

export const ApiDelete = (summary: string, description?: string) =>
	applyDecorators(
		ApiOperation({ summary, description }),
		ApiResponse({ status: 200, description: "Recurso eliminado exitosamente" }),
		ApiResponse(COMMON_RESPONSES.unauthorized),
		ApiResponse(COMMON_RESPONSES.notFound),
		ApiResponse({ status: 409, description: "No se puede eliminar - Existen dependencias" }),
	);

// ========== AUTENTICACIÓN Y PARÁMETROS ==========

export const ApiAuth = () =>
	applyDecorators(
		ApiBearerAuth("JWT-auth"),
		ApiResponse({ status: 401, description: "No autorizado - Token inválido o expirado" }),
		ApiResponse(COMMON_RESPONSES.forbidden),
	);

export const ApiIdParam = (name = "id", description?: string) =>
	ApiParam({
		name,
		description: description || `ID del ${name}`,
		type: "string",
		required: true,
		example: "123e4567-e89b-12d3-a456-426614174000",
	});

export const ApiPagination = () =>
	applyDecorators(
		ApiQuery({
			name: "page",
			required: false,
			type: Number,
			description: "Número de página",
			example: 1,
		}),
		ApiQuery({
			name: "limit",
			required: false,
			type: Number,
			description: "Cantidad de elementos por página",
			example: 10,
		}),
	);

// ========== DECORADORES DE IMÁGENES ==========

export const ApiImageUpload = (summary: string, options: ImageUploadOptions = {}) => {
	const { fieldName = "file", required = true, description } = options;

	return applyDecorators(
		ApiOperation({
			summary,
			description: description || "Sube una imagen al servidor",
		}),
		ApiConsumes("multipart/form-data"),
		ApiBody({
			schema: createFormDataSchema(fieldName, required, "Archivo de imagen (JPG, PNG, GIF, WEBP)"),
		}),
		ApiResponse({
			status: 201,
			description: "Imagen subida exitosamente",
			schema: createImageResponseSchema(),
		}),
		ApiResponse({ status: 400, description: "Formato de imagen no válido o tamaño excedido" }),
		ApiResponse(COMMON_RESPONSES.unauthorized),
		ApiResponse(COMMON_RESPONSES.payloadTooLarge),
	);
};

export const ApiMultipleImageUpload = (summary: string, options: ImageUploadOptions = {}) => {
	const { fieldName = "files", maxFiles = 10, description } = options;

	return applyDecorators(
		ApiOperation({
			summary,
			description: description || `Sube hasta ${maxFiles} imágenes al servidor`,
		}),
		ApiConsumes("multipart/form-data"),
		ApiBody({
			schema: {
				type: "object",
				required: [fieldName],
				properties: {
					[fieldName]: {
						type: "array",
						items: { type: "string", format: "binary" },
						description: `Array de imágenes (máximo ${maxFiles})`,
					},
				},
			},
		}),
		ApiResponse({
			status: 201,
			description: "Imágenes subidas exitosamente",
			schema: {
				type: "object",
				properties: {
					images: { type: "array", items: createImageResponseSchema() },
					count: { type: "number" },
				},
			},
		}),
		ApiResponse({ status: 400, description: "Formato de imagen no válido o límite excedido" }),
		ApiResponse(COMMON_RESPONSES.unauthorized),
	);
};

export const ApiCreateWithImage = (
	summary: string,
	dto: Type<any>,
	options: ImageUploadOptions = {},
) => {
	const { nullable = false, fieldName = "photo", description } = options;

	return applyDecorators(
		ApiOperation({
			summary,
			description: description || "Crea un recurso con datos e imagen opcional",
		}),
		ApiConsumes("multipart/form-data"),
		ApiBody({
			schema: {
				type: "object",
				properties: {
					[fieldName]: {
						type: "string",
						format: "binary",
						description: "Imagen opcional (JPG, PNG, GIF, WEBP)",
						nullable,
					},
				},
			},
		}),
		ApiResponse(COMMON_RESPONSES.created),
		ApiResponse({ status: 400, description: "Datos inválidos o formato de imagen no válido" }),
		ApiResponse(COMMON_RESPONSES.unauthorized),
	);
};

export const ApiUpdateWithImage = (
	summary: string,
	_dto: Type<any>,
	options: ImageUploadOptions = {},
) => {
	const { fieldName = "file", description } = options;

	return applyDecorators(
		ApiOperation({
			summary,
			description: description || "Actualiza el recurso con datos opcionales e imagen",
		}),
		ApiConsumes("multipart/form-data"),
		ApiBody({
			schema: {
				type: "object",
				properties: {
					[fieldName]: {
						type: "string",
						format: "binary",
						description: "Imagen opcional",
					},
					data: {
						type: "string",
						description: "Datos del DTO en formato JSON string",
					},
				},
			},
		}),
		ApiResponse({ status: 200, description: "Recurso actualizado exitosamente" }),
		ApiResponse(COMMON_RESPONSES.badRequest),
		ApiResponse(COMMON_RESPONSES.unauthorized),
		ApiResponse(COMMON_RESPONSES.notFound),
	);
};

// ========== DECORADORES COMBINADOS ==========

export const ApiAuthPaginated = (summary: string, description?: string) =>
	applyDecorators(ApiAuth(), ApiGet(summary, description), ApiPagination());
