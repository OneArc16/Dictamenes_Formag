'use client';

import React, { useState } from 'react';

type Props = {
  dictamenId: number;
  initial: {
    antecedentesClinicos: string;
    condicionSalud: string;
    descripcionHallazgos: string;
  };
  procedimientoPcl: 'A' | 'B';
};

export default function TabAntecedentes({
  dictamenId,
  initial,
  procedimientoPcl,
}: Props) {
  const [antecedentesClinicos, setAntecedentesClinicos] = useState(
    initial.antecedentesClinicos,
  );
  const [condicionSalud, setCondicionSalud] = useState(
    initial.condicionSalud,
  );
  const [descripcionHallazgos, setDescripcionHallazgos] = useState(
    initial.descripcionHallazgos,
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/dictamenes/${dictamenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          antecedentesClinicos,
          condicionSalud,
          descripcionHallazgos,
          procedimientoPcl,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setError(
          data?.error ?? 'Error guardando antecedentes del dictamen',
        );
        return;
      }

      setMessage('Antecedentes guardados correctamente.');
    } catch (err) {
      console.error('Error guardando antecedentes:', err);
      setError('Error guardando antecedentes del dictamen.');
    } finally {
      setSaving(false);
      setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 3000);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1 text-xs font-semibold text-slate-700">
          Antecedentes clínicos
        </label>
        <textarea
          value={antecedentesClinicos}
          onChange={(e) => setAntecedentesClinicos(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 text-sm border rounded-md shadow-sm border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block mb-1 text-xs font-semibold text-slate-700">
          Condición de salud actual
        </label>
        <textarea
          value={condicionSalud}
          onChange={(e) => setCondicionSalud(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 text-sm border rounded-md shadow-sm border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block mb-1 text-xs font-semibold text-slate-700">
          Descripción de hallazgos relevantes
        </label>
        <textarea
          value={descripcionHallazgos}
          onChange={(e) => setDescripcionHallazgos(e.target.value)}
          rows={5}
          className="w-full px-3 py-2 text-sm border rounded-md shadow-sm border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-xs">
          {message && (
            <span className="text-emerald-600">{message}</span>
          )}
          {error && <span className="text-red-600">{error}</span>}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Guardando…' : 'Guardar antecedentes'}
        </button>
      </div>
    </div>
  );
}
