import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { type AppRole, hasMinimumRole } from '@/lib/auth/roles';

export const runtime = 'nodejs';

const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/unauthorized'];

const protectedRouteMinimumRoles: Array<{ prefix: string; role: AppRole }> = [
  { prefix: '/admin', role: 'ADMIN' },
  { prefix: '/manager', role: 'MANAGER' },
  { prefix: '/sales', role: 'SALES' },
  { prefix: '/account', role: 'CUSTOMER' },
];

function isPublicRoute(pathname: string) {
  return publicRoutes.some((route) => pathname === route);
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });
  const roles = Array.isArray(token?.roles) ? token.roles.filter((role): role is string => typeof role === 'string') : [];

  if (isPublicRoute(pathname) || pathname.startsWith('/api/auth')) {
    if (token && ['/login', '/register'].includes(pathname)) {
      return NextResponse.redirect(new URL('/account', request.url));
    }

    return NextResponse.next();
  }

  const rule = protectedRouteMinimumRoles.find((item) => pathname.startsWith(item.prefix));

  if (!rule) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!hasMinimumRole(roles, rule.role)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons).*)'],
};
