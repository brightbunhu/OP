import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { PRODUCT_STATUSES, ProductStatus } from '@/lib/product-constants';

export type ProductFilters = {
  categoryId?: string;
  search?: string;
  status?: ProductStatus;
  featured?: boolean;
};

export async function getProducts(filters: ProductFilters = {}) {
  const andFilters: Prisma.ProductWhereInput[] = [];

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
  price: Prisma.Decimal | string | number;
  compareAtPrice?: Prisma.Decimal | string | number;
  costPrice?: Prisma.Decimal | string | number;
  taxRate: Prisma.Decimal | string | number;
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
      price: new Prisma.Decimal(data.price),
      compareAtPrice: data.compareAtPrice ? new Prisma.Decimal(data.compareAtPrice) : undefined,
      costPrice: data.costPrice ? new Prisma.Decimal(data.costPrice) : undefined,
      taxRate: new Prisma.Decimal(data.taxRate),
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
  price: Prisma.Decimal | string | number;
  compareAtPrice?: Prisma.Decimal | string | number;
  costPrice?: Prisma.Decimal | string | number;
  taxRate: Prisma.Decimal | string | number;
  weightGrams?: number;
  status: ProductStatus;
  isFeatured: boolean;
  categoryId: string;
}>) {
  return prisma.product.update({
    where: { id },
    data: {
      ...data,
      price: data.price !== undefined ? new Prisma.Decimal(data.price) : undefined,
      compareAtPrice: data.compareAtPrice !== undefined ? new Prisma.Decimal(data.compareAtPrice) : undefined,
      costPrice: data.costPrice !== undefined ? new Prisma.Decimal(data.costPrice) : undefined,
      taxRate: data.taxRate !== undefined ? new Prisma.Decimal(data.taxRate) : undefined,
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
