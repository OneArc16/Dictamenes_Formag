import { NextResponse } from "next/server";
import { Prisma, ProcedimientoPcl, ActividadAvdAivd } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Valor = "0.6" | "0.3" | "0.0";

function normalizeValorInput(v: unknown): Valor | null {
  // acepta "0.0" | "0.3" | "0.6" o 0 | 0.3 | 0.6
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  if (!Number.isFinite(n)) return null;
  if (n === 0.6) return "0.6";
  if (n === 0.3) return "0.3";
  if (n === 0) return "0.0";
  return null;
}

function normalizeValorOutput(v: any): Valor {
  // Prisma Decimal -> number -> string con 1 decimal
  const n = Number(v);
  if (n === 0) return "0.0";
  if (n === 0.3) return "0.3";
  // fallback por seguridad
  return "0.6";
}

async function assertProcedimientoB(dictamenId: number) {
  const d = await prisma.dictamen.findUnique({
    where: { id: dictamenId },
    select: { procedimientoPcl: true },
  });

  if (!d) return { ok: false as const, status: 404, error: "Dictamen no encontrado." };

  if (d.procedimientoPcl !== ProcedimientoPcl.B) {
    return {
      ok: false as const,
      status: 409,
      error: "AVD-AIVD no aplica para Procedimiento A.",
    };
  }

  return { ok: true as const };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dictamenId = Number(id);

  if (!Number.isFinite(dictamenId)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const gate = await assertProcedimientoB(dictamenId);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const rows = await prisma.dictamenLimitacionesAvdAivd.findMany({
    where: { dictamenId },
    select: { actividad: true, valor: true },
  });

  // ✅ IMPORTANTÍSIMO: devolver valor como string "0.0" | "0.3" | "0.6"
  const items = rows.map((r) => ({
    actividad: r.actividad,
    valor: normalizeValorOutput(r.valor),
  }));

  return NextResponse.json({ items });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dictamenId = Number(id);

  if (!Number.isFinite(dictamenId)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const gate = await assertProcedimientoB(dictamenId);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const body = await req.json().catch(() => null);

  // Caso 1: bulk { items: [{actividad, valor}] }
  if (body?.items && Array.isArray(body.items)) {
    const items = body.items as Array<{ actividad: ActividadAvdAivd; valor: unknown }>;

    const parsed = items
      .map((it) => ({
        actividad: it.actividad,
        valor: normalizeValorInput(it.valor),
      }))
      .filter((x) => x.actividad && x.valor !== null) as Array<{
      actividad: ActividadAvdAivd;
      valor: Valor;
    }>;

    if (parsed.length === 0) {
      return NextResponse.json({ error: "items inválidos" }, { status: 400 });
    }

    await prisma.$transaction(
      parsed.map((it) =>
        prisma.dictamenLimitacionesAvdAivd.upsert({
          where: {
            dictamenId_actividad: { dictamenId, actividad: it.actividad },
          },
          create: {
            dictamenId,
            actividad: it.actividad,
            valor: new Prisma.Decimal(it.valor),
          },
          update: {
            valor: new Prisma.Decimal(it.valor),
          },
        })
      )
    );

    return NextResponse.json({ ok: true });
  }

  // Caso 2: single { actividad, valor }
  const actividad = body?.actividad as ActividadAvdAivd | undefined;
  const valor = normalizeValorInput(body?.valor);

  if (!actividad || valor === null) {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  await prisma.dictamenLimitacionesAvdAivd.upsert({
    where: { dictamenId_actividad: { dictamenId, actividad } },
    create: { dictamenId, actividad, valor: new Prisma.Decimal(valor) },
    update: { valor: new Prisma.Decimal(valor) },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dictamenId = Number(id);

  if (!Number.isFinite(dictamenId)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const gate = await assertProcedimientoB(dictamenId);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  await prisma.dictamenLimitacionesAvdAivd.deleteMany({ where: { dictamenId } });
  return NextResponse.json({ ok: true });
}
