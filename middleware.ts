import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PREFIXES = [
  '/api/auth/login', // 👈 /login ya no va aquí
  '/favicon',
  '/_next',
  '/assets',
];

function isPublic(pathname: string) {
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

function roleToPath(role?: string) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'ADMISIONISTA') return '/admisiones';
  if (role === 'MEDICO') return '/medico';
  return '/login';
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rutas públicas "reales" (estáticos, api de login, etc.)
  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get('auth')?.value;

  // 🔹 Sin token:
  //    - si NO está en /login → mandarlo a /login
  //    - si ya está en /login → dejarlo ver el formulario
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

    // 🔹 Si YA está autenticado y va a /login, redirigir a su módulo
    if (pathname === '/login') {
      return NextResponse.redirect(new URL(roleToPath(role), req.url));
    }

    // 🔹 Gates por ruta protegida
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
    // Token inválido / expirado → limpiar cookie y mandar a login
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.delete('auth');
    return res;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets).*)'],
};
