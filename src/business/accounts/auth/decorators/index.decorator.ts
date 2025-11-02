import { SetMetadata } from "@nestjs/common";
import { ROLE } from "core/enum/role.enum";

// Keys para metadata
export const PUBLIC_KEY = "isPublic" as const;
export const ROLES_KEY = "roles" as const;

/**
 * Decorador para marcar una ruta como pública (sin autenticación requerida)
 * @example
 * @Public()
 * @Get('public-endpoint')
 * publicMethod() { ... }
 */
export const Public = () => SetMetadata(PUBLIC_KEY, true);

/**
 * Decorador para especificar roles requeridos para acceder a una ruta
 * @param roles - Lista de roles permitidos
 * @example
 * @Roles(ROLE.ADMIN, ROLE.SELLER)
 * @Get('admin-endpoint')
 * adminMethod() { ... }
 */
export const Roles = (...roles: ROLE[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Decorador específico para rutas que solo administradores pueden acceder
 * @example
 * @Admin()
 * @Delete('users/:id')
 * deleteUser() { ... }
 */
export const Admin = () => Roles(ROLE.ADMIN);

/**
 * Decorador específico para rutas que vendedores pueden acceder
 * @example
 * @Seller()
 * @Post('products')
 * createProduct() { ... }
 */
export const Seller = () => Roles(ROLE.SELLER);

/**
 * Decorador específico para rutas que compradores pueden acceder
 * @example
 * @Buyer()
 * @Get('orders')
 * getOrders() { ... }
 */
export const Buyer = () => Roles(ROLE.BUYER);

/**
 * Decorador para rutas accesibles por vendedores y administradores
 * @example
 * @SellerOrAdmin()
 * @Put('products/:id')
 * updateProduct() { ... }
 */
export const SellerOrAdmin = () => Roles(ROLE.SELLER, ROLE.ADMIN);

/**
 * Decorador para rutas accesibles por cualquier usuario autenticado
 * @example
 * @Authenticated()
 * @Get('profile')
 * getProfile() { ... }
 */
export const Authenticated = () => Roles(ROLE.BUYER, ROLE.SELLER, ROLE.ADMIN);
