import { NextRequest, NextResponse } from 'next/server';
import { saveDiagnosticosForDictamen } from '@/server/dictamenes/diagnosticosService';
import { TipoDiagnostico } from '@prisma/client';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dictamenId = Number(params.id);
    if (!dictamenId || Number.isNaN(dictamenId)) {
      return NextResponse.json(
        { error: 'ID de dictamen inválido' },
        { status: 400 }
      );
    }

    const body = await req.json();

    const raw = Array.isArray(body?.diagnosticos) ? body.diagnosticos : [];

    const diagnosticos = raw
      .filter(
        (d: any) =>
          typeof d?.cie10Codigo === 'string' &&
          d.cie10Codigo.trim() !== ''
      )
      .map((d: any) => {
        const cie10Codigo = d.cie10Codigo.trim();

        const tipoRaw = d.tipo as string | undefined;
        const tipoValido: TipoDiagnostico =
          tipoRaw === 'CONFIRMADO_NUEVO' ||
          tipoRaw === 'IMPRESION_DIAGNOSTICA' ||
          tipoRaw === 'CONFIRMADO_REPETIDO'
            ? (tipoRaw as TipoDiagnostico)
            : TipoDiagnostico.IMPRESION_DIAGNOSTICA;

        return {
          cie10Codigo,
          tipo: tipoValido,
        };
      });

    const result = await saveDiagnosticosForDictamen(
      dictamenId,
      diagnosticos
    );

    return NextResponse.json({
      ok: true,
      dictamenId,
      cantidad: result.cantidad,
    });
  } catch (error) {
    console.error('Error guardando diagnósticos:', error);
    return NextResponse.json(
      { error: 'Error al guardar los diagnósticos' },
      { status: 500 }
    );
  }
}
