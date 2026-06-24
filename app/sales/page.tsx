import { requireMinimumRole } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import SalesDashboard from '@/components/sales/sales-dashboard';

export default async function SalesPage() {
  const user = await requireMinimumRole('SALES');

  // 1. Fetch CRM Leads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leadsList = await (prisma as any).lead.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 2. Fetch assigned orders for this salesperson
  const assignedOrders = await prisma.order.findMany({
    where: {
      assignedSalespersonId: user.id,
      deletedAt: null,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 3. Fetch customer users with order counts and grandTotals (to calculate total spent)
  const customerRole = await prisma.role.findUnique({
    where: { name: 'CUSTOMER' },
  });

  const customers = customerRole ? await prisma.user.findMany({
    where: {
      roles: {
        some: {
          id: customerRole.id,
        },
      },
      deletedAt: null,
    },
    include: {
      orders: {
        where: {
          status: {
            notIn: ['CANCELLED', 'REFUNDED'],
          },
        },
        select: {
          grandTotal: true,
        },
      },
      _count: {
        select: {
          orders: {
            where: {
              status: {
                notIn: ['CANCELLED', 'REFUNDED'],
              },
            },
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  }) : [];

  // 4. Fetch monthly sales trends (last 6 months)
  const orders = await prisma.order.findMany({
    where: {
      status: {
        notIn: ['CANCELLED', 'REFUNDED'],
      },
      createdAt: {
        gte: new Date('2026-01-01T00:00:00Z'),
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const monthlySalesMap: Record<string, { month: string; revenue: number; ordersCount: number }> = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let totalSales = 0;
  let totalOrders = 0;

  for (const order of orders) {
    const date = new Date(order.createdAt);
    const monthName = monthNames[date.getMonth()];
    const key = `${date.getFullYear()}-${date.getMonth()}`;

    if (!monthlySalesMap[key]) {
      monthlySalesMap[key] = {
        month: `${monthName} ${date.getFullYear()}`,
        revenue: 0,
        ordersCount: 0,
      };
    }

    const val = Number(order.grandTotal);
    monthlySalesMap[key].revenue += val;
    monthlySalesMap[key].ordersCount += 1;
    
    totalSales += val;
    totalOrders += 1;
  }

  const monthlySales = Object.keys(monthlySalesMap)
    .sort()
    .map(key => {
      const d = monthlySalesMap[key];
      return {
        ...d,
        revenue: Number(d.revenue.toFixed(2)),
      };
    });

  // Calculate statistics
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const activeLeadsCount = leadsList.filter((l: any) => l.status !== 'CONVERTED' && l.status !== 'LOST').length;
  const convertedLeads = leadsList.filter((l: any) => l.status === 'CONVERTED').length;
  const conversionRate = leadsList.length > 0 ? (convertedLeads / leadsList.length) * 100 : 0;

  // Serialize Decimals and Date fields for safe client transfer
  const serializedLeads = leadsList.map((lead: any) => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    status: lead.status,
    value: lead.value ? lead.value.toString() : null,
    source: lead.source,
    notes: lead.notes,
    createdAt: lead.createdAt.toISOString(),
  }));

  const serializedAssignedOrders = assignedOrders.map(order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    subtotal: order.subtotal.toString(),
    grandTotal: order.grandTotal.toString(),
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt.toISOString(),
    user: {
      name: order.user.name,
      email: order.user.email,
    },
  }));

  const serializedCustomers = customers.map(cust => ({
    id: cust.id,
    name: cust.name,
    email: cust.email,
    createdAt: cust.createdAt.toISOString(),
    _count: {
      orders: cust._count.orders,
    },
    orders: cust.orders.map(o => ({
      grandTotal: o.grandTotal.toString(),
    })),
  }));

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header layout design matching provided aesthetics */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm mb-8 animate-fadeIn">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Sales Team Workspace</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Sales Operations & Customer Pipelines</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Welcome back, {user.name || user.email}. Manage B2B wholesale client pipelines, coordinate assigned orders, and track store revenues.
        </p>
      </div>

      <SalesDashboard
        initialData={{
          leads: serializedLeads,
          assignedOrders: serializedAssignedOrders,
          customers: serializedCustomers,
          monthlySales,
          stats: {
            totalSales: Number(totalSales.toFixed(2)),
            totalOrders,
            avgOrderValue: Number(avgOrderValue.toFixed(2)),
            activeLeadsCount,
            conversionRate,
          },
          currentUserId: user.id,
        }}
      />
    </main>
  );
}
