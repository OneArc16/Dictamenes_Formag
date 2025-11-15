import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth')?.value;

    if (!token) {
      return NextResponse.json({ ok: false, user: null }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ ok: false, user: null }, { status: 401 });
    }

    const { sub, name, role } = payload as any;

    return NextResponse.json({
      ok: true,
      user: { id: sub, name, role },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, user: null, error: err?.message ?? 'Error' },
      { status: 500 }
    );
  }
}
