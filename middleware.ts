import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

import {
  canAccessModulePath,
  getDefaultPathForRole,
} from '@/lib/module-navigation';

const PUBLIC_PREFIXES = ['/api/auth/login', '/favicon', '/_next', '/assets'];

function isPublic(pathname: string) {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get('auth')?.value;

  if (!token) {
    if (pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string | undefined;
    const defaultPath = getDefaultPathForRole(role ?? null);

    if (pathname === '/login' || pathname === '/' || pathname === '/inicio') {
      return NextResponse.redirect(new URL(defaultPath, req.url));
    }

    if (!canAccessModulePath(role ?? null, pathname)) {
      return NextResponse.redirect(new URL(defaultPath, req.url));
    }

    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.delete('auth');
    return res;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets).*)'],
};