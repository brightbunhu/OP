import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { auth } from '@/auth';
import { hasMinimumRole } from '@/lib/auth/roles';
import { getVapidKeys } from '../webpush';
import type { PushSubscriptionData } from '@/types/domain';

// Declare global subscriptions array to access saved endpoints
const globalForSubscriptions = globalThis as unknown as {
  pushSubscriptions?: PushSubscriptionData[];
};

export async function POST(req: Request) {
  try {
    // 1. Authorize — only ADMIN can broadcast notifications
    const session = await auth();
    if (!session?.user || !hasMinimumRole(session.user.roles, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, body, url } = await req.json() as { title: string; body: string; url?: string };
    if (!title || !body) {
      return NextResponse.json({ error: 'Missing title or body' }, { status: 400 });
    }

    const subscriptions = globalForSubscriptions.pushSubscriptions ?? [];
    if (subscriptions.length === 0) {
      return NextResponse.json({ success: true, sentCount: 0, message: 'No subscribers registered' });
    }

    // 2. Setup VAPID details
    const vapidKeys = getVapidKeys();
    webpush.setVapidDetails(
      'mailto:admin@opsupermarket.com',
      vapidKeys.publicKey,
      vapidKeys.privateKey,
    );

    const payload = JSON.stringify({
      title,
      body,
      url: url ?? '/',
    });

    const results = await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub, payload);
          return { status: 'success' as const, endpoint: sub.endpoint };
        } catch (e: unknown) {
          const err = e as { statusCode?: number; message?: string };
          // If subscription has expired or is invalid, remove it from list
          if (err.statusCode === 410 || err.statusCode === 404) {
            if (globalForSubscriptions.pushSubscriptions) {
              globalForSubscriptions.pushSubscriptions = globalForSubscriptions.pushSubscriptions.filter(
                (existingSub) => existingSub.endpoint !== sub.endpoint,
              );
            }
            return { status: 'expired_removed' as const, endpoint: sub.endpoint };
          }
          return { status: 'failed' as const, error: err.message ?? 'Unknown error', endpoint: sub.endpoint };
        }
      }),
    );

    const sentCount = results.filter((r) => r.status === 'success').length;
    const removedCount = results.filter((r) => r.status === 'expired_removed').length;

    console.log(`Push broadcast finished: Sent ${sentCount}, Removed ${removedCount}`);

    return NextResponse.json({
      success: true,
      sentCount,
      removedCount,
      totalRemaining: globalForSubscriptions.pushSubscriptions?.length ?? 0,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('Error broadcasting push notification:', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
