import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	NotAcceptableException,
	Param,
	ParseUUIDPipe,
	Patch,
	Req,
	Res,
	UseGuards,
} from "@nestjs/common";
import { USER_TOKEN } from "core/constants/user-token.constants";
import { type Request, type Response } from "express";
import { ErrorHandler } from "src/core/config/error/ErrorHandler";
import { UserPayload } from "../../../../types/express";
import { Admin, Authenticated, SellerOrAdmin } from "../auth/decorators/index.decorator";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { RolesGuard } from "../auth/guard/role.guard";
import { UpdateUsersDto } from "./dto/update-user.dto";
import { UsersService } from "./service/users.service";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Admin()
	@Get()
	findAll() {
		return this.usersService.findAll();
	}

	@Authenticated()
	@Get("me")
	async findMeById(@Req() req: Request) {
		try {
			const { id_user } = req.user as UserPayload;
			return this.usersService.findOneById(id_user);
		} catch (error) {
			ErrorHandler(error);
		}
	}

	@Admin()
	@Get(":id")
	findOneById(@Param("id", ParseUUIDPipe) id: string) {
		return this.usersService.findOneById(id);
	}

	@Admin()
	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	async deleteAdmin(@Param("id", ParseUUIDPipe) id: string) {
		await this.usersService.delete(id);
	}

	@Authenticated()
	@Delete()
	@HttpCode(HttpStatus.NO_CONTENT)
	async deleteUser(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const id_user = req.user?.id_user as string;
		try {
			await this.usersService.delete(id_user);
			res.clearCookie(USER_TOKEN);
		} catch (error) {
			ErrorHandler(error);
		}
	}

	@Authenticated()
	@Patch()
	@HttpCode(HttpStatus.NO_CONTENT)
	updateUser(@Req() req: Request, @Body() updateUsersDto: UpdateUsersDto) {
		if (updateUsersDto.role) {
			throw new NotAcceptableException("You can't change the role");
		}
		const id_user = req.user?.id_user as string;
		return this.usersService.update(updateUsersDto, id_user);
	}

	@SellerOrAdmin()
	@Patch()
	@HttpCode(HttpStatus.NO_CONTENT)
	updateUsingAdmin(
		@Body() updateUsersDto: UpdateUsersDto,
		@Param("id_user", new ParseUUIDPipe()) id_user: string,
	) {
		return this.usersService.updateUsingAdmin(updateUsersDto, id_user);
	}
}
