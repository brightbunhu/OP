import { NextResponse } from 'next/server';
import { getVapidKeys } from '../webpush';

export async function GET() {
  const keys = getVapidKeys();
  return NextResponse.json({ publicKey: keys.publicKey });
}
