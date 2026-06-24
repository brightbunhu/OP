import Link from 'next/link';

export function AuthShell({
  title,
  subtitle,
  children,
}: Readonly<{ title: string; subtitle: string; children: React.ReactNode }>) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4 py-10">
      <section className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm sm:p-8">
        <Link href="/" className="mb-8 inline-block text-sm font-bold uppercase tracking-wide text-primary">
          OP Supermarket
        </Link>
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-card-foreground">{title}</h1>
          <p className="text-sm leading-6 text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
