import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();

    if (q.length < 2) {
      return NextResponse.json({ items: [] });
    }

    const items = await prisma.deficiencia.findMany({
      where: {
        OR: [
          { nombre: { contains: q, mode: "insensitive" } },
          { tabla: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 30,
      orderBy: [{ tabla: "asc" }, { id: "asc" }],
      select: {
        id: true,
        nombre: true,
        tabla: true,
        capitulo: true,
        tipoTabla: true,
      },
    });

    return NextResponse.json({ items });
  } catch (e: any) {
    console.error("❌ GET /api/deficiencias/buscar", e);
    return NextResponse.json(
      { message: "Error interno", error: e.message },
      { status: 500 }
    );
  }
}
