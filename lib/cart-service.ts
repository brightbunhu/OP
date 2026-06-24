import { prisma } from '@/lib/prisma';
import { calculateCartTotals, type CartItemWithProduct, type CartResponse } from '@/lib/cart';

function serializeCartItem(item: { id: string; quantity: number; unitPrice: { toString: () => string }; product: { id: string; name: string; slug: string; imageUrl: string | null; taxRate: { toString: () => string } } }): CartItemWithProduct {
  return {
    id: item.id,
    productId: item.product.id,
    quantity: item.quantity,
    unitPrice: item.unitPrice.toString(),
    taxRate: item.product.taxRate.toString(),
    product: {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      imageUrl: item.product.imageUrl,
    },
  };
}

function serializeCart(cart: { id: string; status: string; currency: string; items: Array<any> } | null): CartResponse {
  if (!cart) {
    return {
      id: '',
      status: 'ACTIVE',
      currency: 'USD',
      items: [],
      totals: calculateCartTotals([]),
    };
  }

  const items = cart.items.map(serializeCartItem);

  return {
    id: cart.id,
    status: cart.status,
    currency: cart.currency,
    items,
    totals: calculateCartTotals(items),
  };
}

async function getActiveCart(userId: string) {
  return prisma.cart.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { items: { include: { product: true } } },
  });
}

async function getOrCreateCart(userId: string) {
  const existingCart = await getActiveCart(userId);

  if (existingCart) {
    return existingCart;
  }

  return prisma.cart.create({
    data: {
      userId,
      currency: 'USD',
    },
    include: { items: { include: { product: true } } },
  });
}

export async function getCart(userId: string): Promise<CartResponse> {
  const cart = await getOrCreateCart(userId);
  return serializeCart(cart);
}

export async function addOrUpdateCartItem(userId: string, productId: string, quantity: number): Promise<CartResponse> {
  const cart = await getOrCreateCart(userId);
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, slug: true, imageUrl: true, price: true, taxRate: true },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  const item = await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
    update: {
      quantity: {
        increment: quantity,
      },
      unitPrice: product.price,
    },
    create: {
      cartId: cart.id,
      productId,
      quantity,
      unitPrice: product.price,
    },
    include: { product: true },
  });

  const updatedCart = await getActiveCart(userId);
  return serializeCart(updatedCart);
}

export async function updateCartItemQuantity(userId: string, productId: string, quantity: number): Promise<CartResponse> {
  const cart = await getOrCreateCart(userId);

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });
  } else {
    await prisma.cartItem.updateMany({
      where: { cartId: cart.id, productId },
      data: { quantity },
    });
  }

  const updatedCart = await getActiveCart(userId);
  return serializeCart(updatedCart);
}

export async function removeCartItem(userId: string, productId: string): Promise<CartResponse> {
  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId },
  });

  const updatedCart = await getActiveCart(userId);
  return serializeCart(updatedCart);
}

export async function saveCart(userId: string): Promise<CartResponse> {
  const cart = await getOrCreateCart(userId);

  await prisma.cart.update({
    where: { id: cart.id },
    data: {},
  });

  const updatedCart = await getActiveCart(userId);
  return serializeCart(updatedCart);
}
