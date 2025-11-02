import {
	BadRequestException,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";

const logger = new Logger("Server-Error");

export const ErrorHandler = (error: any) => {
	if (error.code === "23503") {
		throw new BadRequestException("Related data exists. Delete dependencies first");
	}

	if (
		error instanceof UnauthorizedException ||
		error instanceof NotFoundException ||
		error instanceof BadRequestException
	) {
		throw error;
	}

	logger.error({
		message: "Server Error",
		error: error.message,
		stack: error.stack,
		timestamp: new Date().toISOString(),
	});

	throw new InternalServerErrorException("Please contact system administrator");
};
