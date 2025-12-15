import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Body = {
  deficienciaId: number;
  claseId?: number | null;
  nervioId?: number | null;
  valorDeficiencia?: number | null;
};

function normalizeTipoTabla(tipo: string | null | undefined) {
  const t = (tipo ?? "").trim().toUpperCase();
  if (t === "CLASE" || t === "CLASES") return "CLASE";
  if (t === "NERVIO" || t === "NERVIOS") return "NERVIOS";
  if (t === "MOVIMIENTO" || t === "MOVIMIENTOS") return "MOVIMIENTO";
  return t || null;
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const dictamenId = Number(id);

    if (isNaN(dictamenId)) {
      return NextResponse.json({ message: "dictamenId inválido" }, { status: 400 });
    }

    const body = (await req.json()) as Body;

    const deficienciaId = Number(body.deficienciaId);
    if (isNaN(deficienciaId)) {
      return NextResponse.json({ message: "deficienciaId inválido" }, { status: 400 });
    }

    const claseId =
      body.claseId !== undefined && body.claseId !== null ? Number(body.claseId) : null;
    const nervioId =
      body.nervioId !== undefined && body.nervioId !== null ? Number(body.nervioId) : null;

    const valorDeficiencia =
      body.valorDeficiencia !== undefined && body.valorDeficiencia !== null
        ? Number(body.valorDeficiencia)
        : null;

    const [dictamen, deficiencia] = await Promise.all([
      prisma.dictamen.findUnique({ where: { id: dictamenId }, select: { id: true } }),
      prisma.deficiencia.findUnique({
        where: { id: deficienciaId },
        select: { id: true, tipoTabla: true },
      }),
    ]);

    if (!dictamen) return NextResponse.json({ message: "Dictamen no encontrado" }, { status: 404 });
    if (!deficiencia)
      return NextResponse.json({ message: "Deficiencia no encontrada" }, { status: 404 });

    const tipoTabla = normalizeTipoTabla(deficiencia.tipoTabla);

    if (tipoTabla === "CLASE") {
      if (!claseId || isNaN(claseId)) {
        return NextResponse.json({ message: "claseId requerido para tipo CLASE" }, { status: 400 });
      }

      const creado = await prisma.dictamenDeficiencia.create({
        data: { dictamenId, deficienciaId, claseId, valorDeficiencia },
        select: {
          id: true,
          creadoEn: true,
          valorDeficiencia: true,
          deficiencia: { select: { id: true, tabla: true, nombre: true, capitulo: true, tipoTabla: true } },
          clase: { select: { id: true, nombre: true } },
          nervio: { select: { id: true, nombre: true } },
        },
      });

      return NextResponse.json({ item: creado }, { status: 201 });
    }

    if (tipoTabla === "NERVIOS") {
      if (!nervioId || isNaN(nervioId)) {
        return NextResponse.json({ message: "nervioId requerido para tipo NERVIOS" }, { status: 400 });
      }

      const creado = await prisma.dictamenDeficiencia.create({
        data: { dictamenId, deficienciaId, nervioId, valorDeficiencia },
        select: {
          id: true,
          creadoEn: true,
          valorDeficiencia: true,
          deficiencia: { select: { id: true, tabla: true, nombre: true, capitulo: true, tipoTabla: true } },
          clase: { select: { id: true, nombre: true } },
          nervio: { select: { id: true, nombre: true } },
        },
      });

      return NextResponse.json({ item: creado }, { status: 201 });
    }

    return NextResponse.json(
      { message: `Tipo de tabla no soportado en este paso: ${tipoTabla}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("❌ Error POST /dictamenes/[id]/deficiencias:", error);
    return NextResponse.json(
      { message: "Error interno", error: error.message },
      { status: 500 }
    );
  }
}
