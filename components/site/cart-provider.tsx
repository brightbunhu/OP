'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { calculateCartTotals, type CartItemWithProduct, type CartResponse } from '@/lib/cart';
import {
  addToCartAction,
  updateCartItemQuantityAction,
  removeCartItemAction,
  saveCartAction,
  getCartAction,
} from '@/app/actions/cart.actions';

type CartContextType = {
  cart: CartResponse;
  addItem: (
    product: { id: string; name: string; slug: string; imageUrl: string | null; price: string; taxRate: string },
    quantity: number
  ) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  syncCart: () => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'op_supermarket_guest_cart';

const initialCart: CartResponse = {
  id: '',
  status: 'ACTIVE',
  currency: 'USD',
  items: [],
  totals: calculateCartTotals([]),
};

export function CartProvider({ children, session }: { children: React.ReactNode; session: any }) {
  const [cart, setCart] = useState<CartResponse>(initialCart);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const userId = session?.user?.id;

  // Initial load / Sync guest cart to DB upon login
  useEffect(() => {
    async function initCart() {
      setIsLoading(true);
      try {
        if (userId) {
          // Authenticated User
          const localCartData = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (localCartData) {
            const guestItems = JSON.parse(localCartData) as CartItemWithProduct[];
            if (guestItems.length > 0) {
              // Sync guest items to DB
              const dbItems = guestItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              }));
              const updatedCart = await saveCartAction(dbItems);
              setCart(updatedCart);
              localStorage.removeItem(LOCAL_STORAGE_KEY);
              setIsLoading(false);
              return;
            }
          }
          // No guest items or done syncing, fetch active cart
          const activeCart = await getCartAction();
          setCart(activeCart);
        } else {
          // Guest User
          const localCartData = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (localCartData) {
            const guestItems = JSON.parse(localCartData) as CartItemWithProduct[];
            setCart({
              id: 'guest',
              status: 'ACTIVE',
              currency: 'USD',
              items: guestItems,
              totals: calculateCartTotals(guestItems),
            });
          } else {
            setCart(initialCart);
          }
        }
      } catch (error) {
        console.error('Error initializing/syncing cart:', error);
      } finally {
        setIsLoading(false);
      }
    }

    void initCart();
  }, [userId]);

  // Actions
  const addItem = async (
    product: { id: string; name: string; slug: string; imageUrl: string | null; price: string; taxRate: string },
    quantity: number
  ) => {
    if (quantity <= 0) return;

    if (userId) {
      setIsSaving(true);
      try {
        const updatedCart = await addToCartAction(product.id, quantity);
        setCart(updatedCart);
      } catch (error) {
        console.error('Error adding item to DB cart:', error);
      } finally {
        setIsSaving(false);
      }
    } else {
      // Guest logic
      const updatedItems = [...cart.items];
      const existingItemIndex = updatedItems.findIndex((item) => item.productId === product.id);

      if (existingItemIndex > -1) {
        const item = updatedItems[existingItemIndex];
        if (item) {
          updatedItems[existingItemIndex] = {
            ...item,
            quantity: item.quantity + quantity,
          };
        }
      } else {
        const newItem: CartItemWithProduct = {
          id: Math.random().toString(36).substring(2, 9), // temp id
          productId: product.id,
          quantity,
          unitPrice: product.price,
          taxRate: product.taxRate,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            imageUrl: product.imageUrl,
          },
        };
        updatedItems.push(newItem);
      }

      const updatedCart: CartResponse = {
        id: 'guest',
        status: 'ACTIVE',
        currency: 'USD',
        items: updatedItems,
        totals: calculateCartTotals(updatedItems),
      };

      setCart(updatedCart);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedItems));
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (userId) {
      setIsSaving(true);
      try {
        const updatedCart = await updateCartItemQuantityAction(productId, quantity);
        setCart(updatedCart);
      } catch (error) {
        console.error('Error updating item quantity in DB cart:', error);
      } finally {
        setIsSaving(false);
      }
    } else {
      // Guest logic
      let updatedItems = [...cart.items];
      const existingItemIndex = updatedItems.findIndex((item) => item.productId === productId);

      if (existingItemIndex > -1) {
        if (quantity <= 0) {
          updatedItems = updatedItems.filter((item) => item.productId !== productId);
        } else {
          const item = updatedItems[existingItemIndex];
          if (item) {
            updatedItems[existingItemIndex] = {
              ...item,
              quantity,
            };
          }
        }
      }

      const updatedCart: CartResponse = {
        id: 'guest',
        status: 'ACTIVE',
        currency: 'USD',
        items: updatedItems,
        totals: calculateCartTotals(updatedItems),
      };

      setCart(updatedCart);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedItems));
    }
  };

  const removeItem = async (productId: string) => {
    if (userId) {
      setIsSaving(true);
      try {
        const updatedCart = await removeCartItemAction(productId);
        setCart(updatedCart);
      } catch (error) {
        console.error('Error removing item from DB cart:', error);
      } finally {
        setIsSaving(false);
      }
    } else {
      // Guest logic
      const updatedItems = cart.items.filter((item) => item.productId !== productId);

      const updatedCart: CartResponse = {
        id: 'guest',
        status: 'ACTIVE',
        currency: 'USD',
        items: updatedItems,
        totals: calculateCartTotals(updatedItems),
      };

      setCart(updatedCart);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedItems));
    }
  };

  const syncCart = async () => {
    if (userId) {
      setIsSaving(true);
      try {
        const updatedCart = await saveCartAction();
        setCart(updatedCart);
      } catch (error) {
        console.error('Error syncing DB cart:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <CartContext.Provider value={{ cart, addItem, updateQuantity, removeItem, syncCart, isLoading, isSaving }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
