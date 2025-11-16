// app/api/medicos/options/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';

type JwtPayload = {
  sub: string;
  role?: string;
  name?: string;
  [key: string]: any;
};

async function getEmpleadoIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;
  if (!token) return null;

  const payload = (await verifyJwt(token)) as JwtPayload | null;
  if (!payload?.sub) return null;

  const empleadoId = Number(payload.sub);
  if (!empleadoId || Number.isNaN(empleadoId)) return null;

  return empleadoId;
}

export async function GET() {
  try {
    const empleadoId = await getEmpleadoIdFromToken();
    if (!empleadoId) {
      return NextResponse.json(
        { ok: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Traemos todos los empleados activos con su perfil
    const empleados = await prisma.empleado.findMany({
      where: {
        activo: true,
      },
      include: {
        perfil: true, // para filtrar por nombre de perfil
      },
      orderBy: {
        primerApellido: 'asc',
      },
    });

    // Filtramos solo los de perfil "MEDICO"
    const medicos = empleados
      .filter(
        (e) => e.perfil?.nombre?.toUpperCase() === 'MEDICO'
      )
      .map((e) => {
        const nombreCompleto = [
          e.primerNombre,
          e.segundoNombre,
          e.primerApellido,
          e.segundoApellido,
        ]
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        return {
          id: e.id,
          nombre: nombreCompleto,
        };
      });

    // Ordenar dejando primero al médico logueado
    const sorted = [...medicos].sort((a, b) => {
      if (a.id === empleadoId) return -1;
      if (b.id === empleadoId) return 1;
      return a.nombre.localeCompare(b.nombre, 'es');
    });

    return NextResponse.json({
      ok: true,
      medicoIdActual: empleadoId,
      options: sorted,
    });
  } catch (err: any) {
    console.error('ERROR GET /api/medicos/options:', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error obteniendo médicos' },
      { status: 500 }
    );
  }
}
