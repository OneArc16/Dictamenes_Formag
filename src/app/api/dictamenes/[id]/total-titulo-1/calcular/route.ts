// src/app/api/dictamenes/[id]/total-titulo-1/calcular/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { requireAbilityApi } from "@/lib/auth/api-guards";
import { checkPclAccess } from "@/lib/dictamen/pcl-access";

function toNumberPercent(value: any): number | null {
  if (value === null || value === undefined) return null;

  // Prisma.Decimal
  if (value instanceof Prisma.Decimal) {
    const n = Number(value.toString());
    return Number.isFinite(n) ? n : null;
  }

  // number
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  // string
  const s = String(value).trim();
  if (!s) return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

// Procedimiento B: combinar sucesivamente (ordenado desc)
// Fórmula: A + ((50 - A) * B) / 50
function combinarB(valores: number[]): number {
  if (valores.length === 0) return 0;

  const sorted = [...valores].sort((a, b) => b - a);
  let total = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const b = sorted[i];
    total = total + ((50 - total) * b) / 50;

    if (total >= 50) {
      total = 50;
      break;
    }
  }

  return total;
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

    if (!Number.isFinite(dictamenId)) {
      return NextResponse.json(
        { message: "dictamenId inválido" },
        { status: 400 }
      );
    }
    const gate = await checkPclAccess(dictamenId, auth.auth, { edit: true, markStarted: true });
    if (!gate.ok) return NextResponse.json({ code: gate.code, message: gate.error }, { status: gate.status });

    const dictamen = await prisma.dictamen.findUnique({
      where: { id: dictamenId },
      select: { id: true, procedimientoPcl: true },
    });

    if (!dictamen) {
      return NextResponse.json(
        { message: "Dictamen no encontrado" },
        { status: 404 }
      );
    }

    const rows = await prisma.dictamenDeficiencia.findMany({
      where: { dictamenId },
      select: { valorDeficiencia: true },
    });

    const valores = rows
      .map((r) => toNumberPercent(r.valorDeficiencia))
      .filter((n): n is number => n !== null);

    let total = 0;

    if (dictamen.procedimientoPcl === "A") {
      total = valores.reduce((acc, n) => acc + n, 0);
      if (total > 75) total = 75;
    } else {
      total = combinarB(valores);
      if (total > 50) total = 50;
    }

    total = round2(total);

    const updated = await prisma.dictamen.update({
      where: { id: dictamenId },
      data: { totalTitulo1: total },
      select: { id: true, procedimientoPcl: true, totalTitulo1: true },
    });

    return NextResponse.json({
      message: "Total título 1 calculado",
      dictamen: updated,
      valoresUsados: valores.sort((a, b) => b - a),
    });
  } catch (error: any) {
    console.error("❌ Error calculando totalTitulo1:", error);
    return NextResponse.json(
      { message: "Error interno", error: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
