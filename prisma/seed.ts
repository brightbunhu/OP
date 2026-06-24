import { Prisma } from '@prisma/client';
import { hashSync } from 'bcryptjs';
import { prisma } from '../lib/prisma';

const demoPasswordHash = hashSync('DemoPassword123!', 12);

const permissions = {
  admin: [
    'users:read',
    'users:write',
    'roles:read',
    'roles:write',
    'products:read',
    'products:write',
    'inventory:read',
    'inventory:write',
    'orders:read',
    'orders:write',
    'promotions:read',
    'promotions:write',
    'audit:read',
  ],
  manager: [
    'products:read',
    'products:write',
    'inventory:read',
    'inventory:write',
    'orders:read',
    'orders:write',
    'promotions:read',
    'promotions:write',
  ],
  sales: ['products:read', 'customers:read', 'orders:read', 'orders:write', 'notifications:write'],
  customer: ['products:read', 'cart:write', 'orders:read', 'orders:write', 'reviews:write'],
} as const;

async function seedRoles() {
  const [adminRole, managerRole, salesRole, customerRole] = await Promise.all([
    prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {
        description: 'Full platform administrator',
        permissions: permissions.admin as unknown as Prisma.InputJsonValue,
      },
      create: {
        name: 'ADMIN',
        description: 'Full platform administrator',
        permissions: permissions.admin as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.role.upsert({
      where: { name: 'MANAGER' },
      update: {
        description: 'Store operations manager',
        permissions: permissions.manager as unknown as Prisma.InputJsonValue,
      },
      create: {
        name: 'MANAGER',
        description: 'Store operations manager',
        permissions: permissions.manager as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.role.upsert({
      where: { name: 'SALES' },
      update: {
        description: 'Sales and order support specialist',
        permissions: permissions.sales as unknown as Prisma.InputJsonValue,
      },
      create: {
        name: 'SALES',
        description: 'Sales and order support specialist',
        permissions: permissions.sales as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.role.upsert({
      where: { name: 'CUSTOMER' },
      update: {
        description: 'Verified shopping customer',
        permissions: permissions.customer as unknown as Prisma.InputJsonValue,
      },
      create: {
        name: 'CUSTOMER',
        description: 'Verified shopping customer',
        permissions: permissions.customer as unknown as Prisma.InputJsonValue,
      },
    }),
  ]);

  return { adminRole, managerRole, salesRole, customerRole };
}

async function seedUsers(roleIds: {
  adminRole: { id: string };
  managerRole: { id: string };
  salesRole: { id: string };
  customerRole: { id: string };
}) {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@opsupermarket.com' },
    update: {
      name: 'OP Supermarket Admin',
      passwordHash: demoPasswordHash,
      emailVerified: new Date(),
      roles: { set: [{ id: roleIds.adminRole.id }] },
    },
    create: {
      email: 'admin@opsupermarket.com',
      name: 'OP Supermarket Admin',
      passwordHash: demoPasswordHash,
      emailVerified: new Date(),
      roles: { connect: [{ id: roleIds.adminRole.id }] },
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@opsupermarket.com' },
    update: {
      name: 'Demo Customer',
      passwordHash: demoPasswordHash,
      emailVerified: new Date(),
      roles: { set: [{ id: roleIds.customerRole.id }] },
    },
    create: {
      email: 'customer@opsupermarket.com',
      name: 'Demo Customer',
      passwordHash: demoPasswordHash,
      emailVerified: new Date(),
      roles: { connect: [{ id: roleIds.customerRole.id }] },
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@opsupermarket.com' },
    update: {
      name: 'Demo Manager',
      passwordHash: demoPasswordHash,
      emailVerified: new Date(),
      roles: { set: [{ id: roleIds.managerRole.id }] },
    },
    create: {
      email: 'manager@opsupermarket.com',
      name: 'Demo Manager',
      passwordHash: demoPasswordHash,
      emailVerified: new Date(),
      roles: { connect: [{ id: roleIds.managerRole.id }] },
    },
  });

  const sales = await prisma.user.upsert({
    where: { email: 'sales@opsupermarket.com' },
    update: {
      name: 'Demo Sales',
      passwordHash: demoPasswordHash,
      emailVerified: new Date(),
      roles: { set: [{ id: roleIds.salesRole.id }] },
    },
    create: {
      email: 'sales@opsupermarket.com',
      name: 'Demo Sales',
      passwordHash: demoPasswordHash,
      emailVerified: new Date(),
      roles: { connect: [{ id: roleIds.salesRole.id }] },
    },
  });

  return { admin, manager, sales, customer };
}

async function seedCatalog() {
  const grocery = await prisma.category.upsert({
    where: { slug: 'groceries' },
    update: { name: 'Groceries', description: 'Daily pantry staples and household essentials.' },
    create: { name: 'Groceries', slug: 'groceries', description: 'Daily pantry staples and household essentials.' },
  });

  const freshProduce = await prisma.category.upsert({
    where: { slug: 'fresh-produce' },
    update: {
      name: 'Fresh Produce',
      description: 'Seasonal fruit and vegetables sourced for everyday shopping.',
      parentId: grocery.id,
    },
    create: {
      name: 'Fresh Produce',
      slug: 'fresh-produce',
      description: 'Seasonal fruit and vegetables sourced for everyday shopping.',
      parentId: grocery.id,
    },
  });

  const supplier = await prisma.supplier.upsert({
    where: { name_email: { name: 'OP Fresh Farms', email: 'supply@opfreshfarms.com' } },
    update: {
      contactName: 'Procurement Desk',
      phone: '+263242000000',
      city: 'Harare',
      country: 'Zimbabwe',
    },
    create: {
      name: 'OP Fresh Farms',
      contactName: 'Procurement Desk',
      email: 'supply@opfreshfarms.com',
      phone: '+263242000000',
      city: 'Harare',
      country: 'Zimbabwe',
    },
  });

  const product = await prisma.product.upsert({
    where: { sku: 'OP-APPLE-001' },
    update: {
      name: 'Royal Gala Apples 1kg',
      slug: 'royal-gala-apples-1kg',
      categoryId: freshProduce.id,
      supplierId: supplier.id,
      price: new Prisma.Decimal('3.99'),
      compareAtPrice: new Prisma.Decimal('4.49'),
      costPrice: new Prisma.Decimal('2.30'),
      taxRate: new Prisma.Decimal('0.00'),
      status: 'ACTIVE',
      isFeatured: true,
    },
    create: {
      name: 'Royal Gala Apples 1kg',
      slug: 'royal-gala-apples-1kg',
      sku: 'OP-APPLE-001',
      barcode: '6001000000001',
      description: 'Crisp Royal Gala apples packed for convenient family shopping.',
      imageUrl: '/images/products/royal-gala-apples-1kg.jpg',
      categoryId: freshProduce.id,
      supplierId: supplier.id,
      price: new Prisma.Decimal('3.99'),
      compareAtPrice: new Prisma.Decimal('4.49'),
      costPrice: new Prisma.Decimal('2.30'),
      taxRate: new Prisma.Decimal('0.00'),
      weightGrams: 1000,
      status: 'ACTIVE',
      isFeatured: true,
    },
  });

  const inventory = await prisma.inventory.upsert({
    where: { productId: product.id },
    update: {
      quantityOnHand: 250,
      quantityReserved: 0,
      reorderLevel: 30,
      reorderQuantity: 150,
      warehouseLocation: 'HARARE-A1',
      status: 'IN_STOCK',
    },
    create: {
      productId: product.id,
      quantityOnHand: 250,
      quantityReserved: 0,
      reorderLevel: 30,
      reorderQuantity: 150,
      warehouseLocation: 'HARARE-A1',
      status: 'IN_STOCK',
    },
  });

  const initialStockReference = 'SEED-INITIAL-OP-APPLE-001';
  const existingInitialStockMovement = await prisma.stockMovement.findFirst({
    where: { reference: initialStockReference },
  });

  if (!existingInitialStockMovement) {
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        inventoryId: inventory.id,
        supplierId: supplier.id,
        type: 'PURCHASE',
        quantity: 250,
        unitCost: new Prisma.Decimal('2.30'),
        reference: initialStockReference,
        reason: 'Initial seed stock',
      },
    });
  }

  await prisma.promotion.upsert({
    where: { code: 'WELCOME10' },
    update: {
      name: 'Welcome 10%',
      description: 'Introductory discount for first online supermarket orders.',
      type: 'PERCENTAGE',
      value: new Prisma.Decimal('10.00'),
      startsAt: new Date('2026-01-01T00:00:00.000Z'),
      endsAt: new Date('2027-01-01T00:00:00.000Z'),
      usageLimit: 10000,
      minimumSpend: new Prisma.Decimal('25.00'),
      isActive: true,
      products: { set: [{ id: product.id }] },
      categories: { set: [{ id: freshProduce.id }] },
    },
    create: {
      name: 'Welcome 10%',
      code: 'WELCOME10',
      description: 'Introductory discount for first online supermarket orders.',
      type: 'PERCENTAGE',
      value: new Prisma.Decimal('10.00'),
      startsAt: new Date('2026-01-01T00:00:00.000Z'),
      endsAt: new Date('2027-01-01T00:00:00.000Z'),
      usageLimit: 10000,
      minimumSpend: new Prisma.Decimal('25.00'),
      isActive: true,
      products: { connect: [{ id: product.id }] },
      categories: { connect: [{ id: freshProduce.id }] },
    },
  });

  return { product };
}

async function seedCustomerCart(userId: string, productId: string) {
  const cart = await prisma.cart.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: { userId, status: 'ACTIVE', currency: 'USD' },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      userId,
      status: 'ACTIVE',
      currency: 'USD',
    },
  });

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: {
      quantity: 2,
      unitPrice: new Prisma.Decimal('3.99'),
    },
    create: {
      cartId: cart.id,
      productId,
      quantity: 2,
      unitPrice: new Prisma.Decimal('3.99'),
    },
  });
}

async function seedNotification(userId: string) {
  const existingWelcomeNotification = await prisma.notification.findFirst({
    where: {
      userId,
      title: 'Welcome to OP Supermarket',
      metadata: { path: ['source'], equals: 'seed' },
    },
  });

  if (!existingWelcomeNotification) {
    await prisma.notification.create({
      data: {
        userId,
        channel: 'IN_APP',
        status: 'PENDING',
        title: 'Welcome to OP Supermarket',
        body: 'Your OP Supermarket account is ready for fast, fresh shopping.',
        metadata: { source: 'seed' },
      },
    });
  }
}

async function seedAuditLog(actorId: string) {
  const existingSeedAuditLog = await prisma.auditLog.findFirst({
    where: {
      actorId,
      entityName: 'SeedData',
      action: 'CREATE',
      newValues: { path: ['demoProductSku'], equals: 'OP-APPLE-001' },
    },
  });

  if (!existingSeedAuditLog) {
    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'CREATE',
        entityName: 'SeedData',
        newValues: {
          roles: Object.keys(permissions),
          demoProductSku: 'OP-APPLE-001',
        },
      },
    });
  }
}

async function main() {
  const roles = await seedRoles();
  const users = await seedUsers(roles);
  const catalog = await seedCatalog();

  await seedCustomerCart(users.customer.id, catalog.product.id);
  await seedNotification(users.customer.id);
  await seedAuditLog(users.admin.id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
