import { ROLE } from "core/enum/role.enum";

export interface UserPayload {
	id_user: string;
	role: ROLE;
}

declare global {
	namespace Express {
		interface Request {
			user?: UserPayload;
		}
		interface Response {
			user?: UserPayload;
		}
		interface User extends UserPayload {}
	}
}
