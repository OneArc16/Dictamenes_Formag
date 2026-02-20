'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import TabAntecedentes from '@/components/dictamen/tabs/TabAntecedentes';
import TabSustentacion from '@/components/dictamen/tabs/TabSustentacion';
import TabDiagnosticos from '@/components/dictamen/tabs/TabDiagnosticos';
import TabDeficiencias from '@/components/dictamen/tabs/TabDeficiencias';
import TabAvdAivd from '@/components/dictamen/tabs/TabAvdAivd';
import { TituloIICapitulo2Tab } from '@/components/dictamen/tabs/TituloIICapitulo2Tab';
import TabTituloIII from '@/components/dictamen/tabs/tabTituloIII';

import { useCie10Options } from '@/hooks/useCie10Options';

type DictamenEstado = 'PENDIENTE' | 'REABIERTO' | 'CERRADO';
type TipoEvento = 'ENFERMEDAD' | 'ACCIDENTE';
type OrigenEvento = 'LABORAL' | 'COMUN';

type TabId =
  | 'ANTECEDENTES'
  | 'DIAGNOSTICOS'
  | 'DEFICIENCIAS'
  | 'AVD_AIVD'
  | 'CAPITULO_2'
  | 'TITULO_III'
  | 'SUSTENTACION';

type DictamenCenterPanelProps = {
  readOnly?: boolean;
  serverVersion?: string;
  dictamen: {
    id: number;
    estado?: DictamenEstado | null;

    antecedentesClinicos: string | null;
    condicionSalud: string | null;
    descripcionHallazgos: string | null;

    claseLimitacionLaboral?: 'I' | 'II' | 'III' | 'IV' | null;
    totalCap2?: number | null;

    diagnosticos?: {
      cie10Codigo: string;
      tipo: 'CONFIRMADO_NUEVO' | 'IMPRESION_DIAGNOSTICA' | 'CONFIRMADO_REPETIDO';
      cie10Label?: string | null;
    }[];

    fechaEstructuracionInvalidez?: string | null;
    tipoEvento?: TipoEvento | null;
    origenEvento?: OrigenEvento | null;
  };
  procedimientoPcl: 'A' | 'B';
  fechaDictamen: string;
};

type TotalesPcl = {
  totalTitulo1: number | null;
  totalCap2: number | null;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function DictamenCenterPanel({
  dictamen,
  procedimientoPcl,
  fechaDictamen: _fechaDictamen,
  serverVersion = '',
  readOnly = false,
}: DictamenCenterPanelProps) {
  const [tab, setTab] = useState<TabId>('ANTECEDENTES');

  const queryClient = useQueryClient();
  const { data: cie10Options = [], error: cie10Error } = useCie10Options();

  // ✅ Cache compartido (lo escriben Cap2 y Deficiencias)
  const totalesKey = useMemo(() => ['dictamen', dictamen.id, 'totales'] as const, [dictamen.id]);

  // ✅ "local-only": NO hace fetch, solo se suscribe al cache para re-render inmediato
  const { data: totales } = useQuery<TotalesPcl>({
    queryKey: totalesKey,
    queryFn: async () => ({ totalTitulo1: null, totalCap2: null }),
    enabled: false,
    initialData: () => {
      const cached = queryClient.getQueryData<TotalesPcl>(totalesKey);
      return (
        cached ?? {
          totalTitulo1: null, // no lo tienes en props => se llenará desde Deficiencias/RightPanel
          totalCap2: dictamen.totalCap2 ?? null,
        }
      );
    },
  });

  const isAvdDisabled = procedimientoPcl === 'A';

  // ✅ Regla negocio T3:
  // - Solo Procedimiento A
  // - Solo si (Total Título I + Total Cap2) < 100
  const sumReady = totales?.totalTitulo1 != null && totales?.totalCap2 != null;
  const base = round2((totales?.totalTitulo1 ?? 0) + (totales?.totalCap2 ?? 0));
  const faltante = round2(Math.max(0, 100 - base));

  const tituloIIIDisabledBySum = procedimientoPcl === 'A' && sumReady && faltante <= 0;
  const isTituloIIIDisabled = procedimientoPcl === 'B' || tituloIIIDisabledBySum;

  const isClosed = dictamen.estado === 'CERRADO';
  const effectiveReadOnly = readOnly || isClosed;

  useEffect(() => {
    if (isAvdDisabled && tab === 'AVD_AIVD') setTab('DEFICIENCIAS');
  }, [isAvdDisabled, tab]);

  useEffect(() => {
    if (isTituloIIIDisabled && tab === 'TITULO_III') setTab('CAPITULO_2');
  }, [isTituloIIIDisabled, tab]);

  return (
    <div className="bg-white border shadow-sm rounded-xl">
      <div className="relative z-10 flex px-4 border-b bg-slate-50">
        {(
          [
            ['ANTECEDENTES', 'Antecedentes'],
            ['DIAGNOSTICOS', 'Diagnóstico y tratamiento'],
            ['DEFICIENCIAS', 'Deficiencias / PCL'],
            ['AVD_AIVD', 'AVD-AIVD'],
            ['CAPITULO_2', 'Título II - Capítulo 2'],
            ['TITULO_III', 'Título III'],
            ['SUSTENTACION', 'Sustentación y observaciones'],
          ] as [TabId, string][]
        ).map(([id, label]) => {
          const active = tab === id;

          const disabled =
            (id === 'AVD_AIVD' && isAvdDisabled) || (id === 'TITULO_III' && isTituloIIIDisabled);

          const disabledTitle =
            id === 'AVD_AIVD'
              ? 'No aplica para Procedimiento A'
              : id === 'TITULO_III'
              ? procedimientoPcl === 'B'
                ? 'Aplica únicamente para Procedimiento A'
                : tituloIIIDisabledBySum
                ? `No aplica: (Título I + Título II Cap.2) ya alcanzó 100% (Base: ${base.toFixed(2)}%).`
                : undefined
              : undefined;

          return (
            <button
              key={id}
              type="button"
              data-ro-allow="1"
              onClick={() => {
                if (!disabled) setTab(id);
              }}
              disabled={disabled}
              title={disabled ? disabledTitle : undefined}
              className={`relative border-b-2 px-3 py-2 text-xs font-medium ${
                active
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-700'
              } ${
                disabled ? 'cursor-not-allowed opacity-50 hover:border-transparent hover:text-slate-500' : ''
              }`}
            >
              {label}
              {disabled ? <span className="ml-2 text-[10px] text-slate-400">(No aplica)</span> : null}
            </button>
          );
        })}
      </div>

      <div className="p-4 text-sm">
        {isClosed && (
          <div className="px-3 py-2 mb-3 text-xs border rounded-lg border-amber-200 bg-amber-50 text-amber-900">
            <b>Dictamen cerrado:</b> este dictamen está en <b>solo lectura</b>. No se permite editar.
          </div>
        )}

        {cie10Error && tab === 'DIAGNOSTICOS' && (
          <div className="mb-3 text-[11px] text-red-600">
            Error cargando el catálogo CIE10. Intenta recargar la página.
          </div>
        )}

        <fieldset disabled={effectiveReadOnly} className={effectiveReadOnly ? 'opacity-95' : ''}>
          {tab === 'ANTECEDENTES' && (
            <TabAntecedentes
              dictamenId={dictamen.id}
              initial={{
                antecedentesClinicos: dictamen.antecedentesClinicos ?? '',
                condicionSalud: dictamen.condicionSalud ?? '',
                descripcionHallazgos: dictamen.descripcionHallazgos ?? '',
              }}
              procedimientoPcl={procedimientoPcl}
              serverVersion={serverVersion}
              onGoNext={() => setTab('DIAGNOSTICOS')}
              readOnly={effectiveReadOnly}
            />
          )}

          {tab === 'DIAGNOSTICOS' && (
            <TabDiagnosticos
              dictamenId={dictamen.id}
              procedimientoPcl={procedimientoPcl}
              cie10Options={cie10Options}
              initialDiagnosticos={dictamen.diagnosticos ?? []}
              onGoNext={() => setTab('DEFICIENCIAS')}
            />
          )}

          {tab === 'DEFICIENCIAS' && (
            <TabDeficiencias dictamenId={dictamen.id} procedimientoPcl={procedimientoPcl} />
          )}

          {tab === 'AVD_AIVD' && <TabAvdAivd dictamenId={dictamen.id} procedimientoPcl={procedimientoPcl} />}

          {tab === 'CAPITULO_2' && (
            <TituloIICapitulo2Tab
              dictamenId={dictamen.id}
              procedimientoPcl={procedimientoPcl}
              initialClase={dictamen.claseLimitacionLaboral ?? null}
              initialTotal={dictamen.totalCap2 ?? null}
              readOnly={effectiveReadOnly}
            />
          )}

          {tab === 'TITULO_III' && <TabTituloIII dictamenId={dictamen.id} procedimientoPcl={procedimientoPcl} />}

          {tab === 'SUSTENTACION' && (
            <TabSustentacion
              dictamenId={dictamen.id}
              readOnly={effectiveReadOnly}
              initialMeta={{
                fechaEstructuracionInvalidez: dictamen.fechaEstructuracionInvalidez ?? null,
                tipoEvento: dictamen.tipoEvento ?? null,
                origenEvento: dictamen.origenEvento ?? null,
              }}
            />
          )}
        </fieldset>
      </div>
    </div>
  );
} 