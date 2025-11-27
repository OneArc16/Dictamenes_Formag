'use client';

import React, { useState } from 'react';
import TabAntecedentes from '@/components/dictamen/tabs/TabAntecedentes';
import TabExamenFisico from '@/components/dictamen/tabs/TabExamenFisico';
import TabDiagnosticos from '@/components/dictamen/tabs/TabDiagnosticos';
import TabDeficiencias from '@/components/dictamen/tabs/TabDeficiencias';

type TabId = 'ANTECEDENTES' | 'EXAMEN' | 'DIAGNOSTICOS' | 'DEFICIENCIAS';

type DictamenCenterPanelProps = {
  dictamen: {
    id: number;
    antecedentesClinicos: string | null;
    condicionSalud: string | null;
    descripcionHallazgos: string | null;
  };
  procedimientoPcl: 'A' | 'B';
};

export default function DictamenCenterPanel({
  dictamen,
  procedimientoPcl,
}: DictamenCenterPanelProps) {
  const [tab, setTab] = useState<TabId>('ANTECEDENTES');

  return (
    <div className="bg-white border shadow-sm rounded-xl">
      {/* Header de pestañas */}
      <div className="flex px-4 border-b bg-slate-50">
        {([
          ['ANTECEDENTES', 'Antecedentes'],
          ['EXAMEN', 'Examen físico'],
          ['DIAGNOSTICOS', 'Diagnóstico y tratamiento'],
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
        {tab === 'ANTECEDENTES' && (
          <TabAntecedentes
            dictamenId={dictamen.id}
            initial={{
              antecedentesClinicos: dictamen.antecedentesClinicos ?? '',
              condicionSalud: dictamen.condicionSalud ?? '',
              descripcionHallazgos: dictamen.descripcionHallazgos ?? '',
            }}
            procedimientoPcl={procedimientoPcl}
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
