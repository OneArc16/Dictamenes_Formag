'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DayPicker } from 'react-day-picker';
import { es } from 'react-day-picker/locale';
import { CalendarDays, CheckCircle2, Printer, Search, ShieldAlert, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';

import ModulePageLayout from '@/components/module-shell/ModulePageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCan } from '@/hooks/useCan';

type Patient = { id: number; documentNumber: string; documentType: string; fullName: string; birthDate: string | null; age: number | null; sex: string; eps: string | null; municipality: string | null; celular: string | null; telefono: string | null; email: string | null; direccion: string | null; contactVersion: number };
type Context = { assignedSiteId: number | null; canSelectSite: boolean; sites: { id: number; nombre: string }[] };
type Option = { id: number; nombre: string };
type Doctor = { id: number; name: string };
type Slot = { id: number; inicio: string; fin: string };
type HistoryItem = { id: number; estado: string; inicioProgramado: string; sedeNombre: string; medicoNombre: string; especialidadId: number; especialidadNombre: string; modalidadNombre: string; medioSolicitud: string; activadaAt: string | null; lockVersion: number };

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: 'include', ...init, headers: { ...(init?.body ? { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() } : {}), ...init?.headers } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) throw new Error(payload.message ?? 'No fue posible completar la operación.');
  return payload.data as T;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' }).format(new Date(value));
}
function dateKey(date: Date) { return date.toISOString().slice(0, 10); }
function futureWindow() { const start = new Date(); start.setHours(0, 0, 0, 0); const end = new Date(start); end.setDate(end.getDate() + 61); return { start, end }; }

export default function PatientReceptionPage() {
  const queryClient = useQueryClient();
  const { can: canEditPatient } = useCan('reception.patient.update');
  const { can: canPrintReminder } = useCan('appointment.reminder.print');
  const [documentNumber, setDocumentNumber] = useState('');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [contact, setContact] = useState({ celular: '', telefono: '', email: '', direccion: '' });
  const [siteId, setSiteId] = useState<number | null>(null);
  const [specialtyId, setSpecialtyId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [slotId, setSlotId] = useState<number | null>(null);
  const [medium, setMedium] = useState('PRESENCIAL');
  const [modalityId, setModalityId] = useState<number | null>(null);
  const [rescheduling, setRescheduling] = useState<HistoryItem | null>(null);
  const [historyStates, setHistoryStates] = useState<string[]>([]);
  const range = useMemo(() => futureWindow(), []);

  const context = useQuery({ queryKey: ['reception-context'], queryFn: () => api<Context>('/api/reception/context') });
  const effectiveSiteId = siteId ?? context.data?.assignedSiteId ?? null;
  const search = useMutation({
    mutationFn: () => api<{ kind: 'result'; patient: Patient | null } | { kind: 'ambiguous'; documentTypes: string[] }>('/api/reception/patients/search', { method: 'POST', body: JSON.stringify({ documentNumber }) }),
    onSuccess: (result) => {
      if (result.kind === 'ambiguous') { setPatient(null); setNotFound(false); toast.error('Selecciona el tipo de documento para continuar.'); return; }
      setPatient(result.patient); setNotFound(!result.patient);
      if (result.patient) setContact({ celular: result.patient.celular ?? '', telefono: result.patient.telefono ?? '', email: result.patient.email ?? '', direccion: result.patient.direccion ?? '' });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const specialties = useQuery({ queryKey: ['reception-specialties', effectiveSiteId], enabled: !!effectiveSiteId, queryFn: () => api<Option[]>(`/api/reception/specialties?siteId=${effectiveSiteId}`) });
  const dates = useQuery({ queryKey: ['reception-dates', effectiveSiteId, specialtyId], enabled: !!effectiveSiteId && !!specialtyId, queryFn: () => api<string[]>(`/api/reception/availability/dates?siteId=${effectiveSiteId}&specialtyId=${specialtyId}&from=${dateKey(range.start)}&to=${dateKey(range.end)}`) });
  const selectedDateKey = selectedDate ? dateKey(selectedDate) : null;
  const doctors = useQuery({ queryKey: ['reception-doctors', effectiveSiteId, specialtyId, selectedDateKey], enabled: !!effectiveSiteId && !!specialtyId && !!selectedDateKey, queryFn: () => api<Doctor[]>(`/api/reception/doctors?siteId=${effectiveSiteId}&specialtyId=${specialtyId}&date=${selectedDateKey}`) });
  const slots = useQuery({ queryKey: ['reception-slots', effectiveSiteId, specialtyId, doctorId, selectedDateKey], enabled: !!effectiveSiteId && !!specialtyId && !!doctorId && !!selectedDateKey, queryFn: () => api<Slot[]>(`/api/reception/slots?siteId=${effectiveSiteId}&specialtyId=${specialtyId}&doctorId=${doctorId}&date=${selectedDateKey}`) });
  const modalities = useQuery({ queryKey: ['reception-modalities'], queryFn: () => api<Option[]>('/api/reception/modalities') });
  const history = useQuery({ queryKey: ['reception-history', patient?.id, historyStates], enabled: !!patient, queryFn: () => api<HistoryItem[]>(`/api/reception/patients/${patient!.id}/appointments${historyStates.length ? `?states=${historyStates.join(',')}` : ''}`) });

  const contactChanged = patient && ['celular', 'telefono', 'email', 'direccion'].some((key) => contact[key as keyof typeof contact] !== (patient[key as keyof Patient] ?? ''));
  const validContact = !contact.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email);
  const saveContact = useMutation({
    mutationFn: () => api<Patient>(`/api/reception/patients/${patient!.id}/contact`, { method: 'PATCH', body: JSON.stringify({ expectedContactVersion: patient!.contactVersion, ...contact }) }),
    onSuccess: (updated) => { setPatient(updated); setContact({ celular: updated.celular ?? '', telefono: updated.telefono ?? '', email: updated.email ?? '', direccion: updated.direccion ?? '' }); toast.success('Datos de contacto guardados.'); },
    onError: (error: Error) => toast.error(error.message),
  });
  const book = useMutation({
    mutationFn: () => rescheduling
      ? api<{ id: number }>(`/api/reception/appointments/${rescheduling.id}/reschedule`, { method: 'POST', body: JSON.stringify({ expectedVersion: rescheduling.lockVersion, newSlotId: slotId, reasonCode: 'SOLICITUD_PACIENTE' }) })
      : api<{ id: number }>('/api/reception/appointments', { method: 'POST', body: JSON.stringify({ patientId: patient!.id, specialtyId, slotId, requestMedium: medium, modalityId }) }),
    onSuccess: () => { toast.success(rescheduling ? 'Cita reprogramada correctamente.' : 'Cita agendada correctamente.'); setSelectedDate(undefined); setDoctorId(null); setSlotId(null); setRescheduling(null); queryClient.invalidateQueries({ queryKey: ['reception-history', patient?.id] }); queryClient.invalidateQueries({ queryKey: ['reception-dates'] }); queryClient.invalidateQueries({ queryKey: ['reception-slots'] }); },
    onError: (error: Error) => toast.error(error.message),
  });
  const act = useMutation({ mutationFn: ({ id, version, action }: { id: number; version: number; action: 'activate' | 'cancel' }) => api(`/api/reception/appointments/${id}/${action}`, { method: 'POST', body: JSON.stringify(action === 'cancel' ? { expectedVersion: version, reasonCode: 'SOLICITUD_PACIENTE' } : { expectedVersion: version }) }), onSuccess: () => { toast.success('La cita fue actualizada.'); queryClient.invalidateQueries({ queryKey: ['reception-history', patient?.id] }); }, onError: (error: Error) => toast.error(error.message) });
  const reminder = useMutation({
    mutationFn: async ({ appointmentId, target }: { appointmentId: number; target: Window | null }) => {
      const document = await api<{ id: string }>(`/api/reception/appointments/${appointmentId}/reminder-documents`, { method: 'POST', body: '{}' });
      const url = `/api/reception/appointments/${appointmentId}/reminder-documents/${document.id}/content`;
      if (target) target.location.assign(url);
      else window.location.assign(url);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const resetForSite = (value: number) => { setSiteId(value); setSpecialtyId(null); setSelectedDate(undefined); setDoctorId(null); setSlotId(null); };
  const selectSpecialty = (value: number) => { setSpecialtyId(value); setSelectedDate(undefined); setDoctorId(null); setSlotId(null); };
  const canBook = !!patient && !!effectiveSiteId && !!specialtyId && !!selectedDate && !!doctorId && !!slotId && (!!rescheduling || !!modalityId);

  return <ModulePageLayout moduleKey="admisiones" title="Recepción de pacientes" description="Consulta institucional del paciente, actualización de contacto y asignación segura de citas." compactHero>
    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Search className="h-5 w-5 text-sky-700" /> Buscar paciente</CardTitle></CardHeader><CardContent>
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); setNotFound(false); void search.mutateAsync(); }}>
        <label className="sr-only" htmlFor="document-number">Número de documento</label><Input id="document-number" value={documentNumber} onChange={(event) => { setDocumentNumber(event.target.value); setNotFound(false); }} placeholder="Número de documento" autoComplete="off" className="h-11" />
        <Button type="submit" className="h-11 shrink-0" disabled={!documentNumber.trim() || search.isPending}>{search.isPending ? 'Buscando…' : 'Buscar'}</Button>
      </form>
      {notFound ? <p className="mt-3 flex items-center gap-2 text-sm text-amber-800" role="status" aria-live="polite" aria-atomic="true"><ShieldAlert className="h-4 w-4" />El paciente no existe. Debes crearlo antes de agendar una cita.</p> : null}
    </CardContent></Card>

    {patient ? <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)]">
      <div className="space-y-4"><Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><UserRound className="h-5 w-5 text-sky-700" /> Datos del paciente</CardTitle></CardHeader><CardContent className="space-y-5">
        <div className="grid gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-2"><div><span className="block text-xs text-slate-500">Paciente</span><strong>{patient.fullName}</strong></div><div><span className="block text-xs text-slate-500">Documento</span>{patient.documentType} · {patient.documentNumber}</div><div><span className="block text-xs text-slate-500">Nacimiento / edad</span>{patient.birthDate ?? 'Sin registrar'}{patient.age !== null ? ` · ${patient.age} años` : ''}</div><div><span className="block text-xs text-slate-500">EPS / municipio</span>{patient.eps ?? 'Sin EPS'} · {patient.municipality ?? 'Sin municipio'}</div></div>
        <fieldset disabled={!canEditPatient || saveContact.isPending} className="grid gap-3 sm:grid-cols-2"><legend className="mb-2 text-sm font-medium text-slate-800">Contacto</legend>{(['celular', 'telefono', 'email', 'direccion'] as const).map((field) => <label key={field} className={field === 'direccion' ? 'sm:col-span-2' : ''}><span className="mb-1 block text-xs font-medium capitalize text-slate-600">{field === 'direccion' ? 'Dirección' : field}</span><Input type={field === 'email' ? 'email' : field === 'celular' || field === 'telefono' ? 'tel' : 'text'} autoComplete={field === 'email' ? 'email' : field === 'direccion' ? 'street-address' : 'tel'} value={contact[field]} onChange={(event) => setContact({ ...contact, [field]: event.target.value })} className="h-11" /></label>)}</fieldset>
        {canEditPatient ? <div className="flex justify-end"><Button onClick={() => saveContact.mutate()} disabled={!contactChanged || !validContact || saveContact.isPending}>{saveContact.isPending ? 'Guardando…' : 'Guardar datos'}</Button></div> : <p className="text-sm text-slate-500">No tienes permiso para editar los datos de contacto.</p>}
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Historial de citas</CardTitle></CardHeader><CardContent><fieldset className="mb-4 flex flex-wrap gap-x-3 gap-y-2"><legend className="mb-1 text-xs font-medium text-slate-600">Filtrar estados</legend>{['ASIGNADA', 'ATENDIDA', 'REPROGRAMADA', 'CANCELADA'].map((state) => <label key={state} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={historyStates.includes(state)} onChange={() => setHistoryStates((current) => current.includes(state) ? current.filter((item) => item !== state) : [...current, state])} />{state}</label>)}</fieldset>{history.isLoading ? <p className="text-sm text-slate-500">Cargando historial…</p> : history.data?.length ? <div className="space-y-3">{history.data.map((item) => <article key={item.id} className="rounded-lg border border-slate-200 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm">{item.especialidadNombre}</strong><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">{item.estado}</span></div><p className="mt-1 text-sm text-slate-600">{formatDateTime(item.inicioProgramado)} · {item.medicoNombre}</p><p className="text-xs text-slate-500">{item.sedeNombre} · {item.modalidadNombre}</p>{item.estado === 'ASIGNADA' ? <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => act.mutate({ id: item.id, version: item.lockVersion, action: 'activate' })} disabled={!!item.activadaAt || act.isPending}>{item.activadaAt ? 'Activada' : 'Activar'}</Button><Button size="sm" variant="outline" onClick={() => { setRescheduling(item); selectSpecialty(item.especialidadId); }}>Reprogramar</Button>{canPrintReminder ? <Button size="sm" variant="outline" onClick={() => reminder.mutate({ appointmentId: item.id, target: window.open('', '_blank', 'noopener') })} disabled={reminder.isPending}><Printer aria-hidden="true" />{reminder.isPending ? 'Generando…' : 'Imprimir'}</Button> : null}<Button size="sm" variant="destructive" onClick={() => { if (window.confirm('¿Cancelar esta cita? El cupo volverá a estar disponible.')) act.mutate({ id: item.id, version: item.lockVersion, action: 'cancel' }); }} disabled={act.isPending}>Cancelar</Button></div> : null}</article>)}</div> : <p className="text-sm text-slate-500">Este paciente aún no tiene citas registradas.</p>}</CardContent></Card></div>
      <Card className="h-fit xl:sticky xl:top-4"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="h-5 w-5 text-sky-700" /> {rescheduling ? 'Reprogramar cita' : 'Asignar cita'}</CardTitle></CardHeader><CardContent className="space-y-4">
        {rescheduling ? <div className="flex items-center justify-between rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900"><span>Elige un nuevo cupo para {rescheduling.especialidadNombre}.</span><Button size="sm" variant="ghost" onClick={() => setRescheduling(null)}>Cancelar</Button></div> : null}
        <label className="block text-sm font-medium">Sede<select className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3" value={effectiveSiteId ?? ''} disabled={!context.data?.canSelectSite} onChange={(event) => resetForSite(Number(event.target.value))}><option value="">Selecciona una sede</option>{context.data?.sites.map((site) => <option key={site.id} value={site.id}>{site.nombre}</option>)}</select></label>
        <label className="block text-sm font-medium">Especialidad<select className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3" value={specialtyId ?? ''} disabled={!effectiveSiteId || specialties.isLoading} onChange={(event) => selectSpecialty(Number(event.target.value))}><option value="">Selecciona una especialidad</option>{specialties.data?.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>
        <div><span className="block text-sm font-medium">Fecha de cita</span><p className="mb-2 text-xs text-slate-500"><span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-600" />Tiene citas disponibles</p>{specialtyId ? <div className="overflow-auto rounded-lg border border-slate-200 p-2"><DayPicker mode="single" locale={es} selected={selectedDate} onSelect={(date) => { setSelectedDate(date); setDoctorId(null); setSlotId(null); }} numberOfMonths={typeof window !== 'undefined' && window.innerWidth >= 768 ? 2 : 1} disabled={{ before: range.start, after: range.end }} modifiers={{ available: (date) => (dates.data ?? []).includes(dateKey(date)) }} modifiersClassNames={{ available: 'bg-emerald-100 font-semibold text-emerald-950' }} aria-label="Calendario de disponibilidad" /></div> : <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">Selecciona una especialidad para consultar las fechas disponibles.</p>}</div>
        <label className="block text-sm font-medium">Médico<select className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3" value={doctorId ?? ''} disabled={!selectedDateKey} onChange={(event) => { setDoctorId(Number(event.target.value)); setSlotId(null); }}><option value="">Selecciona un médico</option>{doctors.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <fieldset disabled={!doctorId}><legend className="mb-1 text-sm font-medium">Hora disponible</legend><div className="flex flex-wrap gap-2">{slots.data?.map((slot) => <Button key={slot.id} type="button" size="sm" variant={slotId === slot.id ? 'default' : 'outline'} onClick={() => setSlotId(slot.id)}>{new Intl.DateTimeFormat('es-CO', { timeStyle: 'short', timeZone: 'America/Bogota' }).format(new Date(slot.inicio))}</Button>) ?? <span className="text-sm text-slate-500">Selecciona un médico.</span>}</div></fieldset>
        {!rescheduling ? <div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-medium">Medio<select className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3" value={medium} onChange={(event) => setMedium(event.target.value)}><option value="PRESENCIAL">Presencial</option><option value="TELEFONO">Teléfono</option><option value="CORREO">Correo</option><option value="WHATSAPP">WhatsApp</option></select></label><label className="block text-sm font-medium">Modalidad<select className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3" value={modalityId ?? ''} onChange={(event) => setModalityId(Number(event.target.value))}><option value="">Selecciona</option>{modalities.data?.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label></div> : null}
        <Button className="h-11 w-full" disabled={!canBook || book.isPending} onClick={() => book.mutate()}>{book.isPending ? 'Guardando…' : rescheduling ? 'Confirmar reprogramación' : 'Agendar cita'}</Button><p className="sr-only" aria-live="polite">{book.isSuccess ? (rescheduling ? 'Cita reprogramada correctamente.' : 'Cita agendada correctamente.') : ''}</p>
      </CardContent></Card>
    </div> : <Card><CardContent className="flex items-center gap-3 py-8 text-sm text-slate-500"><CheckCircle2 className="h-5 w-5 text-slate-400" />Busca un paciente por su número de documento para iniciar la recepción.</CardContent></Card>}
  </ModulePageLayout>;
}
