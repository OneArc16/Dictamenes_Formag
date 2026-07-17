import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

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
    await jwtVerify(token, secret);

    if (pathname === '/login' || pathname === '/') {
      return NextResponse.redirect(new URL('/inicio', req.url));
    }

    // La autorización por módulo se resuelve en los layouts/guards contra la
    // base de datos. El middleware solo descarta sesiones ausentes o inválidas.
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
