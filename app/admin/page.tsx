import { requireMinimumRole } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import AdminDashboard from '@/components/admin/admin-dashboard';
import type { AdminUser, AdminRole, AdminAuditLog, AdminStats } from '@/components/admin/admin-dashboard';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';

export default async function AdminPage() {
  const user = await requireMinimumRole('ADMIN');

  // Fetch all users with roles and order count
  const rawUsers = await prisma.user.findMany({
    include: {
      roles: { select: { id: true, name: true } },
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const users: AdminUser[] = rawUsers.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    status: u.status,
    roles: u.roles,
    createdAt: u.createdAt.toISOString(),
    _count: { orders: u._count.orders },
  }));

  // Fetch all roles with user count
  const rawRoles = await prisma.role.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { users: true } } },
    orderBy: { name: 'asc' },
  });

  const roles: AdminRole[] = rawRoles.map((r: any) => ({
    id: r.id,
    name: r.name,
    description: r.description ?? null,
    permissions: Array.isArray(r.permissions) ? (r.permissions as string[]) : [],
    _count: { users: r._count.users },
    createdAt: r.createdAt.toISOString(),
  }));

  // Fetch recent audit logs
  const rawLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { actor: { select: { name: true, email: true } } },
  });

  const auditLogs: AdminAuditLog[] = rawLogs.map((l: any) => ({
    id: l.id,
    action: l.action,
    entityName: l.entityName,
    entityId: l.entityId ?? null,
    actor: l.actor ? { name: l.actor.name, email: l.actor.email } : null,
    createdAt: l.createdAt.toISOString(),
    ipAddress: l.ipAddress ?? null,
  }));

  // Aggregate stats
  const [totalOrders, totalRevenue, totalProducts] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { grandTotal: true } }).then((r: any) => Number(r._sum.grandTotal ?? 0)),
    prisma.product.count({ where: { deletedAt: null } }),
  ]);

  const activeUsers = rawUsers.filter(u => u.status === 'ACTIVE').length;
  const suspendedUsers = rawUsers.filter(u => u.status === 'SUSPENDED').length;

  const stats: AdminStats = {
    totalUsers: rawUsers.length,
    activeUsers,
    suspendedUsers,
    totalRoles: rawRoles.length,
    totalOrders,
    totalRevenue,
    totalProducts,
    totalAuditLogs: rawLogs.length,
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Platform Administration</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Admin Control Centre</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Welcome back, {user.name || user.email}. Full platform access — manage users, roles, audit logs, and system settings.
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/admin/reports"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition">
            <BarChart3 className="h-4 w-4" /> View Reports
          </Link>
        </div>
      </div>

      <AdminDashboard
        initialUsers={users}
        initialRoles={roles}
        initialAuditLogs={auditLogs}
        stats={stats}
        currentUser={{ id: user.id, name: user.name ?? '', email: user.email ?? '' }}
      />
    </main>
  );
}
