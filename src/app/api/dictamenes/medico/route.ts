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
  const cookieStore = await cookies(); // Next 16: cookies() es async-like
  const token = cookieStore.get('auth')?.value;
  if (!token) return null;

  const payload = (await verifyJwt(token)) as JwtPayload | null;
  if (!payload?.sub) return null;

  const medicoId = Number(payload.sub);
  if (!medicoId || Number.isNaN(medicoId)) return null;

  return medicoId;
}

// Parsear estado = PENDIENTES,REABIERTOS,...
function parseEstados(raw: string | null): EstadoFiltro[] {
  if (!raw) return [];
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const allowed: EstadoFiltro[] = ['PENDIENTES', 'REABIERTOS', 'CERRADOS', 'TODOS'];

  return parts.filter((p): p is EstadoFiltro =>
    (allowed as string[]).includes(p),
  );
}

// Parsear medicoIds = "1,2,3"
function parseMedicoIds(raw: string | null): number[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && n > 0);
}

/* =============== GET: listar dictámenes ================= */

export async function GET(req: Request) {
  try {
    const medicoId = await getMedicoIdFromToken();
    if (!medicoId) {
      return NextResponse.json(
        { ok: false, error: 'No autenticado' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const documento = (searchParams.get('documento') ?? '').trim();
    const fechaDesde = searchParams.get('fechaDesde'); // YYYY-MM-DD
    const fechaHasta = searchParams.get('fechaHasta'); // YYYY-MM-DD

    // ✅ Estados (multi)
    let estados = parseEstados(searchParams.get('estado'));
    if (!estados.length) {
      // Por defecto: pendientes + reabiertos
      estados = ['PENDIENTES', 'REABIERTOS'];
    }

    // ✅ Médicos (multi): medicoIds="1,2,3"
    let filtroMedicoIds = parseMedicoIds(searchParams.get('medicoIds'));
    // Fallback por si en algún momento se usa medicoId= "1"
    if (!filtroMedicoIds.length) {
      filtroMedicoIds = parseMedicoIds(searchParams.get('medicoId'));
    }

    const AND: any[] = [];

    // 🔒 Si NO hay filtro de médico → mostrar solo los dictámenes del médico logueado
    // Si SÍ hay filtro → dictámenes de esos médicos
    if (filtroMedicoIds.length > 0) {
      AND.push({ empleadoId: { in: filtroMedicoIds } });
    } else {
      AND.push({ empleadoId: medicoId });
    }

    // Documento del docente
    if (documento) {
      AND.push({
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
      AND.push({ fechaDictamen: rango });
    }

    // Filtro de estado / reabierto
    if (!estados.includes('TODOS')) {
      const OR: any[] = [];

      if (estados.includes('PENDIENTES')) {
        OR.push({ estado: true, reabierto: false });
      }
      if (estados.includes('REABIERTOS')) {
        OR.push({ estado: true, reabierto: true });
      }
      if (estados.includes('CERRADOS')) {
        OR.push({ estado: false });
      }

      if (OR.length) {
        AND.push({ OR });
      }
    }

    const dictamenes = await prisma.dictamen.findMany({
      where: AND.length ? { AND } : undefined,
      include: {
        usuario: true,   // docente
        empleado: true,  // médico que creó el dictamen
      },
      orderBy: {
        creadoEn: 'desc',
      },
      take: 100,
    });

    const rows = dictamenes.map((d) => {
      const estadoFront = d.estado
        ? d.reabierto
          ? 'REABIERTO'
          : 'PENDIENTE'
        : 'CERRADO';

      const medicoNombre = d.empleado
        ? `${d.empleado.primerNombre} ${d.empleado.primerApellido}`
        : null;

      return {
        id: d.id,
        fechaDictamen: d.fechaDictamen
          ? d.fechaDictamen.toISOString()
          : null,
        docenteTipoDocumento: d.usuario.tipoIdentificacion,
        docenteDocumento: d.usuario.identificacion,
        docenteNombre: `${d.usuario.primerNombre} ${d.usuario.primerApellido}`,
        estado: estadoFront,
        reabierto: d.reabierto,
        medicoNombre,
      };
    });

    return NextResponse.json({ ok: true, rows });
  } catch (err: any) {
    console.error('ERROR GET /api/dictamenes/medico:', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error consultando dictámenes' },
      { status: 500 },
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
        { status: 401 },
      );
    }

    const json = await req.json();
    const data = CreateDictamenSchema.parse(json);

    const fecha = new Date(`${data.fechaDictamen}T00:00:00`);

    const dictamen = await prisma.dictamen.create({
      data: {
        usuarioId: data.usuarioId,
        empleadoId: medicoId, // 👈 médico que crea el dictamen
        fechaDictamen: fecha,
        procedimientoPcl: data.procedimientoPcl as ProcedimientoPcl,
        antecedentesClinicos: data.antecedentesClinicos ?? null,
        condicionSalud: data.condicionSalud ?? null,
        descripcionHallazgos: data.descripcionHallazgos ?? null,
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
