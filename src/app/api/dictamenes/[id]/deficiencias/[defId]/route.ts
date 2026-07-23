import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAbilityApi } from "@/lib/auth/api-guards";
import { checkPclAccess } from "@/lib/dictamen/pcl-access";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string; defId: string }> }
) {
  try {
    const auth = await requireAbilityApi("dictamen.edit");
    if (!auth.ok) return NextResponse.json({ message: auth.error }, { status: auth.status });
    const { id, defId } = await context.params;

    const dictamenId = Number(id);
    const itemId = Number(defId);

    if (isNaN(dictamenId) || isNaN(itemId)) {
      return NextResponse.json({ message: "Parámetros inválidos" }, { status: 400 });
    }
    const gate = await checkPclAccess(dictamenId, auth.auth, { edit: true, markStarted: true });
    if (!gate.ok) return NextResponse.json({ code: gate.code, message: gate.error }, { status: gate.status });

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
