import { prisma } from '@/lib/prisma';
import { hasMinimumRole } from '@/lib/auth/roles';
import { getCart, addOrUpdateCartItem } from '@/lib/cart-service';
import { getOrdersByUser, getOrderByNumber } from '@/lib/order-service';

// Define schemas for OpenRouter function calling
export const AI_TOOL_SCHEMAS = [
  {
    type: 'function',
    function: {
      name: 'check_product_price_and_stock',
      description: 'Search the database product catalog for prices, description, SKU, and active stock levels.',
      parameters: {
        type: 'object',
        properties: {
          searchQuery: {
            type: 'string',
            description: 'The keyword to search for (e.g., Bananas, Milk, Bread).'
          }
        },
        required: ['searchQuery']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_to_cart',
      description: 'Add a product to the user\'s active shopping cart by product ID and quantity.',
      parameters: {
        type: 'object',
        properties: {
          productId: {
            type: 'string',
            description: 'The UUID of the product to add.'
          },
          quantity: {
            type: 'integer',
            description: 'Quantity of units to add (default 1).',
            default: 1
          }
        },
        required: ['productId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_cart',
      description: 'View items and totals inside the user\'s active shopping cart.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'track_orders',
      description: 'Track shipment status, payment, and items of user\'s recent orders or a specific order number.',
      parameters: {
        type: 'object',
        properties: {
          orderNumber: {
            type: 'string',
            description: 'Optional specific order number (e.g. OP-XXXXX).'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'analyze_sales',
      description: 'Sales analysis. Aggregates total transactions, sales velocity, average order values, and order status summaries. Minimum role: SALES.',
      parameters: {
        type: 'object',
        properties: {
          periodDays: {
            type: 'integer',
            description: 'Number of days to analyze (default 30).',
            default: 30
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'customer_insights',
      description: 'Analysis of customer demographics, registration dates, purchase counts, and lifetime value spent. Minimum role: SALES.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'revenue_analysis',
      description: 'Revenue analysis. Summarizes gross revenue, cost of goods, net profit margins, and daily averages. Minimum role: MANAGER.',
      parameters: {
        type: 'object',
        properties: {
          periodDays: {
            type: 'integer',
            description: 'Number of days to analyze (default 30).',
            default: 30
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'inventory_forecasting',
      description: 'Forecasting stock depletion levels, days-of-stock left, reorder alerts, and safety points based on historical sales velocity. Minimum role: MANAGER.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'system_reports',
      description: 'System health dashboard reporting audit events count, product catalog sizes, user roles statistics, and database activities. Minimum role: ADMIN.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  }
];

// Helper to check security authorization before executing database calls
function checkRole(userRoles: string[], minimumRole: 'CUSTOMER' | 'SALES' | 'MANAGER' | 'ADMIN') {
  return hasMinimumRole(userRoles, minimumRole);
}

// Tool Implementation Registry
export async function executeAiTool(
  name: string,
  args: Record<string, unknown>,
  userId: string | null,
  userRoles: string[]
): Promise<unknown> {
  // Guard checking for user session when accessing user-specific resources
  const requireUser = () => {
    if (!userId) throw new Error('User authentication required. Please log in first to use this feature.');
  };

  switch (name) {
    case 'check_product_price_and_stock': {
      const q = String(args.searchQuery || '').trim();
      if (!q) return { error: 'Please enter a search query.' };

      const matchedProducts = await prisma.product.findMany({
        where: {
          deletedAt: null,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { sku: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } }
          ]
        },
        include: { inventory: true, category: { select: { name: true } } },
        take: 10
      });

      return matchedProducts.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: Number(p.price),
        category: p.category?.name || 'General',
        stockOnHand: p.inventory?.quantityOnHand ?? 0,
        stockStatus: p.inventory?.status ?? 'IN_STOCK',
        description: p.description || ''
      }));
    }

    case 'add_to_cart': {
      requireUser();
      const pid = String(args.productId || '').trim();
      const qty = Number(args.quantity ?? 1);
      if (!pid) return { error: 'Product ID is required.' };

      try {
        const cart = await addOrUpdateCartItem(userId!, pid, qty);
        const item = cart.items.find(i => i.productId === pid);
        return {
          success: true,
          message: `Successfully added ${qty} units of "${item?.product?.name || 'product'}" to your cart.`,
          cartSummary: {
            itemsCount: cart.items.length,
            subtotal: cart.totals.subtotal,
            tax: cart.totals.tax,
            grandTotal: cart.totals.total
          }
        };
      } catch (e: any) {
        return { error: e.message || 'Could not add item to cart.' };
      }
    }

    case 'get_cart': {
      requireUser();
      try {
        const cart = await getCart(userId!);
        return {
          id: cart.id,
          items: cart.items.map(i => ({
            productId: i.productId,
            name: i.product?.name || 'Unknown',
            quantity: i.quantity,
            unitPrice: Number(i.unitPrice),
            lineTotal: Number(i.unitPrice) * i.quantity
          })),
          totals: {
            subtotal: cart.totals.subtotal,
            tax: cart.totals.tax,
            discount: cart.totals.discount,
            grandTotal: cart.totals.total
          }
        };
      } catch (e: any) {
        return { error: e.message || 'Could not fetch cart details.' };
      }
    }

    case 'track_orders': {
      requireUser();
      const orderNum = String(args.orderNumber || '').trim();
      try {
        if (orderNum) {
          const order = await getOrderByNumber(userId!, orderNum);
          if (!order) return { error: `Order ${orderNum} not found under your account.` };
          return {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.paymentStatus,
            fulfillmentStatus: order.fulfillmentStatus,
            createdAt: order.createdAt.toISOString(),
            grandTotal: Number(order.grandTotal),
            shippingAddress: order.shippingAddress,
            notes: order.notes || '',
            items: order.items.map(item => ({
              productName: item.productName,
              sku: item.sku,
              quantity: item.quantity,
              unitPrice: Number(item.unitPrice),
              lineTotal: Number(item.lineTotal)
            }))
          };
        } else {
          const orders = await getOrdersByUser(userId!);
          return orders.map(order => ({
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt.toISOString(),
            grandTotal: Number(order.grandTotal),
            itemsCount: order.items.length
          }));
        }
      } catch (e: any) {
        return { error: e.message || 'Could not fetch orders.' };
      }
    }

    case 'analyze_sales': {
      if (!checkRole(userRoles, 'SALES')) {
        return { error: 'Access Denied. Minimum role SALES required.' };
      }
      const days = Number(args.periodDays ?? 30);
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - days);

      const activeOrders = await prisma.order.findMany({
        where: {
          deletedAt: null,
          createdAt: { gte: dateLimit }
        },
        include: { items: true }
      });

      const totalRevenue = activeOrders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
      const statuses = activeOrders.reduce((acc: Record<string, number>, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {});

      return {
        period: `${days} days`,
        totalTransactions: activeOrders.length,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        averageOrderValue: activeOrders.length > 0 ? Number((totalRevenue / activeOrders.length).toFixed(2)) : 0,
        statusBreakdown: statuses
      };
    }

    case 'customer_insights': {
      if (!checkRole(userRoles, 'SALES')) {
        return { error: 'Access Denied. Minimum role SALES required.' };
      }

      const users = await prisma.user.findMany({
        where: { deletedAt: null },
        include: {
          orders: {
            where: { deletedAt: null }
          }
        }
      });

      const insights = users.map(u => {
        const orderCount = u.orders.length;
        const totalSpent = u.orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
        return {
          name: u.name,
          email: u.email,
          joinedAt: u.createdAt.toISOString(),
          status: u.status,
          orderCount,
          totalSpent: Number(totalSpent.toFixed(2)),
          averageOrderValue: orderCount > 0 ? Number((totalSpent / orderCount).toFixed(2)) : 0
        };
      }).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 15); // Top 15 shoppers

      return {
        totalCustomers: users.length,
        activeShoppersCount: users.filter(u => u.orders.length > 0).length,
        topCustomers: insights
      };
    }

    case 'revenue_analysis': {
      if (!checkRole(userRoles, 'MANAGER')) {
        return { error: 'Access Denied. Minimum role MANAGER required.' };
      }
      const days = Number(args.periodDays ?? 30);
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - days);

      const orders = await prisma.order.findMany({
        where: {
          deletedAt: null,
          createdAt: { gte: dateLimit }
        },
        include: {
          items: {
            include: {
              product: { select: { costPrice: true, price: true } }
            }
          }
        }
      });

      let grossRevenue = 0;
      let totalCostOfGoods = 0;

      orders.forEach(o => {
        grossRevenue += Number(o.grandTotal);
        o.items.forEach(item => {
          const cost = Number(item.product?.costPrice || item.product?.price || 0);
          totalCostOfGoods += cost * item.quantity;
        });
      });

      const netProfit = grossRevenue - totalCostOfGoods;
      const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

      return {
        period: `${days} days`,
        grossRevenue: Number(grossRevenue.toFixed(2)),
        costOfGoods: Number(totalCostOfGoods.toFixed(2)),
        netProfit: Number(netProfit.toFixed(2)),
        profitMargin: Number(profitMargin.toFixed(1)) + '%'
      };
    }

    case 'inventory_forecasting': {
      if (!checkRole(userRoles, 'MANAGER')) {
        return { error: 'Access Denied. Minimum role MANAGER required.' };
      }

      // Fetch active products with inventory
      const products = await prisma.product.findMany({
        where: { deletedAt: null },
        include: { inventory: true, orderItems: { where: { deletedAt: null } } }
      });

      // Calculate recent 30-day velocity of items
      const date30DaysAgo = new Date();
      date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);

      const forecastList = products.map(p => {
        const stock = p.inventory?.quantityOnHand ?? 0;
        const reorderLevel = p.inventory?.reorderLevel ?? 10;
        
        // Count sold items in last 30 days
        const recentOrderItems = p.orderItems.filter(oi => oi.createdAt >= date30DaysAgo);
        const unitsSold30Days = recentOrderItems.reduce((sum, item) => sum + item.quantity, 0);
        const dailyVelocity = unitsSold30Days / 30;

        let daysOfStockLeft = 999;
        let warning = 'Stable';

        if (dailyVelocity > 0) {
          daysOfStockLeft = Number((stock / dailyVelocity).toFixed(1));
          if (daysOfStockLeft <= 7) {
            warning = 'Critical Out of Stock Risk';
          } else if (daysOfStockLeft <= 14) {
            warning = 'Reorder Soon';
          }
        } else if (stock <= reorderLevel) {
          warning = 'Low Stock Alert';
        }

        return {
          productId: p.id,
          name: p.name,
          sku: p.sku,
          stock,
          reorderLevel,
          unitsSoldLast30Days: unitsSold30Days,
          dailyVelocity: Number(dailyVelocity.toFixed(2)),
          daysOfStockLeft,
          status: warning
        };
      });

      // Return items requiring attention (low stock or high depletion velocity)
      const alerts = forecastList.filter(f => f.status !== 'Stable' || f.stock <= f.reorderLevel);

      return {
        criticalAlertsCount: alerts.length,
        forecast: forecastList.sort((a, b) => a.daysOfStockLeft - b.daysOfStockLeft).slice(0, 20)
      };
    }

    case 'system_reports': {
      if (!checkRole(userRoles, 'ADMIN')) {
        return { error: 'Access Denied. Minimum role ADMIN required.' };
      }

      const [usersCount, productsCount, ordersCount, rolesCount, rawAuditLogs] = await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.product.count({ where: { deletedAt: null } }),
        prisma.order.count({ where: { deletedAt: null } }),
        prisma.role.count({ where: { deletedAt: null } }),
        prisma.auditLog.count()
      ]);

      const usersWithStatus = await prisma.user.groupBy({
        by: ['status'],
        _count: true
      });

      return {
        systemMetrics: {
          totalUsers: usersCount,
          totalProducts: productsCount,
          totalOrders: ordersCount,
          totalRoles: rolesCount,
          auditLogsTracked: rawAuditLogs
        },
        userStatusBreakdown: usersWithStatus.map(item => ({
          status: item.status,
          count: item._count
        }))
      };
    }

    default:
      return { error: `Tool ${name} is not recognized.` };
  }
}
