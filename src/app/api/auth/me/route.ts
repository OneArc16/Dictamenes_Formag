import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const store = await cookies();                 // en Next moderno es async
    const token = store.get('auth')?.value;
    if (!token) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });

    const payload = await verifyJwt(token);        // { sub, role, name }
    return NextResponse.json({
      ok: true,
      user: { id: payload.sub, role: payload.role, name: payload.name },
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Token inválido' }, { status: 401 });
  }
}
