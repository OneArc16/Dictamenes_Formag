// app/admisiones/dictamenes/[id]/page.tsx
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import AppNav from '@/components/AppNav';
import ReabrirDictamenButton from '@/components/dictamen/ReabrirDictamenButton';

import { DictamenFormLayout } from '@/components/dictamen/DictamenFormLayout';
import DictamenLeftPanel from '@/components/dictamen/DictamenLeftPanel';
import DictamenCenterPanel from '@/components/dictamen/DictamenCenterPanel';
import DictamenRightPanel from '@/components/dictamen/DictamenRightPanel';

async function fetchDictamen(id: number) {
  const res = await fetch(`/api/dictamenes/${id}`, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok || !data?.ok) throw new Error(data?.error || 'Error consultando dictamen');
  return data as {
    ok: true;
    readOnly?: boolean;
    dictamen: any;
  };
}

// Formato: ddMMyyyy + id en 9 dígitos -> 01012025123456789
function buildNumeroDictamen(id: number, fecha: string | null) {
  if (!fecha) return '';
  const [yyyy, mm, dd] = fecha.split('-'); // YYYY-MM-DD
  const datePart = `${dd}${mm}${yyyy}`;
  const consecutivo = String(id).padStart(9, '0');
  return `${datePart}${consecutivo}`;
}

export default function AdmisionesDictamenDetallePage() {
  const params = useParams();
  const id = Number((params as any)?.id);

  const { data, isLoading, error } = useQuery({
    queryKey: ['dictamen', id],
    queryFn: () => fetchDictamen(id),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 10_000,
  });

  // ✅ En admisiones siempre es solo lectura (y además tu API ya manda readOnly)
  const readOnly = true;

  const d = data?.dictamen;

  const procedimientoPcl: 'A' | 'B' = (d?.procedimientoPcl ?? 'A') as any;

  const rawFecha = d?.fechaDictamen ?? '';
  const fechaDictamen =
    rawFecha && typeof rawFecha === 'string' && rawFecha.length >= 10
      ? rawFecha.substring(0, 10)
      : '';

  const numeroDictamen =
    d?.numeroDictamen ?? buildNumeroDictamen(Number(d?.id ?? id), fechaDictamen || null);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav title="Módulo de Admisiones" />

      <main className="px-4 py-4 space-y-4 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Detalle dictamen</h1>
            <p className="text-xs text-slate-500">Vista de admisiones (solo lectura)</p>
          </div>

          <div className="flex items-center gap-2">
            {Number.isFinite(id) && id > 0 && <ReabrirDictamenButton dictamenId={id} />}

            <Link
              href="/admisiones"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Volver
            </Link>
          </div>
        </div>

        <div className="p-4 bg-white border shadow-sm border-slate-200 rounded-xl">
          {!Number.isFinite(id) || id <= 0 ? (
            <p className="text-sm text-rose-600">ID inválido</p>
          ) : isLoading ? (
            <p className="text-sm text-slate-500">Cargando dictamen…</p>
          ) : error ? (
            <p className="text-sm text-rose-600">{(error as any)?.message ?? 'Error'}</p>
          ) : (
            <>
              {/* ✅ aviso solo lectura */}
              <div className="px-4 py-2 mb-3 text-xs border rounded-xl border-amber-200 bg-amber-50 text-amber-800">
                Estás en modo solo lectura. No puedes editar información del dictamen.
              </div>

              {/* ✅ MISMA VISTA DEL MÉDICO pero bloqueada (gris + sin interacción) */}
              <div className="pointer-events-none opacity-80">
                <DictamenFormLayout
                  left={
                    <DictamenLeftPanel
                      dictamenId={d.id}
                      estado={d.estado}
                      docente={d.docente}
                      medico={d.medico}
                      numeroDictamen={numeroDictamen}
                      fechaDictamen={fechaDictamen}
                      onChangeFecha={() => {}}
                      procedimientoPcl={procedimientoPcl}
                      onChangeProcedimiento={() => {}}
                      onEditDocente={() => {}}
                    />
                  }
                  center={
                    <DictamenCenterPanel
                      dictamen={{
                        id: d.id,
                        antecedentesClinicos: d.antecedentesClinicos ?? '',
                        condicionSalud: d.condicionSalud ?? '',
                        descripcionHallazgos: d.descripcionHallazgos ?? '',
                        diagnosticos: d.diagnosticos ?? [],
                      }}
                      procedimientoPcl={procedimientoPcl}
                      fechaDictamen={fechaDictamen}
                    />
                  }
                  right={<DictamenRightPanel />}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
