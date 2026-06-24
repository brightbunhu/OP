'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireMinimumRole } from '@/lib/auth/guards';

export async function createLead(formData: {
  name: string;
  email: string;
  phone?: string;
  status: string;
  value?: number;
  source?: string;
  notes?: string;
}) {
  const user = await requireMinimumRole('SALES');

  const lead = await prisma.lead.create({
    data: {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      status: formData.status,
      value: formData.value || null,
      source: formData.source || null,
      notes: formData.notes || null,
      assignedToId: user.id, // assign to the current salesperson
    },
  });

  revalidatePath('/sales');
  return { success: true, lead };
}

export async function updateLeadStatus(leadId: string, status: string) {
  await requireMinimumRole('SALES');

  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: { status },
  });

  revalidatePath('/sales');
  return { success: true, lead };
}

export async function updateOrderStatus(orderId: string, status: string) {
  await requireMinimumRole('SALES');

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: status as 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED' },
  });

  revalidatePath('/sales');
  revalidatePath('/manager');
  return { success: true, order };
}

export async function updateOrderPaymentStatus(orderId: string, paymentStatus: string) {
  await requireMinimumRole('SALES');

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: paymentStatus as 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' },
  });

  revalidatePath('/sales');
  revalidatePath('/manager');
  return { success: true, order };
}

export async function restockProduct(productId: string, quantityToOrder: number) {
  const user = await requireMinimumRole('MANAGER');

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { inventory: true },
  });

  if (!product || !product.inventory) {
    throw new Error('Product or inventory not found');
  }

  // Update inventory
  const updatedInv = await prisma.inventory.update({
    where: { productId },
    data: {
      quantityOnHand: { increment: quantityToOrder },
      status: 'IN_STOCK',
    },
  });

  // Log stock movement
  await prisma.stockMovement.create({
    data: {
      productId,
      inventoryId: product.inventory.id,
      supplierId: product.supplierId,
      type: 'PURCHASE',
      quantity: quantityToOrder,
      unitCost: product.costPrice,
      reference: `RESTOCK-${Date.now()}`,
      reason: `Manager restock request by ${user.name || user.email}`,
    },
  });

  revalidatePath('/manager');
  return { success: true, product: updatedInv };
}
