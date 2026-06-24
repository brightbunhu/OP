import { NextResponse } from 'next/server';

// Declare a global variable to persist subscriptions in memory during development
const globalForSubscriptions = globalThis as unknown as {
  pushSubscriptions: any[];
};

if (!globalForSubscriptions.pushSubscriptions) {
  globalForSubscriptions.pushSubscriptions = [];
}

export async function POST(req: Request) {
  try {
    const subscription = await req.json();
    
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }

    // Check if subscription already exists
    const exists = globalForSubscriptions.pushSubscriptions.some(
      (sub: any) => sub.endpoint === subscription.endpoint
    );

    if (!exists) {
      globalForSubscriptions.pushSubscriptions.push(subscription);
      console.log('Saved push subscription. Total subscriptions:', globalForSubscriptions.pushSubscriptions.length);
    }

    return NextResponse.json({ success: true, count: globalForSubscriptions.pushSubscriptions.length });
  } catch (e: any) {
    console.error('Error in push subscribe API:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  // Return count of subscriptions (for debugging)
  return NextResponse.json({ count: globalForSubscriptions.pushSubscriptions.length });
}
