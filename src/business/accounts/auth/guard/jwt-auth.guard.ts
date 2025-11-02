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
		const isPublic = this.#isPublicRoute(context);

		if (isPublic) {
			this.logger.debug("Public route accessed, skipping authentication");
			return true;
		}

		return super.canActivate(context);
	}

	handleRequest<TUser = any>(
		err: Error | null,
		user: TUser | false,
		info: any,
		context: ExecutionContext,
	): TUser {
		if (err || !user) {
			const request = context.switchToHttp().getRequest();
			this.logger.warn(
				`Authentication failed for ${request.method} ${request.url}: ${
					info?.message || err?.message || "Unknown error"
				}`,
			);

			throw (
				err ||
				new UnauthorizedException(
					info?.message || "Authentication failed. Please provide a valid token.",
				)
			);
		}

		return user;
	}

	#isPublicRoute(context: ExecutionContext): boolean {
		// Verificar si está marcado explícitamente como público
		const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic === true) {
			return true;
		}

		// Verificar si hay roles definidos en el método o clase
		const hasRoles = this.reflector.getAllAndOverride<any>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		// Si no hay roles definidos, considerar la ruta como pública
		return hasRoles === undefined || hasRoles === null;
	}
}
