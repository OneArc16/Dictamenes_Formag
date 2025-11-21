// app/api/dictamenes/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get('q') ?? '').trim();        // documento o nombre
  const estado = (searchParams.get('estado') ?? 'TODOS') // PENDIENTE | CERRADO | REABIERTO | TODOS
    .toUpperCase();

  // Si luego filtras por médico logueado, aquí pondrías empleadoId
  // const medicoId = ...

  const where: any = {
    // ...(medicoId ? { empleadoId: medicoId } : {}),
  };

  // Filtro por documento/nombre del docente
  if (q) {
    where.usuario = {
      OR: [
        { identificacion: { contains: q } },
        { primerNombre: { contains: q, mode: 'insensitive' } },
        { segundoNombre: { contains: q, mode: 'insensitive' } },
        { primerApellido: { contains: q, mode: 'insensitive' } },
        { segundoApellido: { contains: q, mode: 'insensitive' } },
      ],
    };
  }

  // Filtro por estado visual (según tus chips)
  if (estado === 'PENDIENTE') {
    where.estado = true;
    where.reabierto = false;
  } else if (estado === 'CERRADO') {
    where.estado = false;
    where.reabierto = false;
  } else if (estado === 'REABIERTO') {
    where.reabierto = true;
  }
  // si es TODOS, no agregamos nada

  try {
    const dictamenes = await prisma.dictamen.findMany({
      where,
      include: {
        usuario: {
          select: {
            identificacion: true,
            primerNombre: true,
            segundoNombre: true,
            primerApellido: true,
            segundoApellido: true,
            secretariaRef: {            // 🔹 AQUÍ TRAEMOS LA SECRETARÍA
              select: { nombre: true },
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
      },
      orderBy: [
        { fechaDictamen: 'desc' }, // 🔹 primero los más recientes
        { id: 'desc' },
      ],
      take: 100, // o el límite que quieras
    });

    const rows = dictamenes.map((d) => {
      const docenteNombre = [
        d.usuario.primerNombre,
        d.usuario.segundoNombre,
        d.usuario.primerApellido,
        d.usuario.segundoApellido,
      ]
        .filter(Boolean)
        .join(' ');

      const medicoNombre = [
        d.empleado?.primerNombre,
        d.empleado?.segundoNombre,
        d.empleado?.primerApellido,
        d.empleado?.segundoApellido,
      ]
        .filter(Boolean)
        .join(' ');

      let estadoLabel = 'Pendiente';
      if (d.reabierto) estadoLabel = 'Reabierto';
      else if (!d.estado) estadoLabel = 'Cerrado';

      return {
        id: d.id,
        fecha: d.fechaDictamen,                      // ya lo formateas en el front
        documento: d.usuario.identificacion,
        docente: docenteNombre,
        estado: estadoLabel,
        medico: medicoNombre,
        secretaria: d.usuario.secretariaRef?.nombre ?? '', // 🔹 NUEVA COLUMNA
      };
    });

    return NextResponse.json({ ok: true, rows });
  } catch (error: any) {
    console.error('Error listando dictámenes', error);
    return NextResponse.json(
      { ok: false, error: error?.message ?? 'Error listando dictámenes' },
      { status: 500 },
    );
  }
}
