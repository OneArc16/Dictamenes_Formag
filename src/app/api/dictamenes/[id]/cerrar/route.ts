// src/app/api/dictamenes/[id]/cerrar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function buildNombreCompleto(e: any) {
  return `${e.primerNombre ?? ''} ${e.segundoNombre ?? ''} ${e.primerApellido ?? ''} ${e.segundoApellido ?? ''}`
    .replace(/\s+/g, ' ')
    .trim();
}

// Detecta MIME básico desde bytes (PNG/JPG). Si no reconoce, asume PNG.
function detectFirmaMime(bytes: Buffer | null | undefined): string | null {
  if (!bytes || bytes.length < 4) return null;

  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  // JPG: FF D8
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg';

  return 'image/png';
}

export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const dictamenId = Number(id);

    if (!Number.isFinite(dictamenId) || dictamenId <= 0) {
      return NextResponse.json({ ok: false, message: 'id inválido' }, { status: 400 });
    }

    const current = await prisma.dictamen.findUnique({
      where: { id: dictamenId },
      select: { id: true, estado: true, reabierto: true },
    });

    if (!current) {
      return NextResponse.json({ ok: false, message: 'Dictamen no encontrado' }, { status: 404 });
    }

    // ✅ Si ya está cerrado, respondemos OK idempotente (NO tocamos snapshots)
    if (current.estado === false) {
      return NextResponse.json({ ok: true, dictamenId, message: 'El dictamen ya está cerrado.' });
    }

    await prisma.$transaction(async (tx) => {
      // 1) Verificar si ya existen snapshots de junta para este dictamen
      const existing = await tx.dictamenJunta.count({ where: { dictamenId } });

      // 2) Si NO existen, crearlos desde empleados activos de junta (con firma congelada)
      if (existing === 0) {
        const junta = await tx.empleado.findMany({
          where: {
            activo: true,
            esMiembroJunta: true, // ✅ este campo debe existir en Empleado
          },
          orderBy: [{ id: 'asc' }], // (si luego agregas ordenJunta, lo cambiamos a eso)
          select: {
            id: true,
            primerNombre: true,
            segundoNombre: true,
            primerApellido: true,
            segundoApellido: true,
            registroMedico: true,
            licencia: true,
            firma: true, // Bytes?
          },
        });

        if (junta.length > 0) {
          await tx.dictamenJunta.createMany({
            data: junta.map((e, idx) => {
              const firmaBuf = e.firma ? Buffer.from(e.firma as any) : null;

              return {
                dictamenId,
                empleadoId: e.id,
                orden: idx + 1,

                // snapshot congelado
                nombreCompleto: buildNombreCompleto(e),
                registroMedico: e.registroMedico ?? null,
                licencia: e.licencia ?? null,
                firma: e.firma ?? null,
                firmaMime: detectFirmaMime(firmaBuf),
              };
            }),
            // Si llega a pasar una doble llamada simultánea, evita reventar por unique(dictamenId, orden)
            skipDuplicates: true,
          });
        }
      }

      // 3) Cerrar dictamen
      await tx.dictamen.update({
        where: { id: dictamenId },
        data: {
          estado: false,
          reabierto: false,
          // cerradoEn: new Date(), // si luego lo agregas
        },
      });
    });

    return NextResponse.json({ ok: true, dictamenId, message: 'Dictamen cerrado correctamente.' });
  } catch (err: any) {
    console.error('❌ Error POST /api/dictamenes/[id]/cerrar:', err);
    return NextResponse.json({ ok: false, message: err?.message ?? 'Error cerrando dictamen' }, { status: 500 });
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