import { NextResponse } from 'next/server';
import { requireMinimumRole } from '@/lib/auth/guards';
import { getCategories } from '@/lib/product-service';

interface CategoryRow {
  id: string;
  name: string;
}

export async function GET() {
  try {
    await requireMinimumRole('MANAGER');
    const categories = await getCategories();
    return NextResponse.json(
      categories.map((category: CategoryRow) => ({ id: category.id, name: category.name })),
    );
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
