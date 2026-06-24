'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { registerAction, type AuthActionState } from '@/app/actions/auth.actions';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: AuthActionState = { status: 'idle', message: '' };

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);

  return (
    <form action={action} className="space-y-4">
      {state.message ? <Alert variant={state.status === 'success' ? 'success' : 'destructive'}>{state.message}</Alert> : null}
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" autoComplete="name" required minLength={2} maxLength={160} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required maxLength={320} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={12} />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Creating account...' : 'Create account'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary">
          Login
        </Link>
      </p>
    </form>
  );
}
