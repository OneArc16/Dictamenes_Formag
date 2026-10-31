import { NextResponse } from 'next/server';

import {
  atencionesOrderBy,
  buildAtencionesWhere,
  parseAtencionesQuery,
} from '@/features/atenciones/application/atenciones-query';
import { requireMedicoApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const MAX_ROWS = 500;

function toNombreCompleto(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

export async function GET(req: Request) {
  try {
    const authResult = await requireMedicoApi();
    if (!authResult.ok) {
      return NextResponse.json({ ok: false, error: authResult.error }, { status: authResult.status });
    }

    const query = parseAtencionesQuery(new URL(req.url).searchParams);
    const citas = await prisma.cita.findMany({
      where: buildAtencionesWhere(query),
      orderBy: atencionesOrderBy(query.estado),
      take: MAX_ROWS,
      select: {
        id: true,
        estado: true,
        inicioProgramado: true,
        finProgramado: true,
        activadaAt: true,
        medicoNombre: true,
        especialidadNombre: true,
        modalidadNombre: true,
        paciente: {
          select: {
            identificacion: true,
            primerNombre: true,
            segundoNombre: true,
            primerApellido: true,
            segundoApellido: true,
            secretariaRef: { select: { nombre: true } },
            institucionEducativaRef: { select: { secretaria: { select: { nombre: true } } } },
          },
        },
      },
    });

    const rows = citas.map((cita) => ({
      id: cita.id,
      estado: cita.estado === 'ATENDIDA' ? 'ATENDIDA' : 'ACTIVADA',
      inicioProgramado: cita.inicioProgramado.toISOString(),
      finProgramado: cita.finProgramado.toISOString(),
      activadaAt: cita.activadaAt?.toISOString() ?? null,
      docenteDocumento: cita.paciente.identificacion,
      docenteNombre: toNombreCompleto(
        cita.paciente.primerNombre,
        cita.paciente.segundoNombre,
        cita.paciente.primerApellido,
        cita.paciente.segundoApellido,
      ),
      secretaria:
        cita.paciente.secretariaRef?.nombre ??
        cita.paciente.institucionEducativaRef?.secretaria?.nombre ??
        null,
      medicoNombre: cita.medicoNombre,
      especialidadNombre: cita.especialidadNombre,
      modalidadNombre: cita.modalidadNombre,
    }));

    return NextResponse.json({ ok: true, rows, truncated: citas.length === MAX_ROWS });
  } catch (error) {
    console.error('ERROR GET /api/atenciones:', error);
    return NextResponse.json({ ok: false, error: 'Error consultando atenciones' }, { status: 500 });
  }
}
