'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { signIn, signOut } from '@/auth';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '@/lib/auth/validators';
import { registerCustomer, requestPasswordReset, resetPassword } from '@/lib/auth/account-service';

export type AuthActionState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

const defaultError = 'Something went wrong. Please try again.';

function fieldValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? '');
}

export async function registerAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: fieldValue(formData, 'name'),
    email: fieldValue(formData, 'email'),
    password: fieldValue(formData, 'password'),
  });

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.errors[0]?.message ?? defaultError };
  }

  try {
    const result = await registerCustomer(parsed.data);
    return { status: result.ok ? 'success' : 'error', message: result.message };
  } catch (error) {
    console.error(error);
    return { status: 'error', message: defaultError };
  }
}

export async function loginAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: fieldValue(formData, 'email'),
    password: fieldValue(formData, 'password'),
  });

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.errors[0]?.message ?? defaultError };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: 'error', message: 'Invalid credentials, unverified email, or inactive account.' };
    }

    throw error;
  }

  redirect('/account');
}

export async function logoutAction() {
  await signOut({ redirectTo: '/login' });
}

export async function forgotPasswordAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: fieldValue(formData, 'email'),
  });

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.errors[0]?.message ?? defaultError };
  }

  try {
    await requestPasswordReset(parsed.data.email);
    return {
      status: 'success',
      message: 'If an active account exists for that email, a reset link has been sent.',
    };
  } catch (error) {
    console.error(error);
    return { status: 'error', message: defaultError };
  }
}

export async function resetPasswordAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: fieldValue(formData, 'token'),
    password: fieldValue(formData, 'password'),
    confirmPassword: fieldValue(formData, 'confirmPassword'),
  });

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.errors[0]?.message ?? defaultError };
  }

  try {
    const result = await resetPassword(parsed.data);
    return { status: result.ok ? 'success' : 'error', message: result.message };
  } catch (error) {
    console.error(error);
    return { status: 'error', message: defaultError };
  }
}
