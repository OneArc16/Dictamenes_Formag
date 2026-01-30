// src/app/api/dictamenes/[id]/deficiencias/panel/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function normalizeTipoTabla(tipo: string | null | undefined) {
  const t = (tipo ?? "").trim().toUpperCase();
  if (t === "CLASE" || t === "CLASES") return "CLASE";
  if (t === "NERVIO" || t === "NERVIOS") return "NERVIOS";
  if (t === "MOVIMIENTO" || t === "MOVIMIENTOS") return "MOVIMIENTO";
  if (t === "FORMULA" || t === "FORMULAS") return "FORMULA";
  return t || null;
}

function toNumberOrNull(v: any): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(String(v).replace("%", "").trim());
  return Number.isFinite(n) ? n : null;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> } // ✅ params es Promise en tu Next
) {
  try {
    const { id } = await context.params; // ✅ FIX DEL ERROR
    const dictamenId = Number(id);

    if (!Number.isFinite(dictamenId) || dictamenId <= 0) {
      return NextResponse.json(
        { ok: false, error: "dictamenId inválido" },
        { status: 400 }
      );
    }

    const dictamen = await prisma.dictamen.findUnique({
      where: { id: dictamenId },
      select: {
        id: true,
        procedimientoPcl: true,
        numeroDictamen: true,
        fechaDictamen: true,

        // ✅ Totales
        totalTitulo1: true,
        totalCap1: true,

        // ✅ Capítulo 2
        totalCap2: true,
        claseLimitacionLaboral: true,
      },
    });

    if (!dictamen) {
      return NextResponse.json(
        { ok: false, error: "Dictamen no encontrado" },
        { status: 404 }
      );
    }

    const diagnosticos = await prisma.dictamenDiagnostico.findMany({
      where: { dictamenId },
      orderBy: { id: "asc" },
      select: {
        id: true,
        cie10Codigo: true,
        tipo: true,
        cie10: { select: { codigo: true, nombre: true } },
      },
    });

    const deficienciasAsignadasRaw = await prisma.dictamenDeficiencia.findMany({
      where: { dictamenId },
      orderBy: { creadoEn: "desc" },
      select: {
        id: true,
        creadoEn: true,
        valorDeficiencia: true,
        claseId: true,
        deficiencia: {
          select: {
            id: true,
            nombre: true,
            tabla: true,
            capitulo: true,
            tipoTabla: true,
          },
        },
        clase: { select: { id: true, nombre: true } },
      },
    });

    // 🔹 Resolver NERVIOS usando claseId (id_clase) + tabla nervios
    const nervioIds = deficienciasAsignadasRaw
      .filter(
        (x) =>
          normalizeTipoTabla(x.deficiencia?.tipoTabla) === "NERVIOS" && x.claseId
      )
      .map((x) => x.claseId!) as number[];

    const nervios = nervioIds.length
      ? await prisma.deficienciaNervio.findMany({
          where: { id: { in: nervioIds } },
          select: { id: true, nombre: true },
        })
      : [];

    const nervioMap = new Map(nervios.map((n) => [n.id, n]));

    const deficienciasAsignadas = deficienciasAsignadasRaw.map((x) => {
      const tipo = normalizeTipoTabla(x.deficiencia?.tipoTabla);

      const nervio =
        tipo === "NERVIOS" && x.claseId && nervioMap.has(x.claseId)
          ? { id: x.claseId, nombre: nervioMap.get(x.claseId)!.nombre }
          : null;

      const detalle =
        x.clase?.nombre
          ? { tipo: "CLASE" as const, nombre: x.clase.nombre }
          : nervio?.nombre
          ? { tipo: "NERVIO" as const, nombre: nervio.nombre }
          : null;

      return {
        id: x.id,
        creadoEn: x.creadoEn,
        valorDeficiencia:
          x.valorDeficiencia === null || x.valorDeficiencia === undefined
            ? null
            : Number(x.valorDeficiencia),
        deficiencia: x.deficiencia,
        clase: x.clase ?? null,
        nervio,
        detalle,
      };
    });

    // Flags diagnóstico -> tiene deficiencia relacionada
    const diagCodigos = diagnosticos.map((d) => d.cie10Codigo);
    const defIdsAsignadas = Array.from(
      new Set(deficienciasAsignadas.map((x) => x.deficiencia.id))
    );

    let codigosConDef: Set<string> = new Set();

    if (diagCodigos.length > 0 && defIdsAsignadas.length > 0) {
      const links = await prisma.cie10Deficiencia.findMany({
        where: {
          cie10Codigo: { in: diagCodigos },
          deficienciaId: { in: defIdsAsignadas },
        },
        select: { cie10Codigo: true },
      });

      codigosConDef = new Set(links.map((l) => l.cie10Codigo));
    }

    const diagnosticosConFlag = diagnosticos.map((d) => ({
      ...d,
      hasDeficiencia: codigosConDef.has(d.cie10Codigo),
    }));

    const dictamenPayload = {
      ...dictamen,
      totalTitulo1: toNumberOrNull((dictamen as any).totalTitulo1),
      totalCap1: toNumberOrNull((dictamen as any).totalCap1),
      totalCap2: toNumberOrNull((dictamen as any).totalCap2),
      claseLimitacionLaboral: (dictamen as any).claseLimitacionLaboral ?? null,
    };

    return NextResponse.json({
      ok: true,
      dictamen: dictamenPayload,
      diagnosticos: diagnosticosConFlag,
      deficienciasAsignadas,
    });
  } catch (error: any) {
    console.error("❌ Error GET /dictamenes/[id]/deficiencias/panel:", error);
    return NextResponse.json(
      { ok: false, error: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
