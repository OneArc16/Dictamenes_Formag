// src/app/api/dictamenes/[id]/diagnosticos/[idDiag]/deficiencias/vincular/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string; idDiag: string }> }
) {
  try {
    const { id, idDiag } = await context.params;

    const dictamenId = Number(id);
    const dictamenDiagnosticoId = Number(idDiag);

    if (!Number.isFinite(dictamenId) || !Number.isFinite(dictamenDiagnosticoId)) {
      return NextResponse.json(
        { message: "Parámetros inválidos (id / idDiag)." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);

    // Acepta varios nombres por si el front cambia
    const rawDefId =
      body?.deficienciaId ?? body?.deficiencia_id ?? body?.id ?? body?.defId;

    const deficienciaId = Number(rawDefId);

    if (!Number.isFinite(deficienciaId) || deficienciaId <= 0) {
      return NextResponse.json(
        { message: "Parámetros inválidos (deficienciaId).", received: body },
        { status: 400 }
      );
    }

    // Verifica que el diagnóstico pertenezca a ese dictamen y toma el CIE10
    const dx = await prisma.dictamenDiagnostico.findFirst({
      where: { id: dictamenDiagnosticoId, dictamenId },
      select: { cie10Codigo: true },
    });

    if (!dx?.cie10Codigo) {
      return NextResponse.json(
        { message: "Diagnóstico no encontrado para este dictamen." },
        { status: 404 }
      );
    }

    // Crea vínculo en tabla puente (cie10_deficiencias)
    try {
      await prisma.cie10Deficiencia.create({
        data: {
          cie10Codigo: dx.cie10Codigo,
          deficienciaId,
        },
      });
    } catch (e: any) {
      // Si ya existe (unique), lo dejamos pasar
      if (e?.code !== "P2002") throw e;
    }

    return NextResponse.json({
      ok: true,
      cie10Codigo: dx.cie10Codigo,
      deficienciaId,
    });
  } catch (error: any) {
    console.error("❌ POST vincular deficiencia:", error);
    return NextResponse.json(
      { message: "Error interno", error: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
