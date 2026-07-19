'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Search, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';

import ModulePageLayout from '@/components/module-shell/ModulePageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AgendaPreview } from '@/features/agenda/domain/types';
import { agendaRequest } from './api-client';

type SiteOption = { id: number; nombre: string };
type DoctorOption = {
  id: number;
  nombre: string;
  documento: string | null;
  especialidadPrincipal: string | null;
  tieneHorarioParticular: boolean;
};

const STEPS = ['Sede y médicos', 'Periodo y duración', 'Excluir fechas', 'Vista previa'] as const;
const QUICK_DURATIONS = [15, 20, 30, 45, 60];

function todayBogota() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function datesBetween(start: string, end: string) {
  if (!start || !end || end < start) return [];
  const dates: string[] = [];
  let cursor = start;
  while (cursor <= end && dates.length <= 90) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return dates;
}

function friendlyDate(date: string) {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}

export default function AgendaCreationWizard() {
  const router = useRouter();
  const errorRef = useRef<HTMLDivElement>(null);
  const [today] = useState(todayBogota);
  const [step, setStep] = useState(1);
  const [siteId, setSiteId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [doctorIds, setDoctorIds] = useState<Set<number>>(new Set());
  const [selectedDoctorOptions, setSelectedDoctorOptions] = useState<Map<number, DoctorOption>>(new Map());
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(addDays(today, 6));
  const [duration, setDuration] = useState(30);
  const [excludedDates, setExcludedDates] = useState<Set<string>>(new Set());
  const [doctorExclusions, setDoctorExclusions] = useState<Map<number, Set<string>>>(new Map());
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<AgendaPreview | null>(null);
  const [availability, setAvailability] = useState<AgendaPreview | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState('');

  const sitesQuery = useQuery<{ options: SiteOption[] }>({
    queryKey: ['agenda-sites'],
    queryFn: () => agendaRequest('/api/agenda/sedes/options'),
  });
  const doctorsQuery = useQuery<{ options: DoctorOption[] }>({
    queryKey: ['agenda-doctors', siteId, search],
    enabled: Boolean(siteId),
    queryFn: () => agendaRequest(`/api/agenda/medicos/options?sedeId=${siteId}&search=${encodeURIComponent(search)}`),
  });
  const doctors = doctorsQuery.data?.options ?? [];
  const selectedDoctors = [...selectedDoctorOptions.values()];
  const periodDates = useMemo(() => datesBetween(startDate, endDate), [startDate, endDate]);

  const payload = useMemo(() => ({
    sedeId: siteId,
    medicoIds: [...doctorIds],
    fechaInicial: startDate,
    fechaFinal: endDate,
    duracionMinutos: duration,
    fechasExcluidas: [...excludedDates],
    exclusionesPorMedico: [...doctorExclusions.entries()].map(([medicoId, dates]) => ({ medicoId, fechas: [...dates] })),
  }), [siteId, doctorIds, startDate, endDate, duration, excludedDates, doctorExclusions]);

  const previewMutation = useMutation<{ preview: AgendaPreview }, Error>({
    mutationFn: () => agendaRequest('/api/agenda/generaciones/preview', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: (data) => {
      setPreview(data.preview);
      setIdempotencyKey(crypto.randomUUID());
      setStep(4);
      setError('');
    },
    onError: (mutationError) => showError(mutationError.message),
  });
  const availabilityMutation = useMutation<{ preview: AgendaPreview }, Error>({
    mutationFn: () => agendaRequest('/api/agenda/generaciones/preview', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: (data) => {
      setAvailability(data.preview);
      setStep(3);
      setError(data.preview.errores.length ? data.preview.errores.join(' ') : '');
    },
    onError: (mutationError) => showError(mutationError.message),
  });
  const confirmMutation = useMutation<{ result: { generacionId: number } }, Error>({
    mutationFn: () => agendaRequest('/api/agenda/generaciones', {
      method: 'POST',
      body: JSON.stringify({ ...payload, idempotencyKey, previewFingerprint: preview?.fingerprint }),
    }),
    onSuccess: (data) => router.push(`/agenda/generaciones/${data.result.generacionId}`),
    onError: (mutationError) => showError(mutationError.message),
  });

  function showError(message: string) {
    setError(message);
    requestAnimationFrame(() => errorRef.current?.focus());
  }

  function chooseSite(value: number) {
    setSiteId(value);
    setDoctorIds(new Set());
    setSelectedDoctorOptions(new Map());
    setDoctorExclusions(new Map());
    setPreview(null);
  }

  function toggleDoctor(doctor: DoctorOption, checked: boolean) {
    setDoctorIds((current) => {
      const next = new Set(current);
      if (checked) next.add(doctor.id); else next.delete(doctor.id);
      return next;
    });
    setSelectedDoctorOptions((current) => {
      const next = new Map(current);
      if (checked) next.set(doctor.id, doctor); else next.delete(doctor.id);
      return next;
    });
    setPreview(null);
  }

  function toggleGlobalDate(date: string, include: boolean) {
    setExcludedDates((current) => {
      const next = new Set(current);
      if (include) next.delete(date); else next.add(date);
      return next;
    });
    setPreview(null);
  }

  function toggleDoctorDate(doctorId: number, date: string, exclude: boolean) {
    setDoctorExclusions((current) => {
      const next = new Map(current);
      const dates = new Set(next.get(doctorId) ?? []);
      if (exclude) dates.add(date); else dates.delete(date);
      if (dates.size) next.set(doctorId, dates); else next.delete(doctorId);
      return next;
    });
    setPreview(null);
  }

  function nextStep() {
    setError('');
    if (step === 1) {
      if (!siteId) return showError('Selecciona una sede activa.');
      if (doctorIds.size === 0) return showError('Selecciona al menos un médico.');
      setStep(2);
      return;
    }
    if (step === 2) {
      if (startDate < today) return showError('La fecha inicial debe ser hoy o una fecha futura.');
      if (endDate < startDate) return showError('La fecha final no puede ser anterior a la inicial.');
      if (periodDates.length === 0 || periodDates.length > 90) return showError('El periodo puede tener máximo 90 días.');
      if (duration < 5 || duration > 240 || duration % 5 !== 0) return showError('La duración debe ser múltiplo de 5, entre 5 y 240 minutos.');
      availabilityMutation.mutate();
      return;
    }
    if (step === 3) previewMutation.mutate();
  }

  return (
    <ModulePageLayout
      moduleKey="agenda"
      title="Crear agenda médica"
      description="Genera cupos para uno o varios médicos. El servidor valida nuevamente horarios y conflictos al confirmar."
      compactHero
    >
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 p-4 sm:p-5">
          <ol aria-label="Progreso de creación de agenda" className="grid gap-2 sm:grid-cols-4">
            {STEPS.map((label, index) => {
              const number = index + 1;
              const active = number === step;
              const complete = number < step;
              return (
                <li key={label} aria-current={active ? 'step' : undefined} className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm ${active ? 'border-sky-300 bg-sky-50 font-semibold text-sky-900' : complete ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-500'}`}>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold shadow-sm">{complete ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : number}</span>
                  <span>{label}</span>
                </li>
              );
            })}
          </ol>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {error ? <div ref={errorRef} tabIndex={-1} role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">{error}</div> : null}

          {step === 1 ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
              <section aria-labelledby="site-doctors-title" className="space-y-5">
                <div><h2 id="site-doctors-title" className="text-lg font-semibold text-slate-950">Selecciona la sede y los médicos</h2><p className="mt-1 text-sm text-slate-600">Solo aparecen empleados activos con perfil médico y sede coincidente.</p></div>
                <div className="space-y-2">
                  <Label htmlFor="agenda-site">Sede *</Label>
                  <select id="agenda-site" value={siteId ?? ''} onChange={(event) => chooseSite(Number(event.target.value))} className="min-h-11 w-full px-3 text-sm">
                    <option value="">Selecciona una sede</option>
                    {(sitesQuery.data?.options ?? []).map((site) => <option key={site.id} value={site.id}>{site.nombre}</option>)}
                  </select>
                </div>
                {siteId ? (
                  <>
                    <div className="relative"><Label htmlFor="doctor-search" className="sr-only">Buscar médico</Label><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" /><Input id="doctor-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, documento o especialidad" className="min-h-11 pl-10" /></div>
                    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-medium text-slate-700">{doctors.length} resultados</p><Button type="button" variant="outline" className="min-h-11" disabled={!doctors.length} onClick={() => { if (window.confirm(`¿Seleccionar los ${doctors.length} médicos de los resultados filtrados?`)) { setDoctorIds((current) => new Set([...current, ...doctors.map((doctor) => doctor.id)])); setSelectedDoctorOptions((current) => new Map([...current, ...doctors.map((doctor) => [doctor.id, doctor] as const)])); } }}>Seleccionar resultados</Button></div>
                    <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-2xl border border-slate-200 p-2" role="group" aria-label="Médicos elegibles">
                      {doctorsQuery.isLoading ? <p className="p-5 text-sm text-slate-500">Cargando médicos…</p> : doctors.length === 0 ? <p className="p-5 text-sm text-slate-600">No hay médicos elegibles para esta búsqueda.</p> : doctors.map((doctor) => (
                        <label key={doctor.id} htmlFor={`doctor-${doctor.id}`} className="flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border border-transparent p-3 hover:border-sky-200 hover:bg-sky-50/50">
                          <Checkbox id={`doctor-${doctor.id}`} checked={doctorIds.has(doctor.id)} onCheckedChange={(value) => toggleDoctor(doctor, value === true)} className="mt-1 h-5 w-5" />
                          <span className="min-w-0"><span className="block font-medium text-slate-900">{doctor.nombre}</span><span className="mt-1 block text-xs text-slate-500">{doctor.especialidadPrincipal ?? 'Sin especialidad principal'} · {doctor.tieneHorarioParticular ? 'Horario particular' : 'Horario de sede'}</span></span>
                        </label>
                      ))}
                    </div>
                  </>
                ) : null}
              </section>
              <aside className="h-fit rounded-2xl border border-sky-100 bg-sky-50/70 p-4 lg:sticky lg:top-5"><div className="flex items-center gap-2 font-semibold text-sky-950"><Users aria-hidden="true" /> Selección</div><p className="mt-3 text-3xl font-semibold tabular-nums text-sky-900">{doctorIds.size}</p><p className="text-sm text-sky-800">médicos seleccionados</p>{selectedDoctors.length ? <ul className="mt-4 space-y-1 text-xs text-sky-900">{selectedDoctors.slice(0, 5).map((doctor) => <li key={doctor.id} className="truncate">{doctor.nombre}</li>)}{selectedDoctors.length > 5 ? <li>y {selectedDoctors.length - 5} más</li> : null}</ul> : null}</aside>
            </div>
          ) : null}

          {step === 2 ? (
            <section aria-labelledby="period-title" className="mx-auto max-w-3xl space-y-6">
              <div><h2 id="period-title" className="text-lg font-semibold text-slate-950">Define el periodo y la duración</h2><p className="mt-1 text-sm text-slate-600">El rango es inclusivo y puede abarcar hasta 90 días naturales.</p></div>
              <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="start-date">Fecha inicial *</Label><Input id="start-date" type="date" min={today} value={startDate} onChange={(event) => { setStartDate(event.target.value); setPreview(null); }} className="min-h-11" /></div><div className="space-y-2"><Label htmlFor="end-date">Fecha final *</Label><Input id="end-date" type="date" min={startDate} max={addDays(startDate, 89)} value={endDate} onChange={(event) => { setEndDate(event.target.value); setPreview(null); }} className="min-h-11" /></div></div>
              <fieldset className="space-y-3"><legend className="text-sm font-medium text-slate-900">Duración de consulta *</legend><div className="flex flex-wrap gap-2">{QUICK_DURATIONS.map((minutes) => <Button key={minutes} type="button" variant={duration === minutes ? 'default' : 'outline'} aria-pressed={duration === minutes} onClick={() => { setDuration(minutes); setPreview(null); }} className="min-h-11 min-w-16">{minutes} min</Button>)}</div><div className="max-w-xs space-y-2"><Label htmlFor="custom-duration">Duración personalizada</Label><Input id="custom-duration" type="number" min={5} max={240} step={5} value={duration} onChange={(event) => { setDuration(Number(event.target.value)); setPreview(null); }} className="min-h-11" /><p className="text-xs text-slate-500">Múltiplos de 5, entre 5 y 240 minutos.</p></div></fieldset>
            </section>
          ) : null}

          {step === 3 ? (
            <section aria-labelledby="exclusions-title" className="space-y-5">
              <div><h2 id="exclusions-title" className="text-lg font-semibold text-slate-950">Excluye fechas manualmente</h2><p className="mt-1 text-sm text-slate-600">Por defecto todas las fechas se incluyen. El servidor ignorará automáticamente los días sin bloques laborales.</p></div>
              {(availability?.fechasLaboralesEvaluadas ?? []).length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">No se encontraron fechas con bloques laborales en el periodo. Revisa los horarios configurados.</div> : <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{(availability?.fechasLaboralesEvaluadas ?? []).map((date) => { const included = !excludedDates.has(date); return <label key={date} htmlFor={`date-${date}`} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 hover:border-sky-300"><Checkbox id={`date-${date}`} checked={included} onCheckedChange={(value) => toggleGlobalDate(date, value === true)} className="h-5 w-5" /><span className="text-sm capitalize text-slate-800">{friendlyDate(date)}</span></label>; })}</div>}
              <details className="rounded-2xl border border-slate-200 p-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold text-slate-900">Opciones avanzadas por médico</summary><div className="mt-4 space-y-4">{selectedDoctors.map((doctor) => { const doctorDates = availability?.medicos.find((item) => item.medicoId === doctor.id)?.fechasLaboralesLista ?? []; return <fieldset key={doctor.id} className="rounded-xl bg-slate-50 p-3"><legend className="px-1 text-sm font-semibold text-slate-900">{doctor.nombre}</legend><div className="mt-2 flex flex-wrap gap-2">{doctorDates.filter((date) => !excludedDates.has(date)).map((date) => { const excluded = doctorExclusions.get(doctor.id)?.has(date) ?? false; return <label key={date} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs"><Checkbox checked={excluded} onCheckedChange={(value) => toggleDoctorDate(doctor.id, date, value === true)} /><span>Excluir {date}</span></label>; })}</div></fieldset>; })}</div></details>
            </section>
          ) : null}

          {step === 4 && preview ? (
            <section aria-labelledby="preview-title" className="space-y-5">
              <div><h2 id="preview-title" className="text-lg font-semibold text-slate-950">Revisa antes de confirmar</h2><p className="mt-1 text-sm text-slate-600">La confirmación recalculará los cupos para protegerte ante cambios concurrentes.</p></div>
              {preview.errores.length ? <div role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><div className="flex gap-2 font-semibold"><AlertTriangle aria-hidden="true" /> Hay problemas que bloquean la confirmación</div><ul className="mt-2 list-disc space-y-1 pl-6">{preview.errores.map((message) => <li key={message}>{message}</li>)}</ul></div> : <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-900"><CheckCircle2 aria-hidden="true" /> La agenda está lista para confirmar.</div>}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[{ label: 'Médicos', value: preview.totalMedicos }, { label: 'Candidatos', value: preview.totalCandidatos }, { label: 'Nuevos', value: preview.totalNuevos }, { label: 'Omitidos', value: preview.totalOmitidos }].map((stat) => <div key={stat.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stat.label}</p><p className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">{stat.value}</p></div>)}</div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="p-3">Médico</th><th className="p-3">Horario efectivo</th><th className="p-3 text-right">Laborales</th><th className="p-3 text-right">Nuevos</th><th className="p-3 text-right">Omitidos</th><th className="p-3 text-right">Conflictos</th></tr></thead><tbody>{preview.medicos.map((doctor) => <tr key={doctor.medicoId} className="border-t border-slate-100"><td className="p-3 font-medium text-slate-900">{doctor.medicoNombre}</td><td className="p-3 text-slate-600">{doctor.horarioLaboralNombre ?? 'Sin horario'} {doctor.horarioOrigen ? `(${doctor.horarioOrigen === 'SEDE' ? 'sede' : 'particular'})` : ''}</td><td className="p-3 text-right tabular-nums">{doctor.fechasLaborales}</td><td className="p-3 text-right tabular-nums">{doctor.totalNuevos}</td><td className="p-3 text-right tabular-nums">{doctor.totalOmitidos}</td><td className="p-3 text-right tabular-nums">{doctor.totalConflictos}</td></tr>)}</tbody></table></div>
              <p className="rounded-xl bg-slate-100 p-4 text-sm leading-6 text-slate-700">Se crearán <strong>{preview.totalNuevos} cupos</strong> de {duration} minutos para {preview.totalMedicos} médicos en {preview.sedeNombre}, entre {startDate} y {endDate}. Se omitirán {preview.totalOmitidos} cupos existentes o pasados.</p>
            </section>
          ) : null}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" className="min-h-11" disabled={step === 1 || previewMutation.isPending || availabilityMutation.isPending || confirmMutation.isPending} onClick={() => { setError(''); setStep((current) => Math.max(1, current - 1)); }}><ArrowLeft aria-hidden="true" /> Volver</Button>
            {step < 4 ? <Button type="button" className="min-h-11 bg-sky-700 hover:bg-sky-800" disabled={previewMutation.isPending || availabilityMutation.isPending} onClick={nextStep}>{previewMutation.isPending || availabilityMutation.isPending ? 'Calculando…' : step === 3 ? 'Calcular vista previa' : 'Continuar'} <ArrowRight aria-hidden="true" /></Button> : <Button type="button" className="min-h-11 bg-emerald-700 hover:bg-emerald-800" disabled={!preview || preview.bloqueado || preview.totalNuevos === 0 || confirmMutation.isPending} onClick={() => confirmMutation.mutate()}>{confirmMutation.isPending ? 'Confirmando…' : `Confirmar ${preview?.totalNuevos ?? 0} cupos`}</Button>}
          </div>
        </CardContent>
      </Card>
    </ModulePageLayout>
  );
}
