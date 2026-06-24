/**
 * Shared domain types used across the application.
 * Centralising these prevents implicit `any` in map/filter/reduce callbacks.
 */

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
}

// ---------------------------------------------------------------------------
// Product (lightweight view – used in listings / admin tables)
// ---------------------------------------------------------------------------
export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  sku: string;
  barcode: string | null;
  description: string | null;
  imageUrl: string | null;
  categoryId: string;
  category: { id: string; name: string } | null;
  price: string;
  compareAtPrice: string | null;
  costPrice: string | null;
  taxRate: string;
  weightGrams: number | null;
  status: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Push notification subscription
// ---------------------------------------------------------------------------
export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// ---------------------------------------------------------------------------
// Role (minimal shape returned by server actions / API)
// ---------------------------------------------------------------------------
export interface RoleRef {
  id: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Session user (for components that receive session as a prop)
// ---------------------------------------------------------------------------
export interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  roles?: string[];
  permissions?: string[];
  status?: string;
  emailVerifiedAt?: string | null;
}

export interface AppSession {
  user: SessionUser;
  expires: string;
}
