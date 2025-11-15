// app/api/dictamenes/medico/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';
import { z } from 'zod';
import { ProcedimientoPcl } from '@prisma/client';

export const runtime = 'nodejs';

type EstadoFiltro = 'PENDIENTES' | 'CERRADOS' | 'TODOS';

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
    const estadoFiltro =
      (searchParams.get('estado') as EstadoFiltro | null) ?? 'PENDIENTES';

    const where: any = {
      // 🔴 Si más adelante ligamos el dictamen al médico,
      // aquí iría algo como: empleadoId: medicoId,
    };

    // Documento del docente
    if (documento) {
      where.usuario = {
        identificacion: { contains: documento, mode: 'insensitive' },
      };
    }

    // Estado
    if (estadoFiltro === 'PENDIENTES') {
      where.estado = true; // incluye reabiertos si más adelante agregamos ese flag
    } else if (estadoFiltro === 'CERRADOS') {
      where.estado = false;
    }

    // Fechas: se aplican solo si el usuario las usa en el filtro
    if (fechaDesde || fechaHasta) {
      where.fechaDictamen = {};
      if (fechaDesde) {
        where.fechaDictamen.gte = new Date(`${fechaDesde}T00:00:00`);
      }
      if (fechaHasta) {
        where.fechaDictamen.lte = new Date(`${fechaHasta}T23:59:59`);
      }
    }

    const dictamenes = await prisma.dictamen.findMany({
      where,
      include: {
        usuario: true,
      },
      orderBy: {
        creadoEn: 'desc',
      },
      take: 100,
    });

    const rows = dictamenes.map((d) => ({
      id: d.id,
      numeroDictamen: d.numeroDictamen,
      fechaDictamen: d.fechaDictamen,
      estado: d.estado ? 'PENDIENTE' : 'CERRADO',
      reabierto: false, // si luego agregamos campo, aquí se usa
      docenteDocumento: d.usuario.identificacion,
      docenteNombre: `${d.usuario.primerNombre} ${d.usuario.primerApellido}`,
      medicoNombre: null, // luego podemos traerlo
      procedimientoPcl: d.procedimientoPcl,
      totalTitulo1: d.totalTitulo1,
      totalTitulo3: d.totalTitulo3,
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
        // aplicaAnalisisOcupacional: false,  // usa default del schema
        // estado: true,                      // usa default del schema
      },
      select: {
        id: true,
      },
    });

    // 🔥 SIEMPRE devolvemos JSON
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
