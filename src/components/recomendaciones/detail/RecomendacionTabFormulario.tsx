'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type RecomendacionDetalleViewModel } from '@/components/recomendaciones/detail/types';

const DEFAULT_EXAMENES_REALIZADOS =
  'CONSULTA POR ESPECIALISTA EN MEDICINA DEL TRABAJO O SEGURIDAD Y SALUD EN EL TRABAJO';
const DEFAULT_MOTIVO = 'CONCEPTO MEDICO PARA RECOMENDACIONES LABORALES';

function getDefaultValue(value: string, fallback: string) {
  const normalized = value.trim();
  return normalized.length > 0 ? value : fallback;
}

function normalizeTextValue(value: string) {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : '';
}

export function RecomendacionTabFormulario({
  detalle,
  canEdit,
}: {
  detalle: RecomendacionDetalleViewModel;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [examenesRealizados, setExamenesRealizados] = useState(
    getDefaultValue(detalle.examenesRealizados, DEFAULT_EXAMENES_REALIZADOS),
  );
  const [motivo, setMotivo] = useState(getDefaultValue(detalle.motivo, DEFAULT_MOTIVO));
  const [recomendaciones, setRecomendaciones] = useState(
    detalle.recomendacionesObservacionesRestricciones,
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setExamenesRealizados(
      getDefaultValue(detalle.examenesRealizados, DEFAULT_EXAMENES_REALIZADOS),
    );
    setMotivo(getDefaultValue(detalle.motivo, DEFAULT_MOTIVO));
    setRecomendaciones(detalle.recomendacionesObservacionesRestricciones);
  }, [
    detalle.examenesRealizados,
    detalle.motivo,
    detalle.recomendacionesObservacionesRestricciones,
    detalle.id,
  ]);

  const isEditable = canEdit && (detalle.estado === 'BORRADOR' || detalle.estado === 'REABIERTO');
  const persistedValues = useMemo(
    () => ({
      examenesRealizados: getDefaultValue(detalle.examenesRealizados, DEFAULT_EXAMENES_REALIZADOS),
      motivo: getDefaultValue(detalle.motivo, DEFAULT_MOTIVO),
      recomendaciones: detalle.recomendacionesObservacionesRestricciones,
    }),
    [
      detalle.examenesRealizados,
      detalle.motivo,
      detalle.recomendacionesObservacionesRestricciones,
    ],
  );

  const hasChanges = useMemo(
    () =>
      normalizeTextValue(examenesRealizados) !== normalizeTextValue(persistedValues.examenesRealizados) ||
      normalizeTextValue(motivo) !== normalizeTextValue(persistedValues.motivo) ||
      normalizeTextValue(recomendaciones) !== normalizeTextValue(persistedValues.recomendaciones),
    [examenesRealizados, motivo, recomendaciones, persistedValues],
  );

  const isBusy = isSaving || isRefreshing;
  const canSave = isEditable && hasChanges && !isBusy;

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(`/api/recomendaciones/${detalle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          examenesRealizados,
          motivo,
          recomendacionesObservacionesRestricciones: recomendaciones,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? 'No se pudo guardar la recomendacion.');
      }

      setExamenesRealizados(
        getDefaultValue(
          data.recomendacion?.examenesRealizados ?? '',
          DEFAULT_EXAMENES_REALIZADOS,
        ),
      );
      setMotivo(getDefaultValue(data.recomendacion?.motivo ?? '', DEFAULT_MOTIVO));
      setRecomendaciones(
        data.recomendacion?.recomendacionesObservacionesRestricciones ?? '',
      );

      toast.success('Recomendacion guardada correctamente.');
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('Error guardando la recomendacion:', error);
      toast.error(
        error instanceof Error ? error.message : 'No se pudo guardar la recomendacion.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Examenes realizados
        </Label>
        <Textarea
          value={examenesRealizados}
          onChange={(event) => setExamenesRealizados(event.target.value)}
          placeholder={DEFAULT_EXAMENES_REALIZADOS}
          disabled={!isEditable || isBusy}
          className="min-h-[84px] resize-y rounded-2xl border-slate-200 bg-white shadow-none"
        />
      </section>

      <section className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Motivo
        </Label>
        <Textarea
          value={motivo}
          onChange={(event) => setMotivo(event.target.value)}
          placeholder={DEFAULT_MOTIVO}
          disabled={!isEditable || isBusy}
          className="min-h-[84px] resize-y rounded-2xl border-slate-200 bg-white shadow-none"
        />
      </section>

      <section className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Recomendaciones, observaciones y restricciones
        </Label>
        <Textarea
          value={recomendaciones}
          onChange={(event) => setRecomendaciones(event.target.value)}
          placeholder="Registra en un solo campo las recomendaciones, observaciones y restricciones laborales"
          disabled={!isEditable || isBusy}
          className="min-h-[300px] resize-y rounded-2xl border-slate-200 bg-white shadow-none"
        />
      </section>

      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-xs text-slate-500">
          {!isEditable
            ? 'El formulario esta en solo lectura para el estado o perfil actual.'
            : hasChanges
              ? 'Hay cambios pendientes por guardar.'
              : 'No hay cambios pendientes.'}
        </p>

        <Button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="rounded-xl px-5 text-white hover:text-white disabled:text-white/80"
        >
          {isBusy ? 'Guardando...' : hasChanges ? 'Guardar recomendacion' : 'Sin cambios'}
        </Button>
      </div>
    </div>
  );
}
