import { ROLE } from "src/core/enum/role.enum";

export type AuthInterface =
	| {
			id_user: string;
			role: ROLE;
	  }
	| undefined;
