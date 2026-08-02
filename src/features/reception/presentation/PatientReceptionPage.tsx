'use client';

import { type FormEvent, useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DayPicker } from 'react-day-picker';
import { es } from 'react-day-picker/locale';
import { BriefcaseBusiness, CalendarDays, Printer, Search, ShieldAlert, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';

import ModulePageLayout from '@/components/module-shell/ModulePageLayout';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCan } from '@/hooks/useCan';
import {
  CATEGORIA_OPTIONS,
  ESCOLARIDAD_OPTIONS,
  ESTADO_CIVIL_OPTIONS,
  FORMA_VINCULACION_OPTIONS,
  NIVEL_ESCALAFON_OPTIONS,
} from '@/components/registrar-docente/constants';

type Patient = {
  id: number; documentNumber: string; documentType: string; fullName: string; firstName: string;
  middleName: string | null; lastName: string; secondLastName: string | null; birthDate: string | null;
  age: number | null; sex: string; epsCode: string; eps: string | null; departmentCode: string | null;
  department: string | null; municipalityCode: string | null; municipality: string | null;
  neighborhood: string | null; zone: string; countryCode: string; country: string | null;
  category: string | null; celular: string | null; telefono: string | null; email: string | null;
  direccion: string | null; teacherPositionId: number | null; teacherPosition: string | null;
  teacherPositionCode: string | null;
  education: string | null; employmentStartDate: string | null; secretariatId: number | null;
  secretariat: string | null; institutionId: number | null; institution: string | null;
  employmentType: string; civilStatus: string | null; salaryGrade: string; salaryLevel: string;
  profileVersion: number;
};
type PatientProfileDraft = {
  firstName: string; middleName: string; lastName: string; secondLastName: string; birthDate: string;
  sex: string; epsCode: string; departmentCode: string; municipalityCode: string; neighborhood: string;
  zone: string; countryCode: string; category: string; celular: string; telefono: string; email: string;
  direccion: string; teacherPositionId: string; education: string; employmentStartDate: string;
  secretariatId: string; institutionId: string; employmentType: string; civilStatus: string;
  salaryGrade: string; salaryLevel: string;
};
type SearchOption = { value: string; label: string };
type ProfileOptions = {
  eps: (SearchOption & { isFideicomisos: boolean })[];
  countries: SearchOption[];
  departments: SearchOption[];
  municipalities: (SearchOption & { departmentCode: string })[];
  neighborhoods: (SearchOption & { id: number; municipalityCode: string })[];
  secretariats: SearchOption[];
};
type Context = { assignedSiteId: number | null; canSelectSite: boolean; sites: { id: number; nombre: string }[] };
type Option = { id: number; nombre: string };
type Doctor = { id: number; name: string };
type Slot = { id: number; inicio: string; fin: string };
type AppointmentReason = { codigo: string; nombre: string };
type HistoryItem = { id: number; estado: string; inicioProgramado: string; sedeNombre: string; medicoNombre: string; especialidadId: number; especialidadNombre: string; modalidadNombre: string; medioSolicitud: string; activadaAt: string | null; lockVersion: number };
type HistoryPage = { items: HistoryItem[]; nextCursor: string | null };
type Movement = { id: number; tipoEvento: string; estadoAnterior: string | null; estadoNuevo: string | null; estadoCupoAnterior: string | null; estadoCupoNuevo: string | null; createdAt: string; metadata: Record<string, unknown> | null };
type MovementPage = { items: Movement[]; nextCursor: string | null };

function csrfToken() {
  if (typeof document === 'undefined') return undefined;
  const value = document.cookie.split('; ').find((entry) => entry.startsWith('reception_csrf='))?.slice('reception_csrf='.length);
  return value ? decodeURIComponent(value) : undefined;
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const token = init?.body ? csrfToken() : undefined;
  const response = await fetch(url, { credentials: 'include', ...init, headers: { ...(init?.body ? { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID(), ...(token ? { 'X-CSRF-Token': token } : {}) } : {}), ...init?.headers } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) throw new Error(payload.message ?? 'No fue posible completar la operación.');
  return payload.data as T;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' }).format(new Date(value));
}
function dateKey(date: Date) { return date.toISOString().slice(0, 10); }
function futureWindow() { const start = new Date(); start.setHours(0, 0, 0, 0); const end = new Date(start); end.setDate(end.getDate() + 61); return { start, end }; }
function ageFromBirthDate(value: string) { if (!value) return ''; const birth = new Date(`${value}T00:00:00`); if (Number.isNaN(birth.getTime())) return ''; const today = new Date(); let age = today.getFullYear() - birth.getFullYear(); if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age -= 1; return age >= 0 ? `${age} años` : ''; }
function patientDraft(patient: Patient): PatientProfileDraft {
  return {
    firstName: patient.firstName, middleName: patient.middleName ?? '', lastName: patient.lastName,
    secondLastName: patient.secondLastName ?? '', birthDate: patient.birthDate ?? '', sex: patient.sex,
    epsCode: patient.epsCode, departmentCode: patient.departmentCode ?? '', municipalityCode: patient.municipalityCode ?? '',
    neighborhood: patient.neighborhood ?? '', zone: patient.zone, countryCode: patient.countryCode,
    category: patient.category ?? '', celular: patient.celular ?? '', telefono: patient.telefono ?? '',
    email: patient.email ?? '', direccion: patient.direccion ?? '',
    teacherPositionId: patient.teacherPositionId ? String(patient.teacherPositionId) : '', education: patient.education ?? '',
    employmentStartDate: patient.employmentStartDate ?? '', secretariatId: patient.secretariatId ? String(patient.secretariatId) : '',
    institutionId: patient.institutionId ? String(patient.institutionId) : '', employmentType: patient.employmentType ?? '',
    civilStatus: patient.civilStatus ?? '', salaryGrade: patient.salaryGrade ?? '', salaryLevel: patient.salaryLevel ?? '',
  };
}
function emptyPatientDraft(): PatientProfileDraft {
  return {
    firstName: '', middleName: '', lastName: '', secondLastName: '', birthDate: '', sex: '', epsCode: '',
    departmentCode: '', municipalityCode: '', neighborhood: '', zone: '', countryCode: '', category: '',
    celular: '', telefono: '', email: '', direccion: '', teacherPositionId: '', education: '',
    employmentStartDate: '', secretariatId: '', institutionId: '', employmentType: '', civilStatus: '',
    salaryGrade: '', salaryLevel: '',
  };
}

const DOCUMENT_TYPES = [
  { value: 'CC', label: 'Cédula de ciudadanía (CC)' },
  { value: 'TI', label: 'Tarjeta de identidad (TI)' },
  { value: 'CE', label: 'Cédula de extranjería (CE)' },
  { value: 'PA', label: 'Pasaporte (PA)' },
];

function PatientDataForm({
  patient,
  documentNumber,
  documentType,
  draft,
  options,
  canEdit,
  profileChanged,
  validProfile,
  searching,
  saving,
  notFound,
  ambiguousDocumentTypes,
  onDocumentNumberChange,
  onDocumentTypeChange,
  onDraftChange,
  onSearch,
  onSave,
}: {
  patient: Patient | null;
  documentNumber: string;
  documentType: string;
  draft: PatientProfileDraft;
  options: ProfileOptions | undefined;
  canEdit: boolean;
  profileChanged: boolean;
  validProfile: boolean;
  searching: boolean;
  saving: boolean;
  notFound: boolean;
  ambiguousDocumentTypes: string[];
  onDocumentNumberChange: (value: string) => void;
  onDocumentTypeChange: (value: string) => void;
  onDraftChange: (field: keyof PatientProfileDraft, value: string) => void;
  onSearch: () => void;
  onSave: () => void;
}) {
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch();
  };
  const [positionSearch, setPositionSearch] = useState('');
  const [institutionSearch, setInstitutionSearch] = useState('');
  const isFideicomisos = options?.eps.find((item) => item.value === draft.epsCode)?.isFideicomisos ?? false;
  const positions = useQuery({
    queryKey: ['reception-profile-positions', positionSearch],
    enabled: !!patient && positionSearch.trim().length >= 3,
    queryFn: () => api<SearchOption[]>(`/api/reception/patient-profile-options/positions?q=${encodeURIComponent(positionSearch.trim())}`),
  });
  const institutions = useQuery({
    queryKey: ['reception-profile-institutions', draft.secretariatId, draft.municipalityCode, institutionSearch],
    enabled: !!patient && isFideicomisos && !!draft.secretariatId && institutionSearch.trim().length >= 3,
    queryFn: () => {
      const params = new URLSearchParams({ secretariatId: draft.secretariatId, q: institutionSearch.trim() });
      if (draft.municipalityCode) params.set('municipalityCode', draft.municipalityCode);
      return api<SearchOption[]>(`/api/reception/patient-profile-options/institutions?${params}`);
    },
  });
  const municipalityOptions = useMemo(() => (options?.municipalities ?? []).filter((item) => !draft.departmentCode || item.departmentCode === draft.departmentCode), [draft.departmentCode, options?.municipalities]);
  const neighborhoodOptions = useMemo(() => {
    const available = (options?.neighborhoods ?? []).filter((item) => !draft.municipalityCode || item.municipalityCode === draft.municipalityCode);
    return draft.neighborhood && !available.some((item) => item.value === draft.neighborhood)
      ? [{ value: draft.neighborhood, label: draft.neighborhood }, ...available]
      : available;
  }, [draft.municipalityCode, draft.neighborhood, options?.neighborhoods]);
  const positionOptions = useMemo(() => {
    const available = positions.data ?? [];
    const currentPositionLabel = patient?.teacherPosition
      ? patient.teacherPositionCode
        ? `${patient.teacherPosition} (${patient.teacherPositionCode})`
        : patient.teacherPosition
      : null;
    return draft.teacherPositionId && currentPositionLabel && !available.some((item) => item.value === draft.teacherPositionId)
      ? [{ value: draft.teacherPositionId, label: currentPositionLabel }, ...available]
      : available;
  }, [draft.teacherPositionId, patient, positions.data]);
  const institutionOptions = useMemo(() => {
    const available = institutions.data ?? [];
    return draft.institutionId && patient?.institution && !available.some((item) => item.value === draft.institutionId)
      ? [{ value: draft.institutionId, label: patient.institution }, ...available]
      : available;
  }, [draft.institutionId, institutions.data, patient]);
  const emailInvalid = !!draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email);
  const fieldDisabled = !patient || !canEdit || saving;
  const selectClassName = 'h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500';
  const labelClassName = 'mb-1 block text-xs font-medium text-slate-700';

  return <div className="space-y-4">
    <Card>
      <CardHeader className="border-b border-slate-200 bg-slate-50/80 px-4 py-3"><CardTitle className="flex items-center gap-2 text-sm"><UserRound className="h-4 w-4 text-sky-700" /> Datos de identificación, ubicación y contacto</CardTitle></CardHeader>
      <CardContent className="space-y-3 p-4">
        <form className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-12" onSubmit={submitSearch}>
          <label className="xl:col-span-2" htmlFor="patient-document-type"><span className={labelClassName}>Tipo de documento</span><select id="patient-document-type" value={documentType} onChange={(event) => onDocumentTypeChange(event.target.value)} disabled={saving} className={selectClassName}><option value="">Sin especificar</option>{DOCUMENT_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label className="xl:col-span-3" htmlFor="document-number"><span className={labelClassName}>Número de documento</span><div className="flex items-stretch rounded-md shadow-sm"><Input id="document-number" value={documentNumber} onChange={(event) => onDocumentNumberChange(event.target.value)} disabled={saving} inputMode="numeric" autoComplete="off" className="h-11 min-w-0 flex-1 rounded-r-none border-r-0 focus:z-10" /><Button type="submit" variant="outline" className="h-11 rounded-l-none border-slate-300 px-3 text-xs font-semibold" disabled={!documentNumber.trim() || searching || saving}><Search className="h-4 w-4" aria-hidden="true" /><span className="sr-only sm:not-sr-only">{searching ? 'Buscando…' : 'Buscar'}</span></Button></div></label>
          <label className="xl:col-span-2" htmlFor="patient-birth-date"><span className={labelClassName}>Fecha de nacimiento</span><Input id="patient-birth-date" type="date" value={draft.birthDate} onChange={(event) => onDraftChange('birthDate', event.target.value)} disabled={fieldDisabled} className="h-11" /></label>
          <label className="xl:col-span-1" htmlFor="patient-age"><span className={labelClassName}>Edad</span><Input id="patient-age" value={ageFromBirthDate(draft.birthDate)} readOnly disabled={!patient} className="h-11 bg-slate-50 text-slate-700" /></label>
          <label className="xl:col-span-2" htmlFor="patient-sex"><span className={labelClassName}>Sexo</span><select id="patient-sex" value={draft.sex} onChange={(event) => onDraftChange('sex', event.target.value)} disabled={fieldDisabled} className={selectClassName}><option value="">Selecciona</option><option value="M">Masculino</option><option value="F">Femenino</option><option value="O">Otro</option></select></label>
          <label className="xl:col-span-2" htmlFor="patient-category"><span className={labelClassName}>Categoría</span><select id="patient-category" value={draft.category} onChange={(event) => onDraftChange('category', event.target.value)} disabled={fieldDisabled} className={selectClassName}><option value="">Selecciona</option>{CATEGORIA_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        </form>
        {notFound ? <p className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status" aria-live="polite" aria-atomic="true"><ShieldAlert className="h-4 w-4 shrink-0" />El paciente no existe. Debes crearlo antes de agendar una cita.</p> : null}
        {ambiguousDocumentTypes.length ? <p className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900" role="status">El número existe con varios tipos de documento ({ambiguousDocumentTypes.join(', ')}). Selecciona uno y vuelve a buscar.</p> : null}
        <fieldset className="space-y-3" disabled={fieldDisabled}><legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Datos básicos editables</legend>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-12">
            <label className="xl:col-span-2" htmlFor="patient-first-name"><span className={labelClassName}>Primer nombre</span><Input id="patient-first-name" value={draft.firstName} onChange={(event) => onDraftChange('firstName', event.target.value)} className="h-11" /></label>
            <label className="xl:col-span-2" htmlFor="patient-middle-name"><span className={labelClassName}>Segundo nombre</span><Input id="patient-middle-name" value={draft.middleName} onChange={(event) => onDraftChange('middleName', event.target.value)} className="h-11" /></label>
            <label className="xl:col-span-2" htmlFor="patient-last-name"><span className={labelClassName}>Primer apellido</span><Input id="patient-last-name" value={draft.lastName} onChange={(event) => onDraftChange('lastName', event.target.value)} className="h-11" /></label>
            <label className="xl:col-span-2" htmlFor="patient-second-last-name"><span className={labelClassName}>Segundo apellido</span><Input id="patient-second-last-name" value={draft.secondLastName} onChange={(event) => onDraftChange('secondLastName', event.target.value)} className="h-11" /></label>
            <label className="xl:col-span-4" htmlFor="patient-direccion"><span className={labelClassName}>Dirección</span><Input id="patient-direccion" value={draft.direccion} onChange={(event) => onDraftChange('direccion', event.target.value)} autoComplete="street-address" className="h-11" /></label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-12">
            <div className="xl:col-span-3"><label className={labelClassName} htmlFor="patient-department">Departamento</label><SearchableSelect id="patient-department" value={draft.departmentCode} options={options?.departments} onChange={(value) => { onDraftChange('departmentCode', value); const current = options?.municipalities.find((item) => item.value === draft.municipalityCode); if (current && current.departmentCode !== value) { onDraftChange('municipalityCode', ''); onDraftChange('neighborhood', ''); onDraftChange('institutionId', ''); setInstitutionSearch(''); } }} placeholder="Escribe departamento" disabled={fieldDisabled} /></div>
            <div className="xl:col-span-3"><label className={labelClassName} htmlFor="patient-municipality">Municipio</label><SearchableSelect id="patient-municipality" value={draft.municipalityCode} options={municipalityOptions} onChange={(value) => { if (value !== draft.municipalityCode) { onDraftChange('neighborhood', ''); onDraftChange('institutionId', ''); setInstitutionSearch(''); } onDraftChange('municipalityCode', value); }} placeholder={draft.departmentCode ? 'Escribe municipio' : 'Selecciona departamento'} disabled={fieldDisabled || !draft.departmentCode} /></div>
            <div className="xl:col-span-2"><label className={labelClassName} htmlFor="patient-neighborhood">Barrio / vereda</label><SearchableSelect id="patient-neighborhood" value={draft.neighborhood} options={neighborhoodOptions} onChange={(value) => onDraftChange('neighborhood', value)} placeholder={draft.municipalityCode ? 'Escribe barrio' : 'Selecciona municipio'} disabled={fieldDisabled || !draft.municipalityCode} /></div>
            <label className="xl:col-span-1" htmlFor="patient-zone"><span className={labelClassName}>Zona</span><select id="patient-zone" value={draft.zone} onChange={(event) => onDraftChange('zone', event.target.value)} className={selectClassName}><option value="">Selecciona</option><option value="U">Urbana</option><option value="R">Rural</option></select></label>
            <div className="xl:col-span-3"><label className={labelClassName} htmlFor="patient-country">País</label><SearchableSelect id="patient-country" value={draft.countryCode} options={options?.countries} onChange={(value) => onDraftChange('countryCode', value)} placeholder="Escribe país" disabled={fieldDisabled} /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-12">
            <div className="xl:col-span-4"><label className={labelClassName} htmlFor="patient-eps">Aseguradora (EPS)</label><SearchableSelect id="patient-eps" value={draft.epsCode} options={options?.eps} onChange={(value) => onDraftChange('epsCode', value)} placeholder="Escribe EPS" disabled={fieldDisabled} /></div>
            <label className="xl:col-span-2" htmlFor="patient-celular"><span className={labelClassName}>Celular</span><Input id="patient-celular" type="tel" value={draft.celular} onChange={(event) => onDraftChange('celular', event.target.value)} autoComplete="tel" className="h-11" /></label>
            <label className="xl:col-span-2" htmlFor="patient-telefono"><span className={labelClassName}>Teléfono</span><Input id="patient-telefono" type="tel" value={draft.telefono} onChange={(event) => onDraftChange('telefono', event.target.value)} autoComplete="tel" className="h-11" /></label>
            <label className="xl:col-span-4" htmlFor="patient-email"><span className={labelClassName}>Correo</span><Input id="patient-email" type="email" value={draft.email} onChange={(event) => onDraftChange('email', event.target.value)} autoComplete="email" className="h-11" aria-invalid={emailInvalid} aria-describedby={emailInvalid ? 'patient-email-error' : undefined} />{emailInvalid ? <span id="patient-email-error" className="mt-1 block text-xs text-red-700" role="alert">Escribe un correo válido.</span> : null}</label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-12">
            <div className="xl:col-span-6"><label className={labelClassName} htmlFor="patient-position">Cargo</label><SearchableSelect id="patient-position" value={draft.teacherPositionId} options={positionOptions} onSearch={setPositionSearch} minSearchLength={3} isLoading={positions.isFetching} onChange={(value) => onDraftChange('teacherPositionId', value)} placeholder="Escribe mínimo 3 letras" disabled={fieldDisabled} /></div>
            <label className="xl:col-span-3" htmlFor="patient-education"><span className={labelClassName}>Escolaridad</span><select id="patient-education" value={draft.education} onChange={(event) => onDraftChange('education', event.target.value)} className={selectClassName}><option value="">Selecciona</option>{ESCOLARIDAD_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="xl:col-span-3" htmlFor="patient-civil-status"><span className={labelClassName}>Estado civil</span><select id="patient-civil-status" value={draft.civilStatus} onChange={(event) => onDraftChange('civilStatus', event.target.value)} className={selectClassName}><option value="">Selecciona</option>{ESTADO_CIVIL_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          </div>
        </fieldset>
      </CardContent>
    </Card>

    {isFideicomisos ? <Card>
      <CardHeader className="border-b border-slate-200 bg-slate-50/80 px-4 py-3"><CardTitle className="flex items-center gap-2 text-sm"><BriefcaseBusiness className="h-4 w-4 text-sky-700" /> Datos laborales del docente</CardTitle></CardHeader>
      <CardContent className="space-y-3 p-4">
        <fieldset className="space-y-3" disabled={fieldDisabled}>
          <legend className="sr-only">Información laboral editable</legend>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-12">
            <label className="xl:col-span-2" htmlFor="patient-employment-start"><span className={labelClassName}>Fecha de vinculación</span><Input id="patient-employment-start" type="date" value={draft.employmentStartDate} onChange={(event) => onDraftChange('employmentStartDate', event.target.value)} className="h-11" /></label>
            <div className="xl:col-span-4"><label className={labelClassName} htmlFor="patient-secretariat">Secretaría donde labora</label><SearchableSelect id="patient-secretariat" value={draft.secretariatId} options={options?.secretariats} onChange={(value) => { if (value !== draft.secretariatId) { onDraftChange('institutionId', ''); setInstitutionSearch(''); } onDraftChange('secretariatId', value); }} placeholder="Escribe secretaría" disabled={fieldDisabled} /></div>
            <div className="xl:col-span-6"><label className={labelClassName} htmlFor="patient-institution">Institución donde labora</label><SearchableSelect id="patient-institution" value={draft.institutionId} options={institutionOptions} onSearch={setInstitutionSearch} minSearchLength={3} isLoading={institutions.isFetching} onChange={(value) => onDraftChange('institutionId', value)} placeholder={draft.secretariatId ? 'Escribe mínimo 3 letras' : 'Selecciona secretaría'} disabled={fieldDisabled || !draft.secretariatId} /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-12">
            <label className="xl:col-span-4" htmlFor="patient-employment-type"><span className={labelClassName}>Forma de vinculación</span><select id="patient-employment-type" value={draft.employmentType} onChange={(event) => onDraftChange('employmentType', event.target.value)} className={selectClassName}><option value="">Selecciona</option>{FORMA_VINCULACION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="xl:col-span-4" htmlFor="patient-salary-grade"><span className={labelClassName}>Grado de escalafón</span><Input id="patient-salary-grade" value={draft.salaryGrade} onChange={(event) => onDraftChange('salaryGrade', event.target.value)} maxLength={2} placeholder="Ej. 14 o 2A" className="h-11" /></label>
            <label className="xl:col-span-4" htmlFor="patient-salary-level"><span className={labelClassName}>Nivel de escalafón</span><select id="patient-salary-level" value={draft.salaryLevel} onChange={(event) => onDraftChange('salaryLevel', event.target.value)} className={selectClassName}><option value="">Selecciona</option>{NIVEL_ESCALAFON_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          </div>
        </fieldset>
      </CardContent>
    </Card> : null}

    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      {patient && canEdit ? <><p className={`text-xs ${!validProfile ? 'text-red-700' : 'text-slate-500'}`}>{!validProfile ? 'Completa identificación, sexo, ubicación, EPS y verifica el correo.' : profileChanged ? 'Hay cambios pendientes por guardar.' : 'Edita cualquier campo para habilitar el guardado.'}</p><Button className="h-11 shrink-0" onClick={onSave} disabled={!profileChanged || !validProfile || saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</Button></> : patient ? <p className="text-sm text-slate-500">No tienes permiso para editar los datos del paciente.</p> : <p className="text-sm text-slate-500">Busca un paciente para cargar y editar sus datos.</p>}
    </div>
  </div>;
}

function AvailabilityCalendar({
  selected,
  availableDates,
  range,
  onSelect,
}: {
  selected: Date | undefined;
  availableDates: string[];
  range: { start: Date; end: Date };
  onSelect: (date: Date | undefined) => void;
}) {
  const available = useMemo(() => new Set(availableDates), [availableDates]);
  const calendar = (months: number) => <DayPicker className="date-range-day-picker" mode="single" locale={es} selected={selected} onSelect={onSelect} numberOfMonths={months} disabled={[{ before: range.start, after: range.end }, (date) => !available.has(dateKey(date))]} modifiers={{ available: (date) => available.has(dateKey(date)) }} modifiersClassNames={{ available: 'bg-emerald-100 font-semibold text-emerald-950' }} aria-label="Calendario de disponibilidad de los próximos dos meses" />;

  return <div className="rounded-lg border border-slate-200 bg-white p-2"><div className="md:hidden">{calendar(1)}</div><div className="hidden md:block">{calendar(2)}</div></div>;
}

function InitialReceptionLayout() {
  return <section className="space-y-4" aria-label="Formulario de asignación de cita">
    <Card><CardHeader className="border-b border-slate-200 bg-slate-50/80 px-4 py-3"><CardTitle className="flex items-center gap-2 text-sm"><CalendarDays className="h-4 w-4 text-sky-700" /> Asignar cita</CardTitle></CardHeader><CardContent className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4"><label><span className="mb-1 block text-xs font-medium text-slate-700">Sede de atención</span><select disabled className="h-11 w-full rounded-md border border-slate-300 bg-slate-100 px-3 text-sm text-slate-500"><option>Selecciona un paciente</option></select></label><label><span className="mb-1 block text-xs font-medium text-slate-700">Especialidad</span><select disabled className="h-11 w-full rounded-md border border-slate-300 bg-slate-100 px-3 text-sm text-slate-500"><option>Selecciona un paciente</option></select></label><label><span className="mb-1 block text-xs font-medium text-slate-700">Médico</span><select disabled className="h-11 w-full rounded-md border border-slate-300 bg-slate-100 px-3 text-sm text-slate-500"><option>Selecciona una fecha</option></select></label><label><span className="mb-1 block text-xs font-medium text-slate-700">Modalidad</span><select disabled className="h-11 w-full rounded-md border border-slate-300 bg-slate-100 px-3 text-sm text-slate-500"><option>Selecciona un paciente</option></select></label><p className="text-xs text-slate-500 sm:col-span-2 xl:col-span-4">Busca un paciente para habilitar especialidad, calendario de dos meses y disponibilidad.</p></CardContent></Card>
    <div className="flex min-h-12 items-center justify-center rounded-lg bg-slate-700 px-4 text-center text-sm font-medium text-white shadow-sm" aria-live="polite">Fecha de cita: No hay fecha seleccionada</div>
    <Card><CardContent className="flex min-h-28 items-center justify-center p-4 text-center text-sm text-slate-600"><span>El historial de citas aparecerá aquí al consultar un paciente.</span></CardContent></Card>
  </section>;
}

export default function PatientReceptionPage() {
  const queryClient = useQueryClient();
  const { can: canEditPatient } = useCan('reception.patient.update');
  const { can: canPrintReminder } = useCan('appointment.reminder.print');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [ambiguousDocumentTypes, setAmbiguousDocumentTypes] = useState<string[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [draft, setDraft] = useState<PatientProfileDraft>(() => emptyPatientDraft());
  const [siteId, setSiteId] = useState<number | null>(null);
  const [specialtyId, setSpecialtyId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [slotId, setSlotId] = useState<number | null>(null);
  const [medium, setMedium] = useState('PRESENCIAL');
  const [modalityId, setModalityId] = useState<number | null>(null);
  const [rescheduling, setRescheduling] = useState<HistoryItem | null>(null);
  const [cancelling, setCancelling] = useState<HistoryItem | null>(null);
  const [rescheduleConfirmationOpen, setRescheduleConfirmationOpen] = useState(false);
  const [movementAppointment, setMovementAppointment] = useState<HistoryItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [historyStates, setHistoryStates] = useState<string[]>([]);
  const [historyStateSearch, setHistoryStateSearch] = useState('');
  const range = useMemo(() => futureWindow(), []);

  const context = useQuery({ queryKey: ['reception-context'], queryFn: () => api<Context>('/api/reception/context') });
  const profileOptions = useQuery({ queryKey: ['reception-patient-profile-options'], queryFn: () => api<ProfileOptions>('/api/reception/patient-profile-options') });
  const effectiveSiteId = siteId ?? context.data?.assignedSiteId ?? null;
  const search = useMutation({
    mutationFn: () => api<{ kind: 'result'; patient: Patient | null } | { kind: 'ambiguous'; documentTypes: string[] }>('/api/reception/patients/search', { method: 'POST', body: JSON.stringify({ documentNumber, ...(documentType ? { documentType } : {}) }) }),
    onSuccess: (result) => {
      if (result.kind === 'ambiguous') { setPatient(null); setDraft(emptyPatientDraft()); setNotFound(false); setAmbiguousDocumentTypes(result.documentTypes); toast.error('Selecciona el tipo de documento para continuar.'); return; }
      setAmbiguousDocumentTypes([]);
      setPatient(result.patient); setNotFound(!result.patient);
      if (result.patient) { setDocumentNumber(result.patient.documentNumber); setDocumentType(result.patient.documentType); setDraft(patientDraft(result.patient)); }
      else setDraft(emptyPatientDraft());
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const specialties = useQuery({ queryKey: ['reception-specialties', effectiveSiteId], enabled: !!effectiveSiteId, queryFn: () => api<Option[]>(`/api/reception/specialties?siteId=${effectiveSiteId}`) });
  const dates = useQuery({ queryKey: ['reception-dates', effectiveSiteId, specialtyId], enabled: !!effectiveSiteId && !!specialtyId, queryFn: () => api<string[]>(`/api/reception/availability/dates?siteId=${effectiveSiteId}&specialtyId=${specialtyId}&from=${dateKey(range.start)}&to=${dateKey(range.end)}`) });
  const selectedDateKey = selectedDate ? dateKey(selectedDate) : null;
  const doctors = useQuery({ queryKey: ['reception-doctors', effectiveSiteId, specialtyId, selectedDateKey], enabled: !!effectiveSiteId && !!specialtyId && !!selectedDateKey, queryFn: () => api<Doctor[]>(`/api/reception/doctors?siteId=${effectiveSiteId}&specialtyId=${specialtyId}&date=${selectedDateKey}`) });
  const slots = useQuery({ queryKey: ['reception-slots', effectiveSiteId, specialtyId, doctorId, selectedDateKey], enabled: !!effectiveSiteId && !!specialtyId && !!doctorId && !!selectedDateKey, queryFn: () => api<Slot[]>(`/api/reception/slots?siteId=${effectiveSiteId}&specialtyId=${specialtyId}&doctorId=${doctorId}&date=${selectedDateKey}`) });
  const modalities = useQuery({ queryKey: ['reception-modalities'], queryFn: () => api<Option[]>('/api/reception/modalities') });
  const cancelReasons = useQuery({ queryKey: ['reception-reasons', 'CANCELACION'], queryFn: () => api<AppointmentReason[]>('/api/reception/appointment-reasons?type=CANCELACION') });
  const rescheduleReasons = useQuery({ queryKey: ['reception-reasons', 'REPROGRAMACION'], queryFn: () => api<AppointmentReason[]>('/api/reception/appointment-reasons?type=REPROGRAMACION') });
  const history = useInfiniteQuery({
    queryKey: ['reception-history', patient?.id, historyStates], enabled: !!patient, initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => { const query = new URLSearchParams({ pageSize: '20' }); if (historyStates.length) query.set('states', historyStates.join(',')); if (pageParam) query.set('cursor', pageParam); return api<HistoryPage>(`/api/reception/patients/${patient!.id}/appointments?${query}`); },
    getNextPageParam: (page) => page.nextCursor,
  });
  const movements = useInfiniteQuery({
    queryKey: ['appointment-movements', movementAppointment?.id], enabled: !!movementAppointment, initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => { const query = new URLSearchParams({ pageSize: '20' }); if (pageParam) query.set('cursor', pageParam); return api<MovementPage>(`/api/reception/appointments/${movementAppointment!.id}/movements?${query}`); },
    getNextPageParam: (page) => page.nextCursor,
  });
  const historyItems = history.data?.pages.flatMap((page) => page.items) ?? [];
  const movementItems = movements.data?.pages.flatMap((page) => page.items) ?? [];

  const profileChanged = patient && (documentNumber !== patient.documentNumber || documentType !== patient.documentType || JSON.stringify(draft) !== JSON.stringify(patientDraft(patient)));
  const validProfile = documentType.length === 2 && !!documentNumber.trim() && !!draft.firstName.trim() && !!draft.lastName.trim() && !!draft.sex && !!draft.epsCode && !!draft.zone && !!draft.countryCode && (!draft.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) && (!draft.birthDate || !!ageFromBirthDate(draft.birthDate));
  const saveProfile = useMutation({
    mutationFn: () => api<Patient>(`/api/reception/patients/${patient!.id}/profile`, { method: 'PATCH', body: JSON.stringify({
      expectedProfileVersion: patient!.profileVersion, documentType, documentNumber,
      firstName: draft.firstName, middleName: draft.middleName || null,
      lastName: draft.lastName, secondLastName: draft.secondLastName || null,
      birthDate: draft.birthDate || null, sex: draft.sex, epsCode: draft.epsCode,
      departmentCode: draft.departmentCode || null, municipalityCode: draft.municipalityCode || null,
      neighborhood: draft.neighborhood || null, zone: draft.zone, countryCode: draft.countryCode,
      category: draft.category || null, celular: draft.celular || null, telefono: draft.telefono || null,
      email: draft.email || null, direccion: draft.direccion || null,
      teacherPositionId: draft.teacherPositionId ? Number(draft.teacherPositionId) : null,
      education: draft.education || null, employmentStartDate: draft.employmentStartDate || null,
      secretariatId: draft.secretariatId ? Number(draft.secretariatId) : null,
      institutionId: draft.institutionId ? Number(draft.institutionId) : null,
      employmentType: draft.employmentType, civilStatus: draft.civilStatus || null,
      salaryGrade: draft.salaryGrade, salaryLevel: draft.salaryLevel,
    }) }),
    onSuccess: (updated) => { setPatient(updated); setDocumentNumber(updated.documentNumber); setDocumentType(updated.documentType); setDraft(patientDraft(updated)); toast.success('Datos del paciente guardados.'); },
    onError: (error: Error) => toast.error(error.message),
  });
  const book = useMutation({
    mutationFn: () => rescheduling
      ? api<{ id: number }>(`/api/reception/appointments/${rescheduling.id}/reschedule`, { method: 'POST', body: JSON.stringify({ expectedVersion: rescheduling.lockVersion, newSlotId: slotId, reasonCode: rescheduleReason }) })
      : api<{ id: number }>('/api/reception/appointments', { method: 'POST', body: JSON.stringify({ patientId: patient!.id, specialtyId, slotId, requestMedium: medium, modalityId }) }),
    onSuccess: () => { toast.success(rescheduling ? 'Cita reprogramada correctamente.' : 'Cita agendada correctamente.'); setSelectedDate(undefined); setDoctorId(null); setSlotId(null); setRescheduling(null); setRescheduleReason(''); queryClient.invalidateQueries({ queryKey: ['reception-history', patient?.id] }); queryClient.invalidateQueries({ queryKey: ['reception-dates'] }); queryClient.invalidateQueries({ queryKey: ['reception-slots'] }); },
    onError: (error: Error) => toast.error(error.message),
  });
  const act = useMutation({ mutationFn: ({ id, version, action }: { id: number; version: number; action: 'activate' | 'cancel' }) => api(`/api/reception/appointments/${id}/${action}`, { method: 'POST', body: JSON.stringify(action === 'cancel' ? { expectedVersion: version, reasonCode: cancelReason } : { expectedVersion: version }) }), onSuccess: () => { toast.success('La cita fue actualizada.'); setCancelReason(''); queryClient.invalidateQueries({ queryKey: ['reception-history', patient?.id] }); }, onError: (error: Error) => toast.error(error.message) });
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
  const canBook = !!patient && !!effectiveSiteId && !!specialtyId && !!selectedDate && !!doctorId && !!slotId && (!!rescheduling ? !!rescheduleReason : !!modalityId);
  const historyStateOptions = [{ value: 'ASIGNADA', label: 'Asignada' }, { value: 'ATENDIDA', label: 'Atendida' }, { value: 'REPROGRAMADA', label: 'Reprogramada' }, { value: 'CANCELADA', label: 'Cancelada' }];
  const visibleHistoryStateOptions = historyStateOptions.filter((state) => state.label.toLocaleLowerCase('es-CO').includes(historyStateSearch.trim().toLocaleLowerCase('es-CO')));
  const historyFilterLabel = historyStates.length ? `${historyStates.length} estado${historyStates.length === 1 ? '' : 's'} seleccionado${historyStates.length === 1 ? '' : 's'}` : 'Todos los estados';

  return <ModulePageLayout moduleKey="admisiones" minimalHero>
    <PatientDataForm patient={patient} documentNumber={documentNumber} documentType={documentType} draft={draft} options={profileOptions.data} canEdit={canEditPatient} profileChanged={!!profileChanged} validProfile={validProfile} searching={search.isPending} saving={saveProfile.isPending} notFound={notFound} ambiguousDocumentTypes={ambiguousDocumentTypes} onDocumentNumberChange={(value) => { setDocumentNumber(value); setNotFound(false); setAmbiguousDocumentTypes([]); }} onDocumentTypeChange={(value) => { setDocumentType(value); setNotFound(false); }} onDraftChange={(field, value) => setDraft((current) => ({ ...current, [field]: value }))} onSearch={() => { setNotFound(false); void search.mutateAsync(); }} onSave={() => saveProfile.mutate()} />

    {patient ? <div className="grid gap-4 [&>div:first-child]:contents [&>div:first-child>div:nth-child(1)]:order-2 [&>div:first-child>div:nth-child(2)]:order-3 [&>div:nth-child(2)]:order-1">
      <div className="space-y-4">
      <div className="flex min-h-16 items-center justify-center rounded-lg bg-slate-700 px-4 text-center text-sm font-medium text-white shadow-sm" aria-live="polite">Fecha de cita: {selectedDate ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'full', timeZone: 'America/Bogota' }).format(selectedDate) : 'No hay fecha seleccionada'}</div>
      <Card><CardHeader><CardTitle className="text-base">Historial de citas</CardTitle></CardHeader><CardContent><div className="mb-4"><span id="history-filter-label" className="mb-1 block text-xs font-medium text-slate-600">Filtrar estados</span><DropdownMenu onOpenChange={(open) => { if (!open) setHistoryStateSearch(''); }}><DropdownMenuTrigger asChild><Button type="button" variant="outline" className="min-h-11 w-full justify-between sm:w-auto" aria-labelledby="history-filter-label" aria-describedby="history-filter-summary">{historyFilterLabel}<span aria-hidden="true">▾</span></Button></DropdownMenuTrigger><DropdownMenuContent className="w-64 p-2" align="start"><DropdownMenuLabel>Estados de cita</DropdownMenuLabel><label className="sr-only" htmlFor="history-state-search">Buscar estado</label><Input id="history-state-search" value={historyStateSearch} onChange={(event) => setHistoryStateSearch(event.target.value)} onKeyDown={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()} placeholder="Buscar estado" className="mb-2 h-10" autoComplete="off" />{visibleHistoryStateOptions.length ? visibleHistoryStateOptions.map((state) => <DropdownMenuCheckboxItem key={state.value} checked={historyStates.includes(state.value)} onSelect={(event) => event.preventDefault()} onCheckedChange={() => setHistoryStates((current) => current.includes(state.value) ? current.filter((item) => item !== state.value) : [...current, state.value])}>{state.label}</DropdownMenuCheckboxItem>) : <p className="px-2 py-3 text-sm text-slate-500">No hay estados coincidentes.</p>}<DropdownMenuSeparator /> <DropdownMenuItem disabled={!historyStates.length} onSelect={(event) => { event.preventDefault(); setHistoryStates([]); }}>Limpiar filtros</DropdownMenuItem></DropdownMenuContent></DropdownMenu><p id="history-filter-summary" className="mt-1 text-xs text-slate-500" aria-live="polite">{historyFilterLabel}</p></div>{history.isLoading ? <p className="text-sm text-slate-500">Cargando historial…</p> : history.isError ? <div className="space-y-2 text-sm text-red-700" role="alert"><p>No fue posible cargar el historial.</p><Button size="sm" variant="outline" onClick={() => history.refetch()}>Reintentar</Button></div> : historyItems.length ? <div className="space-y-3">{historyItems.map((item) => <article key={item.id} className="rounded-lg border border-slate-200 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm">{item.especialidadNombre}</strong><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">{item.estado}</span></div><p className="mt-1 text-sm text-slate-600">{formatDateTime(item.inicioProgramado)} · {item.medicoNombre}</p><p className="text-xs text-slate-500">{item.sedeNombre} · {item.modalidadNombre}</p><Button className="mt-2" size="sm" variant="ghost" onClick={() => setMovementAppointment(item)}>Ver movimientos</Button>{item.estado === 'ASIGNADA' ? <div className="mt-3 flex flex-wrap items-end gap-2"><Button size="sm" variant="outline" onClick={() => act.mutate({ id: item.id, version: item.lockVersion, action: 'activate' })} disabled={!!item.activadaAt || act.isPending}>{item.activadaAt ? 'Activada' : 'Activar'}</Button><Button size="sm" variant="outline" onClick={() => { setRescheduling(item); setRescheduleReason(''); selectSpecialty(item.especialidadId); }}>Reprogramar</Button>{canPrintReminder ? <Button size="sm" variant="outline" onClick={() => reminder.mutate({ appointmentId: item.id, target: window.open('', '_blank', 'noopener') })} disabled={reminder.isPending}><Printer aria-hidden="true" />{reminder.isPending ? 'Generando…' : 'Imprimir'}</Button> : null}<Button size="sm" variant="destructive" onClick={() => { setCancelReason(''); setCancelling(item); }} disabled={act.isPending}>Cancelar</Button></div> : null}</article>)}{history.hasNextPage ? <Button className="w-full" variant="outline" onClick={() => history.fetchNextPage()} disabled={history.isFetchingNextPage}>{history.isFetchingNextPage ? 'Cargando…' : 'Cargar más citas'}</Button> : null}</div> : <p className="text-sm text-slate-500">Este paciente aún no tiene citas registradas.</p>}</CardContent></Card></div>
      <Card className="h-fit"><CardHeader className="border-b border-slate-200 bg-slate-50/80 px-4 py-3"><CardTitle className="flex items-center gap-2 text-sm"><CalendarDays className="h-4 w-4 text-sky-700" /> {rescheduling ? 'Reprogramar cita' : 'Asignar cita'}</CardTitle></CardHeader><CardContent className="grid items-start gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
        {rescheduling ? <><div className="flex items-center justify-between rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900 sm:col-span-2 xl:col-span-4"><span>Elige un nuevo cupo para {rescheduling.especialidadNombre}.</span><Button size="sm" variant="ghost" onClick={() => { setRescheduling(null); setRescheduleReason(''); }}>Cancelar</Button></div><label className="block text-sm font-medium" htmlFor="reschedule-reason">Motivo de reprogramación<select id="reschedule-reason" className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3" value={rescheduleReason} onChange={(event) => setRescheduleReason(event.target.value)} required><option value="">Selecciona el motivo</option>{rescheduleReasons.data?.map((reason) => <option key={reason.codigo} value={reason.codigo}>{reason.nombre}</option>)}</select></label></> : null}
        <label className="block text-sm font-medium">Sede de atención<select className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3" value={effectiveSiteId ?? ''} disabled={!context.data?.canSelectSite} onChange={(event) => resetForSite(Number(event.target.value))}><option value="">Selecciona una sede</option>{context.data?.sites.map((site) => <option key={site.id} value={site.id}>{site.nombre}</option>)}</select></label>
        <label className="block text-sm font-medium">Especialidad<select className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3" value={specialtyId ?? ''} disabled={!effectiveSiteId || specialties.isLoading} onChange={(event) => selectSpecialty(Number(event.target.value))}><option value="">Selecciona una especialidad</option>{specialties.data?.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>
        <div className="sm:col-span-2 xl:col-span-2 xl:row-span-4"><div className="mb-2 flex flex-wrap items-end justify-between gap-2"><div><span className="block text-sm font-medium">Fecha de cita</span><p className="text-xs text-slate-500">Disponibilidad de los próximos dos meses</p></div><span className="inline-flex items-center gap-1.5 text-xs text-emerald-800"><span className="h-2 w-2 rounded-full bg-emerald-600" />Tiene cupos</span></div>{specialtyId ? <AvailabilityCalendar selected={selectedDate} availableDates={dates.data ?? []} range={range} onSelect={(date) => { setSelectedDate(date); setDoctorId(null); setSlotId(null); }} /> : <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">Selecciona una especialidad para consultar las fechas disponibles.</p>}</div>
        <label className="block text-sm font-medium">Médico<select className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3" value={doctorId ?? ''} disabled={!selectedDateKey} onChange={(event) => { setDoctorId(Number(event.target.value)); setSlotId(null); }}><option value="">Selecciona un médico</option>{doctors.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <fieldset disabled={!doctorId}><legend className="mb-1 text-sm font-medium">Hora disponible</legend><div className="flex min-h-11 flex-wrap items-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-2 py-1">{slots.data?.length ? slots.data.map((slot) => <Button key={slot.id} type="button" size="sm" variant={slotId === slot.id ? 'default' : 'outline'} onClick={() => setSlotId(slot.id)}>{new Intl.DateTimeFormat('es-CO', { timeStyle: 'short', timeZone: 'America/Bogota' }).format(new Date(slot.inicio))}</Button>) : <span className="text-sm text-slate-500">Selecciona un médico.</span>}</div></fieldset>
        {!rescheduling ? <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2 xl:col-span-2"><label className="block text-sm font-medium">Medio<select className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3" value={medium} onChange={(event) => setMedium(event.target.value)}><option value="PRESENCIAL">Presencial</option><option value="TELEFONO">Teléfono</option><option value="CORREO">Correo</option><option value="WHATSAPP">WhatsApp</option></select></label><label className="block text-sm font-medium">Modalidad<select className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3" value={modalityId ?? ''} onChange={(event) => setModalityId(Number(event.target.value))}><option value="">Selecciona</option>{modalities.data?.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label></div> : null}
        <Button className="h-11 sm:col-span-2 xl:col-span-2" disabled={!canBook || book.isPending} onClick={() => rescheduling ? setRescheduleConfirmationOpen(true) : book.mutate()}>{book.isPending ? 'Guardando…' : rescheduling ? 'Continuar con la reprogramación' : 'Agendar cita'}</Button><p className="sr-only" aria-live="polite">{book.isSuccess ? (rescheduling ? 'Cita reprogramada correctamente.' : 'Cita agendada correctamente.') : ''}</p>
      </CardContent></Card>
    </div> : <InitialReceptionLayout />}
    <AlertDialog open={!!cancelling} onOpenChange={(open) => { if (!open && !act.isPending) { setCancelling(null); setCancelReason(''); } }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Cancelar cita</AlertDialogTitle><AlertDialogDescription>El cupo volverá a estar disponible. Selecciona el motivo institucional antes de confirmar.</AlertDialogDescription></AlertDialogHeader><label className="grid gap-1 text-sm font-medium text-slate-800" htmlFor="cancel-reason">Motivo de cancelación<select id="cancel-reason" className="h-11 rounded-md border border-slate-300 bg-white px-3" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} autoFocus><option value="">Selecciona el motivo</option>{cancelReasons.data?.map((reason) => <option key={reason.codigo} value={reason.codigo}>{reason.nombre}</option>)}</select></label><AlertDialogFooter><AlertDialogCancel disabled={act.isPending}>Volver</AlertDialogCancel><AlertDialogAction className="bg-red-600 hover:bg-red-700" disabled={!cancelReason || act.isPending} onClick={(event) => { event.preventDefault(); if (cancelling) act.mutate({ id: cancelling.id, version: cancelling.lockVersion, action: 'cancel' }, { onSuccess: () => setCancelling(null) }); }}> {act.isPending ? 'Cancelando…' : 'Confirmar cancelación'} </AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <AlertDialog open={rescheduleConfirmationOpen} onOpenChange={(open) => { if (!open && !book.isPending) setRescheduleConfirmationOpen(false); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar reprogramación</AlertDialogTitle><AlertDialogDescription>La cita actual quedará reprogramada y se asignará el nuevo cupo seleccionado.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={book.isPending}>Volver</AlertDialogCancel><AlertDialogAction disabled={book.isPending} onClick={(event) => { event.preventDefault(); book.mutate(undefined, { onSuccess: () => setRescheduleConfirmationOpen(false) }); }}>{book.isPending ? 'Reprogramando…' : 'Confirmar reprogramación'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <Dialog open={!!movementAppointment} onOpenChange={(open) => { if (!open) setMovementAppointment(null); }}><DialogContent className="max-h-[80dvh] overflow-y-auto"><DialogHeader><DialogTitle>Movimientos de la cita</DialogTitle><DialogDescription>{movementAppointment ? `${movementAppointment.especialidadNombre} · ${formatDateTime(movementAppointment.inicioProgramado)}` : 'Trazabilidad operativa de la cita.'}</DialogDescription></DialogHeader>{movements.isLoading ? <p className="text-sm text-slate-500">Cargando movimientos…</p> : movements.isError ? <div className="space-y-2 text-sm text-red-700" role="alert"><p>No fue posible cargar los movimientos.</p><Button size="sm" variant="outline" onClick={() => movements.refetch()}>Reintentar</Button></div> : movementItems.length ? <ol className="space-y-3" aria-label="Movimientos de la cita">{movementItems.map((movement) => <li key={movement.id} className="rounded-lg border border-slate-200 p-3"><p className="text-sm font-semibold text-slate-900">{movement.tipoEvento}</p><p className="mt-1 text-xs text-slate-600">{formatDateTime(movement.createdAt)}</p>{movement.estadoAnterior || movement.estadoNuevo ? <p className="mt-1 text-xs text-slate-600">Estado: {movement.estadoAnterior ?? '—'} → {movement.estadoNuevo ?? '—'}</p> : null}{movement.estadoCupoAnterior || movement.estadoCupoNuevo ? <p className="text-xs text-slate-600">Cupo: {movement.estadoCupoAnterior ?? '—'} → {movement.estadoCupoNuevo ?? '—'}</p> : null}</li>)}</ol> : <p className="text-sm text-slate-500">Esta cita todavía no tiene movimientos.</p>}{movements.hasNextPage ? <Button className="w-full" variant="outline" onClick={() => movements.fetchNextPage()} disabled={movements.isFetchingNextPage}>{movements.isFetchingNextPage ? 'Cargando…' : 'Cargar más movimientos'}</Button> : null}<DialogFooter><Button variant="outline" onClick={() => setMovementAppointment(null)}>Cerrar</Button></DialogFooter></DialogContent></Dialog>
  </ModulePageLayout>;
}
