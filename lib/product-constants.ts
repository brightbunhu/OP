export const PRODUCT_STATUSES = ['DRAFT', 'ACTIVE', 'ARCHIVED', 'OUT_OF_STOCK'] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];
