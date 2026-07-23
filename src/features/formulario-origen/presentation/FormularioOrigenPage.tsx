'use client';

import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import AppNav from '@/components/AppNav';
import { ClinicalDocumentLayout } from '@/components/clinical-document/ClinicalDocumentLayout';
import { buildNumeroDictamen } from '../domain/numero-dictamen';
import { calculateSectionProgress } from '../domain/validation';
import { FormularioOrigenCenterPanel } from './FormularioOrigenCenterPanel';
import { FormularioOrigenLeftPanel } from './FormularioOrigenLeftPanel';
import { FormularioOrigenRightPanel } from './FormularioOrigenRightPanel';
import type { FormularioOrigenDto, OriginTab, ValidationIssue } from './types';

const TABS: OriginTab[] = [
  'descripcion',
  'historial-laboral',
  'informacion-fundamentos',
  'diagnostico-tratamiento',
  'sustentacion',
];

function isOriginTab(value: string | null): value is OriginTab {
  return TABS.includes(value as OriginTab);
}

async function readResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok !== true) {
    const error = new Error(data?.error ?? 'No fue posible completar la operación.') as Error & {
      code?: string;
      details?: { issues?: ValidationIssue[] };
    };
    error.code = data?.code;
    error.details = data?.details;
    throw error;
  }
  return data;
}

export default function FormularioOrigenPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const dictamenId = Number(params.id);
  const initialTab = searchParams.get('tab');
  const activeTab: OriginTab = isOriginTab(initialTab) ? initialTab : 'descripcion';
  const [formulario, setFormulario] = useState<FormularioOrigenDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const lastSavedDescription = useRef('');
  const lastSavedDate = useRef('');
  const formRef = useRef<FormularioOrigenDto | null>(null);

  useEffect(() => {
    formRef.current = formulario;
  }, [formulario]);

  const load = useCallback(async () => {
    if (!Number.isInteger(dictamenId) || dictamenId <= 0) {
      setLoadError('El ID del expediente no es válido.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/dictamenes/${dictamenId}/origen`, {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await readResponse(response);
      const next = data.formulario as FormularioOrigenDto;
      setFormulario(next);
      lastSavedDescription.current = next.descripcion;
      lastSavedDate.current = next.fechaDictamenOrigen;
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Error cargando el formulario.');
    } finally {
      setLoading(false);
    }
  }, [dictamenId]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeTab = (tab: OriginTab) => {
    router.replace(`/medico/dictamen/${dictamenId}/origen?tab=${tab}`, { scroll: false });
  };

  const saveSection = useCallback(
    async (tab: OriginTab, options?: { silent?: boolean }) => {
      const current = formRef.current;
      if (!current || current.readOnly || saving) return false;
      setSaving(true);
      setSaveState('saving');

      let endpoint = '';
      let method: 'PATCH' | 'PUT' = 'PATCH';
      let body: object;

      if (tab === 'descripcion') {
        endpoint = 'descripcion';
        body = {
          descripcion: current.descripcion,
          fechaDictamenOrigen: current.fechaDictamenOrigen,
          expectedVersion: current.lockVersion,
        };
      } else if (tab === 'historial-laboral') {
        endpoint = 'historial-laboral';
        method = 'PUT';
        body = {
          items: current.historialLaboral.map((item) => ({
            institucionId: item.institucionId,
            institucionNombreSnapshot: item.institucionNombreSnapshot,
            cargoId: item.cargoId,
            cargoNombreSnapshot: item.cargoNombreSnapshot,
            riesgosLaborales: item.riesgosLaborales,
            jornadaLaboral: item.jornadaLaboral,
            tiempoExposicionAnios: item.tiempoExposicionAnios,
          })),
          expectedVersion: current.lockVersion,
        };
      } else if (tab === 'informacion-fundamentos') {
        endpoint = 'informacion-fundamentos';
        body = {
          fechaOcurrencia: current.fechaOcurrencia,
          horaOcurrencia: current.horaOcurrencia,
          jornadaEvento: current.jornadaEvento,
          soportes: current.soportes.map((support) => ({
            tipo: support.tipo,
            estado: support.estado,
            fechaDocumento: support.fechaDocumento,
            seTuvoEnCuenta: support.seTuvoEnCuenta,
            nombreOtro: support.nombreOtro,
          })),
          expectedVersion: current.lockVersion,
        };
      } else if (tab === 'diagnostico-tratamiento') {
        endpoint = 'diagnosticos';
        method = 'PUT';
        const diagnosesToSave = current.diagnosticos.filter((diagnosis) =>
          diagnosis.cie10Codigo.trim(),
        );
        body = {
          diagnosticos: diagnosesToSave.map((diagnosis, index) => ({
            cie10Codigo: diagnosis.cie10Codigo,
            tipo: diagnosis.tipo,
            esPrincipal: index === 0,
          })),
          tratamiento: current.tratamiento || null,
          expectedVersion: current.lockVersion,
        };
      } else {
        endpoint = 'sustentacion';
        body = {
          concepto: current.concepto,
          fundamentosDerecho: current.fundamentosDerecho,
          tipoEvento: current.tipoEvento,
          origenEvento: current.origenEvento,
          expectedVersion: current.lockVersion,
        };
      }

      try {
        const response = await fetch(
          `/api/dictamenes/${dictamenId}/origen/${endpoint}`,
          {
            method,
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          },
        );
        const data = await readResponse(response);
        const server = data.formulario as FormularioOrigenDto;
        const latest = formRef.current;
        const descriptionChangedWhileSaving =
          tab === 'descripcion' &&
          latest &&
          (latest.descripcion !== current.descripcion ||
            latest.fechaDictamenOrigen !== current.fechaDictamenOrigen);
        const next = descriptionChangedWhileSaving
          ? {
              ...server,
              descripcion: latest.descripcion,
              fechaDictamenOrigen: latest.fechaDictamenOrigen,
              numeroDictamenOrigen: buildNumeroDictamen(
                latest.fechaDictamenOrigen,
                latest.docente.documento,
              ),
            }
          : server;
        setFormulario(next);
        formRef.current = next;
        if (tab === 'descripcion') {
          lastSavedDescription.current = current.descripcion;
          lastSavedDate.current = current.fechaDictamenOrigen;
        }
        setSaveState('saved');
        if (!options?.silent) toast.success('Sección guardada.');
        return true;
      } catch (error) {
        setSaveState('error');
        const message = error instanceof Error ? error.message : 'No se pudo guardar.';
        if ((error as { code?: string }).code === 'STALE_VERSION') {
          toast.error(message);
          await load();
        } else if (!options?.silent) {
          toast.error(message);
        }
        return false;
      } finally {
        setSaving(false);
      }
    },
    [dictamenId, load, saving],
  );

  useEffect(() => {
    if (
      !formulario ||
      formulario.readOnly ||
      (formulario.descripcion === lastSavedDescription.current &&
        formulario.fechaDictamenOrigen === lastSavedDate.current) ||
      saving
    ) {
      return;
    }
    const timer = window.setTimeout(() => {
      void saveSection('descripcion', { silent: true });
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [formulario, saveSection, saving]);

  const finalize = async () => {
    const saved = await saveSection(activeTab, { silent: true });
    if (saved === false && !formRef.current?.readOnly) return;
    const current = formRef.current;
    if (!current) return;

    setFinalizing(true);
    try {
      const response = await fetch(
        `/api/dictamenes/${dictamenId}/origen/finalizar`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expectedVersion: current.lockVersion }),
        },
      );
      const data = await readResponse(response);
      setFormulario(data.formulario as FormularioOrigenDto);
      toast.success('Formulario de Origen finalizado. El Dictamen PCL está habilitado.');
    } catch (error) {
      const typed = error as Error & { details?: { issues?: ValidationIssue[] } };
      const issues = typed.details?.issues;
      if (issues?.length) {
        setFormulario((previous) =>
          previous
            ? {
                ...previous,
                validation: {
                  issues,
                  progress: calculateSectionProgress(issues),
                },
              }
            : previous,
        );
        const firstTab = issues[0].section;
        changeTab(firstTab);
        window.requestAnimationFrame(() => {
          const fieldId: Record<string, string> = {
            descripcion: 'origin-description',
            concepto: 'origin-concept',
            fundamentosDerecho: 'origin-legal-foundation',
            fechaOcurrencia: 'occurrence-date',
            horaOcurrencia: 'occurrence-time',
            jornadaEvento: 'event-shift',
          };
          document
            .getElementById(fieldId[issues[0].field] ?? `panel-${firstTab}`)
            ?.focus();
        });
      }
      toast.error(error instanceof Error ? error.message : 'No se pudo finalizar.');
    } finally {
      setFinalizing(false);
    }
  };

  const savingLabel =
    saveState === 'saving'
      ? 'Guardando en el servidor…'
      : saveState === 'error'
        ? 'Error al guardar. Reintenta.'
        : saveState === 'saved'
          ? 'Borrador guardado en el servidor.'
          : 'Borrador sincronizado con el servidor.';

  if (loading) {
    return (
      <div className="min-h-dvh bg-slate-50">
        <AppNav title="Formulario de Origen" />
        <main className="mx-auto max-w-[1600px] px-4 py-6 lg:px-8">
          <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white motion-reduce:animate-none" />
        </main>
      </div>
    );
  }

  if (loadError || !formulario) {
    return (
      <div className="min-h-dvh bg-slate-50">
        <AppNav title="Formulario de Origen" />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-xl border border-rose-200 bg-white p-6 shadow-sm">
            <h1 className="text-lg font-semibold text-slate-950">
              No fue posible abrir el Formulario de Origen
            </h1>
            <p className="mt-2 text-sm text-rose-700">{loadError}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-sky-800 px-4 text-sm font-semibold text-white hover:bg-sky-900"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Reintentar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      <AppNav title="Formulario de Origen" />
      <main
        id="main-content"
        className="mx-auto w-full max-w-[1760px] px-3 pb-6 pt-2 sm:px-4 lg:px-6 2xl:px-8"
      >
        <h1 className="sr-only">Formulario de Determinación de Origen</h1>
        <button
          type="button"
          onClick={() => router.push('/medico')}
          className="mb-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-sky-800 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a Dictámenes
        </button>
        <ClinicalDocumentLayout
          left={
            <FormularioOrigenLeftPanel
              formulario={formulario}
              savingLabel={savingLabel}
              onDateChange={(fechaDictamenOrigen) =>
                setFormulario({ ...formulario, fechaDictamenOrigen })
              }
            />
          }
          center={
            <FormularioOrigenCenterPanel
              formulario={formulario}
              activeTab={activeTab}
              saving={saving}
              onTabChange={changeTab}
              onChange={setFormulario}
              onSave={saveSection}
            />
          }
          right={
            <FormularioOrigenRightPanel
              formulario={formulario}
              saving={saving}
              finalizing={finalizing}
              onGoToTab={changeTab}
              onSaveDraft={() => void saveSection(activeTab)}
              onFinalize={() => void finalize()}
              onOpenPcl={() => router.push(`/medico/dictamen/${dictamenId}`)}
              onOpenPdf={() =>
                window.open(
                  `/api/dictamenes/${dictamenId}/origen/pdf`,
                  '_blank',
                  'noopener,noreferrer',
                )
              }
            />
          }
        />
      </main>
    </div>
  );
}
