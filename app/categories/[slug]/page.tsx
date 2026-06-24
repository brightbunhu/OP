import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/site';

export default async function CategoryDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  const category = await prisma.category.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      products: {
        where: {
          status: 'ACTIVE',
          deletedAt: null,
        },
        orderBy: { updatedAt: 'desc' },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="space-y-8">
        <div className="space-y-3">
          <Link href="/categories" className="text-sm font-medium text-primary hover:underline">
            ← Back to categories
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{category.name}</h1>
          <p className="text-sm leading-7 text-muted-foreground">{category.description}</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Products in {category.name}</h2>
          {category.products.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
              No products found in this category.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {category.products.map((product) => (
                <article key={product.id} className="group overflow-hidden rounded-[20px] border border-border bg-white p-6 shadow-enterprise transition-all duration-300 hover:-translate-y-1">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="aspect-[4/3] w-full rounded-[16px] object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="aspect-[4/3] rounded-[16px] bg-muted p-4 text-sm font-semibold text-muted-foreground flex items-center justify-center overflow-hidden">
                      <div className="transition-transform duration-500 group-hover:scale-105">Product image</div>
                    </div>
                  )}
                  <div className="mt-5 space-y-3">
                    <h3 className="text-xl font-bold text-foreground truncate">{product.name}</h3>
                    <p className="text-sm leading-6 text-muted-foreground line-clamp-2">{product.description || 'No description available.'}</p>
                    <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/50">
                      <span className="text-lg font-bold text-secondary">{formatCurrency(Number(product.price))}</span>
                      <Link
                        href={`/products/${product.slug}`}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:border-primary"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

