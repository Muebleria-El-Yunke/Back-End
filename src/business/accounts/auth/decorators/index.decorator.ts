import { SetMetadata } from "@nestjs/common";
import { ROLE } from "core/enum/role.enum";

export const PUBLIC_KEY = "isPublic" as const;
export const ROLES_KEY = "roles" as const;
export const Roles = (...roles: ROLE[]) => SetMetadata(ROLES_KEY, roles);

export const Public = () => SetMetadata(PUBLIC_KEY, true);
export const Admin = () => Roles(ROLE.ADMIN);
export const Seller = () => Roles(ROLE.SELLER);
export const Buyer = () => Roles(ROLE.BUYER);
export const SellerOrAdmin = () => Roles(ROLE.SELLER, ROLE.ADMIN);
export const Authenticated = () => Roles(ROLE.BUYER, ROLE.SELLER, ROLE.ADMIN);
