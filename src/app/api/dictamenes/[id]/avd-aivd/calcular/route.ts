import { NextResponse } from "next/server";
import { Prisma, ProcedimientoPcl, ActividadAvdAivd } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAbilityApi } from "@/lib/auth/api-guards";
import { checkPclAccess } from "@/lib/dictamen/pcl-access";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAbilityApi("dictamen.edit");
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;
  const dictamenId = Number(id);

  if (!Number.isFinite(dictamenId)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }
  const gate = await checkPclAccess(dictamenId, auth.auth, { edit: true, markStarted: true });
  if (!gate.ok) return NextResponse.json({ code: gate.code, error: gate.error }, { status: gate.status });

  const dictamen = await prisma.dictamen.findUnique({
    where: { id: dictamenId },
    select: { procedimientoPcl: true },
  });

  if (!dictamen) {
    return NextResponse.json({ error: "Dictamen no encontrado." }, { status: 404 });
  }

  if (dictamen.procedimientoPcl !== ProcedimientoPcl.B) {
    return NextResponse.json(
      { error: "AVD-AIVD no aplica para Procedimiento A." },
      { status: 409 }
    );
  }

  // 1) Leer qué actividades ya están guardadas
  const existentes = await prisma.dictamenLimitacionesAvdAivd.findMany({
    where: { dictamenId },
    select: { actividad: true },
  });

  const setExistentes = new Set(existentes.map((e) => e.actividad));
  const todas = Object.values(ActividadAvdAivd);

  const faltantes = todas.filter((act) => !setExistentes.has(act));

  // 2) Autocompletar faltantes con 0.0 (si hay)
  if (faltantes.length > 0) {
    await prisma.dictamenLimitacionesAvdAivd.createMany({
      data: faltantes.map((actividad) => ({
        dictamenId,
        actividad,
        valor: new Prisma.Decimal("0.0"),
      })),
      skipDuplicates: true,
    });
  }

  // 3) Sumar
  const agg = await prisma.dictamenLimitacionesAvdAivd.aggregate({
    where: { dictamenId },
    _sum: { valor: true },
    _count: { _all: true },
  });

  const total = agg._sum.valor ?? new Prisma.Decimal(0);

  // 4) Guardar en dictamenes.totalCap1
  await prisma.dictamen.update({
    where: { id: dictamenId },
    data: { totalCap1: total },
  });

  return NextResponse.json({
    ok: true,
    totalCap1: total.toString(),
    diligenciadas: agg._count._all,
    autocompletadas: faltantes.length,
  });
}
