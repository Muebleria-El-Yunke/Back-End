import {
	BadRequestException,
	Injectable,
	NotAcceptableException,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { isEmail } from "class-validator";
import { ErrorHandler } from "src/core/config/error/ErrorHandler";
import { ROLE } from "src/core/enum/role.enum";
import { Repository } from "typeorm";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUsersDto } from "../dto/update-user.dto";
import { User } from "../entities/user.entity";
import { ExistUserInterface } from "../interfaces/users.interfaces";
import { PasswordService } from "./password.service";

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly passwordService: PasswordService,
	) {}

	// *<!-- Method
	async findAll() {
		try {
			const user = await this.userRepository.find();
			return user;
		} catch (error) {
			ErrorHandler(error);
		}
	}

	async findOneById(id_user: string, errorNotFound: boolean = true) {
		let user: User | null = null;
		try {
			user = await this.userRepository.findOneBy({ id_user });
		} catch (error) {
			ErrorHandler(error);
		}
		if (!user && errorNotFound) throw new NotFoundException("User not found");
		return user;
	}

	async update(updateUsersDto: UpdateUsersDto, id_user: string) {
		const { role: _role, ...users } = updateUsersDto;
		if (users.password) {
			users.password = await this.passwordService.encrypt(users.password);
		}
		try {
			await this.userRepository.update({ id_user }, users);
			return;
		} catch (error) {
			ErrorHandler(error);
		}
	}

	async updateUsingAdmin(updateUsersDto: UpdateUsersDto, id_user: string) {
		const { role, ...userData } = updateUsersDto;
		const user = await this.findOneById(id_user);
		if (!user) throw new BadRequestException("User does not exist");
		if (user.role === ROLE.ADMIN && role && role !== user.role) {
			throw new NotAcceptableException("Admin role cannot be changed");
		}
		if (userData.password) {
			userData.password = await this.passwordService.encrypt(userData.password);
		}
		try {
			const userUpdate = Object.assign(user, userData);
			if (role && role !== user.role) {
				user.role = role;
			}
			const updatedUser = await this.userRepository.save(userUpdate);
			return { message: "User updated successfully", user: updatedUser };
		} catch (error) {
			ErrorHandler(error);
		}
	}

	async delete(id_user: string) {
		const user = (await this.findOneById(id_user)) as User;
		try {
			const role = user.role;
			if (role === ROLE.ADMIN)
				throw new UnauthorizedException("You cannot delete a user with an administrator role.");
			await this.userRepository.delete(id_user);
			return true;
		} catch (error) {
			ErrorHandler(error);
		}
	}

	// ! -> External Method
	async findByNameOrEmail(content: string, includePassword = false): Promise<User | null> {
		let typeContent: string = "user.user_name";
		if (isEmail(content)) {
			typeContent = "LOWER(user.email)";
		}
		try {
			const queryBuilder = this.userRepository
				.createQueryBuilder("user")
				.where(`${typeContent} = :content`, {
					content,
				})
				.addSelect(["user.role", "user.email", "user.user_name", "user.id_user"]);

			if (includePassword) {
				queryBuilder.addSelect("user.password");
			}

			return await queryBuilder.getOne();
		} catch (error) {
			ErrorHandler(error);
			return null;
		}
	}

	async findExistUser(dataUser: ExistUserInterface): Promise<null | User | undefined> {
		try {
			const { email, user_name } = dataUser;
			// * Builder
			const queryBuilder = this.userRepository.createQueryBuilder("user");
			if (user_name && email) {
				queryBuilder.where(
					"LOWER(user.user_name) = LOWER(:user_name) OR LOWER(user.email) = LOWER(:email)",
					{ user_name, email },
				);
			} else {
				return null;
			}
			const findUser = await queryBuilder.getOne();
			return findUser;
		} catch (error) {
			ErrorHandler(error);
		}
	}

	async createAdmin(createAdminDto: CreateUserDto): Promise<boolean> {
		const { email, user_name, password } = createAdminDto;

		const findAdmin = await this.findExistUser({ email, user_name });
		if (findAdmin) return false;

		const encryptedPassword = await this.passwordService.encrypt(password);
		const admin = this.userRepository.create({
			...createAdminDto,
			role: ROLE.ADMIN,
			password: encryptedPassword,
		});

		await this.userRepository.save(admin);
		return true;
	}
	// ! <-
}
