// src/app/api/dictamenes/[id]/diagnosticos/[idDiag]/deficiencias-opciones/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAbilityApi } from "@/lib/auth/api-guards";
import { checkPclAccess } from "@/lib/dictamen/pcl-access";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string; idDiag: string }> }
) {
  try {
    const auth = await requireAbilityApi("dictamen.read");
    if (!auth.ok) return NextResponse.json({ message: auth.error }, { status: auth.status });
    const { id, idDiag } = await context.params;

    const dictamenId = Number(id);
    const diagId = Number(idDiag);

    if (isNaN(dictamenId) || isNaN(diagId)) {
      return NextResponse.json(
        { message: "Parámetros inválidos" },
        { status: 400 }
      );
    }
    const gate = await checkPclAccess(dictamenId, auth.auth, {
      allowHistoricalClosed: true,
    });
    if (!gate.ok) return NextResponse.json({ code: gate.code, message: gate.error }, { status: gate.status });

    // ================================
    // 1. Obtener diagnóstico y su CIE10
    // ================================
    const diagnostico = await prisma.dictamenDiagnostico.findUnique({
      where: { id: diagId },
      select: {
        cie10Codigo: true,
        cie10: {
          select: {
            codigo: true,
            nombre: true,
          },
        },
      },
    });

    if (!diagnostico) {
      return NextResponse.json(
        { message: "Diagnóstico no encontrado" },
        { status: 404 }
      );
    }

    const cie10Codigo = diagnostico.cie10Codigo;

    // =======================================
    // 2. Buscar deficiencias asociadas al CIE10
    // =======================================
    const relaciones = await prisma.cie10Deficiencia.findMany({
      where: { cie10Codigo },
      select: {
        deficiencia: {
          select: {
            id: true,
            nombre: true,
            tabla: true,
            capitulo: true,
            tipoTabla: true,
          },
        },
      },
      orderBy: {
        deficienciaId: "asc",
      },
    });

    // Transformamos en una lista limpia:
    const opciones = relaciones.map((r) => ({
      id: r.deficiencia.id,
      nombre: r.deficiencia.nombre,
      tabla: r.deficiencia.tabla,
      capitulo: r.deficiencia.capitulo,
      tipoTabla: r.deficiencia.tipoTabla,
    }));

    return NextResponse.json({
      cie10: diagnostico.cie10,
      opciones,
    });
  } catch (error: any) {
    console.error("❌ Error en deficiencias-opciones:", error);
    return NextResponse.json(
      { message: "Error interno", error: error.message },
      { status: 500 }
    );
  }
}
