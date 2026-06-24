export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  SALES: 'SALES',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<AppRole, number> = {
  CUSTOMER: 10,
  SALES: 20,
  MANAGER: 30,
  ADMIN: 40,
};

export const ROLE_PERMISSIONS: Record<AppRole, readonly string[]> = {
  CUSTOMER: ['products:read', 'cart:write', 'orders:read', 'orders:write', 'reviews:write'],
  SALES: ['products:read', 'customers:read', 'orders:read', 'orders:write', 'notifications:write'],
  MANAGER: [
    'products:read',
    'products:write',
    'inventory:read',
    'inventory:write',
    'orders:read',
    'orders:write',
    'promotions:read',
    'promotions:write',
  ],
  ADMIN: [
    'users:read',
    'users:write',
    'roles:read',
    'roles:write',
    'products:read',
    'products:write',
    'inventory:read',
    'inventory:write',
    'orders:read',
    'orders:write',
    'promotions:read',
    'promotions:write',
    'audit:read',
  ],
};

export function hasRole(userRoles: readonly string[], requiredRoles: readonly AppRole[]) {
  return requiredRoles.some((role) => userRoles.includes(role));
}

export function hasMinimumRole(userRoles: readonly string[], minimumRole: AppRole) {
  const userRank = Math.max(0, ...userRoles.map((role) => ROLE_HIERARCHY[role as AppRole] ?? 0));
  return userRank >= ROLE_HIERARCHY[minimumRole];
}

export function hasPermission(userPermissions: readonly string[], permission: string) {
  return userPermissions.includes(permission);
}
