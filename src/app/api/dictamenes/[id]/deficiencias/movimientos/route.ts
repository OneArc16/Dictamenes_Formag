import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAbilityApi } from "@/lib/auth/api-guards";
import { checkPclAccess } from "@/lib/dictamen/pcl-access";

type Body = {
  deficienciaId: number;
  modo: "RESTRICCION" | "ANQUILOSIS";
  valorDeficiencia: number; // ✅ ahora es libre y obligatorio
  items: Array<{
    tipoMovimiento: string; // ej: "Flexión o elevación anterior"
    movimientoId: number;   // id de DeficienciaMovimiento
  }>;
};

function toNumber(v: any): number | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s.replace(",", "."));
  return Number.isNaN(n) ? null : n;
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAbilityApi("dictamen.edit");
    if (!auth.ok) return NextResponse.json({ message: auth.error }, { status: auth.status });
    const { id } = await context.params;
    const dictamenId = Number(id);

    if (isNaN(dictamenId)) {
      return NextResponse.json({ message: "dictamenId inválido" }, { status: 400 });
    }
    const gate = await checkPclAccess(dictamenId, auth.auth, { edit: true, markStarted: true });
    if (!gate.ok) return NextResponse.json({ code: gate.code, message: gate.error }, { status: gate.status });

    const body = (await req.json()) as Body;

    if (!body?.deficienciaId || typeof body.deficienciaId !== "number") {
      return NextResponse.json({ message: "deficienciaId es requerido" }, { status: 400 });
    }
    if (body.modo !== "RESTRICCION" && body.modo !== "ANQUILOSIS") {
      return NextResponse.json({ message: "modo inválido" }, { status: 400 });
    }

    // ✅ valorDeficiencia libre pero obligatorio
    const valorLibre = toNumber(body.valorDeficiencia);
    if (valorLibre === null) {
      return NextResponse.json(
        { message: "valorDeficiencia es requerido y debe ser numérico" },
        { status: 400 }
      );
    }

    // ✅ mínimo 1 movimiento seleccionado
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ message: "items es requerido (mínimo 1)" }, { status: 400 });
    }

    // Validar duplicados por tipoMovimiento
    const tipos = body.items.map((x) => (x.tipoMovimiento ?? "").trim()).filter(Boolean);
    if (tipos.length !== body.items.length) {
      return NextResponse.json({ message: "Cada item debe tener tipoMovimiento" }, { status: 400 });
    }
    const uniqueTipos = new Set(tipos.map((t) => t.toLowerCase()));
    if (uniqueTipos.size !== tipos.length) {
      return NextResponse.json(
        { message: "No se permite repetir tipoMovimiento dentro del mismo guardado" },
        { status: 400 }
      );
    }

    // Dictamen (para saber Procedimiento A/B)
    const dictamen = await prisma.dictamen.findUnique({
      where: { id: dictamenId },
      select: { id: true, procedimientoPcl: true },
    });

    if (!dictamen) {
      return NextResponse.json({ message: "Dictamen no encontrado" }, { status: 404 });
    }

    // Deficiencia existe y es MOVIMIENTO
    const def = await prisma.deficiencia.findUnique({
      where: { id: body.deficienciaId },
      select: { id: true, tipoTabla: true },
    });

    if (!def) {
      return NextResponse.json({ message: "Deficiencia no encontrada" }, { status: 404 });
    }

    const tipoTabla = String(def.tipoTabla ?? "").trim().toUpperCase();
    if (tipoTabla !== "MOVIMIENTO" && tipoTabla !== "MOVIMIENTOS") {
      return NextResponse.json(
        { message: `La deficiencia no es tipo MOVIMIENTO (es: ${def.tipoTabla ?? "—"})` },
        { status: 400 }
      );
    }

    const movimientoIds = body.items.map((x) => Number(x.movimientoId)).filter((n) => !isNaN(n));
    if (movimientoIds.length !== body.items.length) {
      return NextResponse.json({ message: "movimientoId inválido en items" }, { status: 400 });
    }

    // Traer movimientos y validar que pertenezcan a la deficiencia
    const movimientos = await prisma.deficienciaMovimiento.findMany({
      where: {
        id: { in: movimientoIds },
        deficienciaId: body.deficienciaId,
      },
      select: {
        id: true,
        deficienciaId: true,
        tipoMovimiento: true,
        restriccionA: true,
        restriccionB: true,
        anquilosisA: true,
        anquilosisB: true,
      },
    });

    if (movimientos.length !== movimientoIds.length) {
      return NextResponse.json(
        { message: "Uno o más movimientos no existen o no pertenecen a la deficiencia" },
        { status: 400 }
      );
    }

    const movById = new Map<number, typeof movimientos[number]>();
    movimientos.forEach((m) => movById.set(m.id, m));

    const isA = dictamen.procedimientoPcl === "A";

    // Guardar snapshot de valor por movimiento (según modo + A/B)
    const detalle = body.items.map((it) => {
      const mov = movById.get(it.movimientoId)!;

      const valorRaw =
        body.modo === "RESTRICCION"
          ? (isA ? mov.restriccionA : mov.restriccionB)
          : (isA ? mov.anquilosisA : mov.anquilosisB);

      return {
        tipoMovimiento: it.tipoMovimiento.trim(),
        movimientoId: it.movimientoId,
        modo: body.modo,
        valor: valorRaw,
      };
    });

    const created = await prisma.$transaction(async (tx) => {
      // ✅ valorDeficiencia = el que escribe el médico
      const dictamenDef = await tx.dictamenDeficiencia.create({
        data: {
          dictamenId,
          deficienciaId: body.deficienciaId,
          valorDeficiencia: valorLibre,
        },
        select: { id: true },
      });

      await tx.dictamenDeficienciaMovimiento.createMany({
        data: detalle.map((d) => ({
          dictamenDeficienciaId: dictamenDef.id,
          movimientoId: d.movimientoId,
          tipoMovimiento: d.tipoMovimiento,
          modo: d.modo as any,
          valor: d.valor as any,
        })),
      });

      return dictamenDef;
    });

    return NextResponse.json({
      message: "MOVIMIENTO guardado",
      dictamenDeficienciaId: created.id,
      valorDeficiencia: valorLibre,
      modo: body.modo,
      procedimiento: dictamen.procedimientoPcl,
      itemsGuardados: detalle.length,
    });
  } catch (error: any) {
    console.error("❌ Error POST /api/dictamenes/[id]/deficiencias/movimientos:", error);
    return NextResponse.json(
      { message: "Error interno", error: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
