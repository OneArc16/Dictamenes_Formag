import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireAdmin } from '@/lib/auth/guards';
import { ADMIN_MODE_COOKIE, type AdminMode } from '@/lib/rbac';

export async function POST(req: Request) {
  await requireAdmin();

  const body = (await req.json().catch(() => null)) as { mode?: AdminMode } | null;
  const mode = body?.mode;

  const allowed: AdminMode[] = ['ADMIN', 'MEDICO_VIEW', 'ADMISION'];
  if (!mode || !allowed.includes(mode)) {
    return NextResponse.json({ ok: false, error: 'Modo inválido' }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_MODE_COOKIE, mode, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/admin',
  });

  return NextResponse.json({ ok: true, mode });
}
