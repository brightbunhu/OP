import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { createSecureToken, hashToken, minutesFromNow } from '@/lib/auth/tokens';
import { ROLES, ROLE_PERMISSIONS } from '@/lib/auth/roles';
import { sendPasswordResetEmail, sendVerificationEmail } from '@/lib/mail/mailer';

const EMAIL_VERIFICATION_TOKEN_MINUTES = 60 * 24;
const PASSWORD_RESET_TOKEN_MINUTES = 30;

export async function createEmailVerificationToken(userId: string) {
  const token = createSecureToken();

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: minutesFromNow(EMAIL_VERIFICATION_TOKEN_MINUTES),
    },
  });

  return token;
}

export async function createPasswordResetToken(userId: string) {
  const token = createSecureToken();

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: minutesFromNow(PASSWORD_RESET_TOKEN_MINUTES),
    },
  });

  return token;
}

export async function registerCustomer(input: { name: string; email: string; password: string }) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existingUser) {
    return { ok: false as const, message: 'An account already exists for this email address.' };
  }

  const passwordHash = await hashPassword(input.password);

  const customerRole = await prisma.role.upsert({
    where: { name: ROLES.CUSTOMER },
    update: {
      permissions: ROLE_PERMISSIONS.CUSTOMER as unknown as Prisma.InputJsonValue,
    },
    create: {
      name: ROLES.CUSTOMER,
      description: 'Verified shopping customer',
      permissions: ROLE_PERMISSIONS.CUSTOMER as unknown as Prisma.InputJsonValue,
    },
  });

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      status: 'ACTIVE',
      emailVerified: new Date(),
      roles: {
        connect: { id: customerRole.id },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: 'CREATE',
      entityName: 'User',
      entityId: user.id,
      newValues: { email: user.email, registration: 'self-service' },
    },
  });

  return { ok: true as const, message: 'Account created successfully! You can now log in.' };
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, status: true, deletedAt: true },
  });

  if (!user || user.deletedAt || user.status !== 'ACTIVE') {
    return;
  }

  const token = await createPasswordResetToken(user.id);
  await sendPasswordResetEmail(user.email, token);
}

export async function resetPassword(input: { token: string; password: string }) {
  const tokenHash = hashToken(input.token);
  const now = new Date();

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (
    !resetToken ||
    resetToken.deletedAt ||
    resetToken.consumedAt ||
    resetToken.expiresAt <= now ||
    resetToken.user.deletedAt ||
    resetToken.user.status !== 'ACTIVE'
  ) {
    return { ok: false as const, message: 'This reset link is invalid or has expired.' };
  }

  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { consumedAt: now },
    }),
    prisma.auditLog.create({
      data: {
        actorId: resetToken.userId,
        action: 'PASSWORD_RESET',
        entityName: 'User',
        entityId: resetToken.userId,
      },
    }),
  ]);

  return { ok: true as const, message: 'Password updated. You can now login with your new password.' };
}

export async function verifyEmailAddress(token: string) {
  const tokenHash = hashToken(token);
  const now = new Date();

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (
    !verificationToken ||
    verificationToken.deletedAt ||
    verificationToken.consumedAt ||
    verificationToken.expiresAt <= now ||
    verificationToken.user.deletedAt ||
    verificationToken.user.status !== 'ACTIVE'
  ) {
    return { ok: false as const, message: 'This verification link is invalid or has expired.' };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: now },
    }),
    prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { consumedAt: now },
    }),
    prisma.auditLog.create({
      data: {
        actorId: verificationToken.userId,
        action: 'UPDATE',
        entityName: 'User',
        entityId: verificationToken.userId,
        newValues: { emailVerified: now.toISOString() },
      },
    }),
  ]);

  return { ok: true as const, message: 'Email verified. You can now login.' };
}
