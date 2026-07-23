'use client';

import { RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Target = 'ORIGEN' | 'PCL';
type Options = {
  targets: Target[];
  versions: Record<Target, number | null>;
  motives: Array<{
    id: number;
    nombre: string;
    descripcion: string | null;
    exigeObservacion: boolean;
    targets: Target[];
  }>;
};

export function ReabrirDocumentoDialog({
  dictamenId,
  onSuccess,
}: {
  dictamenId: number;
  onSuccess: (route: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Options | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [motiveId, setMotiveId] = useState('');
  const [observation, setObservation] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    void fetch(`/api/dictamenes/${dictamenId}/reapertura/opciones`, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data?.ok) throw new Error(data?.error ?? 'No se pudieron cargar las opciones.');
        const next = data as Options;
        setOptions(next);
        setTarget(next.targets.length === 1 ? next.targets[0] : null);
      })
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          toast.error(error instanceof Error ? error.message : 'Error cargando opciones.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [dictamenId, open]);

  const motives = useMemo(
    () => options?.motives.filter((motive) => target && motive.targets.includes(target)) ?? [],
    [options, target],
  );
  const selectedMotive = motives.find((motive) => String(motive.id) === motiveId);

  useEffect(() => {
    setMotiveId('');
    setObservation('');
  }, [target]);

  const confirm = async () => {
    if (!target || !motiveId || !options) {
      toast.error('Selecciona el documento y el motivo.');
      return;
    }
    if (selectedMotive?.exigeObservacion && !observation.trim()) {
      toast.error('La observación adicional es obligatoria para este motivo.');
      return;
    }
    const expectedVersion = options.versions[target];
    if (!expectedVersion) {
      toast.error('No se pudo determinar la versión del documento.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`/api/dictamenes/${dictamenId}/reapertura`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objetivo: target,
          motivoId: Number(motiveId),
          observacion: observation.trim() || null,
          expectedVersion,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error ?? 'No se pudo reabrir.');
      toast.success(`${target === 'ORIGEN' ? 'Formulario de Origen' : 'Dictamen PCL'} reabierto.`);
      setOpen(false);
      onSuccess(data.route);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo reabrir.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && setOpen(next)}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Reabrir documento"
          aria-label="Reabrir documento"
          className="h-9 w-9 rounded-full border-sky-200 text-sky-800 shadow-none hover:bg-sky-50 hover:text-sky-900"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="border-slate-200 bg-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Reabrir documento</DialogTitle>
          <DialogDescription>¿Qué documento deseas reabrir?</DialogDescription>
        </DialogHeader>
        {loading ? (
          <p className="py-6 text-sm text-slate-600">Calculando opciones disponibles…</p>
        ) : (
          <div className="space-y-5">
            <fieldset>
              <legend className="sr-only">Documento a reabrir</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {options?.targets.map((item) => (
                  <label
                    key={item}
                    className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm font-semibold ${
                      target === item
                        ? 'border-sky-600 bg-sky-50 text-sky-900'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reopen-target"
                      checked={target === item}
                      onChange={() => setTarget(item)}
                      className="h-4 w-4 accent-sky-700"
                    />
                    {item === 'ORIGEN'
                      ? 'Formulario de Determinación de Origen'
                      : 'Dictamen PCL'}
                  </label>
                ))}
              </div>
            </fieldset>
            {target ? (
              <div>
                <Label htmlFor="reopen-reason">Motivo de reapertura *</Label>
                <select
                  id="reopen-reason"
                  value={motiveId}
                  onChange={(event) => setMotiveId(event.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
                >
                  <option value="">Seleccionar motivo</option>
                  {motives.map((motive) => (
                    <option key={motive.id} value={motive.id}>
                      {motive.nombre}
                    </option>
                  ))}
                </select>
                {selectedMotive?.descripcion ? (
                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    {selectedMotive.descripcion}
                  </p>
                ) : null}
              </div>
            ) : null}
            {selectedMotive ? (
              <div>
                <Label htmlFor="reopen-observation">
                  Observación adicional{selectedMotive.exigeObservacion ? ' *' : ''}
                </Label>
                <Textarea
                  id="reopen-observation"
                  value={observation}
                  onChange={(event) => setObservation(event.target.value)}
                  className="mt-1.5 min-h-24"
                />
              </div>
            ) : null}
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void confirm()}
            disabled={loading || submitting || !target || !motiveId}
            className="text-white"
          >
            {submitting ? 'Reabriendo…' : `Reabrir ${target === 'ORIGEN' ? 'Origen' : 'PCL'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
