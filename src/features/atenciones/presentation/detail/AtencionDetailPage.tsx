'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';

import { ClinicalDocumentLayout } from '@/components/clinical-document/ClinicalDocumentLayout';
import { ActualizarDocenteModal } from '@/components/docentes/ActualizarDocenteModal';
import type { AtencionDetalle } from '@/features/atenciones/application/atencion-detail';
import { DEFAULT_ANTECEDENTES_GINECOBSTETRICOS } from '@/features/atenciones/domain/antecedentes-ginecobstetricos';

import { AtencionCenterPanel } from './AtencionCenterPanel';
import { AtencionLeftPanel } from './AtencionLeftPanel';
import { AtencionRightPanel } from './AtencionRightPanel';
import { ATENCION_TABS, type AtencionTabId } from './atencion-tabs';
import { AntecedentesTab } from './tabs/AntecedentesTab';
import { MotivoConsultaTab } from './tabs/MotivoConsultaTab';
import { useAntecedentes } from './useAntecedentes';

const SIN_GINECOBSTETRICOS = {
  datos: DEFAULT_ANTECEDENTES_GINECOBSTETRICOS,
  version: 0,
  actualizadoEn: null,
  actualizadoPor: null,
};
import { useAtencionForm } from './useAtencionForm';

export default function AtencionDetailPage({ detalle }: { detalle: AtencionDetalle }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [showEditDocente, setShowEditDocente] = useState(false);
  const [activeTab, setActiveTab] = useState<AtencionTabId>(ATENCION_TABS[0].id);
  const editable = detalle.estado === 'ACTIVADA' && detalle.canAttend;
  const { form, setField, status, error, flush } = useAtencionForm(detalle.id, detalle.form, editable);
  const personales = useAntecedentes('personales', detalle.id, detalle.antecedentesPersonales, editable);
  const familiares = useAntecedentes('familiares', detalle.id, detalle.antecedentesFamiliares, editable);
  // Los hooks no pueden ser condicionales: sin ginecobstétricos (no es mujer) queda inactivo.
  const mujer = detalle.antecedentesGinecobstetricos !== null;
  const gineco = useAntecedentes(
    'ginecobstetricos',
    detalle.id,
    detalle.antecedentesGinecobstetricos ?? SIN_GINECOBSTETRICOS,
    editable && mujer,
  );

  // El panel derecho resume todos los guardados; finalizar espera a que terminen.
  const statuses = [status, personales.status, familiares.status, gineco.status];
  const saveStatus = (['error', 'saving', 'saved'] as const).find((value) => statuses.includes(value)) ?? 'idle';
  const saveError = error ?? personales.error ?? familiares.error ?? gineco.error;
  const flushAll = async () =>
    (await flush()) && (await personales.flush()) && (await familiares.flush()) && (await gineco.flush());

  const refresh = () => startTransition(() => router.refresh());

  return (
    <div className="mx-auto w-full max-w-[1760px] px-3 pb-6 pt-2 sm:px-4 lg:px-6 2xl:px-8">
      {detalle.canAttend && showEditDocente ? (
        <ActualizarDocenteModal
          open={showEditDocente}
          onClose={() => setShowEditDocente(false)}
          numeroDocumento={detalle.docente.documento}
          onUpdate={() => {
            toast.success('Datos del docente actualizados correctamente.');
            setShowEditDocente(false);
            refresh();
          }}
        />
      ) : null}

      <h1 className="sr-only">Atención de {detalle.docente.nombreCompleto}</h1>
      <Link
        href="/atenciones"
        className="mb-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-sky-800 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a Atenciones
      </Link>

      <ClinicalDocumentLayout
        left={
          <AtencionLeftPanel
            detalle={detalle}
            onEditDocente={detalle.canAttend ? () => setShowEditDocente(true) : undefined}
          />
        }
        center={
          <AtencionCenterPanel
            activeTab={activeTab}
            onTabChange={setActiveTab}
            panels={{
              'motivo-consulta': <MotivoConsultaTab form={form} readOnly={!editable} onChange={setField} />,
              antecedentes: (
                <AntecedentesTab
                  personales={personales}
                  familiares={familiares}
                  ginecobstetricos={mujer ? gineco : null}
                  readOnly={!editable}
                  snapshot={detalle.antecedentesDeEstaAtencion}
                />
              ),
            }}
          />
        }
        right={
          <AtencionRightPanel
            detalle={detalle}
            form={form}
            saveStatus={saveStatus}
            saveError={saveError}
            onGoToTab={setActiveTab}
            onFlush={flushAll}
            onFinalized={refresh}
          />
        }
      />
    </div>
  );
}
