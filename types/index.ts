// Central type definitions for Prisma query results and API responses

// Decimal type helper for Prisma Decimal fields
type Decimal = { toNumber: () => number } | number;

// Order types
export type OrderWithDetails = {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  paymentStatus: string;
  grandTotal: Decimal;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
    createdAt: Date;
    status: string;
  } | null;
  items: Array<{
    productId: string;
    quantity: number;
    lineTotal: Decimal;
    product: {
      costPrice: Decimal | null;
      price: Decimal;
      category: { name: string } | null;
    } | null;
  }>;
};

export type AssignedOrder = {
  id: string;
  orderNumber: string;
  subtotal: Decimal;
  grandTotal: Decimal;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  } | null;
};

export type OrderItem = {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  lineTotal: Decimal;
  unitPrice: Decimal;
  product: {
    imageUrl: string | null;
  } | null;
};

// Product types
export type ProductWithInventory = {
  id: string;
  name: string;
  sku: string;
  price: Decimal;
  costPrice: Decimal | null;
  status: string;
  inventory: {
    quantityOnHand: number;
    reorderLevel: number;
    status: string;
    warehouseLocation?: string | null;
  } | null;
  category: {
    name: string;
  } | null;
};

// User/Customer types
export type CustomerUser = {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  status: string;
};

export type CustomerWithOrders = {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  _count: {
    orders: number;
  };
  orders: Array<{
    grandTotal: Decimal;
  }>;
};

// Sales/Lead types
export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  value: Decimal | null;
  source: string | null;
  notes: string | null;
  createdAt: Date;
};

// Admin types
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  status: string;
  roles: Array<{ id: string; name: string }>;
  createdAt: string;
  _count: { orders: number };
};

export type AdminRole = {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  _count: { users: number };
  createdAt: string;
};

export type AdminAuditLog = {
  id: string;
  action: string;
  entityName: string;
  entityId: string | null;
  actor: { name: string; email: string } | null;
  createdAt: string;
  ipAddress: string | null;
};

export type AdminStats = {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalRoles: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalAuditLogs: number;
};
