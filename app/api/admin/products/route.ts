import { NextResponse } from 'next/server';
import { requireMinimumRole } from '@/lib/auth/guards';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/product-service';
import { productSchema, productFiltersSchema } from '@/lib/validators/product';

function serializeProduct(product: any) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    barcode: product.barcode,
    description: product.description,
    imageUrl: product.imageUrl,
    categoryId: product.categoryId,
    category: product.category ? { id: product.category.id, name: product.category.name } : null,
    price: product.price.toString(),
    compareAtPrice: product.compareAtPrice?.toString() ?? null,
    costPrice: product.costPrice?.toString() ?? null,
    taxRate: product.taxRate.toString(),
    weightGrams: product.weightGrams,
    status: product.status,
    isFeatured: product.isFeatured,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export async function GET(request: Request) {
  await requireMinimumRole('MANAGER');
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

  return NextResponse.json(products.map(serializeProduct));
}

export async function POST(request: Request) {
  await requireMinimumRole('MANAGER');
  const body = await request.json();
  const parsed = productSchema.safeParse({
    ...body,
    isFeatured: body.featured === 'true' || body.isFeatured === true,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const product = await createProduct({
    ...parsed.data,
    barcode: parsed.data.barcode ?? undefined,
    description: parsed.data.description ?? undefined,
    imageUrl: parsed.data.imageUrl ?? undefined,
  });

  return NextResponse.json(serializeProduct(product));
}

export async function PATCH(request: Request) {
  await requireMinimumRole('MANAGER');
  const body = await request.json();

  if (!body?.id) {
    return NextResponse.json({ error: 'Product id required' }, { status: 400 });
  }

  const parsed = productSchema.partial().safeParse({
    ...body,
    isFeatured: body.featured === 'true' || body.isFeatured === true,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const product = await updateProduct(body.id, {
    ...parsed.data,
    barcode: parsed.data.barcode ?? undefined,
    description: parsed.data.description ?? undefined,
    imageUrl: parsed.data.imageUrl ?? undefined,
  });

  return NextResponse.json(serializeProduct(product));
}

export async function DELETE(request: Request) {
  await requireMinimumRole('MANAGER');
  const body = await request.json();

  if (!body?.id) {
    return NextResponse.json({ error: 'Product id required' }, { status: 400 });
  }

  await deleteProduct(body.id);
  return NextResponse.json({ success: true });
}
