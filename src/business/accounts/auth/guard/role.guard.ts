import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLE } from "core/enum/role.enum";
import { ROLES_KEY } from "../decorators/index.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.#getRequiredRoles(context);

		// Si no hay roles requeridos, permite el acceso
		if (requiredRoles.length === 0) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const user = request.user;

		this.#validateUserRole(user, requiredRoles);

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

	#validateUserRole(user: any, requiredRoles: ROLE[]): void {
		if (!user) {
			throw new ForbiddenException("User not authenticated");
		}

		if (!user.role) {
			throw new ForbiddenException("User role not found");
		}

		if (!requiredRoles.includes(user.role)) {
			throw new ForbiddenException(
				`Insufficient permissions. Required roles: ${requiredRoles.join(", ")}`,
			);
		}
	}
}
