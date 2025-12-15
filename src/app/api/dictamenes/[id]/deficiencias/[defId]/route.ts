import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string; defId: string }> }
) {
  try {
    const { id, defId } = await context.params;

    const dictamenId = Number(id);
    const itemId = Number(defId);

    if (isNaN(dictamenId) || isNaN(itemId)) {
      return NextResponse.json({ message: "Parámetros inválidos" }, { status: 400 });
    }

    const result = await prisma.dictamenDeficiencia.deleteMany({
      where: { id: itemId, dictamenId },
    });

    if (result.count === 0) {
      return NextResponse.json({ message: "Registro no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error DELETE /dictamenes/[id]/deficiencias/[defId]:", error);
    return NextResponse.json({ message: "Error interno", error: error.message }, { status: 500 });
  }
}
