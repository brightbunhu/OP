import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/product-service';
import { formatCurrency } from '@/lib/site';
import { AddToCartForm } from '@/components/products/add-to-cart-form';

export async function generateStaticParams() {
  return [] as Array<{ slug: string }>;
}

export default async function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="space-y-3">
          <Link href="/products" className="text-sm font-medium text-primary hover:underline">
            ← Back to products
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{product.name}</h1>
          <p className="text-sm text-muted-foreground">{product.category?.name ?? 'Uncategorized'}</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="rounded-3xl border border-border bg-muted p-4 text-center text-sm font-semibold text-muted-foreground">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="mx-auto h-full max-h-[520px] w-full rounded-3xl object-contain"
              />
            ) : (
              <div className="aspect-[4/3] rounded-3xl bg-muted p-10 text-sm font-semibold text-muted-foreground">Product image placeholder</div>
            )}
          </div>

          <div className="space-y-6 rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{product.category?.name ?? 'Uncategorized'}</span>
                <span className="text-lg font-semibold text-foreground">{formatCurrency(Number(product.price))}</span>
              </div>
              <p className="text-sm leading-7 text-muted-foreground">{product.description ?? 'No detailed description available for this product.'}</p>
            </div>

            <div className="space-y-4 rounded-3xl bg-muted p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Product highlights</p>
              <ul className="space-y-3 text-sm leading-6 text-foreground">
                <li>Fresh ingredients and modern curated grocery sourcing.</li>
                <li>Responsive product page optimized for mobile and desktop.</li>
                <li>Clear pricing, descriptions, and fast checkout-ready structure.</li>
              </ul>
            </div>

            <AddToCartForm
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                imageUrl: product.imageUrl,
                price: product.price.toString(),
                taxRate: product.taxRate.toString(),
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
