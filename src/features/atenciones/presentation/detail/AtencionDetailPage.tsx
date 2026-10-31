'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import toast from 'react-hot-toast';

import { ClinicalDocumentLayout } from '@/components/clinical-document/ClinicalDocumentLayout';
import { ActualizarDocenteModal } from '@/components/docentes/ActualizarDocenteModal';
import type { AtencionDetalle } from '@/features/atenciones/application/atencion-detail';
import { EXAMEN_CATALOG } from '@/features/atenciones/domain/examen-fisico';
import { REVISION_CATALOG } from '@/features/atenciones/domain/revision-sistemas';
import { DEFAULT_ANTECEDENTES_GINECOBSTETRICOS } from '@/features/atenciones/domain/antecedentes-ginecobstetricos';

import { AtencionCenterPanel } from './AtencionCenterPanel';
import { AtencionLeftPanel } from './AtencionLeftPanel';
import { AtencionRightPanel } from './AtencionRightPanel';
import { ATENCION_TABS, atencionPendientesUi, type AtencionTabId } from './atencion-tabs';
import { AntecedentesTab } from './tabs/AntecedentesTab';
import { MotivoConsultaTab } from './tabs/MotivoConsultaTab';
import { AnalisisPlanTab } from './tabs/AnalisisPlanTab';
import { DiagnosticosTab } from './tabs/DiagnosticosTab';
import { ExamenFisicoTab } from './tabs/ExamenFisicoTab';
import { HallazgosTab } from './tabs/HallazgosTab';
import { SignosVitalesTab } from './tabs/SignosVitalesTab';
import { useAntecedentes } from './useAntecedentes';

const SIN_GINECOBSTETRICOS = {
  datos: DEFAULT_ANTECEDENTES_GINECOBSTETRICOS,
  version: 0,
  actualizadoEn: null,
  actualizadoPor: null,
};
import { useAtencionForm } from './useAtencionForm';
import { useDiagnosticos } from './useDiagnosticos';
import { useHallazgos } from './useHallazgos';
import { useSignosVitales } from './useSignosVitales';

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

  const signos = useSignosVitales(detalle.id, detalle.signosVitales, editable);
  const revision = useHallazgos('revision-sistemas', detalle.id, detalle.revisionSistemas, editable);
  const examen = useHallazgos('examen-fisico', detalle.id, detalle.examenFisico, editable);
  const diagnosticos = useDiagnosticos(detalle.id, detalle.diagnosticos, editable);

  // El panel derecho resume todos los guardados; finalizar espera a que terminen.
  const statuses = [
    status,
    personales.status,
    familiares.status,
    gineco.status,
    signos.status,
    revision.status,
    examen.status,
    diagnosticos.status,
  ];
  const saveStatus = (['error', 'saving', 'saved'] as const).find((value) => statuses.includes(value)) ?? 'idle';
  const saveError =
    error ??
    personales.error ??
    familiares.error ??
    gineco.error ??
    signos.error ??
    revision.error ??
    examen.error ??
    diagnosticos.error;
  const flushAll = async () =>
    (await flush()) &&
    (await personales.flush()) &&
    (await familiares.flush()) &&
    (await gineco.flush()) &&
    (await signos.flush()) &&
    (await revision.flush()) &&
    (await examen.flush()) &&
    (await diagnosticos.flush());

  const pendientes = atencionPendientesUi(
    form,
    signos.values,
    diagnosticos.filas.some((fila) => fila.cie10Codigo.trim()),
  );
  const pendientesPorPestana = pendientes.reduce<Partial<Record<AtencionTabId, number>>>(
    (acc, item) => ({ ...acc, [item.tab]: (acc[item.tab] ?? 0) + 1 }),
    {},
  );

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
            pendientes={editable ? pendientesPorPestana : {}}
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
              'signos-vitales': (
                <SignosVitalesTab
                  form={signos.form}
                  values={signos.values}
                  errors={signos.errors}
                  historial={detalle.signosHistorial}
                  readOnly={!editable}
                  status={signos.status}
                  error={signos.error}
                  tomadoEn={signos.tomadoEn}
                  tomadoPor={signos.tomadoPor}
                  onChange={signos.setField}
                />
              ),
              'revision-sistemas': (
                <HallazgosTab
                  catalog={REVISION_CATALOG}
                  idPrefix="revision"
                  revision={revision.datos}
                  mujer={detalle.mujer}
                  readOnly={!editable}
                  origen={revision.origen}
                  heredadaDe={revision.heredadaDe}
                  status={revision.status}
                  error={revision.error}
                  onChange={revision.update}
                />
              ),
              'examen-fisico': (
                <ExamenFisicoTab
                  signos={signos.values}
                  onEditSignos={() => setActiveTab('signos-vitales')}
                  catalog={EXAMEN_CATALOG}
                  idPrefix="examen"
                  revision={examen.datos}
                  mujer={detalle.mujer}
                  readOnly={!editable}
                  origen={examen.origen}
                  heredadaDe={examen.heredadaDe}
                  status={examen.status}
                  error={examen.error}
                  onChange={examen.update}
                />
              ),
              diagnosticos: (
                <DiagnosticosTab
                  filas={diagnosticos.filas}
                  readOnly={!editable}
                  status={diagnosticos.status}
                  error={diagnosticos.error}
                  onChange={diagnosticos.update}
                />
              ),
              'analisis-plan': <AnalisisPlanTab form={form} readOnly={!editable} onChange={setField} />,
            }}
          />
        }
        right={
          <AtencionRightPanel
            detalle={detalle}
            pendientes={pendientes}
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
