import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { type AppRole, hasMinimumRole, hasPermission, hasRole } from '@/lib/auth/roles';

export async function requireUser() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return session.user;
}

export async function requireRole(roles: readonly AppRole[]) {
  const user = await requireUser();

  if (!hasRole(user.roles, roles)) {
    redirect('/unauthorized');
  }

  return user;
}

export async function requireMinimumRole(role: AppRole) {
  const user = await requireUser();

  if (!hasMinimumRole(user.roles, role)) {
    redirect('/unauthorized');
  }

  return user;
}

export async function requirePermission(permission: string) {
  const user = await requireUser();

  if (!hasPermission(user.permissions, permission)) {
    redirect('/unauthorized');
  }

  return user;
}
