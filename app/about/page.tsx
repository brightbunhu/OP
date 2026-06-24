export const metadata = {
  title: 'About | OP Supermarket',
  description: 'Learn about OP Supermarket and our modern commerce platform for grocery experiences.',
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">About us</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Designed for modern grocery experiences.</h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            OP Supermarket is a purpose-built storefront concept combining responsive design, secure role-based access, and clean product exploration for customers and supermarket teams.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">Our mission</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              We make grocery shopping simple and accessible, while giving business users control over teams, inventory, and secure platform roles.
            </p>
          </article>

          <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">What we build</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              <li>Responsive mobile-first layouts for every screen.</li>
              <li>SEO-friendly product and category pages.</li>
              <li>Prisma-backed data access and PostgreSQL connectivity.</li>
              <li>Role-based permissions for customer and team workspaces.</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
