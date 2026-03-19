import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';

type EstadoFiltro = 'PENDIENTES' | 'CERRADAS' | 'ANULADAS' | 'TODOS';

type JwtPayload = {
  sub: string;
  role?: string;
  name?: string;
  [key: string]: unknown;
};

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;
  if (!token) return null;

  const payload = (await verifyJwt(token)) as JwtPayload | null;
  if (!payload?.sub) return null;

  return {
    empleadoId: Number(payload.sub),
    role: payload.role ?? null,
  };
}

function toNombreCompleto(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function mapEstado(estado: string): 'PENDIENTE' | 'CERRADA' | 'ANULADA' {
  if (estado === 'ANULADA') return 'ANULADA';
  if (estado === 'CERRADA') return 'CERRADA';
  return 'PENDIENTE';
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if (!auth) {
      return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    }

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
    const auth = await requireAuth();
    if (!auth) {
      return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    }

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
      and.push({
        estado:
          estado === 'CERRADAS'
            ? 'CERRADA'
            : estado === 'ANULADAS'
            ? 'ANULADA'
            : 'BORRADOR',
      });
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
      },
      orderBy: [{ fechaRecomendacion: 'desc' }, { id: 'desc' }],
      take: 500,
    });

    const rows = recomendaciones.map((recomendacion) => ({
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
    }));

    return NextResponse.json({ ok: true, rows });
  } catch (error) {
    console.error('ERROR GET /api/recomendaciones:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Error consultando recomendaciones' },
      { status: 500 },
    );
  }
}