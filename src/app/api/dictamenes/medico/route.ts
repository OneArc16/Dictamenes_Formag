import { NextResponse } from 'next/server';
import { ProcedimientoPcl, Prisma, TipoDictamen } from '@prisma/client';
import { z } from 'zod';

import { requireMedicoApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type EstadoFiltro = 'PENDIENTES' | 'REABIERTOS' | 'CERRADOS' | 'TODOS';

type DictamenCreatePayload = z.infer<typeof CreateDictamenSchema>;

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
    const auth = await requireMedicoApi('dictamen.read');
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const medicoId = auth.auth.empleadoId;
    const { searchParams } = new URL(req.url);

    const documento = (searchParams.get('documento') ?? '').trim();
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');

    const estadosFiltro = ((searchParams.get('estado') ?? 'PENDIENTES').trim() || 'PENDIENTES')
      .split(',')
      .map((state) => state.trim().toUpperCase())
      .filter(Boolean) as EstadoFiltro[];

    const medicoIds = (searchParams.get('medicoIds') ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));

    const whereAnd: Prisma.DictamenWhereInput[] = [];

    if (medicoIds.length > 0) {
      whereAnd.push({ empleadoId: { in: medicoIds } });
    } else {
      whereAnd.push({ empleadoId: medicoId });
    }

    if (documento) {
      whereAnd.push({
        usuario: {
          identificacion: { contains: documento, mode: 'insensitive' },
        },
      });
    }

    if (fechaDesde || fechaHasta) {
      const rango: Prisma.DateTimeFilter = {};
      if (fechaDesde) rango.gte = normalizeDateStart(fechaDesde);
      if (fechaHasta) rango.lte = normalizeDateEnd(fechaHasta);
      whereAnd.push({ fechaDictamen: rango });
    }

    if (!estadosFiltro.includes('TODOS')) {
      const orEstados: Prisma.DictamenWhereInput[] = [];

      if (estadosFiltro.includes('PENDIENTES')) {
        orEstados.push({ estado: true, reabierto: false });
      }
      if (estadosFiltro.includes('REABIERTOS')) {
        orEstados.push({ estado: true, reabierto: true });
      }
      if (estadosFiltro.includes('CERRADOS')) {
        orEstados.push({ estado: false });
      }

      if (orEstados.length > 0) {
        whereAnd.push({ OR: orEstados });
      }
    }

    const dictamenes = await prisma.dictamen.findMany({
      where: whereAnd.length > 0 ? { AND: whereAnd } : undefined,
      include: {
        usuario: {
          include: {
            secretariaRef: true,
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
      take: 100,
    });

    const rows = dictamenes.map((dictamen) => ({
      id: dictamen.id,
      tipoDictamen: dictamen.tipoDictamen,
      fechaDictamen: dictamen.fechaDictamen ? dictamen.fechaDictamen.toISOString() : null,
      docenteDocumento: dictamen.usuario.identificacion,
      docenteNombre: buildNombreCompleto(dictamen.usuario),
      secretaria: dictamen.usuario.secretariaRef?.nombre ?? null,
      estado: dictamen.reabierto ? 'REABIERTO' : dictamen.estado ? 'PENDIENTE' : 'CERRADO',
      medicoNombre: buildNombreCompleto(dictamen.empleado),
      fueReabierto: Boolean(dictamen.reabiertoEn || dictamen.motivoReapertura || dictamen.reabiertoPor),
      reabiertaEn: dictamen.reabiertoEn ? dictamen.reabiertoEn.toISOString() : null,
      reabiertaPorNombre: buildNombreCompleto(dictamen.reabiertoPor),
      motivoReapertura: dictamen.motivoReapertura?.nombre ?? null,
    }));

    return NextResponse.json({ ok: true, rows });
  } catch (error: unknown) {
    console.error('ERROR GET /api/dictamenes/medico:', error);
    const message = error instanceof Error ? error.message : 'Error consultando dictamenes';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

const CreateDictamenSchema = z.object({
  usuarioId: z.number().int().positive(),
  fechaDictamen: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha invalida (YYYY-MM-DD)'),
  procedimientoPcl: z.enum(['A', 'B']),
  tipoDictamen: z.enum(['CALIFICACION', 'RECALIFICACION']).optional(),
  antecedentesClinicos: z.string().optional(),
  condicionSalud: z.string().optional(),
  descripcionHallazgos: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const auth = await requireMedicoApi('dictamen.create');
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const medicoId = auth.auth.empleadoId;
    const json = await req.json();
    const data = CreateDictamenSchema.parse(json) as DictamenCreatePayload;

    const fecha = new Date(`${data.fechaDictamen}T00:00:00`);

    const antecedentesClinicos = (data.antecedentesClinicos ?? '').trim() || null;
    const condicionSalud = (data.condicionSalud ?? '').trim() || null;
    const descripcionHallazgos = (data.descripcionHallazgos ?? '').trim() || null;

    const dictamen = await prisma.dictamen.create({
      data: {
        usuarioId: data.usuarioId,
        fechaDictamen: fecha,
        procedimientoPcl: data.procedimientoPcl as ProcedimientoPcl,
        tipoDictamen: data.tipoDictamen ? (data.tipoDictamen as TipoDictamen) : undefined,
        antecedentesClinicos,
        condicionSalud,
        descripcionHallazgos,
        empleadoId: medicoId,
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({ ok: true, dictamen });
  } catch (error: unknown) {
    console.error('ERROR POST /api/dictamenes/medico:', error);

    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message ?? 'Datos invalidos.'
        : error instanceof Error
          ? error.message
          : 'Error creando dictamen';

    return NextResponse.json({ ok: false, error: message }, { status: error instanceof z.ZodError ? 400 : 500 });
  }
}