import { NextResponse } from 'next/server';
import { getAuthorizationContext } from '@/lib/auth/authorization';

export async function GET() {
  try {
    const auth = await getAuthorizationContext();

    if (!auth) {
      return NextResponse.json({ ok: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: String(auth.empleadoId),
        name: auth.name,
        role: auth.role,
        perfilId: auth.perfilId,
        perfilNombre: auth.perfilNombre,
        permissions: auth.permissions,
      },
    });
  } catch (error) {
    const err = error as { message?: string };
    return NextResponse.json(
      { ok: false, user: null, error: err?.message ?? 'Error' },
      { status: 500 },
    );
  }
}
