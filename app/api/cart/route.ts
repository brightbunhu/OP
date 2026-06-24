import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guards';
import { getCart } from '@/lib/cart-service';

export async function GET(request: Request) {
  const user = await requireUser();
  const cart = await getCart(user.id);
  return NextResponse.json(cart);
}
