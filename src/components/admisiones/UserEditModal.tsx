'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import ModalShell from '@/components/ui/ModalShell';
import type { Paciente } from '@/types/paciente';
import EpsBadge from './EpsBadge';

type Editable = Pick<Paciente, 'Celular'|'Tel_fono'|'Direcci_n'>;

export default function UserEditModal({
  paciente,
  onClose,
  onSaved,
}: {
  paciente: Paciente;
  onClose: () => void;
  onSaved: (updated: Paciente) => void;
}) {
  const titleId = 'editar-paciente-title';
  const [form, setForm] = useState<Editable>({
    Celular: paciente.Celular ?? '',
    Tel_fono: paciente.Tel_fono ?? '',
    Direcci_n: paciente.Direcci_n ?? '',
  });
  const [loading, setLoading] = useState(false);

  const esFidu = (paciente.Codigo_eps ?? '').toUpperCase() === 'FIDU24';
  const nombre = useMemo(() => fullName(paciente), [paciente]);

  const dirty =
    (form.Celular ?? '') !== (paciente.Celular ?? '') ||
    (form.Tel_fono ?? '') !== (paciente.Tel_fono ?? '') ||
    (form.Direcci_n ?? '') !== (paciente.Direcci_n ?? '');

  async function save() {
    if (!dirty || loading) return;
    setLoading(true);
    const t = toast.loading('Guardando cambios…');
    try {
      const res = await fetch(`/api/pacientes/${paciente.IdUsuario}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          celular: (form.Celular ?? '').trim(),
          telefono: (form.Tel_fono ?? '').trim(),
          direccion: (form.Direcci_n ?? '').trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'No fue posible actualizar');

      toast.success('Paciente actualizado', { id: t });
      onSaved(data.row as Paciente);
      onClose();
    } catch (e: any) {
      toast.error(e?.message || 'Error al actualizar', { id: t });
      setLoading(false);
    }
  }

  return (
    <ModalShell onClose={onClose} ariaLabelledBy={titleId}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-subtle">
        <div className="flex items-center gap-3">
          <span className="grid text-white h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-brand-400 to-brand-600">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 0c-5 0-8 3-8 6.5V21" strokeWidth="2" />
            </svg>
          </span>
          <div>
            <h3 id={titleId} className="text-lg font-semibold text-text">
              Editar paciente
            </h3>
            <p className="text-xs text-muted">{nombre}</p>
          </div>
        </div>
        <EpsBadge value={paciente.Codigo_eps} isFidu={esFidu} />
      </div>

      {/* Body (form) */}
      <div className="px-6 py-5">
        <div className="grid gap-3 text-sm">
          <Row label="Documento">
            {paciente.Tipo_identificaci_n}-{paciente.Identificaci_n_usuario}
          </Row>

          <Field label="Celular">
            <input
              inputMode="tel"
              value={form.Celular ?? ''}
              onChange={(e) => setForm((s) => ({ ...s, Celular: e.target.value }))}
              className="w-full rounded-xl border border-subtle bg-bg px-4 py-2.5 placeholder-muted focus:border-brand-300 focus:ring-2 focus:ring-brand-200"
              placeholder="3001234567"
            />
          </Field>

          <Field label="Teléfono">
            <input
              inputMode="tel"
              value={form.Tel_fono ?? ''}
              onChange={(e) => setForm((s) => ({ ...s, Tel_fono: e.target.value }))}
              className="w-full rounded-xl border border-subtle bg-bg px-4 py-2.5 placeholder-muted focus:border-brand-300 focus:ring-2 focus:ring-brand-200"
              placeholder="035xxxxxxx"
            />
          </Field>

          <Field label="Dirección">
            <input
              value={form.Direcci_n ?? ''}
              onChange={(e) => setForm((s) => ({ ...s, Direcci_n: e.target.value }))}
              className="w-full rounded-xl border border-subtle bg-bg px-4 py-2.5 placeholder-muted focus:border-brand-300 focus:ring-2 focus:ring-brand-200"
              placeholder="Calle 00 #00-00"
            />
          </Field>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-subtle">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm border rounded-lg border-subtle bg-panel hover:bg-bg"
        >
          Cancelar
        </button>
        <button
          onClick={save}
          disabled={!dirty || loading}
          className="px-4 py-2 text-sm text-white border rounded-lg border-subtle bg-primary hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </ModalShell>
  );
}

/* helpers */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-muted">{label}</span>
      {children}
    </label>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-text">{children}</span>
    </div>
  );
}
function fullName(p: Paciente) {
  return [p.Primer_nombre, p.Segundo_nombre ?? '', p.Primer_apellido, p.Segundo_apellido ?? '']
    .join(' ').replace(/\s+/g, ' ').trim().toUpperCase();
}
