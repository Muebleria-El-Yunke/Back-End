export interface IdsProfileInterface {
	id_profile: string;
	id_user: string;
}

export interface PayloadUpdate extends PayloadCreate {
	id_public: string;
}

export interface PayloadCreate {
	id_profile: string;
	photo: Express.Multer.File;
}
