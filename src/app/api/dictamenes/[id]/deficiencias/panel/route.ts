// src/app/api/dictamenes/[id]/deficiencias/panel/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const dictamenId = Number(id);

    if (isNaN(dictamenId)) {
      return NextResponse.json({ message: "dictamenId inválido" }, { status: 400 });
    }

    const dictamen = await prisma.dictamen.findUnique({
      where: { id: dictamenId },
      select: { id: true, procedimientoPcl: true },
    });

    if (!dictamen) {
      return NextResponse.json({ message: "Dictamen no encontrado" }, { status: 404 });
    }

    const diagnosticos = await prisma.dictamenDiagnostico.findMany({
      where: { dictamenId },
      orderBy: { id: "asc" },
      select: {
        id: true,
        cie10Codigo: true,
        tipo: true,
        cie10: { select: { codigo: true, nombre: true } },
      },
    });

    const deficienciasAsignadas = await prisma.dictamenDeficiencia.findMany({
      where: { dictamenId },
      orderBy: { creadoEn: "desc" },
      select: {
        id: true,
        creadoEn: true,
        valorDeficiencia: true,
        deficiencia: {
          select: { id: true, nombre: true, tabla: true, capitulo: true, tipoTabla: true },
        },
        clase: { select: { id: true, nombre: true } },
        nervio: { select: { id: true, nombre: true } },
      },
    });

    // Borde verde en diagnósticos (igual que antes)
    const diagCodigos = diagnosticos.map((d) => d.cie10Codigo);
    const defIdsAsignadas = Array.from(new Set(deficienciasAsignadas.map((x) => x.deficiencia.id)));

    let codigosConDef: Set<string> = new Set();

    if (diagCodigos.length > 0 && defIdsAsignadas.length > 0) {
      const links = await prisma.cie10Deficiencia.findMany({
        where: {
          cie10Codigo: { in: diagCodigos },
          deficienciaId: { in: defIdsAsignadas },
        },
        select: { cie10Codigo: true },
      });

      codigosConDef = new Set(links.map((l) => l.cie10Codigo));
    }

    const diagnosticosConFlag = diagnosticos.map((d) => ({
      ...d,
      hasDeficiencia: codigosConDef.has(d.cie10Codigo),
    }));

    return NextResponse.json({
      dictamen,
      diagnosticos: diagnosticosConFlag,
      deficienciasAsignadas,
    });
  } catch (error: any) {
    console.error("❌ Error GET /dictamenes/[id]/deficiencias/panel:", error);
    return NextResponse.json(
      { message: "Error interno", error: error.message },
      { status: 500 }
    );
  }
}
