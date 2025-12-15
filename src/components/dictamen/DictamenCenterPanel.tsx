'use client';

import React, { useState } from 'react';
import TabAntecedentes from '@/components/dictamen/tabs/TabAntecedentes';
import TabExamenFisico from '@/components/dictamen/tabs/TabExamenFisico';
import TabDiagnosticos from '@/components/dictamen/tabs/TabDiagnosticos';
import TabDeficiencias from '@/components/dictamen/tabs/TabDeficiencias';
import { useCie10Options } from '@/hooks/useCie10Options';

type TabId = 'ANTECEDENTES' | 'EXAMEN' | 'DIAGNOSTICOS' | 'DEFICIENCIAS';

type DictamenCenterPanelProps = {
  dictamen: {
    id: number;
    antecedentesClinicos: string | null;
    condicionSalud: string | null;
    descripcionHallazgos: string | null;
    diagnosticos?: {
      cie10Codigo: string;
      tipo:
        | 'CONFIRMADO_NUEVO'
        | 'IMPRESION_DIAGNOSTICA'
        | 'CONFIRMADO_REPETIDO';
      cie10Label?: string | null;
    }[];
  };
  procedimientoPcl: 'A' | 'B';
  fechaDictamen: string; // la dejamos por compatibilidad si luego la necesitas
};

export default function DictamenCenterPanel({
  dictamen,
  procedimientoPcl,
  fechaDictamen,
}: DictamenCenterPanelProps) {
  const [tab, setTab] = useState<TabId>('ANTECEDENTES');

  const {
    data: cie10Options = [],
    isLoading: cie10Loading,
    error: cie10Error,
  } = useCie10Options();

  return (
    <div className="bg-white border shadow-sm rounded-xl">
      {/* Header de pestañas */}
      <div className="flex px-4 border-b bg-slate-50">
        {([
          ['ANTECEDENTES', 'Antecedentes'],
          ['DIAGNOSTICOS', 'Diagnóstico y tratamiento'],
          ['EXAMEN', 'Examen físico'],
          ['DEFICIENCIAS', 'Deficiencias / PCL'],
        ] as [TabId, string][]).map(([id, label]) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`relative border-b-2 px-3 py-2 text-xs font-medium ${
                active
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Contenido de pestaña */}
      <div className="p-4 text-sm">
        {cie10Error && tab === 'DIAGNOSTICOS' && (
          <div className="mb-3 text-[11px] text-red-600">
            Error cargando el catálogo CIE10. Intenta recargar la página.
          </div>
        )}

        {tab === 'ANTECEDENTES' && (
          <TabAntecedentes
            dictamenId={dictamen.id}
            initial={{
              antecedentesClinicos: dictamen.antecedentesClinicos ?? '',
              condicionSalud: dictamen.condicionSalud ?? '',
              descripcionHallazgos: dictamen.descripcionHallazgos ?? '',
            }}
            procedimientoPcl={procedimientoPcl}
            // 👇 cuando guarda bien, saltamos a la pestaña de Diagnóstico
            onGoNext={() => setTab('DIAGNOSTICOS')}
          />
        )}

        {tab === 'EXAMEN' && (
          <TabExamenFisico
            dictamenId={dictamen.id}
            procedimientoPcl={procedimientoPcl}
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
          <TabDeficiencias
            dictamenId={dictamen.id}
            procedimientoPcl={procedimientoPcl}
          />
        )}
      </div>
    </div>
  );
}