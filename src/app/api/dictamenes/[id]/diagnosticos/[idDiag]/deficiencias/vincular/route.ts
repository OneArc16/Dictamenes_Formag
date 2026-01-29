import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string; diagnosticoId: string }> }
) {
  try {
    const { id, diagnosticoId } = await context.params;

    const dictamenId = Number(id);
    const dxId = Number(diagnosticoId);

    if (Number.isNaN(dictamenId) || Number.isNaN(dxId)) {
      return NextResponse.json({ message: "Parámetros inválidos" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const deficienciaId = Number(body?.deficienciaId);

    if (!deficienciaId || Number.isNaN(deficienciaId)) {
      return NextResponse.json({ message: "deficienciaId es requerido" }, { status: 400 });
    }

    // 1) Validar que el diagnóstico exista y pertenezca al dictamen
    const dx = await prisma.dictamenDiagnostico.findFirst({
      where: { id: dxId, dictamenId },
      select: { id: true, cie10Codigo: true },
    });

    if (!dx) {
      return NextResponse.json({ message: "Diagnóstico no encontrado en este dictamen" }, { status: 404 });
    }

    // 2) Validar que la deficiencia exista
    const def = await prisma.deficiencia.findUnique({
      where: { id: deficienciaId },
      select: { id: true },
    });

    if (!def) {
      return NextResponse.json({ message: "Deficiencia no encontrada" }, { status: 404 });
    }

    // 3) Crear vínculo CIE10 ↔ Deficiencia (id compuesto)
    // Si ya existe, no falla (upsert)
    await prisma.cie10Deficiencia.upsert({
      where: {
        cie10Codigo_deficienciaId: {
          cie10Codigo: dx.cie10Codigo,
          deficienciaId,
        },
      },
      create: {
        cie10Codigo: dx.cie10Codigo,
        deficienciaId,
      },
      update: {},
    });

    return NextResponse.json({
      message: "Vínculo creado",
      cie10Codigo: dx.cie10Codigo,
      deficienciaId,
    });
  } catch (error: any) {
    console.error("❌ POST /dictamenes/[id]/diagnosticos/[diagnosticoId]/deficiencias/vincular:", error);
    return NextResponse.json(
      { message: "Error interno", error: error?.message },
      { status: 500 }
    );
  }
}
