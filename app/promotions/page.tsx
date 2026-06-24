import Link from 'next/link';
import { promotions } from '@/lib/site';

export const metadata = {
  title: 'Promotions | OP Supermarket',
  description: 'Save with grocery promotions and limited-time supermarket deals across popular categories.',
};

export default function PromotionsPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Promotions</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Current deals to save on groceries</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Find active promotions, bundle offers, and grocery discounts available today.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {promotions.map((promotion) => (
            <article key={promotion.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{promotion.discountLabel}</span>
                  <span className="text-sm text-muted-foreground">{promotion.validUntil}</span>
                </div>
                <h2 className="text-2xl font-semibold text-foreground">{promotion.title}</h2>
                <p className="text-sm leading-6 text-muted-foreground">{promotion.description}</p>
              </div>
              <Link href="/products" className="mt-6 inline-flex text-sm font-semibold text-primary hover:underline">
                Shop eligible products
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
