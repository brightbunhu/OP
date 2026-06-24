'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/components/site/cart-provider';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/site';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, Loader2, Save, ShoppingBag, ArrowRight } from 'lucide-react';
import { Alert } from '@/components/ui/alert';

export default function CartPage() {
  const { cart, updateQuantity, removeItem, syncCart, isLoading, isSaving } = useCart();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleDecreaseQuantity = async (productId: string, currentQuantity: number) => {
    await updateQuantity(productId, currentQuantity - 1);
  };

  const handleIncreaseQuantity = async (productId: string, currentQuantity: number) => {
    await updateQuantity(productId, currentQuantity + 1);
  };

  const handleSaveCart = async () => {
    if (cart.id === 'guest') return;
    try {
      setSaveStatus('idle');
      await syncCart();
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
    }
  };



  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading your cart...</p>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center justify-center gap-6 rounded-[20px] border border-border bg-white p-12 shadow-enterprise">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingCart className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Your cart is empty</h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Looks like you haven't added any products to your cart yet. Explore our fresh catalog to find great groceries.
            </p>
          </div>
          <Button asChild className="rounded-[12px] px-6 py-5">
            <Link href="/products" className="inline-flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Go Shopping
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Shopping Cart</h1>
            <p className="text-sm text-muted-foreground">Manage your grocery items and discounts</p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue shopping
          </Link>
        </div>



        {saveStatus === 'success' && (
          <Alert variant="success" className="animate-in fade-in duration-300">
            Your shopping cart has been successfully synced and persisted online.
          </Alert>
        )}

        {saveStatus === 'error' && (
          <Alert variant="destructive" className="animate-in fade-in duration-300">
            Failed to save your cart. Please try again.
          </Alert>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.8fr_1fr] items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Cart Items List */}
          <div className="space-y-4">
            <div className="rounded-[20px] border border-border bg-white shadow-enterprise overflow-hidden">
              <div className="divide-y divide-border">
                {cart.items.map((item) => {
                  const lineTotal = Number(item.unitPrice) * item.quantity;
                  return (
                    <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 transition hover:bg-muted/30">
                      <div className="flex items-center gap-4">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="h-16 w-16 rounded-2xl object-cover border border-border bg-muted"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-muted text-[10px] text-muted-foreground text-center p-1">
                            No image
                          </div>
                        )}
                        <div className="space-y-1">
                          <h3 className="font-semibold text-foreground leading-snug">{item.product.name}</h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>Unit Price: {formatCurrency(Number(item.unitPrice))}</span>
                            <span>•</span>
                            <span>Tax: {item.taxRate}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-6 self-stretch sm:self-center">
                        {/* Quantity Controls */}
                        <div className="flex items-center rounded-xl border border-border bg-muted p-1">
                          <button
                            type="button"
                            onClick={() => void handleDecreaseQuantity(item.productId, item.quantity)}
                            disabled={isSaving}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-background hover:text-foreground disabled:opacity-30"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-foreground select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => void handleIncreaseQuantity(item.productId, item.quantity)}
                            disabled={isSaving}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-background hover:text-foreground disabled:opacity-30"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Line Total & Remove */}
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-bold text-foreground w-20 text-right">
                            {formatCurrency(lineTotal)}
                          </span>
                          <button
                            type="button"
                            onClick={() => void removeItem(item.productId)}
                            disabled={isSaving}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:text-destructive hover:border-destructive/30 transition duration-150"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cart Summary Card */}
          <div className="space-y-6">
            <div className="rounded-[20px] border border-border bg-white p-6 shadow-enterprise space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})</span>
                  <span className="font-semibold text-foreground">{formatCurrency(cart.totals.subtotal)}</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated Taxes</span>
                  <span className="font-semibold text-foreground">{formatCurrency(cart.totals.tax)}</span>
                </div>

                {cart.totals.discount > 0 && (
                  <div className="flex justify-between text-primary font-medium bg-primary/5 rounded-xl px-3 py-2 border border-primary/10">
                    <span className="flex items-center gap-1.5">
                      <span>🏷️</span>
                      {cart.totals.discountLabel ?? 'Discounts applied'}
                    </span>
                    <span>-{formatCurrency(cart.totals.discount)}</span>
                  </div>
                )}

                <div className="border-t border-border pt-4 flex justify-between text-base font-bold text-foreground">
                  <span>Total</span>
                  <span className="text-xl text-secondary">{formatCurrency(cart.totals.total)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button asChild className="w-full h-12 rounded-xl text-sm font-semibold tracking-wide active:scale-[0.98] transition">
                  <Link href="/checkout" className="inline-flex items-center justify-center gap-2">
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  onClick={() => void handleSaveCart()}
                  disabled={cart.id === 'guest' || isSaving}
                  variant="secondary"
                  className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {cart.id === 'guest' ? 'Login to save cart' : 'Save Cart online'}
                </Button>
                {cart.id === 'guest' && (
                  <p className="text-[11px] text-muted-foreground text-center leading-normal">
                    Logging in will automatically transfer your items to your user account.
                  </p>
                )}
              </div>
            </div>

            {/* Premium Guarantee Badges */}
            <div className="rounded-[20px] border border-border bg-background p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Why shop with us?</h4>
              <ul className="space-y-3 text-xs text-foreground">
                <li className="flex items-center gap-2">
                  <span>🥬</span>
                  <strong>100% Freshness Guarantee:</strong> Hand-picked quality check.
                </li>
                <li className="flex items-center gap-2">
                  <span>⚡</span>
                  <strong>Fast Delivery/Pickup:</strong> Flexible scheduler at checkout.
                </li>
                <li className="flex items-center gap-2">
                  <span>🛡️</span>
                  <strong>Secure Transactions:</strong> Encrypted customer protection.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
