'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { resetPasswordAction, type AuthActionState } from '@/app/actions/auth.actions';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: AuthActionState = { status: 'idle', message: '' };

export function ResetPasswordForm({ token }: Readonly<{ token: string }>) {
  const [state, action, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state.message ? <Alert variant={state.status === 'success' ? 'success' : 'destructive'}>{state.message}</Alert> : null}
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={12} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={12} />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Updating password...' : 'Reset password'}
      </Button>
      {state.status === 'success' ? (
        <p className="text-center text-sm">
          <Link href="/login" className="font-medium text-primary">
            Continue to login
          </Link>
        </p>
      ) : null}
    </form>
  );
}
