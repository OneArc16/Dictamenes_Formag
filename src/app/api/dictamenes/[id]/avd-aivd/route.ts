import { NextResponse } from "next/server";
import { Prisma, ActividadAvdAivd, ProcedimientoPcl } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// -------------------------
// Helpers de validación
// -------------------------
function isActividad(value: unknown): value is ActividadAvdAivd {
  return (
    typeof value === "string" &&
    (Object.values(ActividadAvdAivd) as string[]).includes(value)
  );
}

function isValor(value: unknown): value is string {
  return typeof value === "string" && ["0.6", "0.3", "0.0"].includes(value);
}

async function getDictamenProcedimiento(dictamenId: number) {
  return prisma.dictamen.findUnique({
    where: { id: dictamenId },
    select: { procedimientoPcl: true },
  });
}

async function assertDictamenExists(dictamenId: number) {
  const d = await getDictamenProcedimiento(dictamenId);
  if (!d) {
    return { ok: false as const, status: 404, message: "Dictamen no encontrado." };
  }
  return { ok: true as const, procedimientoPcl: d.procedimientoPcl };
}

async function assertProcedimientoB(dictamenId: number) {
  const res = await assertDictamenExists(dictamenId);
  if (!res.ok) return res;

  if (res.procedimientoPcl !== ProcedimientoPcl.B) {
    return {
      ok: false as const,
      status: 409,
      message: "AVD-AIVD no aplica para Procedimiento A.",
    };
  }

  return { ok: true as const };
}

// -------------------------
// GET: listar valores guardados
// -------------------------
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dictamenId = Number(id);

  if (!Number.isFinite(dictamenId)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  // Validar que el dictamen exista (para no listar basura)
  const exists = await assertDictamenExists(dictamenId);
  if (!exists.ok) {
    return NextResponse.json({ error: exists.message }, { status: exists.status });
  }

  const items = await prisma.dictamenLimitacionesAvdAivd.findMany({
    where: { dictamenId },
    select: { actividad: true, valor: true },
    orderBy: { actividad: "asc" }, // opcional
  });

  return NextResponse.json({
    items: items.map((i) => ({
      actividad: i.actividad,
      valor: i.valor.toString(),
    })),
  });
}

// -------------------------
// PUT: upsert (uno o muchos)
// -------------------------
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dictamenId = Number(id);

  if (!Number.isFinite(dictamenId)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  // ✅ Solo B puede modificar AVD-AIVD
  const guard = await assertProcedimientoB(dictamenId);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.message }, { status: guard.status });
  }

  const body = await req.json().catch(() => null);

  // bulk: { items: [{ actividad, valor }] }
  if (body?.items && Array.isArray(body.items)) {
    const items = body.items as Array<{ actividad: unknown; valor: unknown }>;

    for (const it of items) {
      if (!isActividad(it.actividad) || !isValor(it.valor)) {
        return NextResponse.json(
          { error: "Payload inválido en items" },
          { status: 400 }
        );
      }
    }

    await prisma.$transaction(
      items.map((it) =>
        prisma.dictamenLimitacionesAvdAivd.upsert({
          where: {
            dictamenId_actividad: {
              dictamenId,
              actividad: it.actividad as ActividadAvdAivd,
            },
          },
          create: {
            dictamenId,
            actividad: it.actividad as ActividadAvdAivd,
            valor: new Prisma.Decimal(it.valor as string),
          },
          update: {
            valor: new Prisma.Decimal(it.valor as string),
          },
        })
      )
    );

    return NextResponse.json({ ok: true });
  }

  // single: { actividad, valor }
  const actividad = body?.actividad;
  const valor = body?.valor;

  if (!isActividad(actividad) || !isValor(valor)) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  await prisma.dictamenLimitacionesAvdAivd.upsert({
    where: {
      dictamenId_actividad: {
        dictamenId,
        actividad,
      },
    },
    create: {
      dictamenId,
      actividad,
      valor: new Prisma.Decimal(valor),
    },
    update: {
      valor: new Prisma.Decimal(valor),
    },
  });

  return NextResponse.json({ ok: true });
}

// -------------------------
// DELETE: borra todos los registros del dictamen (limpiar)
// -------------------------
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dictamenId = Number(id);

  if (!Number.isFinite(dictamenId)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  // ✅ Solo B puede limpiar AVD-AIVD
  const guard = await assertProcedimientoB(dictamenId);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.message }, { status: guard.status });
  }

  await prisma.dictamenLimitacionesAvdAivd.deleteMany({
    where: { dictamenId },
  });

  return NextResponse.json({ ok: true });
}
