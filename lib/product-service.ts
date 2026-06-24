import { prisma } from '@/lib/prisma';
import { PRODUCT_STATUSES, ProductStatus } from '@/lib/product-constants';

export type ProductFilters = {
  categoryId?: string;
  search?: string;
  status?: ProductStatus;
  featured?: boolean;
};

export async function getProducts(filters: ProductFilters = {}) {
  const andFilters: any[] = [];

  if (filters.categoryId) {
    andFilters.push({ categoryId: filters.categoryId });
  }

  if (filters.status) {
    andFilters.push({ status: filters.status });
  }

  if (typeof filters.featured === 'boolean') {
    andFilters.push({ isFeatured: filters.featured });
  }

  if (filters.search) {
    andFilters.push({
      OR: [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
      ],
    });
  }

  return prisma.product.findMany({
    where: {
      deletedAt: null,
      AND: andFilters.length ? andFilters : undefined,
    },
    include: { category: true },
    orderBy: [{ status: 'desc' }, { updatedAt: 'desc' }],
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
}

export async function createProduct(data: {
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  description?: string;
  imageUrl?: string;
  price: string | number;
  compareAtPrice?: string | number;
  costPrice?: string | number;
  taxRate: string | number;
  weightGrams?: number;
  status: ProductStatus;
  isFeatured: boolean;
  categoryId: string;
}) {
  return prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      barcode: data.barcode,
      description: data.description,
      imageUrl: data.imageUrl,
      price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
      compareAtPrice: data.compareAtPrice ? (typeof data.compareAtPrice === 'string' ? parseFloat(data.compareAtPrice) : data.compareAtPrice) : undefined,
      costPrice: data.costPrice ? (typeof data.costPrice === 'string' ? parseFloat(data.costPrice) : data.costPrice) : undefined,
      taxRate: typeof data.taxRate === 'string' ? parseFloat(data.taxRate) : data.taxRate,
      weightGrams: data.weightGrams,
      status: data.status,
      isFeatured: data.isFeatured,
      categoryId: data.categoryId,
    },
  });
}

export async function updateProduct(id: string, data: Partial<{
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  description?: string;
  imageUrl?: string;
  price: string | number;
  compareAtPrice?: string | number;
  costPrice?: string | number;
  taxRate: string | number;
  weightGrams?: number;
  status: ProductStatus;
  isFeatured: boolean;
  categoryId: string;
}>) {
  return prisma.product.update({
    where: { id },
    data: {
      ...data,
      price: data.price !== undefined ? (typeof data.price === 'string' ? parseFloat(data.price) : data.price) : undefined,
      compareAtPrice: data.compareAtPrice !== undefined ? (typeof data.compareAtPrice === 'string' ? parseFloat(data.compareAtPrice) : data.compareAtPrice) : undefined,
      costPrice: data.costPrice !== undefined ? (typeof data.costPrice === 'string' ? parseFloat(data.costPrice) : data.costPrice) : undefined,
      taxRate: data.taxRate !== undefined ? (typeof data.taxRate === 'string' ? parseFloat(data.taxRate) : data.taxRate) : undefined,
    },
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function getCategories() {
  return prisma.category.findMany({ where: { deletedAt: null }, orderBy: { name: 'asc' } });
}
