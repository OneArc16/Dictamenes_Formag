import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deficienciaId = Number(id);

    if (isNaN(deficienciaId)) {
      return NextResponse.json({ message: "deficienciaId inválido" }, { status: 400 });
    }

    const nervios = await prisma.deficienciaNervio.findMany({
      where: { deficienciaId },
      orderBy: [{ orden: "asc" }, { id: "asc" }],
      select: {
        id: true,
        nombre: true,
        orden: true,
        motorA: true,
        sensitivoA: true,
        mixtoA: true,
        motorB: true,
        sensitivoB: true,
        mixtoB: true,
      },
    });

    return NextResponse.json({ nervios }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error GET /deficiencias/[id]/nervios:", error);
    return NextResponse.json(
      { message: "Error interno", error: error.message },
      { status: 500 }
    );
  }
}
