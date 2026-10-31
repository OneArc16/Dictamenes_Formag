'use client';

import { Activity, ChevronDown, History, Ruler } from 'lucide-react';
import type { ReactNode } from 'react';

import type { SignosHistorialItem } from '@/features/atenciones/application/signos-vitales';
import { inputClassName } from '@/features/formulario-origen/presentation/FormField';
import {
  SIGNO_FIELDS,
  alertaSigno,
  calcularImc,
  clasificarImc,
  formatSigno,
  type SignoKey,
  type SignosForm,
  type SignosValues,
} from '@/features/atenciones/domain/signos-vitales';

import { formatAtencionFecha, formatAtencionHora } from '../../AtencionesTable';
import { signoInputId } from '../atencion-tabs';
import type { SaveStatus } from '../useAutosave';

const FIELD = Object.fromEntries(SIGNO_FIELDS.map((field) => [field.key, field])) as Record<
  SignoKey,
  (typeof SIGNO_FIELDS)[number]
>;

/** Etiquetas cortas para que todas las tarjetas queden en una línea y alineadas. */
const TILE_LABEL: Partial<Record<SignoKey, string>> = {
  frecuenciaCardiaca: 'Frec. cardíaca',
  frecuenciaRespiratoria: 'Frec. resp.',
};

/** Referencia de normalidad en adultos que se muestra bajo cada signo. */
const NORMAL_HINT: Partial<Record<SignoKey, string>> = {
  frecuenciaCardiaca: 'Normal 60–100',
  frecuenciaRespiratoria: 'Normal 12–20',
  temperatura: 'Normal 36–37,5',
  saturacion: 'Normal ≥ 95',
};

// Campos más bajos que los del resto de formularios: aquí son muchos números cortos.
const compactInputClassName = inputClassName.replace('min-h-11', 'min-h-9').replace('py-2', 'py-1');

const SAVE_LABEL: Record<Exclude<SaveStatus, 'idle'>, string> = {
  saving: 'Guardando…',
  saved: 'Guardado',
  error: 'No se pudieron guardar',
};

const TONE_CLASS = {
  ok: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200',
};

function Chip({ tone, children }: { tone: keyof typeof TONE_CLASS; children: ReactNode }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${TONE_CLASS[tone]}`}
    >
      {children}
    </span>
  );
}

function SectionTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
      {icon}
      {children}
    </h3>
  );
}

function NumberInput({
  field,
  value,
  error,
  readOnly,
  onChange,
  showUnit = true,
}: {
  field: SignoKey;
  value: string;
  error?: string;
  readOnly: boolean;
  onChange: (value: string) => void;
  /** La presión muestra la unidad una sola vez, fuera de sus dos campos. */
  showUnit?: boolean;
}) {
  const id = signoInputId(field);
  return (
    <div className="relative">
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        readOnly={readOnly}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-label={FIELD[field].label}
        onChange={(event) => onChange(event.target.value.replace(/[^\d.,]/g, ''))}
        className={`${compactInputClassName} ${showUnit ? 'pr-11' : ''} font-semibold tabular-nums ${
          error ? 'border-rose-400 focus-visible:border-rose-500 focus-visible:ring-rose-500/25' : ''
        }`}
      />
      {showUnit ? (
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-500">
          {FIELD[field].unit}
        </span>
      ) : null}
    </div>
  );
}

function FieldError({ field, error }: { field: SignoKey; error?: string }) {
  return error ? (
    <p id={`${signoInputId(field)}-error`} className="mt-1 text-[11px] font-medium text-rose-700">
      {error}
    </p>
  ) : null;
}

function Tile({
  label,
  required,
  htmlFor,
  footer,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  htmlFor: string;
  className?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col rounded-lg border border-slate-200 bg-white p-2.5 ${className ?? ''}`}>
      <label htmlFor={htmlFor} className="truncate text-[11px] font-semibold leading-4 text-slate-700" title={label}>
        {label}
        {required ? <span className="ml-0.5 text-rose-700">*</span> : null}
      </label>
      <div className="mt-1">{children}</div>
      {footer ? (
        <div className="mt-1 flex min-h-5 flex-wrap items-center gap-1.5 text-[11px] leading-4 text-slate-500">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

function VitalTile({
  field,
  form,
  values,
  errors,
  readOnly,
  onChange,
}: {
  field: SignoKey;
  form: SignosForm;
  values: SignosValues;
  errors: Partial<Record<SignoKey, string>>;
  readOnly: boolean;
  onChange: (key: SignoKey, value: string) => void;
}) {
  const alerta = alertaSigno(field, values);
  return (
    <Tile
      label={TILE_LABEL[field] ?? FIELD[field].label}
      required={FIELD[field].required}
      htmlFor={signoInputId(field)}
      footer={
        errors[field] ? (
          <FieldError field={field} error={errors[field]} />
        ) : (
          <>
            {alerta ? <Chip tone="warning">{alerta}</Chip> : null}
            {NORMAL_HINT[field] ? <span>{NORMAL_HINT[field]}</span> : null}
          </>
        )
      }
    >
      <NumberInput
        field={field}
        value={form[field]}
        error={errors[field]}
        readOnly={readOnly}
        onChange={(value) => onChange(field, value)}
      />
    </Tile>
  );
}

function HistoryCell({ field, values }: { field: SignoKey; values: SignosValues }) {
  const alerta = alertaSigno(field, values);
  return (
    <span className={alerta ? 'font-semibold text-amber-800' : undefined} title={alerta ?? undefined}>
      {formatSigno(values[field])}
    </span>
  );
}

export function SignosVitalesTab({
  form,
  values,
  errors,
  historial,
  readOnly,
  status,
  error,
  tomadoEn,
  tomadoPor,
  onChange,
}: {
  form: SignosForm;
  values: SignosValues;
  errors: Partial<Record<SignoKey, string>>;
  historial: SignosHistorialItem[];
  readOnly: boolean;
  status: SaveStatus;
  error: string | null;
  tomadoEn: string | null;
  tomadoPor: string | null;
  onChange: (key: SignoKey, value: string) => void;
}) {
  const imc = calcularImc(values.pesoKg, values.tallaCm);
  const imcClass = clasificarImc(imc);
  const presionAlerta = alertaSigno('presionSistolica', values) ?? alertaSigno('presionDiastolica', values);
  const perimetros = SIGNO_FIELDS.filter((field) => field.group === 'perimetros');
  const perimetrosConValor = perimetros.filter((field) => form[field.key]).length;
  const previo = historial[0]?.values;
  const deltaPeso =
    values.pesoKg != null && previo?.pesoKg != null ? Math.round((values.pesoKg - previo.pesoKg) * 10) / 10 : null;

  const saveLabel = readOnly || status === 'idle' ? null : status === 'error' && error ? error : SAVE_LABEL[status];
  const tomado = tomadoEn
    ? `Tomados ${formatAtencionFecha(tomadoEn)} ${formatAtencionHora(tomadoEn)}${tomadoPor ? ` por ${tomadoPor}` : ''}`
    : null;
  const meta = [saveLabel, tomado].filter(Boolean).join(' · ');

  const historyRows: Array<{ key: string; fecha: string; medico: string; values: SignosValues; current: boolean }> = [
    ...(Object.values(values).some((value) => value != null)
      ? [{ key: 'actual', fecha: tomadoEn ?? new Date().toISOString(), medico: 'Esta atención', values, current: true }]
      : []),
    ...historial.map((item) => ({
      key: String(item.citaId),
      fecha: item.fecha,
      medico: item.medicoNombre,
      values: item.values,
      current: false,
    })),
  ];

  return (
    <div className="space-y-4">
      {meta ? (
        <p
          role="status"
          className={`text-[11px] ${status === 'error' ? 'font-medium text-rose-700' : 'text-slate-500'}`}
        >
          {meta}
        </p>
      ) : null}

      <section className="space-y-2">
        <SectionTitle icon={<Activity className="h-4 w-4 text-sky-700" aria-hidden="true" />}>
          Signos vitales
        </SectionTitle>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          <Tile
            label="Presión arterial"
            className="col-span-2 sm:col-span-1 xl:col-span-2"
            required
            htmlFor={signoInputId('presionSistolica')}
            footer={
              errors.presionSistolica || errors.presionDiastolica ? (
                <>
                  <FieldError field="presionSistolica" error={errors.presionSistolica} />
                  <FieldError field="presionDiastolica" error={errors.presionDiastolica} />
                </>
              ) : (
                <>
                  {presionAlerta ? <Chip tone="warning">{presionAlerta}</Chip> : null}
                  <span>Normal &lt; 140/90</span>
                </>
              )
            }
          >
            <div className="flex items-center gap-1.5">
              <div className="min-w-0 flex-1">
                <NumberInput
                  field="presionSistolica"
                  value={form.presionSistolica}
                  error={errors.presionSistolica}
                  readOnly={readOnly}
                  onChange={(value) => onChange('presionSistolica', value)}
                  showUnit={false}
                />
              </div>
              <span className="font-semibold text-slate-400" aria-hidden="true">
                /
              </span>
              <div className="min-w-0 flex-1">
                <NumberInput
                  field="presionDiastolica"
                  value={form.presionDiastolica}
                  error={errors.presionDiastolica}
                  readOnly={readOnly}
                  onChange={(value) => onChange('presionDiastolica', value)}
                  showUnit={false}
                />
              </div>
              <span className="text-[11px] text-slate-500">mmHg</span>
            </div>
          </Tile>
          {(['frecuenciaCardiaca', 'frecuenciaRespiratoria', 'temperatura', 'saturacion'] as const).map((field) => (
            <VitalTile
              key={field}
              field={field}
              form={form}
              values={values}
              errors={errors}
              readOnly={readOnly}
              onChange={onChange}
            />
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <SectionTitle icon={<Ruler className="h-4 w-4 text-sky-700" aria-hidden="true" />}>Antropometría</SectionTitle>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          <Tile
            label="Peso"
            required
            htmlFor={signoInputId('pesoKg')}
            footer={
              errors.pesoKg ? (
                <FieldError field="pesoKg" error={errors.pesoKg} />
              ) : deltaPeso != null && deltaPeso !== 0 ? (
                <span>
                  {deltaPeso > 0 ? '↑' : '↓'} {formatSigno(Math.abs(deltaPeso))} kg desde la toma anterior
                </span>
              ) : null
            }
          >
            <NumberInput
              field="pesoKg"
              value={form.pesoKg}
              error={errors.pesoKg}
              readOnly={readOnly}
              onChange={(value) => onChange('pesoKg', value)}
            />
          </Tile>
          <VitalTile
            field="tallaCm"
            form={form}
            values={values}
            errors={errors}
            readOnly={readOnly}
            onChange={onChange}
          />
          <div className="flex flex-col rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <span id="signo-imc" className="text-[11px] font-semibold leading-4 text-slate-700">
              IMC
            </span>
            <output
              aria-labelledby="signo-imc"
              className="mt-1 flex min-h-9 items-center text-lg font-semibold tabular-nums text-slate-900"
            >
              {formatSigno(imc)}
            </output>
            <div className="mt-1 min-h-5">
              {imcClass ? (
                <Chip tone={imcClass.tone}>{imcClass.label}</Chip>
              ) : (
                <span className="text-[11px] text-slate-500">Se calcula con peso y talla</span>
              )}
            </div>
          </div>
        </div>

        <details
          className="group rounded-lg border border-slate-200 bg-white"
          open={perimetrosConValor > 0 || undefined}
        >
          <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between gap-2 px-3 text-xs font-semibold text-slate-700 [&::-webkit-details-marker]:hidden">
            <span>
              Perímetros{' '}
              <span className="font-normal text-slate-500">
                (opcional{perimetrosConValor ? ` · ${perimetrosConValor} registrados` : ''})
              </span>
            </span>
            <ChevronDown
              className="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {perimetros.map((field) => (
              <div key={field.key}>
                <label htmlFor={signoInputId(field.key)} className="text-[11px] font-semibold text-slate-700">
                  {field.short}
                </label>
                <div className="mt-1">
                  <NumberInput
                    field={field.key}
                    value={form[field.key]}
                    error={errors[field.key]}
                    readOnly={readOnly}
                    onChange={(value) => onChange(field.key, value)}
                  />
                </div>
                <FieldError field={field.key} error={errors[field.key]} />
              </div>
            ))}
          </div>
        </details>
      </section>

      <section className="space-y-2">
        <SectionTitle icon={<History className="h-4 w-4 text-sky-700" aria-hidden="true" />}>Historial</SectionTitle>
        {historyRows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-xs text-slate-500">
            Aún no hay signos vitales registrados para este docente.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Fecha
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    PA
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    FC
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    FR
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    T°
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    SpO₂
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Peso
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Talla
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    IMC
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Médico
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 tabular-nums text-slate-700">
                {historyRows.map((row) => (
                  <tr key={row.key} className={row.current ? 'bg-sky-50/60' : undefined}>
                    <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-900">
                      {formatAtencionFecha(row.fecha)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <HistoryCell field="presionSistolica" values={row.values} />/
                      <HistoryCell field="presionDiastolica" values={row.values} />
                    </td>
                    <td className="px-3 py-2">
                      <HistoryCell field="frecuenciaCardiaca" values={row.values} />
                    </td>
                    <td className="px-3 py-2">
                      <HistoryCell field="frecuenciaRespiratoria" values={row.values} />
                    </td>
                    <td className="px-3 py-2">
                      <HistoryCell field="temperatura" values={row.values} />
                    </td>
                    <td className="px-3 py-2">
                      <HistoryCell field="saturacion" values={row.values} />
                    </td>
                    <td className="px-3 py-2">{formatSigno(row.values.pesoKg)}</td>
                    <td className="px-3 py-2">{formatSigno(row.values.tallaCm)}</td>
                    <td className="px-3 py-2">{formatSigno(calcularImc(row.values.pesoKg, row.values.tallaCm))}</td>
                    <td className="max-w-[200px] truncate px-3 py-2" title={row.medico}>
                      {row.current ? <span className="font-semibold text-sky-800">Esta atención</span> : row.medico}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
