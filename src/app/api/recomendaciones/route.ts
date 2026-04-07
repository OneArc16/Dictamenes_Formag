import { NextResponse } from 'next/server';

import { requireRecomendacionesApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type EstadoFiltro = 'PENDIENTES' | 'REABIERTAS' | 'CERRADAS' | 'ANULADAS' | 'TODOS';

function toNombreCompleto(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function mapEstado(estado: string): 'PENDIENTE' | 'REABIERTO' | 'CERRADA' | 'ANULADA' {
  if (estado === 'ANULADA') return 'ANULADA';
  if (estado === 'CERRADA') return 'CERRADA';
  if (estado === 'REABIERTO') return 'REABIERTO';
  return 'PENDIENTE';
}

export async function POST(req: Request) {
  try {
    const authResult = await requireRecomendacionesApi('recomendacion.create');
    if (!authResult.ok) {
      return NextResponse.json({ ok: false, error: authResult.error }, { status: authResult.status });
    }

    const auth = authResult.auth;
    const body = await req.json().catch(() => null);
    const usuarioId = Number(body?.usuarioId);
    const empleadoIdBody =
      body?.empleadoId == null || body?.empleadoId === ''
        ? null
        : Number(body.empleadoId);

    if (!Number.isFinite(usuarioId) || usuarioId <= 0) {
      return NextResponse.json(
        { ok: false, error: 'Debe indicar un docente valido para la recomendacion.' },
        { status: 400 },
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true },
    });

    if (!usuario) {
      return NextResponse.json({ ok: false, error: 'El docente no existe.' }, { status: 404 });
    }

    let empleadoId = null;

    if (auth.role === 'MEDICO' && Number.isFinite(auth.empleadoId)) {
      empleadoId = auth.empleadoId;
    } else if (empleadoIdBody !== null) {
      if (!Number.isFinite(empleadoIdBody) || empleadoIdBody <= 0) {
        return NextResponse.json(
          { ok: false, error: 'El medico responsable seleccionado no es valido.' },
          { status: 400 },
        );
      }

      const empleado = await prisma.empleado.findUnique({
        where: { id: empleadoIdBody },
        select: { id: true },
      });

      if (!empleado) {
        return NextResponse.json(
          { ok: false, error: 'El medico responsable seleccionado no existe.' },
          { status: 404 },
        );
      }

      empleadoId = empleado.id;
    } else if (Number.isFinite(auth.empleadoId)) {
      empleadoId = auth.empleadoId;
    }

    const existente = await prisma.recomendacionLaboral.findFirst({
      where: {
        usuarioId,
        empleadoId,
        estado: 'BORRADOR',
      },
      orderBy: [{ id: 'desc' }],
    });

    if (existente) {
      return NextResponse.json({
        ok: true,
        created: false,
        recomendacion: {
          id: existente.id,
          usuarioId: existente.usuarioId,
          empleadoId: existente.empleadoId,
        },
      });
    }

    const recomendacion = await prisma.recomendacionLaboral.create({
      data: {
        usuarioId,
        empleadoId,
        fechaRecomendacion: new Date(),
        estado: 'BORRADOR',
      },
    });

    return NextResponse.json({
      ok: true,
      created: true,
      recomendacion: {
        id: recomendacion.id,
        usuarioId: recomendacion.usuarioId,
        empleadoId: recomendacion.empleadoId,
      },
    });
  } catch (error) {
    console.error('ERROR POST /api/recomendaciones:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Error creando recomendacion laboral' },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const authResult = await requireRecomendacionesApi('recomendacion.read');
    if (!authResult.ok) {
      return NextResponse.json({ ok: false, error: authResult.error }, { status: authResult.status });
    }

    const auth = authResult.auth;
    const { searchParams } = new URL(req.url);

    const documento = (searchParams.get('documento') ?? '').trim();
    const fechaDesde = (searchParams.get('fechaDesde') ?? '').trim();
    const fechaHasta = (searchParams.get('fechaHasta') ?? '').trim();
    const estado = ((searchParams.get('estado') ?? 'PENDIENTES').trim().toUpperCase() || 'PENDIENTES') as EstadoFiltro;
    const medicoIdParam = (searchParams.get('medicoId') ?? '').trim();
    const medicoId = medicoIdParam ? Number(medicoIdParam) : null;

    const and: Array<Record<string, unknown>> = [];

    if (Number.isFinite(medicoId)) {
      and.push({ empleadoId: medicoId });
    } else if (auth.role === 'MEDICO' && Number.isFinite(auth.empleadoId)) {
      and.push({ empleadoId: auth.empleadoId });
    }

    if (documento) {
      and.push({
        usuario: {
          identificacion: { contains: documento, mode: 'insensitive' },
        },
      });
    }

    if (estado !== 'TODOS') {
      if (estado === 'CERRADAS') {
        and.push({ estado: 'CERRADA' });
      } else if (estado === 'ANULADAS') {
        and.push({ estado: 'ANULADA' });
      } else if (estado === 'REABIERTAS') {
        and.push({ estado: 'REABIERTO' });
      } else {
        and.push({ estado: 'BORRADOR' });
      }
    }

    if (fechaDesde || fechaHasta) {
      const rango: { gte?: Date; lte?: Date } = {};
      if (fechaDesde) {
        rango.gte = new Date(`${fechaDesde}T00:00:00`);
      }
      if (fechaHasta) {
        rango.lte = new Date(`${fechaHasta}T23:59:59`);
      }
      and.push({ fechaRecomendacion: rango });
    }

    const where = and.length > 0 ? { AND: and } : undefined;

    const recomendaciones = await prisma.recomendacionLaboral.findMany({
      where,
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
        empleado: true,
        reabiertaPor: {
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
      orderBy:
        estado === 'REABIERTAS'
          ? [{ reabiertaEn: 'desc' }, { fechaRecomendacion: 'desc' }, { id: 'desc' }]
          : [{ fechaRecomendacion: 'desc' }, { id: 'desc' }],
      take: 500,
    });

    const rows = recomendaciones.map((recomendacion) => {
      const reabiertaPorNombre = recomendacion.reabiertaPor
        ? toNombreCompleto(
            recomendacion.reabiertaPor.primerNombre,
            recomendacion.reabiertaPor.segundoNombre,
            recomendacion.reabiertaPor.primerApellido,
            recomendacion.reabiertaPor.segundoApellido,
          )
        : null;

      const motivoReapertura = recomendacion.motivoReapertura?.nombre ?? null;
      const fueReabierta = Boolean(
        recomendacion.reabiertaEn || reabiertaPorNombre || motivoReapertura,
      );

      return {
        id: recomendacion.id,
        fechaRecomendacion: recomendacion.fechaRecomendacion
          ? recomendacion.fechaRecomendacion.toISOString()
          : null,
        docenteDocumento: recomendacion.usuario.identificacion,
        docenteNombre: toNombreCompleto(
          recomendacion.usuario.primerNombre,
          recomendacion.usuario.segundoNombre,
          recomendacion.usuario.primerApellido,
          recomendacion.usuario.segundoApellido,
        ),
        secretaria:
          recomendacion.usuario.secretariaRef?.nombre ??
          recomendacion.usuario.institucionEducativaRef?.secretaria?.nombre ??
          null,
        estado: mapEstado(recomendacion.estado),
        medicoNombre: recomendacion.empleado
          ? toNombreCompleto(
              recomendacion.empleado.primerNombre,
              recomendacion.empleado.segundoNombre,
              recomendacion.empleado.primerApellido,
              recomendacion.empleado.segundoApellido,
            )
          : null,
        fueReabierta,
        reabiertaEn: recomendacion.reabiertaEn
          ? recomendacion.reabiertaEn.toISOString()
          : null,
        reabiertaPorNombre,
        motivoReapertura,
      };
    });

    return NextResponse.json({ ok: true, rows });
  } catch (error) {
    console.error('ERROR GET /api/recomendaciones:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Error consultando recomendaciones' },
      { status: 500 },
    );
  }
}