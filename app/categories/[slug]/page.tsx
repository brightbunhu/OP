import Link from 'next/link';
import { notFound } from 'next/navigation';
import { categories, getCategoryBySlug } from '@/lib/site';

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export default async function CategoryDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const category = getCategoryBySlug(resolvedParams.slug);

  if (!category) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="space-y-3">
          <Link href="/categories" className="text-sm font-medium text-primary hover:underline">
            ← Back to categories
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{category.name}</h1>
          <p className="text-sm leading-7 text-muted-foreground">{category.description}</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">What to expect</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Browse products curated for {category.name.toLowerCase()} with a mobile-first layout and faster search-first structure.
          </p>
        </div>

        <div className="grid gap-4 rounded-3xl border border-border bg-muted p-6 text-sm text-muted-foreground shadow-sm sm:grid-cols-2">
          <div>
            <p className="font-semibold text-foreground">Category highlights</p>
            <p className="mt-3">Fresh items chosen for quality and value.</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">How to shop</p>
            <p className="mt-3">Tap through products, compare pricing, and discover relevant promotions.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
