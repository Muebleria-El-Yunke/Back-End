import { Injectable, UnauthorizedException } from "@nestjs/common";
import { compare, hash } from "bcrypt";

@Injectable()
export class PasswordService {
	async verify(plainPassword: string, encryptPassword: string) {
		const passwordIsCorrect = await compare(plainPassword, encryptPassword);
		if (!passwordIsCorrect) throw new UnauthorizedException("Invalid username, email, or password");
		return passwordIsCorrect;
	}

	async encrypt(plainPassword: string, salt: number = 8) {
		const encryptPassword = await hash(plainPassword, salt);
		return encryptPassword;
	}
}
