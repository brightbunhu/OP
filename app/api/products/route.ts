import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/product-service';
import { productFiltersSchema } from '@/lib/validators/product';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = productFiltersSchema.safeParse(Object.fromEntries(url.searchParams.entries()));

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid filters' }, { status: 400 });
  }

  const products = await getProducts({
    categoryId: parsed.data.categoryId,
    status: parsed.data.status,
    featured: parsed.data.featured === 'true' ? true : parsed.data.featured === 'false' ? false : undefined,
    search: parsed.data.search,
  });

  return NextResponse.json(
    products.map((product: any) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category ? { name: product.category.name } : null,
      shortDescription: product.description ?? null,
      price: product.price.toString(),
      compareAtPrice: product.compareAtPrice?.toString() ?? null,
      status: product.status,
      sku: product.sku,
      imageUrl: product.imageUrl ?? null,
      taxRate: product.taxRate.toString(),
    })),
  );
}
