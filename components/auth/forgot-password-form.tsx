'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { forgotPasswordAction, type AuthActionState } from '@/app/actions/auth.actions';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: AuthActionState = { status: 'idle', message: '' };

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initialState);

  return (
    <form action={action} className="space-y-4">
      {state.message ? <Alert variant={state.status === 'success' ? 'success' : 'destructive'}>{state.message}</Alert> : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required maxLength={320} />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Sending link...' : 'Send reset link'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{' '}
        <Link href="/login" className="font-medium text-primary">
          Login
        </Link>
      </p>
    </form>
  );
}
