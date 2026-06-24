import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { CustomerDashboard } from '@/components/account/customer-dashboard';
import { getOrdersByUser } from '@/lib/order-service';
import { prisma } from '@/lib/prisma';

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const params = await searchParams;
  const activeTab = params.tab ?? 'profile';
  const userId = session.user.id;

  // Prefetch data for all tabs
  const [orders, notifications] = await Promise.all([
    getOrdersByUser(userId),
    prisma.notification.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  return (
    <CustomerDashboard
      user={session.user}
      orders={orders}
      notifications={notifications}
      activeTab={activeTab}
    />
  );
}
