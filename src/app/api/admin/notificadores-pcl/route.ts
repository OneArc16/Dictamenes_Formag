import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireAdminApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const UpsertNotificadorSchema = z.object({
  sedeId: z.number().int().positive(),
  empleadoId: z.number().int().positive().nullable().optional(),
  vigenteDesde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  vigenteHasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

function getAuditActor(payload: { name?: string; sub?: string }): string | null {
  const actor = String(payload.name ?? payload.sub ?? '').trim();
  return actor || null;
}

function parseDateOnly(value?: string | null) {
  return value ? new Date(`${value}T00:00:00.000-05:00`) : null;
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdminApi('admin.notificadores_pcl.manage');
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => null);
    const parsed = UpsertNotificadorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Datos invalidos para asignar notificador.' }, { status: 400 });
    }

    const empleadoId = parsed.data.empleadoId ?? null;
    const vigenteDesde = parseDateOnly(parsed.data.vigenteDesde);
    const vigenteHasta = parseDateOnly(parsed.data.vigenteHasta);

    if (vigenteDesde && vigenteHasta && vigenteHasta < vigenteDesde) {
      return NextResponse.json(
        { ok: false, error: 'La fecha final no puede ser anterior a la fecha inicial.' },
        { status: 400 },
      );
    }

    const sede = await prisma.sede.findUnique({
      where: { id: parsed.data.sedeId },
      select: { id: true },
    });

    if (!sede) {
      return NextResponse.json({ ok: false, error: 'Sede no encontrada.' }, { status: 404 });
    }

    if (empleadoId) {
      const empleado = await prisma.empleado.findUnique({
        where: { id: empleadoId },
        select: { id: true, activo: true, firma: true, idSede: true },
      });

      if (!empleado || !empleado.activo) {
        return NextResponse.json({ ok: false, error: 'Empleado notificador no disponible.' }, { status: 404 });
      }

      if (!empleado.firma || empleado.firma.byteLength === 0) {
        return NextResponse.json(
          { ok: false, error: 'El empleado seleccionado no tiene firma registrada.' },
          { status: 400 },
        );
      }

      if (!empleado.idSede) {
        return NextResponse.json(
          { ok: false, error: 'El empleado seleccionado no tiene sede asignada.' },
          { status: 400 },
        );
      }

      if (empleado.idSede !== parsed.data.sedeId) {
        return NextResponse.json(
          { ok: false, error: 'El empleado seleccionado pertenece a una sede diferente.' },
          { status: 400 },
        );
      }
    }

    const actor = getAuditActor(auth.payload);

    await prisma.$transaction(async (tx) => {
      await tx.sedeNotificador.updateMany({
        where: {
          sedeId: parsed.data.sedeId,
          estado: true,
        },
        data: {
          estado: false,
          updatedBy: actor,
        },
      });

      if (!empleadoId) return;

      await tx.sedeNotificador.upsert({
        where: {
          sedeId_empleadoId: {
            sedeId: parsed.data.sedeId,
            empleadoId,
          },
        },
        update: {
          estado: true,
          vigenteDesde,
          vigenteHasta,
          updatedBy: actor,
        },
        create: {
          sedeId: parsed.data.sedeId,
          empleadoId,
          estado: true,
          vigenteDesde,
          vigenteHasta,
          createdBy: actor,
          updatedBy: actor,
        },
      });
    });

    return NextResponse.json({
      ok: true,
      message: empleadoId ? 'Notificador asignado correctamente.' : 'Notificador removido correctamente.',
    });
  } catch (error) {
    console.error('ERROR POST /api/admin/notificadores-pcl:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Error guardando notificador PCL.',
      },
      { status: 500 },
    );
  }
}
