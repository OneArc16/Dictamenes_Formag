import { NextRequest, NextResponse } from 'next/server';

import { requireAbilityApi } from '@/lib/auth/api-guards';
import type { AuthorizationContext } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import {
  buildDictamenHistorySnapshot,
  resolveDictamenEstadoHistorial,
} from '@/lib/dictamen/historial';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AuthCtx = AuthorizationContext;

type EmpleadoJuntaSnapshot = {
  id: number;
  primerNombre: string | null;
  segundoNombre: string | null;
  primerApellido: string | null;
  segundoApellido: string | null;
  registroMedico: string | null;
  licencia: string | null;
  firma: Uint8Array | null;
};

function buildNombreCompleto(empleado: EmpleadoJuntaSnapshot) {
  return [
    empleado.primerNombre,
    empleado.segundoNombre,
    empleado.primerApellido,
    empleado.segundoApellido,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
}

function detectFirmaMime(bytes: Buffer | null | undefined): string | null {
  if (!bytes || bytes.length < 4) return null;

  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg';

  return 'image/png';
}

function canCloseDictamen(dictamen: { empleadoId: number | null }, auth: AuthCtx) {
  if (auth.role !== 'MEDICO') {
    return {
      ok: false as const,
      status: 403,
      error: 'No autorizado para cerrar este dictamen.',
    };
  }

  if (dictamen.empleadoId != null && dictamen.empleadoId !== auth.empleadoId) {
    return {
      ok: false as const,
      status: 403,
      error: 'No tiene permiso sobre este dictamen.',
    };
  }

  return { ok: true as const };
}

export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAbilityApi('dictamen.close');
    if (!authResult.ok) {
      return NextResponse.json({ ok: false, message: authResult.error }, { status: authResult.status });
    }

    const auth = authResult.auth;

    const { id } = await context.params;
    const dictamenId = Number(id);

    if (!Number.isFinite(dictamenId) || dictamenId <= 0) {
      return NextResponse.json({ ok: false, message: 'id invalido' }, { status: 400 });
    }

    const current = await prisma.dictamen.findUnique({
      where: { id: dictamenId },
      select: {
        id: true,
        empleadoId: true,
        estado: true,
        reabierto: true,
        numeroDictamen: true,
        fechaDictamen: true,
        procedimientoPcl: true,
        tipoDictamen: true,
        antecedentesClinicos: true,
        condicionSalud: true,
        descripcionHallazgos: true,
        sustentacionObservaciones: true,
        fechaEstructuracionInvalidez: true,
        tipoEvento: true,
        origenEvento: true,
        aplicaAnalisisOcupacional: true,
      },
    });

    if (!current) {
      return NextResponse.json({ ok: false, message: 'Dictamen no encontrado' }, { status: 404 });
    }

    const permission = canCloseDictamen(current, auth);
    if (!permission.ok) {
      return NextResponse.json({ ok: false, message: permission.error }, { status: permission.status });
    }

    if (current.estado === false) {
      return NextResponse.json({
        ok: true,
        dictamenId,
        estado: 'CERRADO',
        message: 'El dictamen ya esta cerrado.',
      });
    }

    const snapshot = buildDictamenHistorySnapshot(current);
    const estadoAnterior = resolveDictamenEstadoHistorial(current);

    await prisma.$transaction(async (tx) => {
      const existingJuntaSnapshots = await tx.dictamenJunta.count({ where: { dictamenId } });

      if (existingJuntaSnapshots === 0) {
        const junta = await tx.empleado.findMany({
          where: {
            activo: true,
            esMiembroJunta: true,
          },
          orderBy: [{ id: 'asc' }],
          select: {
            id: true,
            primerNombre: true,
            segundoNombre: true,
            primerApellido: true,
            segundoApellido: true,
            registroMedico: true,
            licencia: true,
            firma: true,
          },
        });

        if (junta.length > 0) {
          await tx.dictamenJunta.createMany({
            data: junta.map((empleado, index) => {
              const firmaBuffer = empleado.firma ? Buffer.from(empleado.firma) : null;

              return {
                dictamenId,
                empleadoId: empleado.id,
                orden: index + 1,
                nombreCompleto: buildNombreCompleto(empleado),
                registroMedico: empleado.registroMedico ?? null,
                licencia: empleado.licencia ?? null,
                firma: empleado.firma ?? null,
                firmaMime: detectFirmaMime(firmaBuffer),
              };
            }),
            skipDuplicates: true,
          });
        }
      }

      await tx.dictamen.update({
        where: { id: dictamenId },
        data: {
          estado: false,
          reabierto: false,
        },
      });

      await tx.dictamenHistorial.create({
        data: {
          dictamenId,
          empleadoId: auth.empleadoId,
          tipo: 'CIERRE',
          estadoAnterior,
          estadoNuevo: 'CERRADO',
          formularioAnterior: snapshot,
          formularioNuevo: snapshot,
        },
      });
    });

    return NextResponse.json({
      ok: true,
      dictamenId,
      estado: 'CERRADO',
      message: 'Dictamen cerrado correctamente.',
    });
  } catch (error: unknown) {
    console.error('ERROR POST /api/dictamenes/[id]/cerrar:', error);
    const message = error instanceof Error ? error.message : 'Error cerrando dictamen';
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ ok: false, message: 'Method Not Allowed' }, { status: 405 });
}

export function PUT() {
  return NextResponse.json({ ok: false, message: 'Method Not Allowed' }, { status: 405 });
}

export function DELETE() {
  return NextResponse.json({ ok: false, message: 'Method Not Allowed' }, { status: 405 });
}
