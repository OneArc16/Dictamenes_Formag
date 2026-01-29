import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Body = { procedimientoPcl?: "A" | "B" };

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const dictamenId = Number(id);

    if (!Number.isFinite(dictamenId)) {
      return NextResponse.json({ message: "id inválido" }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as Body;
    const proc = body?.procedimientoPcl;

    if (proc !== "A" && proc !== "B") {
      return NextResponse.json(
        { message: "procedimientoPcl inválido (A | B)" },
        { status: 400 }
      );
    }

    const exists = await prisma.dictamen.findUnique({
      where: { id: dictamenId },
      select: { id: true },
    });

    if (!exists) {
      return NextResponse.json({ message: "Dictamen no encontrado" }, { status: 404 });
    }

    const updated = await prisma.dictamen.update({
      where: { id: dictamenId },
      data: { procedimientoPcl: proc },
      select: { id: true, procedimientoPcl: true },
    });

    return NextResponse.json({ dictamen: updated });
  } catch (error: any) {
    console.error("❌ PATCH /dictamenes/[id]/procedimiento:", error);
    return NextResponse.json(
      { message: "Error interno", error: error?.message },
      { status: 500 }
    );
  }
}
