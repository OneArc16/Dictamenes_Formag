'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import AppNav from '@/components/AppNav';

type Paciente = {
  IdUsuario: number;
  Identificaci_n_usuario: string;
  Tipo_identificaci_n: string;
  Primer_nombre: string;
  Segundo_nombre: string | null;
  Primer_apellido: string;
  Segundo_apellido: string | null;
  Sexo: string;
  Edad: string;
  Celular: string | null;
  Tel_fono: string | null;
  Direcci_n: string | null;
  Codigo_eps: string;
};
type Me = { id: string; name?: string; role?: string } | null;

export default function AdmisionesPage() {
  const [me, setMe] = useState<Me>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (mounted) setMe(data?.user ?? null);
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Paciente[]>([]);
  const [selected, setSelected] = useState<Paciente | null>(null);
  const [pending, setPending] = useState<Paciente | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  const titulo = useMemo(() => 'Buscador de pacientes', []);

  async function buscar() {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pacientes/search?q=${encodeURIComponent(q.trim())}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error ?? 'Error consultando DNA');

      const list = (data.rows as Paciente[]) ?? [];
      setRows(list);

      if (list.length === 1) {
        const p = list[0];
        const esFidu = (p.Codigo_eps ?? '').toUpperCase() === 'FIDU24';
        if (!esFidu) { setPending(p); setShowAlert(true); } else { setSelected(p); }
      }
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  function limpiar() {
    setQ(''); setRows([]); setSelected(null); setPending(null); setShowAlert(false);
  }
  function openDetail(p: Paciente) {
    const esFidu = (p.Codigo_eps ?? '').toUpperCase() === 'FIDU24';
    if (!esFidu) { setPending(p); setShowAlert(true); } else { setSelected(p); }
  }
  function onAlertClose() {
    setShowAlert(false);
    if (pending) { setSelected(pending); setPending(null); }
  }

  return (
    <div className="min-h-dvh bg-bg text-text">
      <AppNav name={me?.name} role={me?.role} />

      <header className="border-b border-subtle bg-panel/85 backdrop-blur">
        <div className="flex items-center justify-between max-w-6xl px-4 mx-auto h-14">
          <h1 className="text-lg font-semibold">{titulo}</h1>
        </div>
      </header>

      <main className="max-w-6xl px-4 py-6 mx-auto">
        <SearchBar value={q} loading={loading} onChange={setQ} onSearch={buscar} onClear={limpiar} />
        <div className="mt-6">
          <PatientTable rows={rows} loading={loading} onSelect={openDetail} />
        </div>
      </main>

      {showAlert && <AlertModal onClose={onAlertClose} />}
      {selected && <DetailModal paciente={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* ---------- UI ---------- */

function SearchBar({
  value, loading, onChange, onSearch, onClear,
}: { value: string; loading: boolean; onChange: (v: string) => void; onSearch: () => void; onClear: () => void; }) {
  return (
    <div className="p-4 border shadow-sm rounded-2xl border-subtle bg-panel">
      <form
        onSubmit={(e) => { e.preventDefault(); onSearch(); }}
        className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center"
      >
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Documento o nombre/apellido"
          className="px-4 py-3 border rounded-xl border-subtle bg-bg placeholder-muted focus:border-brand-300 focus:ring-2 focus:ring-brand-200"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="px-5 py-3 text-sm text-white border rounded-xl border-subtle bg-primary hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="px-5 py-3 text-sm border rounded-xl border-subtle bg-panel hover:bg-bg"
        >
          Limpiar
        </button>
      </form>
    </div>
  );
}

function PatientTable({
  rows, loading, onSelect,
}: { rows: Paciente[]; loading: boolean; onSelect: (p: Paciente) => void; }) {
  return (
    <div className="overflow-hidden border shadow-sm rounded-2xl border-subtle bg-panel">
      <table className="w-full text-sm">
        <thead className="bg-bg/70">
          <tr className="text-left text-muted">
            <th className="px-4 py-3">Documento</th>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Sexo</th>
            <th className="px-4 py-3">Edad</th>
            <th className="px-4 py-3">EPS</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted">
                {loading ? 'Cargando…' : 'Sin resultados'}
              </td>
            </tr>
          )}

          {rows.map((p) => {
            const nombre = fullName(p);
            const esFidu = (p.Codigo_eps ?? '').toUpperCase() === 'FIDU24';
            return (
              <tr
                key={p.IdUsuario}
                className="border-t cursor-pointer border-subtle hover:bg-bg"
                onClick={() => onSelect(p)}
              >
                <td className="px-4 py-3">{p.Identificaci_n_usuario}</td>
                <td className="px-4 py-3">{nombre}</td>
                <td className="px-4 py-3">{p.Sexo}</td>
                <td className="px-4 py-3">{p.Edad}</td>
                <td className="px-4 py-3"><EpsBadge value={p.Codigo_eps} isFidu={esFidu} /></td>
                <td className="px-4 py-3 text-right">
                  <button
                    className="rounded-lg border border-subtle bg-panel px-3 py-1.5 text-xs hover:bg-bg"
                    onClick={(e) => { e.stopPropagation(); onSelect(p); }}
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Modal Shell (blanco/azul) ---------- */

function ModalShell({
  onClose,
  children,
  maxWidth = 'max-w-xl',
  gradient = 'from-brand-400/40 via-brand-300/30 to-brand-600/40',
  ariaLabelledBy,
}: {
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  gradient?: string;
  ariaLabelledBy?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1100] grid place-items-center bg-black/50 px-4" role="dialog" aria-modal="true" aria-labelledby={ariaLabelledBy}>
      <button className="absolute inset-0 -z-10" aria-label="Cerrar" onClick={onClose} />
      <div className={`w-full ${maxWidth} rounded-2xl p-[1px] bg-gradient-to-tr ${gradient} shadow-2xl`}>
        <div className="border rounded-2xl border-subtle bg-panel">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ---------- Modal: Aviso EPS ---------- */

function AlertModal({ onClose }: { onClose: () => void }) {
  const titleId = 'alerta-eps-title';
  return (
    <ModalShell onClose={onClose} maxWidth="max-w-md" gradient="from-brand-400/40 via-brand-300/30 to-brand-600/40" ariaLabelledBy={titleId}>
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-start gap-3 mb-3">
          <span className="grid w-10 h-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700 ring-1 ring-inset ring-brand-200">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor">
              <path d="M12 9v4m0 4h.01M12 2 2 22h20L12 2Z" strokeWidth="2" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 id={titleId} className="text-base font-semibold text-text">
              Este paciente no es de la Fiduprevisora
            </h3>
            <p className="mt-1 text-sm text-muted">
              Puedes continuar: se mostrará la información del paciente igualmente.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-subtle">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg border-subtle bg-panel hover:bg-bg">
            Entendido
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ---------- Modal: Detalle Paciente ---------- */

function DetailModal({ paciente, onClose }: { paciente: Paciente; onClose: () => void }) {
  const titleId = 'detalle-paciente-title';
  const esFidu = (paciente.Codigo_eps ?? '').toUpperCase() === 'FIDU24';

  return (
    <ModalShell onClose={onClose} ariaLabelledBy={titleId}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-subtle">
        <div className="flex items-center gap-3">
          <span className="grid text-white h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-brand-400 to-brand-600">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 0c-5 0-8 3-8 6.5V21" strokeWidth="2" />
            </svg>
          </span>
          <h3 id={titleId} className="text-lg font-semibold text-text">
            {fullName(paciente)}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <EpsBadge value={paciente.Codigo_eps} isFidu={esFidu} />
          <button onClick={onClose} className="rounded-lg border border-subtle bg-panel px-3 py-1.5 text-xs hover:bg-bg">
            Cerrar
          </button>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="grid gap-3 text-sm text-text">
          <Row label="Documento">
            {paciente.Tipo_identificaci_n}-{paciente.Identificaci_n_usuario}
          </Row>
          <Row label="Sexo">{paciente.Sexo}</Row>
          <Row label="Edad">{paciente.Edad}</Row>
          <Row label="Celular">{paciente.Celular ?? '—'}</Row>
          <Row label="Teléfono">{paciente.Tel_fono ?? '—'}</Row>
          <Row label="Dirección">{paciente.Direcci_n ?? '—'}</Row>
        </div>
      </div>

      <div className="h-3 rounded-b-2xl bg-gradient-to-r from-brand-300/20 via-brand-200/20 to-brand-400/20" />
    </ModalShell>
  );
}

/* ---------- Sub-componentes ---------- */

function EpsBadge({ value, isFidu }: { value?: string; isFidu: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs ${
        isFidu
          ? 'border border-brand-300 bg-brand-50 text-brand-700'
          : 'border border-subtle bg-bg text-muted'
      }`}
    >
      {value || '—'}
    </span>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-3">
      <span className="text-muted">{label}</span>
      <span>{children}</span>
    </div>
  );
}
function fullName(p: Paciente) {
  return [p.Primer_nombre, p.Segundo_nombre ?? '', p.Primer_apellido, p.Segundo_apellido ?? '']
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}
