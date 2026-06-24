import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { Alert } from '@/components/ui/alert';

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <AuthShell title="Choose a new password" subtitle="Use the reset link from your email to secure your account.">
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="space-y-4">
          <Alert variant="destructive">The reset token is missing.</Alert>
          <Link href="/forgot-password" className="text-sm font-medium text-primary">
            Request a new reset link
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
