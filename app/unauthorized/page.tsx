import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-10">
      <div className="space-y-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Access denied</p>
        <h1 className="text-3xl font-bold tracking-tight">You do not have permission to open this area.</h1>
        <p className="text-muted-foreground">Your account is active, but your current role does not include this workspace.</p>
        <Button asChild>
          <Link href="/account">Back to account</Link>
        </Button>
      </div>
    </main>
  );
}
