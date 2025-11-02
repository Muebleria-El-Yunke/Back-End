import { applyDecorators } from "@nestjs/common";
import {
	IsNotEmpty,
	IsStrongPassword,
	IsStrongPasswordOptions,
	MaxLength,
	ValidationOptions,
} from "class-validator";
import { LENGTH } from "src/core/enum/user-length.enum";

export function IsPassword(
	OptionPassword?: IsStrongPasswordOptions,
	validationOptions: ValidationOptions = {},
) {
	return applyDecorators(
		IsStrongPassword(
			OptionPassword ?? {
				minLength: 8,
				minLowercase: 1,
				minNumbers: 1,
				minUppercase: 1,
				minSymbols: 1,
			},
			validationOptions,
		),
		IsNotEmpty(),
		MaxLength(LENGTH.max),
	);
}
