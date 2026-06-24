import { prisma } from '@/lib/prisma';

export type ShippingAddress = {
  fullName: string;
  addressLine1: string;
  city: string;
  province: string;
  country: string;
  phone?: string;
};

export async function placeOrder(userId: string, shippingAddress: ShippingAddress) {
  // Get the user's active cart with items and products
  const cart = await prisma.cart.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error('No active cart or cart is empty');
  }

  // Calculate totals
  const subtotal = cart.items.reduce(
    (sum, item) => sum + (Number(item.unitPrice) * item.quantity),
    0,
  );

  const taxTotal = cart.items.reduce((sum, item) => {
    const itemTotal = Number(item.unitPrice) * item.quantity;
    const taxRate = Number(item.product.taxRate) / 100;
    return sum + (itemTotal * taxRate);
  }, 0);

  const totalQuantity = cart.items.reduce((n, item) => n + item.quantity, 0);

  let discountTotal = 0;
  if (totalQuantity >= 5) {
    discountTotal = subtotal * 0.05;
  } else if (subtotal >= 100) {
    discountTotal = subtotal * 0.1;
  }

  const grandTotal = subtotal - discountTotal + taxTotal;

  // Generate a readable order number
  const orderNumber = `OP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

  // Create the order + items in a transaction, and mark cart as CONVERTED
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        fulfillmentStatus: 'PENDING',
        currency: cart.currency,
        subtotal,
        discountTotal,
        taxTotal,
        shippingTotal: 0,
        grandTotal,
        shippingAddress: shippingAddress as any,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            sku: item.product.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxTotal: Number(item.unitPrice) * item.quantity * (Number(item.product.taxRate) / 100),
            lineTotal: Number(item.unitPrice) * item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    // Mark cart as CONVERTED
    await tx.cart.update({
      where: { id: cart.id },
      data: { status: 'CONVERTED' },
    });

    return newOrder;
  });

  return order;
}

export async function getOrdersByUser(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId, deletedAt: null },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

  // Convert Decimal fields to numbers for serialization
  return orders.map(order => ({
    ...order,
    subtotal: Number(order.subtotal),
    discountTotal: Number(order.discountTotal),
    taxTotal: Number(order.taxTotal),
    shippingTotal: Number(order.shippingTotal),
    grandTotal: Number(order.grandTotal),
    items: order.items.map(item => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      discountTotal: Number(item.discountTotal),
      taxTotal: Number(item.taxTotal),
      lineTotal: Number(item.lineTotal),
    })),
  }));
}

export async function getOrderByNumber(userId: string, orderNumber: string) {
  const order = await prisma.order.findFirst({
    where: { userId, orderNumber, deletedAt: null },
    include: { items: { include: { product: { select: { imageUrl: true, slug: true } } } } },
  });

  if (!order) return null;

  // Convert Decimal fields to numbers for serialization
  return {
    ...order,
    subtotal: Number(order.subtotal),
    discountTotal: Number(order.discountTotal),
    taxTotal: Number(order.taxTotal),
    shippingTotal: Number(order.shippingTotal),
    grandTotal: Number(order.grandTotal),
    items: order.items.map(item => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      discountTotal: Number(item.discountTotal),
      taxTotal: Number(item.taxTotal),
      lineTotal: Number(item.lineTotal),
    })),
  };
}
