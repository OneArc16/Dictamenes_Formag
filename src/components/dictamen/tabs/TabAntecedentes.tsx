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
  /** ✅ (Opcional) versión del servidor para invalidar drafts */
  serverVersion?: string;
  /** 👇 callback opcional para ir a la siguiente pestaña */
  onGoNext?: () => void;

  /** ✅ NUEVO: modo solo lectura (admisionista / dictamen cerrado) */
  readOnly?: boolean;
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
  serverVersion,
  onGoNext,
  readOnly = false,
}: Props) {
  const initialA = initial.antecedentesClinicos ?? '';
  const initialC = initial.condicionSalud ?? '';
  const initialH = initial.descripcionHallazgos ?? '';

  const [antecedentesClinicos, setAntecedentesClinicos] = useState(initialA);
  const [condicionSalud, setCondicionSalud] = useState(initialC);
  const [descripcionHallazgos, setDescripcionHallazgos] = useState(initialH);

  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  /** ✅ evita autosave antes de cargar draft/initial */
  const [loaded, setLoaded] = useState(false);

  // ==========================
  // 1) Cargar borrador desde Dexie (con invalidación por serverVersion)
  //    ✅ en readOnly NO usamos drafts: mostramos lo del backend
  // ==========================
  useEffect(() => {
    let mounted = true;
    setLoaded(false);

    (async () => {
      try {
        if (readOnly) {
          // ✅ Solo lectura: mostrar siempre lo del backend
          setAntecedentesClinicos(initialA);
          setCondicionSalud(initialC);
          setDescripcionHallazgos(initialH);
          return;
        }

        // ✅ Si tenemos serverVersion, validamos contra dictamenMeta (si existe)
        if (serverVersion) {
          const metaTable = (db as any).dictamenMeta;
          if (metaTable?.get) {
            const meta = await metaTable.get(dictamenId);
            const localServerVersion = String(meta?.serverVersion ?? '');

            if (mounted && localServerVersion && localServerVersion !== String(serverVersion)) {
              // servidor cambió -> borrar drafts locales
              await db.dictamenDrafts.delete(dictamenId).catch(() => {});
            }
          }
        }

        const draft = await db.dictamenDrafts.get(dictamenId);

        if (!mounted) return;

        if (draft?.data) {
          const d = draft.data as any;

          // ✅ usa draft si existe, si no usa initial del backend
          setAntecedentesClinicos(d.antecedentesClinicos ?? initialA);
          setCondicionSalud(d.condicionSalud ?? initialC);
          setDescripcionHallazgos(d.descripcionHallazgos ?? initialH);
        } else {
          // ✅ sin draft -> valores del backend
          setAntecedentesClinicos(initialA);
          setCondicionSalud(initialC);
          setDescripcionHallazgos(initialH);
        }
      } catch (err) {
        console.error('Error cargando borrador de antecedentes:', err);
        if (!mounted) return;
        // fallback: backend
        setAntecedentesClinicos(initialA);
        setCondicionSalud(initialC);
        setDescripcionHallazgos(initialH);
      } finally {
        if (mounted) setLoaded(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [dictamenId, initialA, initialC, initialH, serverVersion, readOnly]);

  // ==========================
  // 2) Guardar borrador en Dexie (auto-save) — con MERGE
  //    ✅ en readOnly no guardamos drafts
  // ==========================
  useEffect(() => {
    if (!loaded) return;
    if (readOnly) return;

    let cancelled = false;

    const handler = setTimeout(async () => {
      try {
        if (cancelled) return;
        setDraftStatus('saving');

        // ✅ MERGE con lo que ya exista (no borrar fechaDictamen, procedimientoPcl, etc.)
        const existing = await db.dictamenDrafts.get(dictamenId);
        const prevData = (existing?.data ?? {}) as any;

        await db.dictamenDrafts.put({
          id: dictamenId,
          data: {
            ...prevData,
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
    }, 800);

    return () => {
      cancelled = true;
      clearTimeout(handler);
    };
  }, [loaded, readOnly, dictamenId, antecedentesClinicos, condicionSalud, descripcionHallazgos]);

  // limpiar mensaje de "guardado" después de unos segundos
  useEffect(() => {
    if (draftStatus !== 'saved') return;
    const t = setTimeout(() => setDraftStatus('idle'), 2000);
    return () => clearTimeout(t);
  }, [draftStatus]);

  // ==========================
  // 3) Validación
  // ==========================
  const validate = () => {
    const errors: FieldErrors = {};

    if (!antecedentesClinicos.trim()) errors.antecedentesClinicos = true;
    if (!condicionSalud.trim()) errors.condicionSalud = true;
    if (!descripcionHallazgos.trim()) errors.descripcionHallazgos = true;

    setFieldErrors(errors);

    const faltantes: string[] = [];
    if (errors.antecedentesClinicos) faltantes.push('Antecedentes clínicos');
    if (errors.condicionSalud) faltantes.push('Condición de salud actual');
    if (errors.descripcionHallazgos) faltantes.push('Descripción de hallazgos relevantes');

    if (faltantes.length > 0) {
      toast.error(`Faltan campos por llenar: ${faltantes.join(', ')}`);
      return false;
    }
    return true;
  };

  // ==========================
  // 4) Guardar en backend
  // ==========================
  const handleSave = async () => {
    if (readOnly) return;
    if (saving) return;

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
        toast.error(data?.error ?? 'Error guardando antecedentes del dictamen');
        return;
      }

      setFieldErrors({});
      toast.success('Antecedentes guardados correctamente');

      if (onGoNext) onGoNext();
    } catch (err) {
      console.error('Error guardando antecedentes:', err);
      toast.error('Error guardando antecedentes del dictamen');
    } finally {
      setSaving(false);
    }
  };

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
          disabled={readOnly}
          onChange={(e) => {
            if (readOnly) return;
            setAntecedentesClinicos(e.target.value);
            if (fieldErrors.antecedentesClinicos) {
              setFieldErrors((prev) => ({ ...prev, antecedentesClinicos: false }));
            }
          }}
          rows={4}
          className={`${baseTextareaClasses} ${
            fieldErrors.antecedentesClinicos ? errorTextareaClasses : normalTextareaClasses
          } ${readOnly ? 'bg-slate-50 cursor-not-allowed' : ''}`}
        />
      </div>

      <div>
        <label className="block mb-1 text-xs font-semibold text-slate-700">
          Condición de salud actual *
        </label>
        <textarea
          value={condicionSalud}
          disabled={readOnly}
          onChange={(e) => {
            if (readOnly) return;
            setCondicionSalud(e.target.value);
            if (fieldErrors.condicionSalud) {
              setFieldErrors((prev) => ({ ...prev, condicionSalud: false }));
            }
          }}
          rows={4}
          className={`${baseTextareaClasses} ${
            fieldErrors.condicionSalud ? errorTextareaClasses : normalTextareaClasses
          } ${readOnly ? 'bg-slate-50 cursor-not-allowed' : ''}`}
        />
      </div>

      <div>
        <label className="block mb-1 text-xs font-semibold text-slate-700">
          Descripción de hallazgos relevantes *
        </label>
        <textarea
          value={descripcionHallazgos}
          disabled={readOnly}
          onChange={(e) => {
            if (readOnly) return;
            setDescripcionHallazgos(e.target.value);
            if (fieldErrors.descripcionHallazgos) {
              setFieldErrors((prev) => ({ ...prev, descripcionHallazgos: false }));
            }
          }}
          rows={5}
          className={`${baseTextareaClasses} ${
            fieldErrors.descripcionHallazgos ? errorTextareaClasses : normalTextareaClasses
          } ${readOnly ? 'bg-slate-50 cursor-not-allowed' : ''}`}
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-[11px] text-slate-400">
          {readOnly ? (
            'Modo solo lectura'
          ) : (
            <>
              {!loaded && 'Cargando datos…'}
              {loaded && draftStatus === 'saving' && 'Guardando borrador local…'}
              {loaded && draftStatus === 'saved' && 'Borrador guardado localmente'}
            </>
          )}
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Guardando…' : 'Guardar antecedentes'}
          </button>
        )}
      </div>
    </div>
  );
}