import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Req,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { imageUploadOptions } from "core/config/multer/image-upload.config";
import { type Request } from "express";
import { Admin, Authenticated } from "../auth/decorators/index.decorator";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { RolesGuard } from "../auth/guard/role.guard";
import { CreateProfileDto } from "./dto/create-profile.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { IdsProfileInterface } from "./interface/profile.interface";
import { ProfileService } from "./profile.service";

@Controller("profile")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}

	@Authenticated()
	@Post("create")
	@HttpCode(HttpStatus.CREATED)
	@UseInterceptors(FileInterceptor("photo", imageUploadOptions))
	async createProfile(
		@Body() createProfileDto: CreateProfileDto,
		@Req() req: Request,
		@UploadedFile() photo?: Express.Multer.File,
	) {
		const id_user = req.user?.id_user as string;
		const profile = await this.profileService.create(createProfileDto, id_user, photo);

		return {
			success: true,
			message: "Profile created successfully",
			data: profile,
		};
	}

	@Authenticated()
	@Patch("update/:id_profile")
	@HttpCode(HttpStatus.OK)
	@UseInterceptors(FileInterceptor("photo", imageUploadOptions))
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
			message: "Profile updated successfully",
			data: profile,
		};
	}

	@Admin()
	@Get()
	@HttpCode(HttpStatus.OK)
	async findAll() {
		const profiles = await this.profileService.findAll();

		return {
			success: true,
			message: "Profiles retrieved successfully",
			data: profiles,
			count: profiles.length,
		};
	}

	@Authenticated()
	@Get(":id")
	@HttpCode(HttpStatus.OK)
	async findOneById(@Param("id", ParseUUIDPipe) id: string) {
		const profile = await this.profileService.findOneByProfile(id);

		return {
			success: true,
			message: "Profile retrieved successfully",
			data: profile,
		};
	}

	@Authenticated()
	@Delete()
	@HttpCode(HttpStatus.OK)
	async MyDelete(@Req() req: Request) {
		const id_user = req.user?.id_user as string;
		const result = await this.profileService.removeMy(id_user);

		return {
			success: true,
			message: result?.message,
		};
	}
}
