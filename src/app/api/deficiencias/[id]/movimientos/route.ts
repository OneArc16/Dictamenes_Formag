import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deficienciaId = Number(id);

    if (isNaN(deficienciaId)) {
      return NextResponse.json(
        { message: "deficienciaId inválido" },
        { status: 400 }
      );
    }

    const movimientos = await prisma.deficienciaMovimiento.findMany({
      where: { deficienciaId },
      orderBy: [{ orden: "asc" }, { id: "asc" }],
      select: {
        id: true,
        deficienciaId: true,
        tipoMovimiento: true,
        rangoInicial: true,
        rangoFinal: true,
        restriccionA: true,
        restriccionB: true,
        anquilosisA: true,
        anquilosisB: true,
        grupo: true,
        orden: true,
      },
    });

    return NextResponse.json({ movimientos });
  } catch (error: any) {
    console.error("❌ Error GET /api/deficiencias/[id]/movimientos:", error);
    return NextResponse.json(
      { message: "Error interno", error: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
