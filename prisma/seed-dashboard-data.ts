import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('Starting dashboard data seeding...');

  // 1. Get or create roles
  let customerRole = await prisma.role.findUnique({ where: { name: 'CUSTOMER' } });
  if (!customerRole) {
    customerRole = await prisma.role.create({
      data: {
        name: 'CUSTOMER',
        description: 'Verified shopping customer',
        permissions: ['products:read', 'cart:write', 'orders:read', 'orders:write', 'reviews:write'],
      },
    });
  }

  let salesRole = await prisma.role.findUnique({ where: { name: 'SALES' } });
  if (!salesRole) {
    salesRole = await prisma.role.create({
      data: {
        name: 'SALES',
        description: 'Sales and order support specialist',
        permissions: ['products:read', 'customers:read', 'orders:read', 'orders:write', 'notifications:write'],
      },
    });
  }

  // Get sales rep user
  let salesRep = await prisma.user.findFirst({
    where: { roles: { some: { name: 'SALES' } } },
  });

  if (!salesRep) {
    // If not found, look up sales@opsupermarket.com
    salesRep = await prisma.user.findUnique({ where: { email: 'sales@opsupermarket.com' } });
  }

  // 2. Categories
  const grocery = await prisma.category.upsert({
    where: { slug: 'groceries' },
    update: {},
    create: { name: 'Groceries', slug: 'groceries', description: 'Daily pantry staples and household essentials.' },
  });

  const freshProduce = await prisma.category.upsert({
    where: { slug: 'fresh-produce' },
    update: { parentId: grocery.id },
    create: { name: 'Fresh Produce', slug: 'fresh-produce', description: 'Seasonal fruit and vegetables.', parentId: grocery.id },
  });

  const dairy = await prisma.category.upsert({
    where: { slug: 'dairy' },
    update: { parentId: grocery.id },
    create: { name: 'Dairy & Eggs', slug: 'dairy', description: 'Fresh milk, cheese, butter, and eggs.', parentId: grocery.id },
  });

  const bakery = await prisma.category.upsert({
    where: { slug: 'bakery' },
    update: { parentId: grocery.id },
    create: { name: 'Bakery', slug: 'bakery', description: 'Freshly baked bread, rolls, and pastries.', parentId: grocery.id },
  });

  const beverages = await prisma.category.upsert({
    where: { slug: 'beverages' },
    update: { parentId: grocery.id },
    create: { name: 'Beverages', slug: 'beverages', description: 'Soft drinks, juices, tea, and coffee.', parentId: grocery.id },
  });

  // 3. Supplier
  const supplier = await prisma.supplier.upsert({
    where: { name_email: { name: 'OP Fresh Farms', email: 'supply@opfreshfarms.com' } },
    update: {},
    create: {
      name: 'OP Fresh Farms',
      contactName: 'Procurement Desk',
      email: 'supply@opfreshfarms.com',
      phone: '+263242000000',
      city: 'Harare',
      country: 'Zimbabwe',
    },
  });

  // 4. Products
  const productsToSeed = [
    {
      sku: 'OP-APPLE-001',
      name: 'Royal Gala Apples 1kg',
      slug: 'royal-gala-apples-1kg',
      price: new Prisma.Decimal('3.99'),
      compareAtPrice: new Prisma.Decimal('4.49'),
      costPrice: new Prisma.Decimal('2.30'),
      categoryId: freshProduce.id,
      description: 'Crisp Royal Gala apples packed for convenient shopping.',
      stock: 250,
      reorderLevel: 30,
      warehouseLocation: 'HARARE-A1',
    },
    {
      sku: 'OP-MILK-001',
      name: 'Fresh Full Cream Milk 2L',
      slug: 'fresh-full-cream-milk-2l',
      price: new Prisma.Decimal('2.99'),
      compareAtPrice: new Prisma.Decimal('3.29'),
      costPrice: new Prisma.Decimal('1.80'),
      categoryId: dairy.id,
      description: 'Pasteurized homogenized high-quality fresh milk.',
      stock: 120,
      reorderLevel: 25,
      warehouseLocation: 'HARARE-D3',
    },
    {
      sku: 'OP-BREAD-001',
      name: 'Sliced White Bread 700g',
      slug: 'sliced-white-bread-700g',
      price: new Prisma.Decimal('1.89'),
      compareAtPrice: new Prisma.Decimal('1.99'),
      costPrice: new Prisma.Decimal('1.10'),
      categoryId: bakery.id,
      description: 'Soft white sliced sandwich bread baked fresh daily.',
      stock: 8, // Low Stock for alerts!
      reorderLevel: 15,
      warehouseLocation: 'HARARE-B1',
    },
    {
      sku: 'OP-COKE-001',
      name: 'Coca-Cola Original 1.5L',
      slug: 'coca-cola-original-1.5l',
      price: new Prisma.Decimal('2.49'),
      compareAtPrice: new Prisma.Decimal('2.79'),
      costPrice: new Prisma.Decimal('1.30'),
      categoryId: beverages.id,
      description: 'Classic sparkling soft drink with natural flavors.',
      stock: 310,
      reorderLevel: 40,
      warehouseLocation: 'HARARE-C5',
    },
    {
      sku: 'OP-CHEESE-001',
      name: 'Cheddar Cheese 500g',
      slug: 'cheddar-cheese-500g',
      price: new Prisma.Decimal('6.99'),
      compareAtPrice: new Prisma.Decimal('7.49'),
      costPrice: new Prisma.Decimal('4.20'),
      categoryId: dairy.id,
      description: 'Medium matured rich cheddar cheese block.',
      stock: 75,
      reorderLevel: 15,
      warehouseLocation: 'HARARE-D12',
    },
    {
      sku: 'OP-BANANA-001',
      name: 'Organic Bananas 1kg',
      slug: 'organic-bananas-1kg',
      price: new Prisma.Decimal('1.99'),
      compareAtPrice: new Prisma.Decimal('2.29'),
      costPrice: new Prisma.Decimal('0.95'),
      categoryId: freshProduce.id,
      description: 'Sweet organic yellow bananas sourced locally.',
      stock: 4, // Low Stock!
      reorderLevel: 20,
      warehouseLocation: 'HARARE-A4',
    },
  ];

  const seededProducts = [];

  for (const p of productsToSeed) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        costPrice: p.costPrice,
        status: 'ACTIVE',
      },
      create: {
        sku: p.sku,
        name: p.name,
        slug: p.slug,
        barcode: 'BARCODE-' + p.sku,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        costPrice: p.costPrice,
        categoryId: p.categoryId,
        supplierId: supplier.id,
        status: 'ACTIVE',
      },
    });

    const invStatus = p.stock <= 0 ? 'OUT_OF_STOCK' : p.stock <= p.reorderLevel ? 'LOW_STOCK' : 'IN_STOCK';

    const inventory = await prisma.inventory.upsert({
      where: { productId: product.id },
      update: {
        quantityOnHand: p.stock,
        reorderLevel: p.reorderLevel,
        status: invStatus,
      },
      create: {
        productId: product.id,
        quantityOnHand: p.stock,
        reorderLevel: p.reorderLevel,
        warehouseLocation: p.warehouseLocation,
        status: invStatus,
      },
    });

    seededProducts.push({ ...product, inventoryId: inventory.id });
  }

  console.log(`Seeded ${seededProducts.length} products with inventories.`);

  // 5. Seed 15+ Customers
  const customerNames = [
    'Tariro Moyo', 'Sandra Phiri', 'Kelvin Zhou', 'Farai Ndlovu', 'Tendai Sibanda',
    'Ruvimbo Mutasa', 'Kudzai Gumbo', 'Chipo Chihuri', 'John Miller', 'Sarah Connor',
    'David Beckham', 'Emma Watson', 'James Bond', 'Bruce Wayne', 'Clark Kent'
  ];

  const seededCustomers = [];
  const startYear = 2026;
  
  for (let i = 0; i < customerNames.length; i++) {
    const name = customerNames[i];
    const email = name.toLowerCase().replace(' ', '.') + '@gmail.com';
    // Registration dates spread over the last 6 months (Jan to Jun 2026)
    const month = Math.floor(i / 3); // 0 to 4 (Jan to May)
    const day = (i * 5) % 28 + 1;
    const createdAt = new Date(startYear, month, day, 10, 0, 0);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        createdAt,
      },
      create: {
        email,
        name,
        passwordHash: '$2a$12$R.S7vG1X6M663Yg1e1u0.e6t1jC3Z69m71k2V2d3E4f5g6H7i8J9k', // dummy hash
        emailVerified: createdAt,
        createdAt,
        roles: { connect: [{ id: customerRole.id }] },
      },
    });
    seededCustomers.push(user);
  }

  console.log(`Seeded ${seededCustomers.length} customer users.`);

  // Clear existing orders to avoid duplicate issues and seed fresh clean metrics
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});

  // 6. Seed 80+ Orders over the last 6 months
  console.log('Seeding 85 historical orders...');
  const orderStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
  const paymentStatuses = ['PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED'];

  let orderCount = 0;
  // Let's generate orders for Jan, Feb, Mar, Apr, May, Jun 2026
  const monthsData = [
    { month: 0, orders: 10 }, // Jan
    { month: 1, orders: 12 }, // Feb
    { month: 2, orders: 15 }, // Mar
    { month: 3, orders: 18 }, // Apr
    { month: 4, orders: 20 }, // May
    { month: 5, orders: 10 }, // Jun (up to now)
  ];

  for (const md of monthsData) {
    for (let o = 0; o < md.orders; o++) {
      const customer = seededCustomers[(o + md.month * 3) % seededCustomers.length];
      const day = (o * 3) % 28 + 1;
      const orderDate = new Date(startYear, md.month, day, 12, Math.floor(Math.random() * 60));

      // Decide status: mostly DELIVERED, some CANCELLED, a few PENDING/PROCESSING in the current month (June)
      let status = 'DELIVERED';
      let paymentStatus = 'PAID';
      
      if (md.month === 5) {
        // Current month has some active orders
        const rand = Math.random();
        if (rand < 0.2) {
          status = 'PENDING';
          paymentStatus = 'PENDING';
        } else if (rand < 0.4) {
          status = 'PROCESSING';
          paymentStatus = 'PAID';
        } else if (rand < 0.5) {
          status = 'CANCELLED';
          paymentStatus = 'FAILED';
        }
      } else {
        // Past months have mostly DELIVERED, some CANCELLED or REFUNDED
        const rand = Math.random();
        if (rand < 0.05) {
          status = 'CANCELLED';
          paymentStatus = 'FAILED';
        } else if (rand < 0.08) {
          status = 'REFUNDED';
          paymentStatus = 'REFUNDED';
        }
      }

      // Pick 1 to 3 random products
      const numProducts = Math.floor(Math.random() * 3) + 1;
      const selectedProds = [];
      const usedIndices = new Set();
      
      while (selectedProds.length < numProducts) {
        const pIdx = Math.floor(Math.random() * seededProducts.length);
        if (!usedIndices.has(pIdx)) {
          selectedProds.push(seededProducts[pIdx]);
          usedIndices.add(pIdx);
        }
      }

      // Calculate totals
      let subtotal = 0;
      const orderItemsData = [];
      
      for (const prod of selectedProds) {
        const quantity = Math.floor(Math.random() * 4) + 1; // 1 to 4 items
        const price = prod.price;
        const lineTotal = price.mul(quantity);
        subtotal += Number(lineTotal);

        orderItemsData.push({
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          quantity,
          unitPrice: price,
          lineTotal,
        });
      }

      const shipping = 3.99;
      const discount = Math.random() < 0.3 ? 5.00 : 0.00; // 30% orders have $5 discount
      const grandTotal = Math.max(1.00, subtotal + shipping - discount);

      // Create Order
      const orderNum = `OP-${startYear}${(md.month + 1).toString().padStart(2, '0')}${day.toString().padStart(2, '0')}-${o.toString().padStart(3, '0')}`;
      
      // Determine salesperson assignment (assign 35% of orders to our Demo Sales user if they exist)
      const assignedSalespersonId = (salesRep && Math.random() < 0.35) ? salesRep.id : null;

      await prisma.order.create({
        data: {
          orderNumber: orderNum,
          userId: customer.id,
          status: status as any,
          paymentStatus: paymentStatus as any,
          fulfillmentStatus: (status === 'DELIVERED' ? 'DELIVERED' : 'PENDING') as any,
          currency: 'USD',
          subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
          discountTotal: new Prisma.Decimal(discount.toFixed(2)),
          taxTotal: new Prisma.Decimal((subtotal * 0.15).toFixed(2)), // 15% VAT
          shippingTotal: new Prisma.Decimal(shipping.toFixed(2)),
          grandTotal: new Prisma.Decimal(grandTotal.toFixed(2)),
          shippingAddress: {
            street: `${day * 12} Samora Machel Ave`,
            city: 'Harare',
            country: 'Zimbabwe',
            postalCode: '0000',
          },
          billingAddress: {
            street: `${day * 12} Samora Machel Ave`,
            city: 'Harare',
            country: 'Zimbabwe',
            postalCode: '0000',
          },
          notes: 'Customer order from storefront',
          assignedSalespersonId,
          createdAt: orderDate,
          updatedAt: orderDate,
          items: {
            create: orderItemsData.map(item => ({
              productId: item.productId,
              productName: item.productName,
              sku: item.sku,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            })),
          },
        },
      });

      // Seed Stock Movement for completed sales
      if (status === 'DELIVERED' || status === 'CONFIRMED' || status === 'PROCESSING') {
        for (const item of orderItemsData) {
          const prod = seededProducts.find(p => p.id === item.productId);
          if (prod) {
            await prisma.stockMovement.create({
              data: {
                productId: prod.id,
                inventoryId: prod.inventoryId,
                type: 'SALE',
                quantity: -item.quantity,
                unitCost: prod.costPrice,
                reference: orderNum,
                reason: `Store sale fulfillment`,
                createdAt: orderDate,
              },
            });
          }
        }
      }

      orderCount++;
    }
  }

  console.log(`Seeded ${orderCount} orders with items and stock movements.`);

  // 7. Seed 25 Leads
  console.log('Seeding CRM leads...');
  await prisma.lead.deleteMany({});
  const leadStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];
  const leadSources = ['WEBSITE', 'REFERRAL', 'COLD_CALL', 'CAMPAIGN'];
  const leadCompanies = ['Harare Bakers', 'Midlands Diner', 'Highlands Grocers', 'Vanguard Club', 'Victoria Hotel', 'Apex Catering', 'Chinhoyi School'];
  
  for (let l = 0; l < 25; l++) {
    const leadName = `${customerNames[l % customerNames.length]} (B2B Lead)`;
    const company = leadCompanies[l % leadCompanies.length];
    const email = `contact@${company.toLowerCase().replace(' ', '')}.co.zw`;
    const source = leadSources[l % leadSources.length];
    
    // Distribute status
    let status = 'NEW';
    if (l % 5 === 1) status = 'CONTACTED';
    if (l % 5 === 2) status = 'QUALIFIED';
    if (l % 5 === 3) status = 'CONVERTED';
    if (l % 5 === 4) status = 'LOST';

    const value = new Prisma.Decimal((Math.floor(Math.random() * 45) * 100 + 500).toFixed(2)); // $500 to $5000
    const notes = `Lead interested in wholesale bulk purchasing of fresh fruit, dairy, and grocery items for ${company}. Requires customized pricing list.`;
    
    const day = (l * 4) % 28 + 1;
    const month = l % 6; // Spread Jan to Jun
    const createdAt = new Date(startYear, month, day, 14, 0, 0);

    await prisma.lead.create({
      data: {
        name: leadName,
        email,
        phone: `+26377${Math.floor(Math.random() * 9000000 + 1000000)}`,
        status,
        value,
        source,
        notes,
        assignedToId: salesRep ? salesRep.id : null,
        createdAt,
        updatedAt: createdAt,
      },
    });
  }

  console.log('Seeded 25 CRM Leads successfully.');
  console.log('Dashboard seeding completed successfully.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
