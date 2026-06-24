import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  barcode: z.string().optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  imageUrl: z.string().min(1).optional().nullable(),
  price: z.preprocess((value) => (typeof value === 'string' ? value.trim() : value), z.string().regex(/^\d+(?:\.\d{1,2})?$/, 'Price must be a valid decimal')).transform(Number),
  compareAtPrice: z.preprocess((value) => (typeof value === 'string' && value !== '' ? value.trim() : undefined), z.string().regex(/^\d+(?:\.\d{1,2})?$/, 'Compare at price must be a valid decimal').optional()).transform((value) => (value === undefined ? undefined : Number(value))),
  costPrice: z.preprocess((value) => (typeof value === 'string' && value !== '' ? value.trim() : undefined), z.string().regex(/^\d+(?:\.\d{1,2})?$/, 'Cost price must be a valid decimal').optional()).transform((value) => (value === undefined ? undefined : Number(value))),
  taxRate: z.preprocess((value) => (typeof value === 'string' ? value.trim() : value), z.string().regex(/^\d+(?:\.\d{1,2})?$/, 'Tax rate must be a valid decimal')).transform(Number),
  weightGrams: z.preprocess((value) => (typeof value === 'string' && value !== '' ? Number(value) : undefined), z.number().int().min(0).optional()),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED', 'OUT_OF_STOCK']),
  isFeatured: z.preprocess((value) => value === 'true' || value === true, z.boolean()),
  categoryId: z.string().min(1, 'Category is required'),
});

export const productFiltersSchema = z.object({
  categoryId: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED', 'OUT_OF_STOCK']).optional(),
  featured: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
});
