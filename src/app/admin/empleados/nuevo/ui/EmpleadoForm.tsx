'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type PerfilOption = { id: number; nombre: string };

export default function EmpleadoForm({ perfiles }: { perfiles: PerfilOption[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const payload = {
      tipoDocumento: form.get('tipoDocumento'),
      numeroIdentidad: form.get('numeroIdentidad'),
      primerNombre: form.get('primerNombre'),
      segundoNombre: form.get('segundoNombre'),
      primerApellido: form.get('primerApellido'),
      segundoApellido: form.get('segundoApellido'),
      email: form.get('email'),
      password: form.get('password'),
      perfilId: form.get('perfilId'),
      activo: form.get('activo') === 'on',
      telefonos: form.get('telefonos'),
      direccion: form.get('direccion'),
      registroMedico: form.get('registroMedico'),
      licencia: form.get('licencia'),
    };

    try {
      const res = await fetch('/api/admin/empleados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        setError(data?.error ?? 'No se pudo crear el empleado');
        return;
      }

      router.push('/admin/empleados');
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6 md:col-span-3">
          <label className="block text-[11px] font-medium text-slate-600">Tipo doc</label>
          <input
            name="tipoDocumento"
            placeholder="CC, CE…"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
            required
          />
        </div>

        <div className="col-span-6 md:col-span-3">
          <label className="block text-[11px] font-medium text-slate-600">Número doc</label>
          <input
            name="numeroIdentidad"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
            required
          />
        </div>

        <div className="col-span-12 md:col-span-3">
          <label className="block text-[11px] font-medium text-slate-600">Perfil</label>
          <select
            name="perfilId"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
            defaultValue=""
          >
            <option value="">(Sin perfil)</option>
            {perfiles.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end col-span-12 md:col-span-3">
          <label className="inline-flex items-center gap-2 text-[11px] text-slate-700">
            <input type="checkbox" name="activo" defaultChecked className="w-4 h-4" />
            Activo
          </label>
        </div>

        <div className="col-span-12 md:col-span-3">
          <label className="block text-[11px] font-medium text-slate-600">Primer nombre</label>
          <input name="primerNombre" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40" required />
        </div>

        <div className="col-span-12 md:col-span-3">
          <label className="block text-[11px] font-medium text-slate-600">Segundo nombre</label>
          <input name="segundoNombre" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40" />
        </div>

        <div className="col-span-12 md:col-span-3">
          <label className="block text-[11px] font-medium text-slate-600">Primer apellido</label>
          <input name="primerApellido" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40" required />
        </div>

        <div className="col-span-12 md:col-span-3">
          <label className="block text-[11px] font-medium text-slate-600">Segundo apellido</label>
          <input name="segundoApellido" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40" />
        </div>

        <div className="col-span-12 md:col-span-6">
          <label className="block text-[11px] font-medium text-slate-600">Email</label>
          <input
            name="email"
            type="email"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
            required
          />
        </div>

        <div className="col-span-12 md:col-span-6">
          <label className="block text-[11px] font-medium text-slate-600">Contraseña</label>
          <input
            name="password"
            type="password"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
            required
            minLength={6}
          />
        </div>

        <div className="col-span-12 md:col-span-6">
          <label className="block text-[11px] font-medium text-slate-600">Teléfonos</label>
          <input name="telefonos" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40" />
        </div>

        <div className="col-span-12 md:col-span-6">
          <label className="block text-[11px] font-medium text-slate-600">Dirección</label>
          <input name="direccion" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40" />
        </div>

        <div className="col-span-12 md:col-span-6">
          <label className="block text-[11px] font-medium text-slate-600">Registro médico (si aplica)</label>
          <input name="registroMedico" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40" />
        </div>

        <div className="col-span-12 md:col-span-6">
          <label className="block text-[11px] font-medium text-slate-600">Licencia (si aplica)</label>
          <input name="licencia" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40" />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Guardando…' : 'Crear empleado'}
        </button>
      </div>
    </form>
  );
}
