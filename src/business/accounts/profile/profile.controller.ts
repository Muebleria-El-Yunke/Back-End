import {
	Body,
	Controller,
	DefaultValuePipe,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseBoolPipe,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	Req,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { imageUploadOptions } from "core/config/multer/image-upload.config";
import {
	ApiAuth,
	ApiDelete,
	ApiGet,
	ApiIdParam,
	ApiImageUpload,
	ApiPost,
	ApiUpdateWithImage,
} from "core/config/swagger/swagger.decorators";
import { type Request } from "express";
import { Admin, Authenticated, Public } from "../auth/decorators/index.decorator";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { RolesGuard } from "../auth/guard/role.guard";
import { CreateProfileDto } from "./dto/create-profile.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { type IdsProfileInterface } from "./interface/profile.interface";
import { ProfileService } from "./profile.service";

const MESSAGES = {
	CREATED: "Profile created successfully",
	UPDATED: "Profile updated successfully",
	RETRIEVED: "Profile retrieved successfully",
	RETRIEVED_ALL: "Profiles retrieved successfully",
} as const;

const CommonAuth = () => UseGuards(JwtAuthGuard, RolesGuard);

const ProfileImageUpload = () => UseInterceptors(FileInterceptor("photo", imageUploadOptions));

@ApiTags("Profile")
@Controller("profile")
@CommonAuth()
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}

	@Authenticated()
	@Post("create")
	@HttpCode(HttpStatus.CREATED)
	@ApiPost("Crear perfil de usuario", "Crea un nuevo perfil con foto opcional")
	@ApiAuth()
	@ApiImageUpload("Subir imagen de perfil", { fieldName: "photo", required: false })
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				name: { type: "string", minLength: 4, maxLength: 50 },
				last_name: { type: "string", minLength: 4, maxLength: 50 },
				age: { type: "integer", minimum: 16, maximum: 118 },
				country_prefix: { type: "string", default: "+54" },
				phone_number: { type: "string" },
				photo: {
					type: "string",
					format: "binary",
				},
			},
			required: ["name", "last_name", "age"],
		},
	})
	@ProfileImageUpload()
	async createProfile(
		@Body() createProfileDto: CreateProfileDto,
		@Req() req: Request,
		@UploadedFile() photo?: Express.Multer.File,
	) {
		const id_user = req.user?.id_user as string;
		const profile = await this.profileService.create(createProfileDto, id_user, photo);

		return {
			success: true,
			message: MESSAGES.CREATED,
			data: profile,
		};
	}

	@Authenticated()
	@Patch("update/:id_profile")
	@HttpCode(HttpStatus.OK)
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				name: { type: "string", minLength: 4, maxLength: 50 },
				last_name: { type: "string", minLength: 4, maxLength: 50 },
				age: { type: "integer", minimum: 16, maximum: 118 },
				country_prefix: { type: "string" },
				phone_number: { type: "string" },
				photo: {
					type: "string",
					format: "binary",
				},
			},
		},
	})
	@ApiUpdateWithImage("Actualizar perfil", UpdateProfileDto, {
		fieldName: "photo",
		description: "Actualiza el perfil del usuario con foto opcional",
	})
	@ApiAuth()
	@ApiIdParam("id_profile", "ID del perfil a actualizar")
	@ProfileImageUpload()
	async update(
		@Body() updateProfileDto: UpdateProfileDto,
		@Req() req: Request,
		@Param("id_profile", ParseUUIDPipe) id_profile: string,
		@UploadedFile() photo?: Express.Multer.File,
	) {
		const id_user = req.user?.id_user as string;
		const idsProfile: IdsProfileInterface = { id_user, id_profile };
		const profile = await this.profileService.update(updateProfileDto, idsProfile, photo);

		return {
			success: true,
			message: MESSAGES.UPDATED,
			data: profile,
		};
	}

	@Admin()
	@Get()
	@HttpCode(HttpStatus.OK)
	@ApiGet("Obtener todos los perfiles", "Lista completa de perfiles (Solo administradores)")
	@ApiAuth()
	async findAll() {
		const profiles = await this.profileService.findAll();

		return {
			success: true,
			message: MESSAGES.RETRIEVED_ALL,
			data: profiles,
			count: profiles.length,
		};
	}

	@Public()
	@Get("seller")
	@HttpCode(HttpStatus.OK)
	@ApiGet("Obtener perfil del vendedor", "Obtiene el perfil del vendedor principal")
	async findSeller(@Query("image", new DefaultValuePipe(false), ParseBoolPipe) image?: boolean) {
		const profile = await this.profileService.findSeller(image);
		return {
			success: true,
			message: MESSAGES.RETRIEVED,
			data: profile,
		};
	}

	@Authenticated()
	@Get(":id")
	@HttpCode(HttpStatus.OK)
	@ApiGet("Obtener perfil por ID", "Obtiene un perfil específico por su ID")
	@ApiAuth()
	@ApiIdParam("id", "ID del perfil")
	async findOneById(@Param("id", ParseUUIDPipe) id: string) {
		const profile = await this.profileService.findOneByProfile(id);

		return {
			success: true,
			message: MESSAGES.RETRIEVED,
			data: profile,
		};
	}

	@Authenticated()
	@Delete()
	@HttpCode(HttpStatus.OK)
	@ApiDelete("Eliminar mi perfil", "Elimina el perfil del usuario autenticado")
	@ApiAuth()
	async MyDelete(@Req() req: Request) {
		const id_user = req.user?.id_user as string;
		const result = await this.profileService.removeMy(id_user);

		return {
			success: true,
			message: result?.message,
		};
	}
}
