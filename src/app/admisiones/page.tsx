'use client';

import { useEffect, useMemo, useState } from 'react';
import AppNav from '@/components/AppNav';
import type { Paciente } from '@/types/paciente';
import SearchBar from '@/components/admisiones/SearchBar';
import PatientTable from '@/components/admisiones/PatientTable';
import AlertModal from '@/components/admisiones/AlertModal';
import UserEditModal from '@/components/admisiones/UserEditModal';

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

      // regla: si solo hay 1 y no es FIDU24 -> aviso primero
      if (list.length === 1) {
        const p = list[0];
        const esFidu = (p.Codigo_eps ?? '').toUpperCase() === 'FIDU24';
        if (!esFidu) { setPending(p); setShowAlert(true); }
        else { setSelected(p); }
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
    if (!esFidu) { setPending(p); setShowAlert(true); }
    else { setSelected(p); }
  }

  function onAlertClose() {
    setShowAlert(false);
    if (pending) { setSelected(pending); setPending(null); }
  }

  function onSaved(updated: Paciente) {
    // reflejar cambios en la tabla
    setRows((prev) => prev.map((r) => (r.IdUsuario === updated.IdUsuario ? { ...r, ...updated } : r)));
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
      {selected && (
        <UserEditModal
          paciente={selected}
          onClose={() => setSelected(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
