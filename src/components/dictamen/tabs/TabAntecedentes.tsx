'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { db } from '@/lib/dexieClient';

type Props = {
  dictamenId: number;
  initial: {
    antecedentesClinicos: string;
    condicionSalud: string;
    descripcionHallazgos: string;
  };
  procedimientoPcl: 'A' | 'B';
  /** 👇 callback opcional para ir a la siguiente pestaña */
  onGoNext?: () => void;
};

type FieldErrors = {
  antecedentesClinicos?: boolean;
  condicionSalud?: boolean;
  descripcionHallazgos?: boolean;
};

export default function TabAntecedentes({
  dictamenId,
  initial,
  procedimientoPcl,
  onGoNext,
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // 🔹 estado para el borrador local (Dexie)
  const [draftStatus, setDraftStatus] = useState<
    'idle' | 'saving' | 'saved'
  >('idle');

  // ==========================
  // 1) Cargar borrador desde Dexie
  // ==========================
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const draft = await db.dictamenDrafts.get(dictamenId);
        if (!mounted || !draft?.data) return;

        const d = draft.data as any;

        setAntecedentesClinicos(
          d.antecedentesClinicos ?? initial.antecedentesClinicos ?? '',
        );
        setCondicionSalud(
          d.condicionSalud ?? initial.condicionSalud ?? '',
        );
        setDescripcionHallazgos(
          d.descripcionHallazgos ??
            initial.descripcionHallazgos ??
            '',
        );
      } catch (err) {
        console.error('Error cargando borrador de antecedentes:', err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [dictamenId, initial]);

  // ==========================
  // 2) Guardar borrador en Dexie (auto-save)
  // ==========================
  useEffect(() => {
    let cancelled = false;

    const handler = setTimeout(async () => {
      try {
        if (cancelled) return;
        setDraftStatus('saving');

        await db.dictamenDrafts.put({
          id: dictamenId,
          data: {
            antecedentesClinicos,
            condicionSalud,
            descripcionHallazgos,
          },
          updatedAt: Date.now(),
        });

        if (!cancelled) setDraftStatus('saved');
      } catch (err) {
        console.error('Error guardando borrador de antecedentes:', err);
        if (!cancelled) setDraftStatus('idle');
      }
    }, 800); // ⏱ debounce

    return () => {
      cancelled = true;
      clearTimeout(handler);
    };
  }, [dictamenId, antecedentesClinicos, condicionSalud, descripcionHallazgos]);

  // limpiar mensaje de "guardado" después de unos segundos
  useEffect(() => {
    if (draftStatus !== 'saved') return;
    const t = setTimeout(() => setDraftStatus('idle'), 2000);
    return () => clearTimeout(t);
  }, [draftStatus]);

  // ==========================
  // 3) Validación de campos requeridos
  // ==========================
  const validate = () => {
    const errors: FieldErrors = {};

    if (!antecedentesClinicos.trim()) {
      errors.antecedentesClinicos = true;
    }
    if (!condicionSalud.trim()) {
      errors.condicionSalud = true;
    }
    if (!descripcionHallazgos.trim()) {
      errors.descripcionHallazgos = true;
    }

    setFieldErrors(errors);

    const faltantes: string[] = [];
    if (errors.antecedentesClinicos) faltantes.push('Antecedentes clínicos');
    if (errors.condicionSalud) faltantes.push('Condición de salud actual');
    if (errors.descripcionHallazgos)
      faltantes.push('Descripción de hallazgos relevantes');

    if (faltantes.length > 0) {
      toast.error(
        `Faltan campos por llenar: ${faltantes.join(', ')}`,
      );
      return false;
    }

    return true;
  };

  // ==========================
  // 4) Guardar en backend
  // ==========================
  const handleSave = async () => {
    if (saving) return;

    // ✅ Validación previa
    const ok = validate();
    if (!ok) return;

    setSaving(true);

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
        console.error('Error guardando antecedentes', data);
        toast.error(
          data?.error ?? 'Error guardando antecedentes del dictamen',
        );
        return;
      }

      // limpiar errores de validación
      setFieldErrors({});
      toast.success('Antecedentes guardados correctamente');

      // 👉 pasar a la siguiente pestaña (si el padre mandó el callback)
      if (onGoNext) {
        onGoNext();
      }
    } catch (err) {
      console.error('Error guardando antecedentes:', err);
      toast.error('Error guardando antecedentes del dictamen');
    } finally {
      setSaving(false);
    }
  };

  // helpers para clases de error
  const baseTextareaClasses =
    'w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none';
  const normalTextareaClasses =
    'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500';
  const errorTextareaClasses =
    'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500';

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1 text-xs font-semibold text-slate-700">
          Antecedentes clínicos *
        </label>
        <textarea
          value={antecedentesClinicos}
          onChange={(e) => {
            setAntecedentesClinicos(e.target.value);
            if (fieldErrors.antecedentesClinicos) {
              setFieldErrors((prev) => ({
                ...prev,
                antecedentesClinicos: false,
              }));
            }
          }}
          rows={4}
          className={`${baseTextareaClasses} ${
            fieldErrors.antecedentesClinicos
              ? errorTextareaClasses
              : normalTextareaClasses
          }`}
        />
      </div>

      <div>
        <label className="block mb-1 text-xs font-semibold text-slate-700">
          Condición de salud actual *
        </label>
        <textarea
          value={condicionSalud}
          onChange={(e) => {
            setCondicionSalud(e.target.value);
            if (fieldErrors.condicionSalud) {
              setFieldErrors((prev) => ({
                ...prev,
                condicionSalud: false,
              }));
            }
          }}
          rows={4}
          className={`${baseTextareaClasses} ${
            fieldErrors.condicionSalud
              ? errorTextareaClasses
              : normalTextareaClasses
          }`}
        />
      </div>

      <div>
        <label className="block mb-1 text-xs font-semibold text-slate-700">
          Descripción de hallazgos relevantes *
        </label>
        <textarea
          value={descripcionHallazgos}
          onChange={(e) => {
            setDescripcionHallazgos(e.target.value);
            if (fieldErrors.descripcionHallazgos) {
              setFieldErrors((prev) => ({
                ...prev,
                descripcionHallazgos: false,
              }));
            }
          }}
          rows={5}
          className={`${baseTextareaClasses} ${
            fieldErrors.descripcionHallazgos
              ? errorTextareaClasses
              : normalTextareaClasses
          }`}
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-[11px] text-slate-400">
          {draftStatus === 'saving' && 'Guardando borrador local…'}
          {draftStatus === 'saved' && 'Borrador guardado localmente'}
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
