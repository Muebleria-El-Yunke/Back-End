import { applyDecorators } from "@nestjs/common";
import {
	isEmail,
	IsNotEmpty,
	isNotEmpty,
	Length,
	length,
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
} from "class-validator";
import { LENGTH } from "src/core/enum/user-length.enum";

export function IsUserName() {
	return applyDecorators(IsNotEmpty(), Length(LENGTH.min, LENGTH.max));
}

export function IsEmailOrName(validationOptions?: ValidationOptions) {
	return (target: object, propertyName: string) => {
		registerDecorator({
			name: "IsEmailOrName",
			target: target.constructor,
			propertyName: propertyName,
			options: validationOptions ?? {
				message: "content value must be a valid email or username",
			},
			validator: {
				validate(value: string, _args: ValidationArguments) {
					const isEmailValid = isEmail(value);
					const isUserNameValid = isNotEmpty(value) && length(value, LENGTH.min, LENGTH.max);
					return isEmailValid || isUserNameValid;
				},
			},
		});
	};
}
