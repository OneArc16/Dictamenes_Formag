'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock3, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { useState } from 'react';

import ModulePageLayout from '@/components/module-shell/ModulePageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { agendaRequest } from './api-client';

type Site = { id: number; nombre: string };
type Doctor = { id: number; nombre: string };
type Block = { id?: number; diaSemana: number; horaInicio: string; horaFin: string; orden?: number };
type Schedule = {
  id: number;
  sedeId: number;
  medicoId: number | null;
  medicoNombre: string | null;
  alcance: 'SEDE' | 'PARTICULAR';
  nombre: string;
  zonaHoraria: string;
  vigenteDesde: string;
  vigenteHasta: string | null;
  activo: boolean;
  utilizado: boolean;
  bloques: Block[];
};

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DEFAULT_BLOCKS: Block[] = [1, 2, 3, 4, 5].flatMap((day) => [
  { diaSemana: day, horaInicio: '08:00', horaFin: '12:00' },
  { diaSemana: day, horaInicio: '13:00', horaFin: '17:00' },
]);

function emptyDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function WorkSchedulesManager() {
  const queryClient = useQueryClient();
  const [siteId, setSiteId] = useState<number | null>(null);
  const [scope, setScope] = useState<'SEDE' | 'PARTICULAR'>('SEDE');
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [name, setName] = useState('Horario laboral de sede');
  const [from, setFrom] = useState(emptyDate);
  const [to, setTo] = useState('');
  const [timeZone, setTimeZone] = useState('America/Bogota');
  const [blocks, setBlocks] = useState<Block[]>(DEFAULT_BLOCKS);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const sitesQuery = useQuery<{ options: Site[] }>({
    queryKey: ['agenda-sites'], queryFn: () => agendaRequest('/api/agenda/sedes/options'),
  });
  const doctorsQuery = useQuery<{ options: Doctor[] }>({
    queryKey: ['agenda-doctors-schedules', siteId], enabled: Boolean(siteId),
    queryFn: () => agendaRequest(`/api/agenda/medicos/options?sedeId=${siteId}`),
  });
  const schedulesQuery = useQuery<{ rows: Schedule[] }>({
    queryKey: ['agenda-schedules', siteId], enabled: Boolean(siteId),
    queryFn: () => agendaRequest(`/api/agenda/horarios?sedeId=${siteId}&includeInactive=true`),
  });

  const payload = {
    sedeId: siteId,
    medicoId: scope === 'PARTICULAR' ? doctorId : null,
    nombre: name,
    zonaHoraria: timeZone,
    vigenteDesde: from,
    vigenteHasta: to || null,
    bloques: blocks.map((block, index) => ({ ...block, id: undefined, orden: index + 1 })),
  };
  const saveMutation = useMutation<{ id: number }, Error>({
    mutationFn: () => agendaRequest(editingId ? `/api/agenda/horarios/${editingId}` : '/api/agenda/horarios', {
      method: editingId ? 'PATCH' : 'POST', body: JSON.stringify(payload),
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['agenda-schedules', siteId] });
      resetForm();
    },
    onError: (mutationError) => setError(mutationError.message),
  });
  const deactivateMutation = useMutation<unknown, Error, number>({
    mutationFn: (id) => agendaRequest(`/api/agenda/horarios/${id}/desactivar`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agenda-schedules', siteId] }),
    onError: (mutationError) => setError(mutationError.message),
  });

  function resetForm() {
    setEditingId(null);
    setScope('SEDE');
    setDoctorId(null);
    setName('Horario laboral de sede');
    setFrom(emptyDate());
    setTo('');
    setTimeZone('America/Bogota');
    setBlocks(DEFAULT_BLOCKS);
    setError('');
  }

  function editSchedule(schedule: Schedule) {
    setEditingId(schedule.id);
    setScope(schedule.alcance);
    setDoctorId(schedule.medicoId);
    setName(schedule.nombre);
    setFrom(schedule.vigenteDesde);
    setTo(schedule.vigenteHasta ?? '');
    setTimeZone(schedule.zonaHoraria);
    setBlocks(schedule.bloques.map((block) => ({ ...block })));
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function submit() {
    setError('');
    if (!siteId) return setError('Selecciona una sede.');
    if (scope === 'PARTICULAR' && !doctorId) return setError('Selecciona el médico del horario particular.');
    if (!name.trim()) return setError('Escribe un nombre para el horario.');
    if (!from) return setError('Define la fecha inicial de vigencia.');
    if (blocks.length === 0) return setError('Agrega al menos un bloque de atención.');
    saveMutation.mutate();
  }

  return (
    <ModulePageLayout moduleKey="agenda" title="Horario laboral" description="Configura bloques semanales por sede o un horario particular con vigencia para un médico." compactHero>
      <div className="grid gap-4 xl:grid-cols-[minmax(340px,440px)_minmax(0,1fr)]">
        <Card className="h-fit border-slate-200 bg-white shadow-sm xl:sticky xl:top-4">
          <CardHeader className="border-b border-slate-100 p-5"><CardTitle className="text-base">{editingId ? `Editar horario #${editingId}` : 'Nuevo horario laboral'}</CardTitle></CardHeader>
          <CardContent className="space-y-5 p-5">
            {error ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div> : null}
            <div className="space-y-2"><Label htmlFor="schedule-site">Sede *</Label><select id="schedule-site" value={siteId ?? ''} disabled={Boolean(editingId)} onChange={(event) => { setSiteId(Number(event.target.value)); setDoctorId(null); }} className="min-h-11 w-full px-3 text-sm"><option value="">Selecciona</option>{(sitesQuery.data?.options ?? []).map((site) => <option key={site.id} value={site.id}>{site.nombre}</option>)}</select></div>
            <fieldset><legend className="text-sm font-medium text-slate-900">Alcance *</legend><div className="mt-2 grid grid-cols-2 gap-2">{(['SEDE', 'PARTICULAR'] as const).map((value) => <Button key={value} type="button" variant={scope === value ? 'default' : 'outline'} aria-pressed={scope === value} onClick={() => { setScope(value); if (value === 'SEDE') setDoctorId(null); }} className="min-h-11">{value === 'SEDE' ? 'Toda la sede' : 'Un médico'}</Button>)}</div></fieldset>
            {scope === 'PARTICULAR' ? <div className="space-y-2"><Label htmlFor="schedule-doctor">Médico *</Label><select id="schedule-doctor" value={doctorId ?? ''} onChange={(event) => setDoctorId(Number(event.target.value))} className="min-h-11 w-full px-3 text-sm"><option value="">Selecciona</option>{(doctorsQuery.data?.options ?? []).map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.nombre}</option>)}</select></div> : null}
            <div className="space-y-2"><Label htmlFor="schedule-name">Nombre *</Label><Input id="schedule-name" value={name} onChange={(event) => setName(event.target.value)} className="min-h-11" /></div>
            <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="schedule-from">Vigente desde *</Label><Input id="schedule-from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="min-h-11" /></div><div className="space-y-2"><Label htmlFor="schedule-to">Vigente hasta</Label><Input id="schedule-to" type="date" min={from} value={to} onChange={(event) => setTo(event.target.value)} className="min-h-11" /></div></div>
            <div className="space-y-2"><Label htmlFor="schedule-zone">Zona horaria IANA *</Label><Input id="schedule-zone" value={timeZone} onChange={(event) => setTimeZone(event.target.value)} className="min-h-11" /></div>
            <fieldset className="space-y-3"><legend className="font-medium text-slate-900">Bloques de atención *</legend>{DAYS.map((day, dayIndex) => { const dayNumber = dayIndex + 1; const dayBlocks = blocks.map((block, index) => ({ block, index })).filter((item) => item.block.diaSemana === dayNumber); return <div key={day} className="rounded-xl border border-slate-200 p-3"><div className="flex min-h-11 items-center justify-between gap-2"><span className="text-sm font-semibold text-slate-800">{day}</span><Button type="button" size="sm" variant="outline" className="min-h-10" onClick={() => setBlocks((current) => [...current, { diaSemana: dayNumber, horaInicio: '08:00', horaFin: '12:00' }])}><Plus aria-hidden="true" /> Bloque</Button></div><div className="space-y-2">{dayBlocks.length === 0 ? <p className="text-xs text-slate-500">Sin atención</p> : dayBlocks.map(({ block, index }) => <div key={`${dayNumber}-${index}`} className="grid grid-cols-[1fr_1fr_44px] items-end gap-2"><div><Label className="sr-only" htmlFor={`start-${dayNumber}-${index}`}>Inicio {day}</Label><Input id={`start-${dayNumber}-${index}`} type="time" value={block.horaInicio} onChange={(event) => setBlocks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, horaInicio: event.target.value } : item))} className="min-h-11" /></div><div><Label className="sr-only" htmlFor={`end-${dayNumber}-${index}`}>Fin {day}</Label><Input id={`end-${dayNumber}-${index}`} type="time" value={block.horaFin} onChange={(event) => setBlocks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, horaFin: event.target.value } : item))} className="min-h-11" /></div><Button type="button" size="icon" variant="ghost" aria-label={`Eliminar bloque de ${day}`} className="h-11 w-11 text-rose-700" onClick={() => setBlocks((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 aria-hidden="true" /></Button></div>)}</div></div>; })}</fieldset>
            <div className="flex flex-wrap gap-2"><Button type="button" onClick={submit} disabled={saveMutation.isPending} className="min-h-11 flex-1 bg-sky-700 hover:bg-sky-800">{saveMutation.isPending ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear horario'}</Button>{editingId ? <Button type="button" variant="outline" className="min-h-11" onClick={resetForm}>Cancelar</Button> : null}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm"><CardHeader className="border-b border-slate-100 p-5"><CardTitle className="text-base">Horarios configurados</CardTitle></CardHeader><CardContent className="p-4 sm:p-5">{schedulesQuery.isLoading ? <p className="py-10 text-center text-sm text-slate-500">Cargando horarios…</p> : (schedulesQuery.data?.rows ?? []).length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center"><Clock3 className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" /><p className="mt-3 font-semibold text-slate-900">No hay horarios configurados</p><p className="mt-1 text-sm text-slate-600">Crea el horario predeterminado de la sede para comenzar.</p></div> : <div className="space-y-3">{(schedulesQuery.data?.rows ?? []).map((schedule) => <article key={schedule.id} className={`rounded-2xl border p-4 ${schedule.activo ? 'border-slate-200' : 'border-slate-200 bg-slate-50 opacity-70'}`}><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-950">{schedule.nombre}</h2><span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800">{schedule.alcance === 'SEDE' ? 'Sede' : 'Particular'}</span>{!schedule.activo ? <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs">Inactivo</span> : null}</div><p className="mt-2 text-sm text-slate-600">{schedule.medicoNombre ?? 'Todos los médicos sin horario particular'} · {schedule.vigenteDesde} a {schedule.vigenteHasta ?? 'vigencia abierta'}</p><p className="mt-1 text-xs text-slate-500">{schedule.bloques.length} bloques · {schedule.zonaHoraria}{schedule.utilizado ? ' · utilizado en generaciones' : ''}</p></div>{schedule.activo ? <div className="flex gap-2"><Button type="button" size="icon" variant="outline" aria-label={`Editar ${schedule.nombre}`} className="h-11 w-11" onClick={() => editSchedule(schedule)}><Pencil aria-hidden="true" /></Button><Button type="button" size="icon" variant="outline" aria-label={`Desactivar ${schedule.nombre}`} className="h-11 w-11 text-rose-700" disabled={deactivateMutation.isPending} onClick={() => { if (window.confirm(`¿Desactivar “${schedule.nombre}”? Los cupos existentes no se modificarán.`)) deactivateMutation.mutate(schedule.id); }}><Power aria-hidden="true" /></Button></div> : null}</div><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{DAYS.map((day, index) => { const dayBlocks = schedule.bloques.filter((block) => block.diaSemana === index + 1); if (!dayBlocks.length) return null; return <div key={day} className="rounded-xl bg-slate-50 p-3 text-xs"><span className="font-semibold text-slate-700">{day}</span><span className="mt-1 block text-slate-600">{dayBlocks.map((block) => `${block.horaInicio}–${block.horaFin}`).join(' · ')}</span></div>; })}</div></article>)}</div>}</CardContent></Card>
      </div>
    </ModulePageLayout>
  );
}
