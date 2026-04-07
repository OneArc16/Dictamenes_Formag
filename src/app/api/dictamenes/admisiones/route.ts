import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

import { requireAdmisionesApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type EstadoFiltro = 'PENDIENTES' | 'REABIERTOS' | 'CERRADOS' | 'TODOS';

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
    const auth = await requireAdmisionesApi('dictamen.read');
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
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