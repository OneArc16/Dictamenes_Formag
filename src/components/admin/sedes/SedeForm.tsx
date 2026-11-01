'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  method: 'POST' | 'PATCH';
  apiUrl: string;
  centros: Array<{ id: number; nombre: string }>;
  submitLabel?: string;
  successMessage?: string;
  onSuccessRedirectTo?: string;
  initialValues?: {
    centroMedicoId?: number | null;
    nombre?: string | null;
    codigoHabilitacion?: string | null;
    direccion?: string | null;
    telefono?: string | null;
  };
};

export default function SedeForm({
  method,
  apiUrl,
  centros,
  submitLabel = 'Guardar',
  successMessage = 'Guardado correctamente',
  onSuccessRedirectTo,
  initialValues,
}: Props) {
  const router = useRouter();

  const [centroMedicoId, setCentroMedicoId] = useState(
    String(initialValues?.centroMedicoId ?? centros[0]?.id ?? ''),
  );
  const [nombre, setNombre] = useState(initialValues?.nombre ?? '');
  const [codigoHabilitacion, setCodigoHabilitacion] = useState(initialValues?.codigoHabilitacion ?? '');
  const [direccion, setDireccion] = useState(initialValues?.direccion ?? '');
  const [telefono, setTelefono] = useState(initialValues?.telefono ?? '');

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          centroMedicoId: Number(centroMedicoId),
          nombre: nombre.trim(),
          codigoHabilitacion: codigoHabilitacion.trim(),
          direccion: direccion.trim(),
          telefono: telefono.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? 'No se pudo guardar');
      }
      return data;
    },
    onSuccess: () => {
      toast.success(successMessage);
      if (onSuccessRedirectTo) router.replace(onSuccessRedirectTo);
      router.refresh();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar');
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mutation.isPending) return;

    if (!nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (!centroMedicoId) {
      toast.error('Selecciona un centro médico');
      return;
    }
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sede-nombre" className="text-[11px] font-medium text-slate-600">
            Nombre *
          </Label>
          <Input
            id="sede-nombre"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            maxLength={100}
            className="text-[12px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sede-centro" className="text-[11px] font-medium text-slate-600">
            Centro médico *
          </Label>
          <select
            id="sede-centro"
            value={centroMedicoId}
            onChange={(event) => setCentroMedicoId(event.target.value)}
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-[12px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            {centros.map((centro) => (
              <option key={centro.id} value={centro.id}>
                {centro.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sede-codigo" className="text-[11px] font-medium text-slate-600">
            Código de habilitación
          </Label>
          <Input
            id="sede-codigo"
            value={codigoHabilitacion}
            onChange={(event) => setCodigoHabilitacion(event.target.value)}
            maxLength={50}
            className="text-[12px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sede-telefono" className="text-[11px] font-medium text-slate-600">
            Teléfono
          </Label>
          <Input
            id="sede-telefono"
            value={telefono}
            onChange={(event) => setTelefono(event.target.value)}
            maxLength={50}
            className="text-[12px]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sede-direccion" className="text-[11px] font-medium text-slate-600">
          Dirección
        </Label>
        <Input
          id="sede-direccion"
          value={direccion}
          onChange={(event) => setDireccion(event.target.value)}
          maxLength={225}
          className="text-[12px]"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending} className="text-white hover:text-white">
          {mutation.isPending ? 'Guardando…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
