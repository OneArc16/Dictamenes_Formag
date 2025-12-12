// src/app/api/deficiencias/[id]/clases/route.ts
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
        { message: "ID de deficiencia inválido" },
        { status: 400 }
      );
    }

    const clases = await prisma.deficienciaClase.findMany({
      where: { deficienciaId },
      orderBy: { orden: "asc" },
      select: {
        id: true,
        nombre: true,
        procedimientoA: true,
        procedimientoB: true,
        orden: true,
      },
    });

    return NextResponse.json({ clases });
  } catch (error: any) {
    console.error("❌ Error en GET /deficiencias/[id]/clases:", error);
    return NextResponse.json(
      { message: "Error interno", error: error.message },
      { status: 500 }
    );
  }
}
