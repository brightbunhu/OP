'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { loginAction, type AuthActionState } from '@/app/actions/auth.actions';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: AuthActionState = { status: 'idle', message: '' };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="space-y-4">
      {state.message ? <Alert variant="destructive">{state.message}</Alert> : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required maxLength={320} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-sm font-medium text-primary">
            Forgot password?
          </Link>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Signing in...' : 'Login'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        New to OP Supermarket?{' '}
        <Link href="/register" className="font-medium text-primary">
          Create account
        </Link>
      </p>
    </form>
  );
}
