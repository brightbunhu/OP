'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/site';
import { useCart } from '@/components/site/cart-provider';

type ProductCard = {
  id: string;
  slug: string;
  name: string;
  category: { name: string } | null;
  shortDescription: string | null;
  price: string;
  compareAtPrice: string | null;
  imageUrl: string | null;
  taxRate: string;
};

export default function ProductsPage() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [featured, setFeatured] = useState('');
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    setLoading(true);
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (featured) params.set('featured', featured);

    const response = await fetch(`/api/products?${params.toString()}`);
    const data = await response.json();
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    void fetchProducts();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Products</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">A modern grocery catalog</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Explore live supermarket items with search and filters powered by Prisma and PostgreSQL.
          </p>
        </div>

        <div className="grid gap-4 rounded-3xl border border-border bg-muted p-6 shadow-sm sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input id="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Product name, SKU or description" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Any status</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
              <option value="OUT_OF_STOCK">Out of stock</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="featured">Featured</Label>
            <select
              id="featured"
              value={featured}
              onChange={(event) => setFeatured(event.target.value)}
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All products</option>
              <option value="true">Featured</option>
              <option value="false">Not featured</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{products.length} products found</p>
          <Button onClick={fetchProducts} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh results'}
          </Button>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">Loading products…</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="group overflow-hidden rounded-[20px] border border-border bg-white p-6 shadow-enterprise transition-all duration-300 hover:-translate-y-1">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="aspect-[4/3] w-full rounded-[16px] object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="aspect-[4/3] rounded-[16px] bg-muted p-4 text-sm font-semibold text-muted-foreground flex items-center justify-center overflow-hidden">
                    <div className="transition-transform duration-500 group-hover:scale-105">Live product image</div>
                  </div>
                )}
                <div className="mt-5 space-y-3">
                  <div className="text-sm text-muted-foreground">{product.category?.name ?? 'Uncategorized'}</div>
                  <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
                  <p className="text-sm leading-6 text-muted-foreground line-clamp-2">{product.shortDescription || 'No description available.'}</p>
                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/50">
                    <span className="text-lg font-bold text-secondary">{formatCurrency(Number(product.price))}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="success"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          await addItem({
                            id: product.id,
                            name: product.name,
                            slug: product.slug,
                            imageUrl: product.imageUrl,
                            price: product.price,
                            taxRate: product.taxRate,
                          }, 1);
                        }}
                        className="h-9 rounded-xl px-3 text-xs font-semibold"
                      >
                        Add to Cart
                      </Button>
                      <Link
                        href={`/products/${product.slug}`}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground transition hover:border-primary"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
