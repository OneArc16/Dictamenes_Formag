// src/server/dictamenes/diagnosticosService.ts
import { prisma } from '@/lib/prisma';
import { TipoDiagnostico } from '@prisma/client';

export type DiagnosticoInput = {
  cie10Codigo: string;
  tipo: TipoDiagnostico;
};

export async function saveDiagnosticosForDictamen(
  dictamenId: number,
  diagnosticos: DiagnosticoInput[]
) {
  // 1. Filtrar diagnósticos con código vacío
  const validos = diagnosticos.filter(
    (d) => d.cie10Codigo && d.cie10Codigo.trim() !== ''
  );

  return prisma.$transaction(async (tx) => {
    // (Opcional) Verificar que el dictamen exista
    const existeDictamen = await tx.dictamen.findUnique({
      where: { id: dictamenId },
      select: { id: true },
    });

    if (!existeDictamen) {
      throw new Error('El dictamen no existe');
    }

    // 2. Eliminar todos los diagnósticos previos del dictamen
    await tx.dictamenDiagnostico.deleteMany({
      where: { dictamenId },
    });

    // 3. Crear los nuevos (si hay)
    if (validos.length > 0) {
      await tx.dictamenDiagnostico.createMany({
        data: validos.map((d) => ({
          dictamenId,
          cie10Codigo: d.cie10Codigo,
          tipo: d.tipo,
        })),
      });
    }

    return { cantidad: validos.length };
  });
}
