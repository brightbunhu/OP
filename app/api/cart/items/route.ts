import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guards';
import { addOrUpdateCartItem, updateCartItemQuantity, removeCartItem } from '@/lib/cart-service';

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json();

  if (!body?.productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  const quantity = Number(body.quantity ?? 1);

  if (Number.isNaN(quantity) || quantity < 1) {
    return NextResponse.json({ error: 'Quantity must be a positive number' }, { status: 400 });
  }

  const cart = await addOrUpdateCartItem(user.id, body.productId, quantity);
  return NextResponse.json(cart);
}

export async function PATCH(request: Request) {
  const user = await requireUser();
  const body = await request.json();

  if (!body?.productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  const quantity = Number(body.quantity);

  if (Number.isNaN(quantity)) {
    return NextResponse.json({ error: 'Quantity must be a number' }, { status: 400 });
  }

  const cart = await updateCartItemQuantity(user.id, body.productId, quantity);
  return NextResponse.json(cart);
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  const body = await request.json();

  if (!body?.productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  const cart = await removeCartItem(user.id, body.productId);
  return NextResponse.json(cart);
}
