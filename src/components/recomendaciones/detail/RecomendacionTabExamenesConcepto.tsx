'use client';

import { useEffect, useState, useTransition } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  type RecomendacionDetalleExamen,
  type RecomendacionDetalleViewModel,
} from '@/components/recomendaciones/detail/types';

type ExamenDraft = {
  key: string;
  nombre: string;
  fechaExamen: string;
  resultado: string;
  observacion: string;
};

function buildDraftKey() {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 11);
}

function mapExamenToDraft(examen?: RecomendacionDetalleExamen): ExamenDraft {
  return {
    key: examen ? String(examen.id) : buildDraftKey(),
    nombre: examen?.nombre ?? '',
    fechaExamen: examen?.fechaExamen ?? '',
    resultado: examen?.resultado ?? '',
    observacion: examen?.observacion ?? '',
  };
}

function normalizeDraftsForSave(examenes: ExamenDraft[]) {
  const normalized: Array<{
    nombre: string;
    fechaExamen: string | null;
    resultado: string | null;
    observacion: string | null;
  }> = [];

  for (const examen of examenes) {
    const nombre = examen.nombre.trim();
    const fechaExamen = examen.fechaExamen.trim();
    const resultado = examen.resultado.trim();
    const observacion = examen.observacion.trim();

    const hasContent = Boolean(nombre || fechaExamen || resultado || observacion);
    if (!hasContent) {
      continue;
    }

    if (!nombre) {
      throw new Error('Cada examen diligenciado debe tener nombre.');
    }

    normalized.push({
      nombre,
      fechaExamen: fechaExamen || null,
      resultado: resultado || null,
      observacion: observacion || null,
    });
  }

  return normalized;
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
      No hay examenes registrados todavia. Agrega el primero para esta recomendacion.
    </div>
  );
}

function ExamenCard({
  examen,
  index,
  disabled,
  onChange,
  onRemove,
}: {
  examen: ExamenDraft;
  index: number;
  disabled: boolean;
  onChange: (field: keyof Omit<ExamenDraft, 'key'>, value: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Examen {index + 1}</p>
          <p className="text-xs text-slate-500">Registra nombre, fecha y hallazgos relevantes.</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-slate-500 hover:bg-white hover:text-rose-600"
          onClick={onRemove}
          disabled={disabled}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1.6fr)_220px]">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Nombre del examen
          </Label>
          <Input
            value={examen.nombre}
            onChange={(event) => onChange('nombre', event.target.value)}
            placeholder="Ej. Audiometria ocupacional"
            disabled={disabled}
            className="h-10 rounded-xl border-slate-200 bg-white shadow-none"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Fecha del examen
          </Label>
          <Input
            type="date"
            value={examen.fechaExamen}
            onChange={(event) => onChange('fechaExamen', event.target.value)}
            disabled={disabled}
            className="h-10 rounded-xl border-slate-200 bg-white shadow-none"
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Resultado
          </Label>
          <Textarea
            value={examen.resultado}
            onChange={(event) => onChange('resultado', event.target.value)}
            placeholder="Resume el resultado del examen"
            disabled={disabled}
            className="min-h-[110px] rounded-2xl border-slate-200 bg-white shadow-none"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Observacion
          </Label>
          <Textarea
            value={examen.observacion}
            onChange={(event) => onChange('observacion', event.target.value)}
            placeholder="Hallazgos u observaciones complementarias"
            disabled={disabled}
            className="min-h-[110px] rounded-2xl border-slate-200 bg-white shadow-none"
          />
        </div>
      </div>
    </div>
  );
}

export function RecomendacionTabExamenesConcepto({
  detalle,
}: {
  detalle: RecomendacionDetalleViewModel;
}) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();
  const [concepto, setConcepto] = useState(detalle.concepto);
  const [examenes, setExamenes] = useState<ExamenDraft[]>(
    detalle.examenes.length > 0
      ? detalle.examenes.map((examen) => mapExamenToDraft(examen))
      : [],
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setConcepto(detalle.concepto);
    setExamenes(
      detalle.examenes.length > 0
        ? detalle.examenes.map((examen) => mapExamenToDraft(examen))
        : [],
    );
  }, [detalle.concepto, detalle.examenes, detalle.id]);

  const isEditable = detalle.estado === 'BORRADOR';
  const isBusy = isSaving || isRefreshing;

  const handleAddExamen = () => {
    setExamenes((current) => [...current, mapExamenToDraft()]);
  };

  const handleChangeExamen = (
    key: string,
    field: keyof Omit<ExamenDraft, 'key'>,
    value: string,
  ) => {
    setExamenes((current) =>
      current.map((examen) =>
        examen.key === key ? { ...examen, [field]: value } : examen,
      ),
    );
  };

  const handleRemoveExamen = (key: string) => {
    setExamenes((current) => current.filter((examen) => examen.key !== key));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const normalizedExamenes = normalizeDraftsForSave(examenes);

      const response = await fetch(`/api/recomendaciones/${detalle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          concepto,
          examenes: normalizedExamenes,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? 'No se pudo guardar la seccion.');
      }

      setConcepto(data.recomendacion?.concepto ?? '');
      setExamenes(
        (data.recomendacion?.examenes ?? []).map((examen: RecomendacionDetalleExamen) =>
          mapExamenToDraft(examen),
        ),
      );

      toast.success('Examenes y concepto guardados correctamente.');
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('Error guardando examenes y concepto:', error);
      toast.error(
        error instanceof Error ? error.message : 'No se pudo guardar la seccion.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-950">Examenes realizados</h2>
            <p className="text-sm leading-6 text-slate-600">
              Registra los examenes de soporte asociados a esta recomendacion laboral.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={handleAddExamen}
            disabled={!isEditable || isBusy}
          >
            <Plus className="h-4 w-4" />
            Agregar examen
          </Button>
        </div>

        {examenes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {examenes.map((examen, index) => (
              <ExamenCard
                key={examen.key}
                examen={examen}
                index={index}
                disabled={!isEditable || isBusy}
                onChange={(field, value) => handleChangeExamen(examen.key, field, value)}
                onRemove={() => handleRemoveExamen(examen.key)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Concepto
        </Label>
        <Textarea
          value={concepto}
          onChange={(event) => setConcepto(event.target.value)}
          placeholder="Describe el concepto medico-laboral de la atencion"
          disabled={!isEditable || isBusy}
          className="min-h-[240px] resize-y rounded-2xl border-slate-200 bg-white shadow-none"
        />
      </section>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSave}
          disabled={!isEditable || isBusy}
          className="rounded-xl px-5 text-white hover:text-white disabled:text-white/80"
        >
          {isBusy ? 'Guardando...' : 'Guardar examenes y concepto'}
        </Button>
      </div>
    </div>
  );
}
