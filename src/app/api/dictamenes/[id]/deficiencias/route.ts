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
  if (t === "FORMULA" || t === "FORMULAS") return "FORMULA";
  return t || null;
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
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

    const valorDeficiencia =
      body.valorDeficiencia !== undefined && body.valorDeficiencia !== null
        ? Number(body.valorDeficiencia)
        : null;

    const def = await prisma.deficiencia.findUnique({
      where: { id: deficienciaId },
      select: { id: true, tipoTabla: true, tabla: true, nombre: true, capitulo: true },
    });

    if (!def) return NextResponse.json({ message: "Deficiencia no encontrada" }, { status: 404 });

    const tipoTabla = normalizeTipoTabla(def.tipoTabla);

    let claseId: number | null = null;
    let nervioId: number | null = null;

    if (tipoTabla === "CLASE") {
      const cid = body.claseId !== undefined && body.claseId !== null ? Number(body.claseId) : null;
      if (!cid || isNaN(cid)) {
        return NextResponse.json({ message: "claseId requerido para tipo CLASE" }, { status: 400 });
      }
      if (valorDeficiencia === null) {
        return NextResponse.json({ message: "valorDeficiencia requerido para tipo CLASE" }, { status: 400 });
      }

      // ✅ validar que la clase exista y pertenezca a la deficiencia
      const existe = await prisma.deficienciaClase.findFirst({
        where: { id: cid, deficienciaId },
        select: { id: true },
      });
      if (!existe) {
        return NextResponse.json({ message: "claseId inválido o no pertenece a la deficiencia" }, { status: 400 });
      }

      claseId = cid;
    } else if (tipoTabla === "NERVIOS") {
      const nid = body.nervioId !== undefined && body.nervioId !== null ? Number(body.nervioId) : null;
      if (!nid || isNaN(nid)) {
        return NextResponse.json({ message: "nervioId requerido para tipo NERVIOS" }, { status: 400 });
      }
      if (valorDeficiencia === null) {
        return NextResponse.json({ message: "valorDeficiencia requerido para tipo NERVIOS" }, { status: 400 });
      }

      // ✅ validar que el nervio exista y pertenezca a la deficiencia
      const existe = await prisma.deficienciaNervio.findFirst({
        where: { id: nid, deficienciaId },
        select: { id: true },
      });
      if (!existe) {
        return NextResponse.json({ message: "nervioId inválido o no pertenece a la deficiencia" }, { status: 400 });
      }

      nervioId = nid; // ✅ ahora sí va en nervioId
    } else if (tipoTabla === "FORMULA") {
      if (valorDeficiencia === null) {
        return NextResponse.json({ message: "valorDeficiencia requerido para tipo FORMULA" }, { status: 400 });
      }
      claseId = null;
      nervioId = null;
    } else {
      return NextResponse.json(
        { message: `Tipo no soportado en este paso: ${tipoTabla}` },
        { status: 400 }
      );
    }

    const creado = await prisma.dictamenDeficiencia.create({
      data: { dictamenId, deficienciaId, claseId, nervioId, valorDeficiencia },
      select: {
        id: true,
        dictamenId: true,
        deficienciaId: true,
        claseId: true,
        nervioId: true,
        valorDeficiencia: true,
        creadoEn: true,
        deficiencia: { select: { id: true, tabla: true, nombre: true, capitulo: true, tipoTabla: true } },
      },
    });

    // detalle opcional (clase/nervio)
    let detalle: { tipo: "CLASE" | "NERVIO"; nombre: string } | null = null;

    if (tipoTabla === "CLASE" && creado.claseId) {
      const c = await prisma.deficienciaClase.findUnique({
        where: { id: creado.claseId },
        select: { nombre: true },
      });
      if (c) detalle = { tipo: "CLASE", nombre: c.nombre };
    }

    if (tipoTabla === "NERVIOS" && creado.nervioId) {
      const n = await prisma.deficienciaNervio.findUnique({
        where: { id: creado.nervioId },
        select: { nombre: true },
      });
      if (n) detalle = { tipo: "NERVIO", nombre: n.nombre };
    }

    return NextResponse.json({ item: { ...creado, detalle } }, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error POST /dictamenes/[id]/deficiencias:", error);
    return NextResponse.json({ message: "Error interno", error: error.message }, { status: 500 });
  }
}
