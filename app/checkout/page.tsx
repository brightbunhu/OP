'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/components/site/cart-provider';
import { placeOrderAction } from '@/app/actions/order.actions';
import { formatCurrency } from '@/lib/site';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  CreditCard,
  CheckCircle,
  Loader2,
  Package,
} from 'lucide-react';

export default function CheckoutPage() {
  const { cart, isLoading } = useCart();
  const router = useRouter();
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    addressLine1: '',
    city: '',
    province: '',
    country: 'Zimbabwe',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.fullName || !form.addressLine1 || !form.city || !form.province) {
      setError('Please fill in all required shipping fields.');
      return;
    }

    if (cart.items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setIsPlacing(true);
    try {
      const { orderNumber } = await placeOrderAction(form);
      router.push(`/orders/${orderNumber}`);
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong placing your order. Please try again.');
      setIsPlacing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (cart.items.length === 0 && !isLoading) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center gap-6 rounded-[20px] border border-border bg-white p-12 shadow-enterprise">
          <div className="flex h-16 w-16 items-center justify-center rounded-[16px] bg-primary/10">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nothing to checkout</h1>
            <p className="mt-2 text-sm text-muted-foreground">Add items to your cart before proceeding.</p>
          </div>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </section>
    );
  }

  const totalQuantity = cart.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Checkout</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review your order and complete your purchase</p>
        </div>
        <Link href="/cart" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Cart
        </Link>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 animate-in fade-in duration-300">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-start">
          {/* Left: Shipping + Payment */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Shipping Address</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    required
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    name="addressLine1"
                    value={form.addressLine1}
                    onChange={handleChange}
                    placeholder="123 Market Street"
                    required
                  />
                </div>


                <div className="space-y-1.5">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="New York"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="province">Province *</Label>
                  <select
                    id="province"
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    <option value="">Select Province</option>
                    <option>Bulawayo</option>
                    <option>Harare</option>
                    <option>Manicaland</option>
                    <option>Mashonaland Central</option>
                    <option>Mashonaland East</option>
                    <option>Mashonaland West</option>
                    <option>Masvingo</option>
                    <option>Matabeleland North</option>
                    <option>Matabeleland South</option>
                    <option>Midlands</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={form.country}
                    disabled
                    className="bg-muted/50"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+263 71 234 5678"
                    type="tel"
                  />
                </div>
              </div>
            </div>

            {/* Payment (simulated) */}
            <div className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Payment</h2>
              </div>

              <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-6 text-center space-y-2">
                <div className="flex justify-center gap-3 text-3xl">
                  💳 🏦 📱
                </div>
                <p className="text-sm font-semibold text-foreground">Secure payment gateway</p>
                <p className="text-xs text-muted-foreground">
                  This is a sandbox environment. No real payment will be processed.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {['Visa', 'Mastercard', 'PayPal'].map((method) => (
                    <div
                      key={method}
                      className="rounded-xl border border-border bg-background py-2 text-xs font-semibold text-muted-foreground text-center"
                    >
                      {method}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-4">
            <div className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise space-y-5 sticky top-24">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>
              </div>

              {/* Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-12 w-12 rounded-xl object-cover border border-border"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-muted border border-border flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground flex-shrink-0">
                      {formatCurrency(Number(item.unitPrice) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({totalQuantity} items)</span>
                  <span>{formatCurrency(cart.totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes</span>
                  <span>{formatCurrency(cart.totals.tax)}</span>
                </div>
                {cart.totals.discount > 0 && (
                  <div className="flex justify-between text-primary font-medium">
                    <span>🏷️ {cart.totals.discountLabel}</span>
                    <span>-{formatCurrency(cart.totals.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-primary font-semibold">Free</span>
                </div>
                <div className="flex justify-between font-bold text-foreground text-base border-t border-border pt-3 mt-1">
                  <span>Total</span>
                  <span className="text-secondary text-lg">{formatCurrency(cart.totals.total)}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPlacing}
                className="w-full h-12 rounded-xl text-sm font-semibold tracking-wide active:scale-[0.98] transition"
              >
                {isPlacing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Placing Order...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Place Order
                  </span>
                )}
              </Button>

              <p className="text-[11px] text-muted-foreground text-center">
                By placing your order you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
