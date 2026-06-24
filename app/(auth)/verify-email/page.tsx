import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { Alert } from '@/components/ui/alert';
import { verifyEmailAddress } from '@/lib/auth/account-service';

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams;
  const result = token
    ? await verifyEmailAddress(token)
    : { ok: false as const, message: 'The verification token is missing.' };

  return (
    <AuthShell title="Email verification" subtitle="Your email verification status is shown below.">
      <div className="space-y-4">
        <Alert variant={result.ok ? 'success' : 'destructive'}>{result.message}</Alert>
        <Link href="/login" className="inline-flex text-sm font-medium text-primary">
          Continue to login
        </Link>
      </div>
    </AuthShell>
  );
}
