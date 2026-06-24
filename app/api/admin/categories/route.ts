import { NextResponse } from 'next/server';
import { requireMinimumRole } from '@/lib/auth/guards';
import { getCategories } from '@/lib/product-service';

export async function GET() {
  await requireMinimumRole('MANAGER');
  const categories = await getCategories();
  return NextResponse.json(categories.map((category: { id: string; name: string }) => ({ id: category.id, name: category.name })));
}
