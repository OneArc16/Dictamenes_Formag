// app/api/dictamenes/admisiones/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';

type EstadoFiltro = 'PENDIENTES' | 'REABIERTOS' | 'CERRADOS' | 'TODOS';

type JwtPayload = {
  sub: string;
  role?: string;
  name?: string;
  [key: string]: any;
};

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;
  if (!token) return null;

  const payload = (await verifyJwt(token)) as JwtPayload | null;
  if (!payload?.sub) return null;

  return {
    empleadoId: Number(payload.sub),
    role: payload.role,
    name: payload.name ?? null,
  };
}

/* =============== GET: listar dictámenes (módulo ADMISIONES) ================= */

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if (!auth) {
      return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const documento = (searchParams.get('documento') ?? '').trim();
    const fechaDesde = searchParams.get('fechaDesde'); // YYYY-MM-DD
    const fechaHasta = searchParams.get('fechaHasta'); // YYYY-MM-DD

    // estados: "PENDIENTES,REABIERTOS"
    const estadosRaw = (searchParams.get('estado') ?? '')
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean) as EstadoFiltro[];

    const estadosSeleccionados: EstadoFiltro[] = estadosRaw.length === 0 ? [] : estadosRaw;

    // medicos: "1,2,3" (ids de Empleado)
    const medicosRaw = (searchParams.get('medicos') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const medicoIdsNumeric = medicosRaw
      .map((v) => Number(v))
      .filter((n) => !Number.isNaN(n));

    const and: any[] = [];

    // --- filtro por médico (solo si el admisionista marca alguno) ---
    if (medicoIdsNumeric.length > 0) {
      and.push({ empleadoId: { in: medicoIdsNumeric } });
    }
    // si no marca ninguno, NO se filtra por médico → ve todos

    // --- documento docente ---
    if (documento) {
      and.push({
        usuario: {
          identificacion: { contains: documento, mode: 'insensitive' },
        },
      });
    }

    // --- estado / reabierto ---
    const usarTodos =
      estadosSeleccionados.length === 0 || estadosSeleccionados.includes('TODOS');

    if (!usarTodos) {
      const includePend = estadosSeleccionados.includes('PENDIENTES');
      const includeReab = estadosSeleccionados.includes('REABIERTOS');
      const includeCerr = estadosSeleccionados.includes('CERRADOS');

      const orEstados: any[] = [];

      if (includePend || includeReab) {
        if (includePend && includeReab) {
          orEstados.push({ estado: true });
        } else if (includePend) {
          orEstados.push({ estado: true, reabierto: false });
        } else if (includeReab) {
          orEstados.push({ estado: true, reabierto: true });
        }
      }

      if (includeCerr) {
        orEstados.push({ estado: false });
      }

      if (orEstados.length === 1) {
        and.push(orEstados[0]);
      } else if (orEstados.length > 1) {
        and.push({ OR: orEstados });
      }
    }

    // --- rango de fechas ---
    if (fechaDesde || fechaHasta) {
      const rango: any = {};
      if (fechaDesde) {
        rango.gte = new Date(`${fechaDesde}T00:00:00`);
      }
      if (fechaHasta) {
        rango.lte = new Date(`${fechaHasta}T23:59:59`);
      }
      and.push({ fechaDictamen: rango });
    }

    const where = and.length > 0 ? { AND: and } : undefined;

    const dictamenes = await prisma.dictamen.findMany({
      where,
      include: {
        // ✅ TRAER SECRETARÍA POR RELACIÓN + FALLBACK POR INSTITUCIÓN
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
      orderBy: [{ fechaDictamen: 'desc' }, { id: 'desc' }],
      take: 500,
    });

    const rows = dictamenes.map((d) => {
      const secretariaNombre =
        d.usuario.secretariaRef?.nombre ??
        d.usuario.institucionEducativaRef?.secretaria?.nombre ??
        null;

      return {
        id: d.id,
        fechaDictamen: d.fechaDictamen ? d.fechaDictamen.toISOString() : null,
        docenteDocumento: d.usuario.identificacion,
        docenteNombre: `${d.usuario.primerNombre} ${d.usuario.primerApellido}`,
        // ✅ AQUÍ YA NO ES d.usuario.secretaria (no existe)
        secretaria: secretariaNombre,
        estado: d.estado ? (d.reabierto ? 'REABIERTO' : 'PENDIENTE') : 'CERRADO',
        medicoNombre: d.empleado
          ? `${d.empleado.primerNombre} ${d.empleado.primerApellido}`
          : null,
      };
    });

    return NextResponse.json({ ok: true, rows });
  } catch (err: any) {
    console.error('ERROR GET /api/dictamenes/admisiones:', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error consultando dictámenes' },
      { status: 500 },
    );
  }
}