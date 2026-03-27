import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';

type EstadoFiltro = 'PENDIENTES' | 'REABIERTOS' | 'CERRADOS' | 'TODOS';

type JwtPayload = {
  sub: string;
  role?: string;
  name?: string;
  [key: string]: unknown;
};

function normalizeRole(role: unknown) {
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

  return {
    empleadoId: Number(payload.sub),
    role: normalizeRole(payload.role),
    name: payload.name ?? null,
  };
}

function normalizeDateStart(value: string) {
  return new Date(`${value}T00:00:00.000-05:00`);
}

function normalizeDateEnd(value: string) {
  return new Date(`${value}T23:59:59.999-05:00`);
}

function buildNombreCompleto(persona: {
  primerNombre: string | null;
  segundoNombre: string | null;
  primerApellido: string | null;
  segundoApellido: string | null;
} | null) {
  if (!persona) return null;

  return [
    persona.primerNombre,
    persona.segundoNombre,
    persona.primerApellido,
    persona.segundoApellido,
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if (!auth) {
      return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    }

    if (auth.role !== 'ADMISIONISTA' && auth.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);

    const documento = (searchParams.get('documento') ?? '').trim();
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');

    const estadosSeleccionados = (searchParams.get('estado') ?? '')
      .split(',')
      .map((state) => state.trim().toUpperCase())
      .filter(Boolean) as EstadoFiltro[];

    const medicoIdsNumeric = (searchParams.get('medicos') ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));

    const and: Prisma.DictamenWhereInput[] = [];

    if (medicoIdsNumeric.length > 0) {
      and.push({ empleadoId: { in: medicoIdsNumeric } });
    }

    if (documento) {
      and.push({
        usuario: {
          identificacion: { contains: documento, mode: 'insensitive' },
        },
      });
    }

    const usarTodos = estadosSeleccionados.length === 0 || estadosSeleccionados.includes('TODOS');
    if (!usarTodos) {
      const includePendientes = estadosSeleccionados.includes('PENDIENTES');
      const includeReabiertos = estadosSeleccionados.includes('REABIERTOS');
      const includeCerrados = estadosSeleccionados.includes('CERRADOS');

      const orEstados: Prisma.DictamenWhereInput[] = [];

      if (includePendientes) {
        orEstados.push({ estado: true, reabierto: false });
      }

      if (includeReabiertos) {
        orEstados.push({ estado: true, reabierto: true });
      }

      if (includeCerrados) {
        orEstados.push({ estado: false });
      }

      if (orEstados.length === 1) {
        and.push(orEstados[0]);
      } else if (orEstados.length > 1) {
        and.push({ OR: orEstados });
      }
    }

    if (fechaDesde || fechaHasta) {
      const rango: Prisma.DateTimeFilter = {};
      if (fechaDesde) rango.gte = normalizeDateStart(fechaDesde);
      if (fechaHasta) rango.lte = normalizeDateEnd(fechaHasta);
      and.push({ fechaDictamen: rango });
    }

    const dictamenes = await prisma.dictamen.findMany({
      where: and.length > 0 ? { AND: and } : undefined,
      include: {
        usuario: {
          include: {
            secretariaRef: true,
            institucionEducativaRef: {
              include: {
                secretaria: true,
              },
            },
          },
        },
        empleado: {
          select: {
            primerNombre: true,
            segundoNombre: true,
            primerApellido: true,
            segundoApellido: true,
          },
        },
        reabiertoPor: {
          select: {
            primerNombre: true,
            segundoNombre: true,
            primerApellido: true,
            segundoApellido: true,
          },
        },
        motivoReapertura: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: [{ fechaDictamen: 'desc' }, { id: 'desc' }],
      take: 500,
    });

    const rows = dictamenes.map((dictamen) => ({
      id: dictamen.id,
      fechaDictamen: dictamen.fechaDictamen ? dictamen.fechaDictamen.toISOString() : null,
      docenteDocumento: dictamen.usuario.identificacion,
      docenteNombre: buildNombreCompleto(dictamen.usuario),
      secretaria:
        dictamen.usuario.secretariaRef?.nombre ??
        dictamen.usuario.institucionEducativaRef?.secretaria?.nombre ??
        null,
      estado: dictamen.estado ? (dictamen.reabierto ? 'REABIERTO' : 'PENDIENTE') : 'CERRADO',
      medicoNombre: buildNombreCompleto(dictamen.empleado),
      fueReabierto: Boolean(dictamen.reabiertoEn || dictamen.motivoReapertura || dictamen.reabiertoPor),
      reabiertaEn: dictamen.reabiertoEn ? dictamen.reabiertoEn.toISOString() : null,
      reabiertaPorNombre: buildNombreCompleto(dictamen.reabiertoPor),
      motivoReapertura: dictamen.motivoReapertura?.nombre ?? null,
    }));

    return NextResponse.json({ ok: true, rows });
  } catch (error: unknown) {
    console.error('ERROR GET /api/dictamenes/admisiones:', error);
    const message = error instanceof Error ? error.message : 'Error consultando dictamenes';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
