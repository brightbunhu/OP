'use server';

import { auth } from '@/auth';
import {
  getCart,
  addOrUpdateCartItem,
  updateCartItemQuantity,
  removeCartItem,
  saveCart,
} from '@/lib/cart-service';
import type { CartResponse } from '@/lib/cart';

async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

export async function getCartAction(): Promise<CartResponse> {
  const userId = await getAuthenticatedUserId();
  return getCart(userId);
}

export async function addToCartAction(productId: string, quantity: number): Promise<CartResponse> {
  const userId = await getAuthenticatedUserId();
  return addOrUpdateCartItem(userId, productId, quantity);
}

export async function updateCartItemQuantityAction(productId: string, quantity: number): Promise<CartResponse> {
  const userId = await getAuthenticatedUserId();
  return updateCartItemQuantity(userId, productId, quantity);
}

export async function removeCartItemAction(productId: string): Promise<CartResponse> {
  const userId = await getAuthenticatedUserId();
  return removeCartItem(userId, productId);
}

export async function saveCartAction(guestItems?: { productId: string; quantity: number }[]): Promise<CartResponse> {
  const userId = await getAuthenticatedUserId();
  if (guestItems && guestItems.length > 0) {
    for (const item of guestItems) {
      await addOrUpdateCartItem(userId, item.productId, item.quantity);
    }
  }
  return saveCart(userId);
}
