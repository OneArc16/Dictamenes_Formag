'use client';

import React from 'react';
import { useDictamenDraft } from '@/hooks/useDictamenDraft';

type Props = {
  dictamenId: number;
  initial: {
    antecedentesClinicos: string;
    condicionSalud: string;
    descripcionHallazgos: string;
  };
  procedimientoPcl: 'A' | 'B';
};

type DraftAntecedentes = {
  antecedentesClinicos: string;
  condicionSalud: string;
  descripcionHallazgos: string;
  procedimientoPcl: 'A' | 'B';
};

export default function TabAntecedentes({
  dictamenId,
  initial,
  procedimientoPcl,
}: Props) {
  // 🔹 Estado en Dexie (borrador local)
  const {
    draft,
    updateField,
    loaded,
    saving: savingDraft,
  } = useDictamenDraft<DraftAntecedentes>({
    dictamenId,
    initialData: {
      antecedentesClinicos: initial.antecedentesClinicos ?? '',
      condicionSalud: initial.condicionSalud ?? '',
      descripcionHallazgos: initial.descripcionHallazgos ?? '',
      procedimientoPcl,
    },
    // debounceMs: 800 // opcional
  });

  // 🔹 Estado de guardado en BACKEND (API)
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSave = async () => {
    if (saving) return;
    if (!loaded) return; // esperamos a que cargue el borrador inicial

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/dictamenes/${dictamenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          antecedentesClinicos: draft.antecedentesClinicos,
          condicionSalud: draft.condicionSalud,
          descripcionHallazgos: draft.descripcionHallazgos,
          procedimientoPcl: draft.procedimientoPcl,
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

  // Mientras Dexie carga el borrador, mostramos algo sencillo
  if (!loaded) {
    return (
      <div className="px-2 py-4 text-xs text-slate-500">
        Cargando borrador de antecedentes…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1 text-xs font-semibold text-slate-700">
          Antecedentes clínicos
        </label>
        <textarea
          value={draft.antecedentesClinicos ?? ''}
          onChange={(e) =>
            updateField('antecedentesClinicos', e.target.value)
          }
          rows={4}
          className="w-full px-3 py-2 text-sm border rounded-md shadow-sm border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block mb-1 text-xs font-semibold text-slate-700">
          Condición de salud actual
        </label>
        <textarea
          value={draft.condicionSalud ?? ''}
          onChange={(e) =>
            updateField('condicionSalud', e.target.value)
          }
          rows={4}
          className="w-full px-3 py-2 text-sm border rounded-md shadow-sm border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block mb-1 text-xs font-semibold text-slate-700">
          Descripción de hallazgos relevantes
        </label>
        <textarea
          value={draft.descripcionHallazgos ?? ''}
          onChange={(e) =>
            updateField('descripcionHallazgos', e.target.value)
          }
          rows={5}
          className="w-full px-3 py-2 text-sm border rounded-md shadow-sm border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Si en esta pestaña luego quieres que el médico cambie A/B,
          aquí podríamos meter un select / radio y usar updateField('procedimientoPcl', ...) */}

      <div className="flex items-center justify-between pt-2">
        <div className="space-y-1 text-xs">
          {message && (
            <div className="text-emerald-600">{message}</div>
          )}
          {error && <div className="text-red-600">{error}</div>}

          {/* Estado del autosave local en Dexie */}
          <div className="text-[11px] text-slate-400">
            {savingDraft
              ? 'Guardando borrador local…'
              : 'Borrador guardado localmente'}
          </div>
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
