'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireMinimumRole } from '@/lib/auth/guards';

export async function updateUserStatus(userId: string, status: string) {
  await requireMinimumRole('ADMIN');
  const user = await prisma.user.update({ where: { id: userId }, data: { status: status as 'ACTIVE' | 'SUSPENDED' | 'DELETED' | 'INVITED' } });
  revalidatePath('/admin');
  return { success: true, user };
}

export async function suspendUser(userId: string) {
  await requireMinimumRole('ADMIN');
  const user = await prisma.user.update({ where: { id: userId }, data: { status: 'SUSPENDED' } });
  revalidatePath('/admin');
  return { success: true, user };
}

export async function activateUser(userId: string) {
  await requireMinimumRole('ADMIN');
  const user = await prisma.user.update({ where: { id: userId }, data: { status: 'ACTIVE' } });
  revalidatePath('/admin');
  return { success: true, user };
}

export async function softDeleteUser(userId: string) {
  await requireMinimumRole('ADMIN');
  const user = await prisma.user.update({ where: { id: userId }, data: { status: 'DELETED', deletedAt: new Date() } });
  revalidatePath('/admin');
  return { success: true, user };
}

export async function assignRoleToUser(userId: string, roleId: string) {
  await requireMinimumRole('ADMIN');
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new Error('Role not found');
  const user = await prisma.user.update({
    where: { id: userId },
    data: { roles: { connect: { id: roleId } } },
    include: { roles: true },
  });
  revalidatePath('/admin');
  return { success: true, user };
}

export async function removeRoleFromUser(userId: string, roleId: string) {
  await requireMinimumRole('ADMIN');
  const user = await prisma.user.update({
    where: { id: userId },
    data: { roles: { disconnect: { id: roleId } } },
    include: { roles: true },
  });
  revalidatePath('/admin');
  return { success: true, user };
}

export async function createRole(data: { name: string; description: string; permissions: string[] }) {
  await requireMinimumRole('ADMIN');
  const role = await prisma.role.create({
    data: {
      name: data.name.toUpperCase().replace(/\s+/g, '_'),
      description: data.description,
      permissions: data.permissions,
    },
  });
  revalidatePath('/admin');
  return { success: true, role };
}

export async function updateRole(roleId: string, data: { description: string; permissions: string[] }) {
  await requireMinimumRole('ADMIN');
  const role = await prisma.role.update({ where: { id: roleId }, data: { description: data.description, permissions: data.permissions } });
  revalidatePath('/admin');
  return { success: true, role };
}

export async function deleteRole(roleId: string) {
  await requireMinimumRole('ADMIN');
  const role = await prisma.role.update({ where: { id: roleId }, data: { deletedAt: new Date() } });
  revalidatePath('/admin');
  return { success: true, role };
}

import { hashSync } from 'bcryptjs';

export async function createUser(data: { name: string; email: string; passwordHash: string; roleId: string }) {
  await requireMinimumRole('ADMIN');
  
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists.');
  }

  const hashedPassword = hashSync(data.passwordHash, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: hashedPassword,
      status: 'ACTIVE',
      emailVerified: new Date(),
      roles: {
        connect: { id: data.roleId },
      },
    },
    include: {
      roles: true,
    },
  });

  revalidatePath('/admin');
  return { success: true, user };
}
