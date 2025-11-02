export const JWT_AUTH_GUARD = "JWT_AUTH" as const;
export const ROLE_GUARD = "ROLE_GUARD" as const;

export type GuardType = typeof JWT_AUTH_GUARD | typeof ROLE_GUARD;
