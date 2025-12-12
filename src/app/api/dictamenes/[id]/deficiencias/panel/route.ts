// src/app/api/dictamenes/[id]/deficiencias/panel/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ← CORRECCIÓN IMPORTANTE
    const dictamenId = Number(id);

    if (isNaN(dictamenId)) {
      return NextResponse.json(
        { message: "ID de dictamen inválido" },
        { status: 400 }
      );
    }

    // ============================
    // 1. Obtener dictamen básico
    // ============================
    const dictamen = await prisma.dictamen.findUnique({
      where: { id: dictamenId },
      select: {
        id: true,
        numeroDictamen: true,
        fechaDictamen: true,
        procedimientoPcl: true,
      },
    });

    if (!dictamen) {
      return NextResponse.json(
        { message: "Dictamen no encontrado" },
        { status: 404 }
      );
    }

    // ===============================================
    // 2. Diagnósticos del dictamen con info del CIE10
    // ===============================================
    const diagnosticos = await prisma.dictamenDiagnostico.findMany({
      where: { dictamenId },
      orderBy: { id: "asc" },
      select: {
        id: true,
        cie10Codigo: true,
        tipo: true,
        cie10: {
          select: {
            codigo: true,
            nombre: true,
          },
        },
      },
    });

    // =====================================================
    // 3. Deficiencias ya asignadas al dictamen con joins
    // =====================================================
    const deficienciasAsignadas = await prisma.dictamenDeficiencia.findMany({
      where: { dictamenId },
      orderBy: { id: "asc" },
      select: {
        id: true,
        valorDeficiencia: true,
        creadoEn: true,

        deficiencia: {
          select: {
            id: true,
            nombre: true,
            tabla: true,
            capitulo: true,
            tipoTabla: true,
          },
        },

        clase: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return NextResponse.json({
      dictamen,
      diagnosticos,
      deficienciasAsignadas,
    });
  } catch (error: any) {
    console.error("❌ Error en PANEL de deficiencias:", error);
    return NextResponse.json(
      { message: "Error interno", error: error.message },
      { status: 500 }
    );
  }
}
