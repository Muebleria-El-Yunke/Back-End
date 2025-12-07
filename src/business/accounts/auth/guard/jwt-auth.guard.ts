import { ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { PUBLIC_KEY, ROLES_KEY } from "../decorators/index.decorator";
import { JWT_AUTH_GUARD } from "./guard.constants";

@Injectable()
export class JwtAuthGuard extends AuthGuard(JWT_AUTH_GUARD) {
	private readonly logger = new Logger(JwtAuthGuard.name);

	constructor(private readonly reflector: Reflector) {
		super();
	}

	canActivate(context: ExecutionContext) {
		const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		const roles = this.reflector.getAllAndOverride<boolean>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic || !roles) {
			return true;
		}

		return super.canActivate(context);
	}

	handleRequest<TUser = any>(
		err: Error | null,
		user: TUser | false,
		_info: any,
		_context: ExecutionContext,
	): TUser {
		if (err || !user) {
			throw (
				err ||
				new UnauthorizedException("Authentication required. Please login to access this resource.")
			);
		}

		return user;
	}
}
