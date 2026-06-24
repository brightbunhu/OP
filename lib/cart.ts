export type CartProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
};

export type CartItemWithProduct = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  taxRate: string;
  product: CartProduct;
};

export type CartTotals = {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  discountLabel: string | null;
};

export type CartResponse = {
  id: string;
  status: string;
  currency: string;
  items: CartItemWithProduct[];
  totals: CartTotals;
};

const AUTO_DISCOUNT_THRESHOLD = 100;
const AUTO_DISCOUNT_RATE = 0.1;
const BULK_QUANTITY_THRESHOLD = 5;
const BULK_DISCOUNT_RATE = 0.05;

export function calculateCartTotals(items: CartItemWithProduct[]): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
  const totalQuantity = items.reduce((count, item) => count + item.quantity, 0);

  let discount = 0;
  let discountLabel: string | null = null;

  if (totalQuantity >= BULK_QUANTITY_THRESHOLD) {
    discount = subtotal * BULK_DISCOUNT_RATE;
    discountLabel = `Bulk savings (${Math.round(BULK_DISCOUNT_RATE * 100)}%)`;
  } else if (subtotal >= AUTO_DISCOUNT_THRESHOLD) {
    discount = subtotal * AUTO_DISCOUNT_RATE;
    discountLabel = `Large order discount (${Math.round(AUTO_DISCOUNT_RATE * 100)}%)`;
  }

  const tax = items.reduce((sum, item) => {
    const itemPrice = Number(item.unitPrice) * item.quantity;
    const rate = Number(item.taxRate ?? '0');
    return sum + (itemPrice * rate) / 100;
  }, 0);

  const total = subtotal - discount + tax;

  return {
    subtotal,
    tax,
    discount,
    total,
    discountLabel,
  };
}
