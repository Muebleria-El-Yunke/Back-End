import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLE } from "core/enum/role.enum";
import { ROLES_KEY } from "../decorators/index.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
	private readonly logger = new Logger(RolesGuard.name);

	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.#getRequiredRoles(context);

		// Si no hay roles requeridos, permite el acceso
		if (requiredRoles.length === 0) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const user = request.user;

		this.#validateUserRole(user, requiredRoles, request);

		return true;
	}

	#getRequiredRoles(context: ExecutionContext): ROLE[] {
		return (
			this.reflector.getAllAndOverride<ROLE[]>(ROLES_KEY, [
				context.getHandler(),
				context.getClass(),
			]) ?? []
		);
	}

	#validateUserRole(user: any, requiredRoles: ROLE[], request: any): void {
		if (!user) {
			throw new ForbiddenException("User not authenticated");
		}

		if (!user.role) {
			throw new ForbiddenException("User role not found");
		}

		if (!requiredRoles.includes(user.role)) {
			// Log de intento de acceso no autorizado
			this.logger.warn(
				`Access denied for user ${user.id_user} with role ${user.role} to ${request.path}. Required: ${requiredRoles.join(", ")}`,
			);

			throw new ForbiddenException(
				`Insufficient permissions. Required roles: ${requiredRoles.join(", ")}`,
			);
		}
	}
}
