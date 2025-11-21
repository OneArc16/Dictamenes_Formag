// app/api/dictamenes/medico/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';
import { z } from 'zod';
import { ProcedimientoPcl } from '@prisma/client';

export const runtime = 'nodejs';

type EstadoFiltro = 'PENDIENTES' | 'REABIERTOS' | 'CERRADOS' | 'TODOS';

type JwtPayload = {
  sub: string;
  role?: string;
  name?: string;
  [key: string]: any;
};

async function getMedicoIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;
  if (!token) return null;

  const payload = (await verifyJwt(token)) as JwtPayload | null;
  if (!payload?.sub) return null;

  const medicoId = Number(payload.sub);
  if (!medicoId || Number.isNaN(medicoId)) return null;

  return medicoId;
}

/* =============== GET: listar dictámenes ================= */

export async function GET(req: Request) {
  try {
    const medicoId = await getMedicoIdFromToken();
    if (!medicoId) {
      return NextResponse.json(
        { ok: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    const documento = (searchParams.get('documento') ?? '').trim();
    const fechaDesde = searchParams.get('fechaDesde'); // YYYY-MM-DD
    const fechaHasta = searchParams.get('fechaHasta'); // YYYY-MM-DD

    // Estados múltiples: "PENDIENTES,REABIERTOS"
    const estadoParam = (searchParams.get('estado') ?? 'PENDIENTES').trim();
    const estadosFiltro = (estadoParam
      ? estadoParam.split(',')
      : ['PENDIENTES']
    )
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean) as EstadoFiltro[];

    // Médicos múltiples: "3,5,7"
    const medicoIdsParam = (searchParams.get('medicoIds') ?? '').trim();
    let medicoIds: number[] = [];
    if (medicoIdsParam) {
      medicoIds = medicoIdsParam
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !Number.isNaN(n));
    }

    const whereAnd: any[] = [];

    // Si se enviaron médicos en el filtro, usamos esos;
    // si no, por defecto solo el médico logueado.
    if (medicoIds.length > 0) {
      whereAnd.push({ empleadoId: { in: medicoIds } });
    } else {
      whereAnd.push({ empleadoId: medicoId });
    }

    // Documento del docente
    if (documento) {
      whereAnd.push({
        usuario: {
          identificacion: { contains: documento, mode: 'insensitive' },
        },
      });
    }

    // Rango de fechas
    if (fechaDesde || fechaHasta) {
      const rango: any = {};
      if (fechaDesde) {
        rango.gte = new Date(`${fechaDesde}T00:00:00`);
      }
      if (fechaHasta) {
        rango.lte = new Date(`${fechaHasta}T23:59:59`);
      }
      whereAnd.push({ fechaDictamen: rango });
    }

    // Filtro de estados
    if (!estadosFiltro.includes('TODOS')) {
      const orEstados: any[] = [];

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

    const where = whereAnd.length ? { AND: whereAnd } : {};

    const dictamenes = await prisma.dictamen.findMany({
      where,
      include: {
        usuario: {
          include: {
            secretariaRef: true, // 👈 aquí traemos la secretaria
          },
        }, // Docente
        empleado: true, // Médico que creó el dictamen
      },
      // 🔥 Orden: primero los más recientes
      orderBy: [
        { fechaDictamen: 'desc' },
        { id: 'desc' },
      ],
      take: 100,
    });

    const rows = dictamenes.map((d) => ({
      id: d.id,
      fechaDictamen: d.fechaDictamen
        ? d.fechaDictamen.toISOString()
        : null,
      docenteDocumento: d.usuario.identificacion,
      docenteNombre: `${d.usuario.primerNombre} ${d.usuario.primerApellido}`,
      // 👇 usamos el nombre de la secretaria relacionada
      secretaria: d.usuario.secretariaRef?.nombre ?? null,
      estado: d.reabierto
        ? 'REABIERTO'
        : d.estado
        ? 'PENDIENTE'
        : 'CERRADO',
      medicoNombre: d.empleado
        ? `${d.empleado.primerNombre} ${d.empleado.primerApellido}`
        : null,
    }));

    return NextResponse.json({ ok: true, rows });
  } catch (err: any) {
    console.error('ERROR GET /api/dictamenes/medico:', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error consultando dictámenes' },
      { status: 500 }
    );
  }
}

/* =============== POST: crear dictamen ================= */

const CreateDictamenSchema = z.object({
  usuarioId: z.number().int().positive(),
  fechaDictamen: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (YYYY-MM-DD)'),
  procedimientoPcl: z.enum(['A', 'B']),
  antecedentesClinicos: z.string().optional(),
  condicionSalud: z.string().optional(),
  descripcionHallazgos: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const medicoId = await getMedicoIdFromToken();
    if (!medicoId) {
      return NextResponse.json(
        { ok: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const json = await req.json();
    const data = CreateDictamenSchema.parse(json);

    const fecha = new Date(`${data.fechaDictamen}T00:00:00`);

    const dictamen = await prisma.dictamen.create({
      data: {
        usuarioId: data.usuarioId,
        fechaDictamen: fecha,
        procedimientoPcl: data.procedimientoPcl as ProcedimientoPcl,
        antecedentesClinicos: data.antecedentesClinicos ?? null,
        condicionSalud: data.condicionSalud ?? null,
        descripcionHallazgos: data.descripcionHallazgos ?? null,
        empleadoId: medicoId, // médico que lo crea
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({
      ok: true,
      dictamen,
    });
  } catch (err: any) {
    console.error('ERROR POST /api/dictamenes/medico:', err);
    const msg =
      err?.issues?.[0]?.message || err?.message || 'Error creando dictamen';
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
