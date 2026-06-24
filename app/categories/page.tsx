import Link from 'next/link';
import { categories } from '@/lib/site';

export const metadata = {
  title: 'Categories | OP Supermarket',
  description: 'Shop grocery categories to find fresh produce, bakery items, wellness products, and more.',
};

export default function CategoriesPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Categories</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Shop by category</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Explore every product collection with curated category pages designed for easy browsing.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <article key={category.slug} className="rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="h-48 rounded-3xl bg-muted p-6 text-sm font-semibold text-muted-foreground">
                {category.imageAlt}
              </div>
              <div className="mt-5 space-y-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-foreground">{category.name}</h2>
                  <p className="text-sm leading-6 text-muted-foreground">{category.description}</p>
                </div>
                <Link href={`/categories/${category.slug}`} className="text-sm font-semibold text-primary hover:underline">
                  View category
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
