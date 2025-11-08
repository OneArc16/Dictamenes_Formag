import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PREFIXES = [
  '/login', '/api/auth/login',
  '/favicon', '/_next', '/assets'
];

function isPublic(pathname: string) {
  return PUBLIC_PREFIXES.some(p => pathname.startsWith(p));
}

function roleToPath(role?: string) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'ADMISIONISTA') return '/admisiones';
  if (role === 'MEDICO') return '/medico';
  return '/login';
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get('auth')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string | undefined;

    // Gates por ruta
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL(roleToPath(role), req.url));
    }
    if (pathname.startsWith('/admisiones') && role !== 'ADMISIONISTA') {
      return NextResponse.redirect(new URL(roleToPath(role), req.url));
    }
    if (pathname.startsWith('/medico') && role !== 'MEDICO') {
      return NextResponse.redirect(new URL(roleToPath(role), req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets).*)'],
};
