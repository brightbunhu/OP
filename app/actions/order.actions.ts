'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { placeOrder, type ShippingAddress } from '@/lib/order-service';
import { getOrdersByUser, getOrderByNumber } from '@/lib/order-service';

async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }
  return session.user.id;
}

export async function placeOrderAction(shippingAddress: ShippingAddress) {
  const userId = await getAuthenticatedUserId();
  const order = await placeOrder(userId, shippingAddress);
  return { orderNumber: order.orderNumber };
}

export async function getOrdersAction() {
  const userId = await getAuthenticatedUserId();
  return getOrdersByUser(userId);
}

export async function getOrderByNumberAction(orderNumber: string) {
  const userId = await getAuthenticatedUserId();
  return getOrderByNumber(userId, orderNumber);
}
