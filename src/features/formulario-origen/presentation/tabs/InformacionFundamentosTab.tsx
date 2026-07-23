import { CircleSlash2, Plus, Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getDiaSemanaBogota } from '../../domain/date';
import { FormField, inputClassName, SectionActions } from '../FormField';
import type { SoporteRow, ValidationIssue } from '../types';

const FIXED_SUPPORTS: Array<{ type: SoporteRow['tipo']; label: string }> = [
  { type: 'REPORTE_ACCIDENTE_TRABAJO', label: 'Reporte de Accidente de Trabajo' },
  { type: 'DESCRIPCION_EVENTO', label: 'Descripción del Evento Ocurrido' },
  { type: 'EPICRISIS_RESUMEN_HISTORIA', label: 'Epicrisis o Resumen de Historia Clínica' },
  { type: 'CERTIFICADO_DEFUNCION', label: 'Certificado de Defunción' },
  { type: 'ANALISIS_PUESTO_TRABAJO', label: 'Análisis de Puesto de Trabajo' },
  { type: 'EXAMENES_PREOCUPACIONALES', label: 'Exámenes Preocupacionales' },
  { type: 'INVESTIGACION_ACCIDENTE', label: 'Investigación del Accidente Realizada' },
];

const STATE_LABELS = {
  APORTADO: 'Aportado',
  NO_APORTADO: 'No aportado',
  NO_APLICA: 'N.A.',
} as const;

function SupportFields({
  support,
  hasExplicitState,
  showDocumentName = false,
  readOnly,
  onChange,
  onRemove,
}: {
  support: SoporteRow;
  hasExplicitState: boolean;
  showDocumentName?: boolean;
  readOnly: boolean;
  onChange: (support: SoporteRow) => void;
  onRemove?: () => void;
}) {
  const updateDocumentDetails = (
    patch: Pick<SoporteRow, 'fechaDocumento'> | Pick<SoporteRow, 'seTuvoEnCuenta'>,
  ) => {
    onChange({
      ...support,
      ...patch,
      estado: hasExplicitState ? support.estado : 'APORTADO',
    });
  };

  return (
    <div className="space-y-4">
      {showDocumentName ? (
        <FormField
          id={`other-name-${support.id}`}
          label="Nombre del documento"
          required
        >
          <input
            id={`other-name-${support.id}`}
            value={support.nombreOtro ?? ''}
            readOnly={readOnly}
            placeholder="Ej.: Concepto de especialista"
            onChange={(event) =>
              onChange({
                ...support,
                estado: hasExplicitState ? support.estado : 'APORTADO',
                nombreOtro: event.target.value,
              })
            }
            className={inputClassName}
          />
        </FormField>
      ) : null}

      <fieldset>
        <legend className="text-sm font-medium text-slate-800">
          Estado del soporte <span className="text-rose-700">*</span>
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {(['APORTADO', 'NO_APORTADO', 'NO_APLICA'] as const).map((option) => (
            <label
              key={option}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm hover:bg-slate-50 has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-slate-50 has-[:disabled]:text-slate-500"
            >
              <input
                type="radio"
                name={`support-state-${support.tipo}-${support.id}`}
                value={option}
                checked={hasExplicitState && support.estado === option}
                disabled={readOnly}
                onChange={() => {
                  if (
                    option === 'NO_APLICA' &&
                    (support.fechaDocumento || support.seTuvoEnCuenta) &&
                    !window.confirm(
                      'Cambiar a N.A. eliminará la fecha y el texto registrado. ¿Deseas continuar?',
                    )
                  ) {
                    return;
                  }
                  onChange({
                    ...support,
                    estado: option,
                    fechaDocumento:
                      option === 'NO_APLICA' ? null : support.fechaDocumento,
                    seTuvoEnCuenta:
                      option === 'NO_APLICA' ? null : support.seTuvoEnCuenta,
                  });
                }}
                className="h-4 w-4 accent-sky-700"
              />
              {STATE_LABELS[option]}
            </label>
          ))}
        </div>
      </fieldset>

      {support.estado !== 'NO_APLICA' || !hasExplicitState ? (
        <div className="grid items-start gap-4 md:grid-cols-2">
          <FormField id={`support-date-${support.id}`} label="Fecha">
            <input
              id={`support-date-${support.id}`}
              type="date"
              value={support.fechaDocumento ?? ''}
              readOnly={readOnly}
              onChange={(event) =>
                updateDocumentDetails({
                  fechaDocumento: event.target.value || null,
                })
              }
              className={inputClassName}
            />
          </FormField>

          <FormField
            id={`support-detail-${support.id}`}
            label="Texto libre — Se tuvo en cuenta"
          >
            <textarea
              id={`support-detail-${support.id}`}
              rows={3}
              value={support.seTuvoEnCuenta ?? ''}
              readOnly={readOnly}
              placeholder="Escribe la información relevante del soporte"
              onChange={(event) =>
                updateDocumentDetails({ seTuvoEnCuenta: event.target.value })
              }
              className={`${inputClassName} resize-y`}
            />
          </FormField>
        </div>
      ) : (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Este soporte está marcado como N.A.; no requiere fecha ni texto.
        </p>
      )}

      {onRemove && !readOnly ? (
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-rose-700 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Quitar documento
        </button>
      ) : null}
    </div>
  );
}

function getStatusPresentation(support: SoporteRow | undefined) {
  const state = support?.estado;
  return {
    label: state ? STATE_LABELS[state] : 'Pendiente',
    className:
      state === 'APORTADO'
        ? 'bg-emerald-50 text-emerald-800'
        : state === 'NO_APLICA'
          ? 'bg-slate-100 text-slate-700'
          : state === 'NO_APORTADO'
            ? 'bg-amber-50 text-amber-800'
            : 'bg-rose-50 text-rose-800',
  };
}

function SupportEditor({
  type,
  label,
  support,
  readOnly,
  onChange,
}: {
  type: SoporteRow['tipo'];
  label: string;
  support: SoporteRow | undefined;
  readOnly: boolean;
  onChange: (support: SoporteRow) => void;
}) {
  const status = getStatusPresentation(support);
  const syntheticId = -Array.from(type).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  const base: SoporteRow =
    support ?? {
      id: syntheticId,
      tipo: type,
      estado: 'APORTADO',
      fechaDocumento: null,
      seTuvoEnCuenta: null,
      nombreOtro: null,
    };

  return (
    <details className="group rounded-xl border border-slate-200 bg-white">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-850 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-600">
        <span>{label}</span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </summary>
      <div className="border-t border-slate-200 p-4">
        <SupportFields
          support={base}
          hasExplicitState={Boolean(support)}
          readOnly={readOnly}
          onChange={onChange}
        />
      </div>
    </details>
  );
}

function OtherSupportsEditor({
  supports,
  readOnly,
  onChange,
  onRemove,
  onAdd,
}: {
  supports: SoporteRow[];
  readOnly: boolean;
  onChange: (support: SoporteRow) => void;
  onRemove: (supportId: number) => void;
  onAdd: () => void;
}) {
  const draft: SoporteRow = {
    id: -999_999_999,
    tipo: 'OTRO',
    estado: 'APORTADO',
    fechaDocumento: null,
    seTuvoEnCuenta: null,
    nombreOtro: '',
  };
  const visibleSupports =
    supports.length > 0 ? supports : readOnly ? [] : [draft];

  return (
    <details className="group rounded-xl border border-slate-200 bg-white">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-850 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-600">
        <span>Otros</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
          {supports.length > 0
            ? `${supports.length} ${
                supports.length === 1 ? 'documento' : 'documentos'
              }`
            : 'Sin registros'}
        </span>
      </summary>

      <div className="space-y-4 border-t border-slate-200 p-4">
        {visibleSupports.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            No hay documentos adicionales registrados.
          </p>
        ) : (
          visibleSupports.map((support, index) => (
            <fieldset
              key={support.id}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
            >
              <legend className="px-2 text-sm font-semibold text-slate-800">
                Documento {index + 1}
              </legend>
              <SupportFields
                support={support}
                hasExplicitState={supports.length > 0}
                showDocumentName
                readOnly={readOnly}
                onChange={onChange}
                onRemove={
                  supports.length > 0 ? () => onRemove(support.id) : undefined
                }
              />
            </fieldset>
          ))
        )}

        {!readOnly && supports.length > 0 ? (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-dashed border-sky-500 bg-sky-50 px-4 text-sm font-semibold text-sky-800 hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Agregar documento adicional
          </button>
        ) : null}
      </div>
    </details>
  );
}

export function InformacionFundamentosTab({
  fechaOcurrencia,
  horaOcurrencia,
  jornadaEvento,
  supports,
  readOnly,
  saving,
  issues,
  onMetaChange,
  onSupportsChange,
  onSave,
  onContinue,
}: {
  fechaOcurrencia: string | null;
  horaOcurrencia: string | null;
  jornadaEvento: 'NORMAL' | 'EXTRA' | 'NO_DETERMINADA' | null;
  supports: SoporteRow[];
  readOnly: boolean;
  saving: boolean;
  issues: ValidationIssue[];
  onMetaChange: (patch: {
    fechaOcurrencia?: string | null;
    horaOcurrencia?: string | null;
    jornadaEvento?: 'NORMAL' | 'EXTRA' | 'NO_DETERMINADA' | null;
  }) => void;
  onSupportsChange: (supports: SoporteRow[]) => void;
  onSave: () => Promise<boolean | void> | boolean | void;
  onContinue: () => void;
}) {
  const setSupport = (type: SoporteRow['tipo'], support: SoporteRow) => {
    const index = supports.findIndex((item) => item.tipo === type && item.id === support.id);
    if (index >= 0) {
      onSupportsChange(
        supports.map((item, itemIndex) => (itemIndex === index ? support : item)),
      );
    } else {
      onSupportsChange([...supports, { ...support, tipo: type }]);
    }
  };

  const allSupportsAreNotApplicable =
    FIXED_SUPPORTS.every(({ type }) =>
      supports.some(
        (support) => support.tipo === type && support.estado === 'NO_APLICA',
      ),
    ) && supports.every((support) => support.estado === 'NO_APLICA');

  const hasSupportDetailsToClear = supports.some(
    (support) =>
      Boolean(support.fechaDocumento) || Boolean(support.seTuvoEnCuenta),
  );

  const markAllSupportsAsNotApplicable = () => {
    const fixedSupports = FIXED_SUPPORTS.map(({ type }, index) => {
      const current = supports.find((support) => support.tipo === type);
      return {
        id: current?.id ?? -(index + 1),
        tipo: type,
        estado: 'NO_APLICA' as const,
        fechaDocumento: null,
        seTuvoEnCuenta: null,
        nombreOtro: null,
      };
    });
    const otherSupports = supports
      .filter((support) => support.tipo === 'OTRO')
      .map((support) => ({
        ...support,
        estado: 'NO_APLICA' as const,
        fechaDocumento: null,
        seTuvoEnCuenta: null,
      }));

    onSupportsChange([...fixedSupports, ...otherSupports]);
  };

  return (
    <div className="space-y-7">
      <fieldset className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <legend className="px-2 text-sm font-semibold text-slate-900">Datos de ocurrencia</legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField id="occurrence-date" label="Fecha de ocurrencia">
            <input
              id="occurrence-date"
              type="date"
              value={fechaOcurrencia ?? ''}
              readOnly={readOnly}
              onChange={(event) =>
                onMetaChange({ fechaOcurrencia: event.target.value || null })
              }
              className={inputClassName}
            />
          </FormField>
          <FormField id="occurrence-time" label="Hora de ocurrencia">
            <input
              id="occurrence-time"
              type="time"
              value={horaOcurrencia ?? ''}
              readOnly={readOnly}
              onChange={(event) =>
                onMetaChange({ horaOcurrencia: event.target.value || null })
              }
              className={inputClassName}
            />
          </FormField>
          <FormField id="occurrence-weekday" label="Día de la semana">
            <input
              id="occurrence-weekday"
              value={getDiaSemanaBogota(fechaOcurrencia) ?? ''}
              readOnly
              className={inputClassName}
            />
          </FormField>
          <FormField id="event-shift" label="Jornada">
            <select
              id="event-shift"
              value={jornadaEvento ?? ''}
              disabled={readOnly}
              onChange={(event) =>
                onMetaChange({
                  jornadaEvento:
                    (event.target.value as
                      | 'NORMAL'
                      | 'EXTRA'
                      | 'NO_DETERMINADA') || null,
                })
              }
              className={inputClassName}
            >
              <option value="">Seleccionar</option>
              <option value="NORMAL">Normal</option>
              <option value="EXTRA">Extra</option>
              <option value="NO_DETERMINADA">No determinada</option>
            </select>
          </FormField>
        </div>
      </fieldset>

      <section aria-labelledby="supports-heading">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3
            id="supports-heading"
            className="text-base font-semibold text-slate-900"
          >
            Soportes y fundamentos
          </h3>
          {!readOnly ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  aria-label="Marcar todos los soportes como N.A."
                  title="Marcar todos los soportes como N.A."
                  disabled={allSupportsAreNotApplicable}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center self-start rounded-full border border-slate-300 bg-white text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300 sm:self-auto"
                >
                  <CircleSlash2 className="h-5 w-5" aria-hidden="true" />
                </button>
              </AlertDialogTrigger>

              <AlertDialogContent className="w-[calc(100%_-_2rem)] max-w-sm gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-2xl">
                <AlertDialogHeader className="space-y-3 px-5 pb-4 pt-5 text-left">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                    <CircleSlash2 className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <AlertDialogTitle className="text-lg font-semibold text-slate-950">
                    Marcar todos como N.A.
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm leading-6 text-slate-600">
                    {hasSupportDetailsToClear
                      ? 'Todos los soportes quedarán como N.A. y se eliminarán las fechas y los textos registrados.'
                      : 'Todos los soportes quedarán marcados como N.A.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="gap-2 border-t border-slate-200 bg-slate-50/70 px-5 py-4">
                  <AlertDialogCancel className="mt-0 min-h-11 border-slate-300 bg-white text-slate-700 hover:bg-slate-100">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={markAllSupportsAsNotApplicable}
                    className="min-h-11 bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
        {issues.some((issue) => issue.field.startsWith('soportes.')) ? (
          <p className="mt-2 text-sm text-rose-700" role="alert">
            Aún hay soportes sin estado o con información requerida incompleta.
          </p>
        ) : null}
        <div className="mt-3 space-y-3">
          {FIXED_SUPPORTS.map(({ type, label }, fixedIndex) => {
            const support = supports.find((item) => item.tipo === type);
            return (
              <SupportEditor
                key={type}
                type={type}
                label={label}
                support={support}
                readOnly={readOnly}
                onChange={(next) =>
                  setSupport(type, {
                    ...next,
                    id: support?.id ?? -(fixedIndex + 1),
                    tipo: type,
                  })
                }
              />
            );
          })}
          <OtherSupportsEditor
            supports={supports.filter((item) => item.tipo === 'OTRO')}
            readOnly={readOnly}
            onChange={(next) => setSupport('OTRO', next)}
            onRemove={(supportId) =>
              onSupportsChange(
                supports.filter((item) => item.id !== supportId),
              )
            }
            onAdd={() =>
              onSupportsChange([
                ...supports,
                {
                  id: -Date.now(),
                  tipo: 'OTRO',
                  estado: 'NO_APORTADO',
                  fechaDocumento: null,
                  seTuvoEnCuenta: null,
                  nombreOtro: '',
                },
              ])
            }
          />
        </div>
      </section>

      <SectionActions
        saving={saving}
        readOnly={readOnly}
        onSave={onSave}
        onContinue={onContinue}
      />
    </div>
  );
}
