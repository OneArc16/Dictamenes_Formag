import { NextResponse } from 'next/server';
import { ProcedimientoPcl, Prisma, TipoDictamen } from '@prisma/client';
import { z } from 'zod';

import { requireMedicoApi } from '@/lib/auth/api-guards';
import { hasAnyAbility } from '@/lib/auth/ability-utils';
import { resolveSedeIdParaNuevoDictamen } from '@/lib/dictamen/notificacion-pcl';
import { prisma } from '@/lib/prisma';
import { getVisibleCaseState } from '@/features/formulario-origen/domain/policies';
import { getReopeningTargets } from '@/features/formulario-origen/domain/reopening';
import { buildNumeroDictamen } from '@/features/formulario-origen/domain/numero-dictamen';

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

    const canBrowseAllCases = hasAnyAbility(auth.auth, [
      'module.admin.access',
      'module.admisiones.access',
    ]);
    if (medicoIds.length > 0 && canBrowseAllCases) {
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
        orEstados.push(
          { flujoVersion: 'LEGACY', estado: true, reabierto: false },
          {
            flujoVersion: 'ORIGEN_PREVIO',
            formularioOrigen: { is: { estado: 'BORRADOR' } },
          },
          {
            flujoVersion: 'ORIGEN_PREVIO',
            estado: true,
            reabierto: false,
            formularioOrigen: { is: { estado: 'FINALIZADO' } },
          },
        );
      }
      if (estadosFiltro.includes('REABIERTOS')) {
        orEstados.push(
          { flujoVersion: 'LEGACY', estado: true, reabierto: true },
          {
            flujoVersion: 'ORIGEN_PREVIO',
            formularioOrigen: { is: { estado: 'REABIERTO' } },
          },
          {
            flujoVersion: 'ORIGEN_PREVIO',
            estado: true,
            reabierto: true,
            formularioOrigen: { is: { estado: 'FINALIZADO' } },
          },
        );
      }
      if (estadosFiltro.includes('CERRADOS')) {
        orEstados.push(
          { flujoVersion: 'LEGACY', estado: false },
          {
            flujoVersion: 'ORIGEN_PREVIO',
            estado: false,
            formularioOrigen: { is: { estado: 'FINALIZADO' } },
          },
        );
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
        formularioOrigen: {
          select: {
            estado: true,
            fechaDictamenOrigen: true,
          },
        },
      },
      orderBy: [{ fechaDictamen: 'desc' }, { id: 'desc' }],
      take: 100,
    });

    const rows = dictamenes.map((dictamen) => {
      const visible = getVisibleCaseState({
        flujoVersion: dictamen.flujoVersion,
        formularioOrigenEstado: dictamen.formularioOrigen?.estado,
        pclIniciado: Boolean(dictamen.pclIniciadoEn),
        pclCerrado: !dictamen.estado,
        pclReabierto: dictamen.reabierto,
      });
      const originStage = visible.etapa === 'FORMULARIO_ORIGEN';
      const reopeningTargets = getReopeningTargets({
        flujoVersion: dictamen.flujoVersion,
        originState: dictamen.formularioOrigen?.estado ?? null,
        pclClosed: !dictamen.estado,
        canReopenOrigin: auth.auth.permissions.includes('formulario_origen.reopen'),
        canReopenPcl: auth.auth.permissions.includes('dictamen.reopen'),
      });

      return {
      id: dictamen.id,
      tipoDictamen: dictamen.tipoDictamen,
      fechaDictamen:
        originStage && dictamen.formularioOrigen?.fechaDictamenOrigen
          ? dictamen.formularioOrigen.fechaDictamenOrigen.toISOString()
          : dictamen.fechaDictamen?.toISOString() ?? null,
      docenteDocumento: dictamen.usuario.identificacion,
      docenteNombre: buildNombreCompleto(dictamen.usuario),
      secretaria: dictamen.usuario.secretariaRef?.nombre ?? null,
      etapa: visible.etapa,
      estado: visible.estado,
      actionRoute: originStage
        ? `/medico/dictamen/${dictamen.id}/origen`
        : `/medico/dictamen/${dictamen.id}`,
      pclBloqueado:
        dictamen.flujoVersion === 'ORIGEN_PREVIO' &&
        dictamen.formularioOrigen?.estado !== 'FINALIZADO',
      canReopen: reopeningTargets.length > 0,
      medicoNombre: buildNombreCompleto(dictamen.empleado),
      fueReabierto: Boolean(dictamen.reabiertoEn || dictamen.motivoReapertura || dictamen.reabiertoPor),
      reabiertaEn: dictamen.reabiertoEn ? dictamen.reabiertoEn.toISOString() : null,
      reabiertaPorNombre: buildNombreCompleto(dictamen.reabiertoPor),
      motivoReapertura: dictamen.motivoReapertura?.nombre ?? null,
      };
    });

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
    const sedeId = await resolveSedeIdParaNuevoDictamen({
      empleadoId: medicoId,
      usuarioId: data.usuarioId,
    });

    const docente = await prisma.usuario.findUnique({
      where: { id: data.usuarioId },
      select: { identificacion: true },
    });
    if (!docente) {
      return NextResponse.json({ ok: false, error: 'Docente no encontrado.' }, { status: 404 });
    }
    const active = await prisma.dictamen.findFirst({
      where: { usuarioId: data.usuarioId, estado: true },
      select: { id: true },
    });
    if (active) {
      return NextResponse.json(
        { ok: false, error: `El docente ya tiene un expediente activo (#${active.id}).` },
        { status: 409 },
      );
    }
    const numeroOrigen = buildNumeroDictamen(data.fechaDictamen, docente.identificacion);

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
        sedeId,
        flujoVersion: 'ORIGEN_PREVIO',
        formularioOrigen: {
          create: {
            fechaDictamenOrigen: fecha,
            numeroDictamenOrigen: numeroOrigen,
            historial: {
              create: {
                actorId: medicoId,
                tipo: 'CREACION',
                estadoNuevo: 'BORRADOR',
                cambios: { fuente: 'endpoint_compatibilidad' },
              },
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({
      ok: true,
      dictamen,
      route: `/medico/dictamen/${dictamen.id}/origen`,
    });
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
