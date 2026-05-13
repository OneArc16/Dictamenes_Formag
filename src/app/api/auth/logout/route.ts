import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
  const res = NextResponse.json(
    { ok: true },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } },
  );

  // Expirar la cookie "auth" para cerrar sesión
  res.cookies.set('auth', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return res;
}
