import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TipoDiagnostico } from '@prisma/client';
import { requireAbilityApi } from '@/lib/auth/api-guards';
import { checkPclAccess } from '@/lib/dictamen/pcl-access';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // 👈 params puede ser Promise
) {
  try {
    const auth = await requireAbilityApi('dictamen.edit');
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
    // 👇 Desempaquetamos params con await (sirve tanto si es Promise como si no)
    const { id } = await context.params;

    const dictamenId = Number(id);
    if (!dictamenId || Number.isNaN(dictamenId)) {
      return NextResponse.json(
        { error: 'ID de dictamen inválido' },
        { status: 400 }
      );
    }
    const gate = await checkPclAccess(dictamenId, auth.auth, { edit: true, markStarted: true });
    if (!gate.ok) return NextResponse.json({ code: gate.code, error: gate.error }, { status: gate.status });

    const body = await req.json();
    const raw = Array.isArray(body?.diagnosticos) ? body.diagnosticos : [];

    // Normalizamos payload
    const diagnosticos = raw
      .filter(
        (d: any) =>
          typeof d?.cie10Codigo === 'string' &&
          d.cie10Codigo.trim() !== ''
      )
      .map((d: any) => {
        const cie10Codigo = d.cie10Codigo.trim();

        // Aseguramos que el tipo sea válido según el enum de Prisma
        let tipo: TipoDiagnostico;
        switch (d.tipo) {
          case 'CONFIRMADO_NUEVO':
          case 'IMPRESION_DIAGNOSTICA':
          case 'CONFIRMADO_REPETIDO':
            tipo = d.tipo as TipoDiagnostico;
            break;
          default:
            tipo = TipoDiagnostico.IMPRESION_DIAGNOSTICA;
            break;
        }

        return {
          dictamenId,
          cie10Codigo,
          tipo,
        };
      });

    // Guardamos en BD: borramos todo lo anterior y creamos lo nuevo
    await prisma.$transaction(async (tx) => {
      await tx.dictamenDiagnostico.deleteMany({
        where: { dictamenId },
      });

      if (diagnosticos.length > 0) {
        await tx.dictamenDiagnostico.createMany({
          data: diagnosticos,
        });
      }
    });

    return NextResponse.json({
      ok: true,
      dictamenId,
      cantidad: diagnosticos.length,
    });
  } catch (error) {
    console.error('Error guardando diagnósticos:', error);
    return NextResponse.json(
      { error: 'Error al guardar los diagnósticos' },
      { status: 500 }
    );
  }
}
