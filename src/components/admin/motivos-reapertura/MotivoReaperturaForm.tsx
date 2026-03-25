'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type InitialValues = {
  codigo?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
  orden?: number | null;
  estado?: boolean | null;
};

type Props = {
  method: 'POST' | 'PATCH';
  apiUrl: string;
  submitLabel?: string;
  successMessage?: string;
  onSuccessRedirectTo?: string;
  initialValues?: InitialValues;
};

type Payload = {
  codigo: string;
  nombre: string;
  descripcion: string;
  orden: number;
  estado: boolean;
};

export default function MotivoReaperturaForm({
  method,
  apiUrl,
  submitLabel = 'Guardar',
  successMessage = 'Guardado correctamente',
  onSuccessRedirectTo,
  initialValues,
}: Props) {
  const router = useRouter();

  const initial = useMemo(
    () => ({
      codigo: initialValues?.codigo ?? '',
      nombre: initialValues?.nombre ?? '',
      descripcion: initialValues?.descripcion ?? '',
      orden: String(initialValues?.orden ?? 1),
      estado: initialValues?.estado ?? true,
    }),
    [initialValues],
  );

  const [codigo, setCodigo] = useState(initial.codigo);
  const [nombre, setNombre] = useState(initial.nombre);
  const [descripcion, setDescripcion] = useState(initial.descripcion);
  const [orden, setOrden] = useState(initial.orden);
  const [estado, setEstado] = useState(initial.estado);

  useEffect(() => {
    setCodigo(initial.codigo);
    setNombre(initial.nombre);
    setDescripcion(initial.descripcion);
    setOrden(initial.orden);
    setEstado(initial.estado);
  }, [initial]);

  const mutation = useMutation({
    mutationFn: async (payload: Payload) => {
      const response = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? 'No se pudo guardar');
      }

      return data;
    },
    onSuccess: () => {
      toast.success(successMessage);
      if (onSuccessRedirectTo) {
        router.replace(onSuccessRedirectTo);
      }
      router.refresh();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar');
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mutation.isPending) return;

    const nombreNormalizado = nombre.trim();
    if (!nombreNormalizado) {
      toast.error('El nombre es obligatorio');
      return;
    }

    const ordenNormalizado = Number(orden);
    if (!Number.isInteger(ordenNormalizado) || ordenNormalizado < 1) {
      toast.error('El orden debe ser un número entero mayor o igual a 1');
      return;
    }

    mutation.mutate({
      codigo: codigo.trim().toUpperCase(),
      nombre: nombreNormalizado,
      descripcion: descripcion.trim(),
      orden: ordenNormalizado,
      estado,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="motivo-codigo" className="text-[11px] font-medium text-slate-600">
            Código
          </Label>
          <Input
            id="motivo-codigo"
            value={codigo}
            onChange={(event) => setCodigo(event.target.value.toUpperCase())}
            placeholder="Ej: CLINICA"
            className="text-[12px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="motivo-orden" className="text-[11px] font-medium text-slate-600">
            Orden *
          </Label>
          <Input
            id="motivo-orden"
            type="number"
            min={1}
            step={1}
            value={orden}
            onChange={(event) => setOrden(event.target.value)}
            className="text-[12px]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="motivo-nombre" className="text-[11px] font-medium text-slate-600">
          Nombre *
        </Label>
        <Input
          id="motivo-nombre"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          placeholder="Ej: Actualización por información clínica"
          className="text-[12px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="motivo-descripcion" className="text-[11px] font-medium text-slate-600">
          Descripción
        </Label>
        <Textarea
          id="motivo-descripcion"
          value={descripcion}
          onChange={(event) => setDescripcion(event.target.value)}
          placeholder="Describe cuándo debe usarse este motivo de reapertura."
          className="min-h-[120px] text-[12px]"
        />
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
        <Checkbox
          id="motivo-estado"
          checked={estado}
          onCheckedChange={(checked) => setEstado(checked === true)}
        />
        <div className="space-y-1">
          <Label htmlFor="motivo-estado" className="text-[12px] font-medium text-slate-700">
            Motivo activo
          </Label>
          <p className="text-[11px] leading-5 text-slate-500">
            Los motivos activos quedan disponibles para reabrir recomendaciones cerradas.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending} className="text-white hover:text-white">
          {mutation.isPending ? 'Guardando…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
