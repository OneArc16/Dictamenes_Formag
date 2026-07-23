'use client';

import React, { useMemo, useState } from 'react';

import TabAntecedentes from '@/components/dictamen/tabs/TabAntecedentes';
import TabSustentacion from '@/components/dictamen/tabs/TabSustentacion';
import TabDiagnosticos from '@/components/dictamen/tabs/TabDiagnosticos';
import TabDeficiencias from '@/components/dictamen/tabs/TabDeficiencias';
import TabAvdAivd from '@/components/dictamen/tabs/TabAvdAivd';
import TabHistorial from '@/components/dictamen/tabs/TabHistorial';
import { TituloIICapitulo2Tab } from '@/components/dictamen/tabs/TituloIICapitulo2Tab';
import TabTituloIII from '@/components/dictamen/tabs/tabTituloIII';
import { useCie10Options } from '@/hooks/useCie10Options';
import { useDictamenDeficienciasPanel } from '@/hooks/useDictamenDeficienciasPanel';
import type { DictamenEstado, DictamenHistorialItem } from '@/components/dictamen/types';

type TipoEvento = 'ENFERMEDAD' | 'ACCIDENTE';
type OrigenEvento = 'LABORAL' | 'COMUN';

type TabId =
  | 'ANTECEDENTES'
  | 'DIAGNOSTICOS'
  | 'DEFICIENCIAS'
  | 'AVD_AIVD'
  | 'CAPITULO_2'
  | 'TITULO_III'
  | 'SUSTENTACION'
  | 'HISTORIAL';

type DictamenCenterPanelProps = {
  readOnly?: boolean;
  serverVersion?: string;
  dictamen: {
    id: number;
    estado?: DictamenEstado | null;
    antecedentesClinicos: string | null;
    condicionSalud: string | null;
    descripcionHallazgos: string | null;
    sustentacionObservaciones?: string | null;
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
    historial?: DictamenHistorialItem[];
  };
  procedimientoPcl: 'A' | 'B';
  fechaDictamen: string;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export default function DictamenCenterPanel({
  dictamen,
  procedimientoPcl,
  serverVersion = '',
  readOnly = false,
}: DictamenCenterPanelProps) {
  const [tab, setTab] = useState<TabId>('ANTECEDENTES');

  const { error: cie10Error } = useCie10Options();
  const panel = useDictamenDeficienciasPanel(dictamen.id, procedimientoPcl);

  const totalTitulo1 = panel.data?.dictamen?.totalTitulo1 ?? null;
  const totalCap2 = panel.data?.dictamen?.totalCap2 ?? dictamen.totalCap2 ?? null;

  const isAvdDisabled = procedimientoPcl === 'A';
  const sumReady = totalTitulo1 != null && totalCap2 != null;
  const base = round2((totalTitulo1 ?? 0) + (totalCap2 ?? 0));
  const faltante = round2(Math.max(0, 100 - base));

  const tituloIIIDisabledBySum = procedimientoPcl === 'A' && sumReady && faltante <= 0;
  const isTituloIIIDisabled = procedimientoPcl === 'B' || tituloIIIDisabledBySum;
  const isClosed = dictamen.estado === 'CERRADO';
  const effectiveReadOnly = readOnly || isClosed;

  const activeTab = useMemo<TabId>(() => {
    if (isAvdDisabled && tab === 'AVD_AIVD') {
      return 'DEFICIENCIAS';
    }

    if (isTituloIIIDisabled && tab === 'TITULO_III') {
      return 'CAPITULO_2';
    }

    return tab;
  }, [isAvdDisabled, isTituloIIIDisabled, tab]);

  return (
    <div className="bg-white border shadow-sm rounded-xl">
      <div className="relative z-10 flex px-4 border-b bg-slate-50">
        {(
          [
            ['ANTECEDENTES', 'Antecedentes'],
            ['DIAGNOSTICOS', 'Diagnostico y tratamiento'],
            ['DEFICIENCIAS', 'Deficiencias / PCL'],
            ['AVD_AIVD', 'AVD-AIVD'],
            ['CAPITULO_2', 'Titulo II - Capitulo 2'],
            ['TITULO_III', 'Titulo III'],
            ['SUSTENTACION', 'Sustentacion y observaciones'],
            ['HISTORIAL', 'Historial'],
          ] as [TabId, string][]
        ).map(([id, label]) => {
          const active = activeTab === id;
          const disabled =
            (id === 'AVD_AIVD' && isAvdDisabled) || (id === 'TITULO_III' && isTituloIIIDisabled);

          const disabledTitle =
            id === 'AVD_AIVD'
              ? 'No aplica para Procedimiento A'
              : id === 'TITULO_III'
                ? procedimientoPcl === 'B'
                  ? 'Aplica unicamente para Procedimiento A'
                  : tituloIIIDisabledBySum
                    ? `No aplica: (Titulo I + Titulo II Cap.2) ya alcanzo 100% (Base: ${base.toFixed(2)}%).`
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
            <b>Dictamen cerrado:</b> este dictamen esta en <b>solo lectura</b>. No se permite editar.
          </div>
        )}

        {cie10Error && activeTab === 'DIAGNOSTICOS' && (
          <div className="mb-3 text-[11px] text-red-600">
            Error cargando el catalogo CIE10. Intenta recargar la pagina.
          </div>
        )}

        {activeTab === 'HISTORIAL' ? (
          <TabHistorial historial={dictamen.historial ?? []} />
        ) : (
          <fieldset disabled={effectiveReadOnly} className={effectiveReadOnly ? 'opacity-95' : ''}>
            {activeTab === 'ANTECEDENTES' && (
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

            {activeTab === 'DIAGNOSTICOS' && (
              <TabDiagnosticos
                dictamenId={dictamen.id}
                procedimientoPcl={procedimientoPcl}
                initialDiagnosticos={dictamen.diagnosticos ?? []}
                onGoNext={() => setTab('DEFICIENCIAS')}
              />
            )}

            {activeTab === 'DEFICIENCIAS' && (
              <TabDeficiencias dictamenId={dictamen.id} procedimientoPcl={procedimientoPcl} />
            )}

            {activeTab === 'AVD_AIVD' && (
              <TabAvdAivd dictamenId={dictamen.id} procedimientoPcl={procedimientoPcl} />
            )}

            {activeTab === 'CAPITULO_2' && (
              <TituloIICapitulo2Tab
                dictamenId={dictamen.id}
                procedimientoPcl={procedimientoPcl}
                initialClase={dictamen.claseLimitacionLaboral ?? null}
                initialTotal={dictamen.totalCap2 ?? null}
                readOnly={effectiveReadOnly}
              />
            )}

            {activeTab === 'TITULO_III' && (
              <TabTituloIII dictamenId={dictamen.id} procedimientoPcl={procedimientoPcl} />
            )}

            {activeTab === 'SUSTENTACION' && (
              <TabSustentacion
                dictamenId={dictamen.id}
                readOnly={effectiveReadOnly}
                initialText={dictamen.sustentacionObservaciones ?? ''}
                initialMeta={{
                  fechaEstructuracionInvalidez: dictamen.fechaEstructuracionInvalidez ?? null,
                  tipoEvento: dictamen.tipoEvento ?? null,
                  origenEvento: dictamen.origenEvento ?? null,
                }}
              />
            )}
          </fieldset>
        )}
      </div>
    </div>
  );
}



