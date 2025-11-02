export interface ExistUserInterface {
	user_name: string;
	email: string;
}

export interface UserRegisterInterface {
	email?: string;
	password?: string;
	user_name?: string;
}
