'use client';

import { useState } from 'react';
import { useCart } from '@/components/site/cart-provider';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingCart, Check } from 'lucide-react';

type ProductProp = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: string;
  taxRate: string;
};

export function AddToCartForm({ product }: { product: ProductProp }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem, isSaving } = useCart();

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = async () => {
    await addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center rounded-xl border border-border bg-muted p-1">
        <button
          type="button"
          onClick={handleDecrease}
          disabled={quantity <= 1 || isSaving}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-background hover:text-foreground disabled:opacity-30"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-12 text-center text-sm font-semibold text-foreground select-none" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          onClick={handleIncrease}
          disabled={isSaving}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-background hover:text-foreground disabled:opacity-30"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <Button
        onClick={handleAddToCart}
        disabled={isSaving}
        className="relative flex-1 sm:flex-initial min-w-[160px] h-12 rounded-xl text-sm font-semibold tracking-wide transition-all active:scale-95 duration-150"
      >
        {isSaving ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            Adding...
          </span>
        ) : added ? (
          <span className="flex items-center justify-center gap-2 text-primary-foreground">
            <Check className="h-4 w-4 animate-bounce" />
            Added!
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Add to cart
          </span>
        )}
      </Button>
    </div>
  );
}
