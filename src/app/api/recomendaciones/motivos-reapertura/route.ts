import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';

type JwtPayload = {
  sub?: string;
  role?: string;
  [key: string]: unknown;
};

function normalizeRole(role: unknown): string {
  const normalized = String(role ?? '').trim().toUpperCase();

  if (normalized === 'ADMINISTRADOR') return 'ADMIN';
  if (normalized === 'ADMICIONES' || normalized === 'ADMISIONES') return 'ADMISIONISTA';

  return normalized;
}

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;
  if (!token) return null;

  const payload = (await verifyJwt(token)) as JwtPayload | null;
  if (!payload?.sub) return null;

  const role = normalizeRole(payload.role);
  if (role !== 'MEDICO' && role !== 'ADMISIONISTA' && role !== 'ADMIN') {
    return null;
  }

  return { role };
}

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth) {
      return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    }

    const options = await prisma.motivoReaperturaRecomendacion.findMany({
      where: { estado: true },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
      select: {
        id: true,
        nombre: true,
        descripcion: true,
      },
    });

    return NextResponse.json({ ok: true, options });
  } catch (error) {
    console.error('ERROR GET /api/recomendaciones/motivos-reapertura:', error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Error consultando motivos de reapertura',
      },
      { status: 500 },
    );
  }
}
