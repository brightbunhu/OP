import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guards';
import { saveCart } from '@/lib/cart-service';

export async function POST(request: Request) {
  const user = await requireUser();
  const cart = await saveCart(user.id);
  return NextResponse.json(cart);
}
