import { NextRequest, NextResponse } from 'next/server';

import { requireAbilityApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';
import {
  buildDictamenHistorySnapshot,
  resolveDictamenEstadoHistorial,
} from '@/lib/dictamen/historial';
import { checkPclAccess } from '@/lib/dictamen/pcl-access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    const pclGate = await checkPclAccess(dictamenId, auth, {
      edit: true,
      markStarted: true,
    });
    if (!pclGate.ok) {
      return NextResponse.json(
        { ok: false, code: pclGate.code, message: pclGate.error },
        { status: pclGate.status },
      );
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
          pclRequiereRevision: false,
          origenVersionUtilizadaPcl: pclGate.originVersion,
          lockVersion: { increment: 1 },
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
