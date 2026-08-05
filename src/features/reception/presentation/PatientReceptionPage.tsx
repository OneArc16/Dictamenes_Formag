'use client';

import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DayPicker } from 'react-day-picker';
import { es } from 'react-day-picker/locale';
import { ArrowRight, BriefcaseBusiness, CalendarClock, CalendarDays, CalendarX2, ChevronDown, CircleCheck, Clock3, History, ListFilter, Printer, Save, Search, ShieldAlert, UserRound, X } from 'lucide-react';
import toast from 'react-hot-toast';

import ModulePageLayout from '@/components/module-shell/ModulePageLayout';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip } from '@/components/ui/icon-tooltip';
import { useCan } from '@/hooks/useCan';
import { createUuidV4 } from '@/lib/browser/create-uuid';
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
  const response = await fetch(url, { credentials: 'include', ...init, headers: { ...(init?.body ? { 'Content-Type': 'application/json', 'Idempotency-Key': createUuidV4(), ...(token ? { 'X-CSRF-Token': token } : {}) } : {}), ...init?.headers } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) throw new Error(payload.message ?? 'No fue posible completar la operación.');
  return payload.data as T;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' }).format(new Date(value));
}
function formatTime(value: string) {
  if (!value) return '';
  return new Intl.DateTimeFormat('es-CO', { timeStyle: 'short', timeZone: 'America/Bogota' }).format(new Date(value));
}
function enumLabel(value: string | null) {
  if (!value) return 'Sin registro';
  const normalized = value.replaceAll('_', ' ').toLocaleLowerCase('es-CO');
  return normalized.charAt(0).toLocaleUpperCase('es-CO') + normalized.slice(1);
}
function movementEventLabel(value: string) {
  const labels: Record<string, string> = {
    CREADA: 'Cita creada',
    ACTIVADA: 'Cita activada',
    RECORDATORIO_GENERADO: 'Recordatorio generado',
    CANCELADA: 'Cita cancelada',
    REPROGRAMADA: 'Cita reprogramada',
    ATENDIDA: 'Cita atendida',
  };
  return labels[value] ?? enumLabel(value);
}
function movementReason(metadata: Record<string, unknown> | null) {
  return typeof metadata?.reasonLabel === 'string' ? metadata.reasonLabel : null;
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

const HISTORY_STATE_OPTIONS = [
  { value: 'ASIGNADA', label: 'Asignada', dotClassName: 'bg-blue-500' },
  { value: 'ATENDIDA', label: 'Atendida', dotClassName: 'bg-emerald-500' },
  { value: 'REPROGRAMADA', label: 'Reprogramada', dotClassName: 'bg-amber-500' },
  { value: 'CANCELADA', label: 'Cancelada', dotClassName: 'bg-rose-500' },
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
  onClear,
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
  onClear: () => void;
}) {
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch();
  };
  const [positionSearch, setPositionSearch] = useState('');
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [laborSectionOpen, setLaborSectionOpen] = useState(true);
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
  const selectClassName = 'h-8 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500';
  const laborSelectClassName = 'h-10 w-full rounded-md border border-slate-300 bg-white px-2.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500';
  const labelClassName = 'mb-0.5 block text-[10px] font-medium leading-4 text-slate-700';
  const formGridClassName = 'grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 xl:grid-cols-12 [&>*]:min-w-0';

  const saveButtonLabel = saving
    ? 'Guardando cambios'
    : !validProfile
      ? 'Completa identificación, sexo, ubicación, EPS y verifica el correo.'
      : profileChanged
        ? 'Guardar cambios'
        : 'Sin cambios por guardar';
  const clearButtonLabel = 'Limpiar formulario';

  return <div className="space-y-4">
    <Card>
      <CardHeader className="border-b border-slate-200 bg-slate-50/80 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm"><UserRound className="h-4 w-4 text-sky-700" /> Datos de identificación, ubicación y contacto</CardTitle>
          {patient && canEdit ? <div className="flex items-center gap-2">
            <Tooltip id="patient-clear-profile-tooltip" label={clearButtonLabel} align="right">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 border-slate-300 bg-white text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-700 disabled:bg-slate-100 disabled:text-slate-400"
                aria-label={clearButtonLabel}
                aria-describedby="patient-clear-profile-tooltip"
                disabled={saving}
                onClick={onClear}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Tooltip>
            <Tooltip id="patient-save-profile-tooltip" label={saveButtonLabel} align="right">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 border-slate-300 bg-white text-slate-600 transition-colors hover:border-sky-300 hover:text-sky-700 disabled:bg-slate-100 disabled:text-slate-400"
                aria-label={saveButtonLabel}
                aria-describedby="patient-save-profile-tooltip"
                disabled={!profileChanged || !validProfile || saving}
                onClick={onSave}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Tooltip>
          </div> : null}
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="w-full space-y-2">
          <form
            className={formGridClassName}
            onSubmit={submitSearch}
          >
            <label className="xl:col-span-3" htmlFor="patient-document-type"><span className={labelClassName}>Tipo de documento</span><select id="patient-document-type" value={documentType} onChange={(event) => onDocumentTypeChange(event.target.value)} disabled={saving} className={selectClassName}><option value="">Sin especificar</option>{DOCUMENT_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="xl:col-span-3" htmlFor="document-number"><span className={labelClassName}>Número de documento</span><div className="flex items-stretch rounded-md shadow-sm"><Input id="document-number" value={documentNumber} onChange={(event) => onDocumentNumberChange(event.target.value)} disabled={saving} inputMode="numeric" autoComplete="off" className="h-8 min-w-0 w-full rounded-r-none border-r-0 focus:z-10" /><Button type="submit" variant="outline" className="h-8 shrink-0 rounded-l-none border-slate-300 px-3 text-[11px] font-semibold" disabled={!documentNumber.trim() || searching || saving}><Search className="h-4 w-4" aria-hidden="true" /><span className="sr-only sm:not-sr-only">{searching ? 'Buscando…' : 'Buscar'}</span></Button></div></label>
            <label className="xl:col-span-3" htmlFor="patient-birth-date"><span className={labelClassName}>Fecha de nacimiento</span><Input id="patient-birth-date" type="date" value={draft.birthDate} onChange={(event) => onDraftChange('birthDate', event.target.value)} disabled={fieldDisabled} className="h-8" /></label>
            <label className="xl:col-span-1" htmlFor="patient-age"><span className={labelClassName}>Edad</span><Input id="patient-age" value={ageFromBirthDate(draft.birthDate)} readOnly disabled={!patient} className="h-8 bg-slate-50 text-slate-700" /></label>
            <label className="xl:col-span-1" htmlFor="patient-sex"><span className={labelClassName}>Sexo</span><select id="patient-sex" value={draft.sex} onChange={(event) => onDraftChange('sex', event.target.value)} disabled={fieldDisabled} className={selectClassName}><option value="">Selecciona</option><option value="M">Masculino</option><option value="F">Femenino</option><option value="O">Otro</option></select></label>
            <label className="xl:col-span-1" htmlFor="patient-category"><span className={labelClassName}>Categoría</span><select id="patient-category" value={draft.category} onChange={(event) => onDraftChange('category', event.target.value)} disabled={fieldDisabled} className={selectClassName}><option value="">Selecciona</option>{CATEGORIA_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          </form>
        {notFound ? <p className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status" aria-live="polite" aria-atomic="true"><ShieldAlert className="h-4 w-4 shrink-0" />El paciente no existe. Debes crearlo antes de agendar una cita.</p> : null}
        {ambiguousDocumentTypes.length ? <p className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900" role="status">El número existe con varios tipos de documento ({ambiguousDocumentTypes.join(', ')}). Selecciona uno y vuelve a buscar.</p> : null}
          <fieldset className="space-y-2" disabled={fieldDisabled}><legend className="sr-only">Datos básicos editables</legend>
          <div className={formGridClassName}>
            <label className="xl:col-span-2" htmlFor="patient-first-name"><span className={labelClassName}>Primer nombre</span><Input id="patient-first-name" value={draft.firstName} onChange={(event) => onDraftChange('firstName', event.target.value)} className="h-8" /></label>
            <label className="xl:col-span-2" htmlFor="patient-middle-name"><span className={labelClassName}>Segundo nombre</span><Input id="patient-middle-name" value={draft.middleName} onChange={(event) => onDraftChange('middleName', event.target.value)} className="h-8" /></label>
            <label className="xl:col-span-2" htmlFor="patient-last-name"><span className={labelClassName}>Primer apellido</span><Input id="patient-last-name" value={draft.lastName} onChange={(event) => onDraftChange('lastName', event.target.value)} className="h-8" /></label>
            <label className="xl:col-span-2" htmlFor="patient-second-last-name"><span className={labelClassName}>Segundo apellido</span><Input id="patient-second-last-name" value={draft.secondLastName} onChange={(event) => onDraftChange('secondLastName', event.target.value)} className="h-8" /></label>
            <label className="xl:col-span-4" htmlFor="patient-direccion"><span className={labelClassName}>Dirección</span><Input id="patient-direccion" value={draft.direccion} onChange={(event) => onDraftChange('direccion', event.target.value)} autoComplete="street-address" className="h-8" /></label>
          </div>
          <div className={formGridClassName}>
            <div className="xl:col-span-1"><label className={labelClassName} htmlFor="patient-department">Departamento</label><SearchableSelect id="patient-department" value={draft.departmentCode} options={options?.departments} onChange={(value) => { onDraftChange('departmentCode', value); const current = options?.municipalities.find((item) => item.value === draft.municipalityCode); if (current && current.departmentCode !== value) { onDraftChange('municipalityCode', ''); onDraftChange('neighborhood', ''); onDraftChange('institutionId', ''); setInstitutionSearch(''); } }} placeholder="Escribe departamento" disabled={fieldDisabled} className="h-8 text-xs" /></div>
            <div className="xl:col-span-1"><label className={labelClassName} htmlFor="patient-municipality">Municipio</label><SearchableSelect id="patient-municipality" value={draft.municipalityCode} options={municipalityOptions} onChange={(value) => { if (value !== draft.municipalityCode) { onDraftChange('neighborhood', ''); onDraftChange('institutionId', ''); setInstitutionSearch(''); } onDraftChange('municipalityCode', value); }} placeholder={draft.departmentCode ? 'Escribe municipio' : 'Selecciona departamento'} disabled={fieldDisabled || !draft.departmentCode} className="h-8 text-xs" /></div>
            <div className="xl:col-span-1"><label className={labelClassName} htmlFor="patient-neighborhood">Barrio / vereda</label><SearchableSelect id="patient-neighborhood" value={draft.neighborhood} options={neighborhoodOptions} onChange={(value) => onDraftChange('neighborhood', value)} placeholder={draft.municipalityCode ? 'Escribe barrio' : 'Selecciona municipio'} disabled={fieldDisabled || !draft.municipalityCode} className="h-8 text-xs" /></div>
            <label className="xl:col-span-1" htmlFor="patient-zone"><span className={labelClassName}>Zona</span><select id="patient-zone" value={draft.zone} onChange={(event) => onDraftChange('zone', event.target.value)} className={selectClassName}><option value="">Selecciona</option><option value="U">Urbana</option><option value="R">Rural</option></select></label>
            <div className="xl:col-span-1"><label className={labelClassName} htmlFor="patient-country">País</label><SearchableSelect id="patient-country" value={draft.countryCode} options={options?.countries} onChange={(value) => onDraftChange('countryCode', value)} placeholder="Escribe país" disabled={fieldDisabled} className="h-8 text-xs" /></div>
            <div className="xl:col-span-5"><label className={labelClassName} htmlFor="patient-eps">EPS</label><SearchableSelect id="patient-eps" value={draft.epsCode} options={options?.eps} onChange={(value) => onDraftChange('epsCode', value)} placeholder="Escribe EPS" disabled={fieldDisabled} className="h-8 text-xs" /></div>
            <label className="xl:col-span-1" htmlFor="patient-celular"><span className={labelClassName}>Celular</span><Input id="patient-celular" type="tel" value={draft.celular} onChange={(event) => onDraftChange('celular', event.target.value)} autoComplete="tel" className="h-8" /></label>
            <label className="xl:col-span-1" htmlFor="patient-telefono"><span className={labelClassName}>Teléfono</span><Input id="patient-telefono" type="tel" value={draft.telefono} onChange={(event) => onDraftChange('telefono', event.target.value)} autoComplete="tel" className="h-8" /></label>
          </div>
          <div className={formGridClassName}>
            <label className="xl:col-span-2" htmlFor="patient-email"><span className={labelClassName}>Correo</span><Input id="patient-email" type="email" value={draft.email} onChange={(event) => onDraftChange('email', event.target.value)} autoComplete="email" className="h-8" aria-invalid={emailInvalid} aria-describedby={emailInvalid ? 'patient-email-error' : undefined} />{emailInvalid ? <span id="patient-email-error" className="mt-1 block text-xs text-red-700" role="alert">Escribe un correo válido.</span> : null}</label>
            <div className="xl:col-span-6"><label className={labelClassName} htmlFor="patient-position">Cargo</label><SearchableSelect id="patient-position" value={draft.teacherPositionId} options={positionOptions} onSearch={setPositionSearch} minSearchLength={3} isLoading={positions.isFetching} onChange={(value) => onDraftChange('teacherPositionId', value)} placeholder="Escribe mínimo 3 letras" disabled={fieldDisabled} className="h-8 text-xs" /></div>
            <label className="xl:col-span-2" htmlFor="patient-education"><span className={labelClassName}>Escolaridad</span><select id="patient-education" value={draft.education} onChange={(event) => onDraftChange('education', event.target.value)} className={selectClassName}><option value="">Selecciona</option>{ESCOLARIDAD_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="xl:col-span-2" htmlFor="patient-civil-status"><span className={labelClassName}>Estado civil</span><select id="patient-civil-status" value={draft.civilStatus} onChange={(event) => onDraftChange('civilStatus', event.target.value)} className={selectClassName}><option value="">Selecciona</option>{ESTADO_CIVIL_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          </div>
        </fieldset>
        </div>
      </CardContent>
    </Card>

    {isFideicomisos ? <Card>
      <CardHeader className="border-b border-slate-200 bg-slate-50/80 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm"><BriefcaseBusiness className="h-4 w-4 text-sky-700" /> Datos laborales del docente</CardTitle>
          <Button
            type="button"
            variant="ghost"
            className="h-9 gap-2 px-3 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-expanded={laborSectionOpen}
            aria-controls="labor-data-panel"
            onClick={() => setLaborSectionOpen((current) => !current)}
          >
            {laborSectionOpen ? 'Ocultar' : 'Desplegar'}
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ease-out ${laborSectionOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>
      <div
        id="labor-data-panel"
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${laborSectionOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="min-h-0">
          <CardContent className="p-3">
            <fieldset className="w-full space-y-2.5" disabled={fieldDisabled}>
              <legend className="sr-only">Información laboral editable</legend>
              <div className={formGridClassName}>
                <label className="xl:col-span-1" htmlFor="patient-employment-start"><span className={labelClassName}>F. vinculación</span><Input id="patient-employment-start" type="date" value={draft.employmentStartDate} onChange={(event) => onDraftChange('employmentStartDate', event.target.value)} className="h-10" /></label>
                <div className="xl:col-span-1"><label className={labelClassName} htmlFor="patient-secretariat">Secretaría</label><SearchableSelect id="patient-secretariat" value={draft.secretariatId} options={options?.secretariats} onChange={(value) => { if (value !== draft.secretariatId) { onDraftChange('institutionId', ''); setInstitutionSearch(''); } onDraftChange('secretariatId', value); }} placeholder="Escribe secretaría" disabled={fieldDisabled} className="h-10 text-xs" /></div>
                <label className="xl:col-span-1" htmlFor="patient-employment-type"><span className={labelClassName}>Forma vinc.</span><select id="patient-employment-type" value={draft.employmentType} onChange={(event) => onDraftChange('employmentType', event.target.value)} className={laborSelectClassName}><option value="">Selecciona</option>{FORMA_VINCULACION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                <label className="xl:col-span-1" htmlFor="patient-salary-grade"><span className={labelClassName}>Grado</span><Input id="patient-salary-grade" value={draft.salaryGrade} onChange={(event) => onDraftChange('salaryGrade', event.target.value)} maxLength={2} placeholder="Ej. 14 o 2A" className="h-10" /></label>
                <label className="xl:col-span-1" htmlFor="patient-salary-level"><span className={labelClassName}>Nivel</span><select id="patient-salary-level" value={draft.salaryLevel} onChange={(event) => onDraftChange('salaryLevel', event.target.value)} className={laborSelectClassName}><option value="">Selecciona</option>{NIVEL_ESCALAFON_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                <div className="xl:col-span-4"><label className={labelClassName} htmlFor="patient-institution">Institución</label><SearchableSelect id="patient-institution" value={draft.institutionId} options={institutionOptions} onSearch={setInstitutionSearch} minSearchLength={3} isLoading={institutions.isFetching} onChange={(value) => onDraftChange('institutionId', value)} placeholder={draft.secretariatId ? 'Escribe mínimo 3 letras' : 'Selecciona secretaría'} disabled={fieldDisabled || !draft.secretariatId} className="h-10 text-xs" /></div>
              </div>
            </fieldset>
          </CardContent>
        </div>
      </div>
    </Card> : null}

  </div>;
}

function AvailabilityCalendar({
  selected,
  availableDates,
  range,
  onSelect,
  isLoading,
}: {
  selected: Date | undefined;
  availableDates: string[];
  range: { start: Date; end: Date };
  onSelect: (date: Date | undefined) => void;
  isLoading?: boolean;
}) {
  const available = useMemo(() => new Set(availableDates), [availableDates]);
  const selectedLabel = selected
    ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'full', timeZone: 'America/Bogota' }).format(selected)
    : null;
  const calendar = (months: number) => <DayPicker
    className="appointment-date-picker"
    mode="single"
    locale={es}
    selected={selected}
    onSelect={onSelect}
    numberOfMonths={months}
    fixedWeeks
    showOutsideDays
    disabled={[{ before: range.start, after: range.end }, (date) => !available.has(dateKey(date))]}
    modifiers={{ available: (date) => available.has(dateKey(date)) }}
    modifiersClassNames={{ available: 'appointment-day-available' }}
    aria-label="Calendario de disponibilidad de los próximos dos meses"
  />;

  return <section className="appointment-calendar" aria-label="Selector de fecha de cita">
    <header className="appointment-calendar__header">
      <div>
        <h3>Elige una fecha disponible</h3>
      </div>
      <div className="appointment-calendar__availability" aria-live="polite">
        <CircleCheck aria-hidden="true" />
        <span>{isLoading ? 'Consultando cupos…' : `${available.size} fecha${available.size === 1 ? '' : 's'} con cupo`}</span>
      </div>
    </header>
    {selectedLabel ? <div className="appointment-calendar__selection" aria-live="polite"><span>Fecha elegida</span><strong>{selectedLabel}</strong></div> : null}
    <div className="appointment-calendar__body">
      <div className="md:hidden">{calendar(1)}</div>
      <div className="hidden md:block">{calendar(2)}</div>
    </div>
    <footer className="appointment-calendar__legend" aria-label="Leyenda de disponibilidad">
      <span><i className="appointment-calendar__dot" aria-hidden="true" />Disponible</span>
      <span><i className="appointment-calendar__selected-sample" aria-hidden="true" />Seleccionada</span>
    </footer>
  </section>;
}

function AppointmentDateField({
  selected,
  disabled,
  onOpen,
}: {
  selected?: Date;
  disabled?: boolean;
  onOpen: () => void;
}) {
  const selectedLabel = selected
    ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeZone: 'America/Bogota' }).format(selected)
    : null;

  return <div className={`appointment-date-field${selected ? ' is-selected' : ''}`} aria-live="polite">
    <div className="appointment-date-field__copy">
      <strong>{selectedLabel ?? 'Selecciona Fecha'}</strong>
    </div>
    <Tooltip id="appointment-date-trigger-tooltip" label={disabled ? 'Selecciona una especialidad primero' : 'Elegir fecha'} align="right">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="appointment-icon-action is-primary"
        aria-label={disabled ? 'Selecciona una especialidad primero' : 'Elegir fecha'}
        aria-describedby="appointment-date-trigger-tooltip"
        disabled={disabled}
        onClick={onOpen}
      >
        <CalendarDays aria-hidden="true" />
      </Button>
    </Tooltip>
  </div>;
}

function AppointmentTimeField({
  selectedTime,
  disabled,
  onOpen,
}: {
  selectedTime?: string | null;
  disabled?: boolean;
  onOpen: () => void;
}) {
  const isSelected = !!selectedTime;

  return <div className={`appointment-date-field${isSelected ? ' is-selected' : ''}`} aria-live="polite">
    <div className="appointment-date-field__copy">
      <strong>{selectedTime ?? 'Selecciona Hora'}</strong>
    </div>
    <Tooltip id="appointment-time-trigger-tooltip" label={disabled ? 'Selecciona una fecha primero' : 'Elegir hora'} align="right">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="appointment-icon-action is-primary"
        aria-label={disabled ? 'Selecciona una fecha primero' : 'Elegir hora'}
        aria-describedby="appointment-time-trigger-tooltip"
        disabled={disabled}
        onClick={onOpen}
      >
        <Clock3 aria-hidden="true" />
      </Button>
    </Tooltip>
  </div>;
}

function AppointmentIconAction({
  id,
  label,
  icon,
  onClick,
  disabled,
  tone = 'default',
}: {
  id: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'primary' | 'success' | 'danger';
}) {
  return <Tooltip id={id} label={label}>
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={`appointment-icon-action is-${tone}`}
      aria-label={label}
      aria-describedby={id}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
    </Button>
  </Tooltip>;
}

function HistoryStateFilter({ values, onChange }: { values: string[]; onChange: (values: string[]) => void }) {
  const selectedLabels = HISTORY_STATE_OPTIONS.filter((option) => values.includes(option.value)).map((option) => option.label);
  const filterLabel = selectedLabels.length ? selectedLabels.join(', ') : 'Todos los estados';

  return <div className="history-state-filter">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" className="history-state-filter__trigger" aria-labelledby="history-filter-label" aria-describedby="history-filter-summary">
          <ListFilter aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate text-left">{filterLabel}</span>
          {values.length ? <span className="history-state-filter__count" aria-hidden="true">{values.length}</span> : null}
          <ChevronDown className="history-state-filter__chevron" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="z-50 w-72 rounded-xl border-slate-200 bg-white p-2 text-slate-900 shadow-[0_18px_48px_rgba(15,23,42,0.18)]" align="end" sideOffset={8}>
        <DropdownMenuLabel className="px-2 pb-2 pt-1">
          <span className="block text-sm font-semibold text-slate-900">Estados de la cita</span>
          <span className="mt-0.5 block text-xs font-normal text-slate-500">Puedes seleccionar varios estados.</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mb-1 bg-slate-200" />
        {HISTORY_STATE_OPTIONS.map((option) => <DropdownMenuCheckboxItem
          key={option.value}
          checked={values.includes(option.value)}
          className="min-h-10 cursor-pointer rounded-lg pl-8 pr-3 text-sm text-slate-700 focus:bg-sky-50 focus:text-sky-900 data-[state=checked]:bg-sky-50 data-[state=checked]:font-semibold"
          onSelect={(event) => event.preventDefault()}
          onCheckedChange={() => onChange(values.includes(option.value) ? values.filter((value) => value !== option.value) : [...values, option.value])}
        >
          <span className={`mr-2 h-2 w-2 shrink-0 rounded-full ${option.dotClassName}`} aria-hidden="true" />
          {option.label}
        </DropdownMenuCheckboxItem>)}
        <DropdownMenuSeparator className="mt-1 bg-slate-200" />
        <DropdownMenuItem className="min-h-10 cursor-pointer rounded-lg px-2 text-sm text-slate-600 focus:bg-slate-100 focus:text-slate-900" disabled={!values.length} onSelect={(event) => { event.preventDefault(); onChange([]); }}><X aria-hidden="true" />Limpiar filtros</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <span id="history-filter-summary" className="sr-only" aria-live="polite">{filterLabel}</span>
  </div>;
}

function InitialReceptionLayout() {
  return <section className="space-y-4" aria-label="Formulario de asignación de cita">
    <Card><CardHeader className="border-b border-slate-200 bg-slate-50/80 px-4 py-3"><CardTitle className="flex items-center gap-2 text-sm"><CalendarDays className="h-4 w-4 text-sky-700" /> Asignar cita</CardTitle></CardHeader><CardContent className="grid gap-2.5 p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.85fr)_minmax(0,1.1fr)_minmax(0,1.55fr)_minmax(0,1.55fr)_minmax(0,0.85fr)_auto] xl:items-end"><label><span className="mb-1 block text-[11px] font-medium text-slate-700">Sede de atención</span><select disabled className="h-10 w-full rounded-md border border-slate-300 bg-slate-100 px-3 text-sm text-slate-500"><option>Selecciona un paciente</option></select></label><label><span className="mb-1 block text-[11px] font-medium text-slate-700">Modalidad</span><select disabled className="h-10 w-full rounded-md border border-slate-300 bg-slate-100 px-3 text-sm text-slate-500"><option>Selecciona un paciente</option></select></label><label><span className="mb-1 block text-[11px] font-medium text-slate-700">Especialidad</span><select disabled className="h-10 w-full rounded-md border border-slate-300 bg-slate-100 px-3 text-sm text-slate-500"><option>Selecciona un paciente</option></select></label><div><span className="mb-1 block text-[11px] font-medium text-slate-700">Fecha de cita</span><AppointmentDateField disabled onOpen={() => undefined} /></div><div><span className="mb-1 block text-[11px] font-medium text-slate-700">Hora de cita</span><AppointmentTimeField disabled onOpen={() => undefined} /></div><label><span className="mb-1 block text-[11px] font-medium text-slate-700">Medio</span><select disabled className="h-10 w-full rounded-md border border-slate-300 bg-slate-100 px-3 text-sm text-slate-500"><option>Selecciona un paciente</option></select></label><Tooltip id="appointment-book-disabled-tooltip" label="Agendar cita" align="right"><Button type="button" variant="outline" size="icon" className="appointment-icon-action is-success h-10 w-10 min-w-10" aria-label="Agendar cita" aria-describedby="appointment-book-disabled-tooltip" disabled><CircleCheck aria-hidden="true" /></Button></Tooltip><p className="text-xs text-slate-500 md:col-span-2 xl:col-span-full">Busca un paciente para habilitar especialidad, calendario y horarios.</p></CardContent></Card>
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
  const [datePickerExpanded, setDatePickerExpanded] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [movementAppointment, setMovementAppointment] = useState<HistoryItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [historyStates, setHistoryStates] = useState<string[]>([]);
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
      if (result.patient) {
        setDocumentNumber(result.patient.documentNumber);
        setDocumentType(result.patient.documentType);
        const nextDraft = patientDraft(result.patient);
        if (!nextDraft.telefono.trim() && nextDraft.celular.trim()) nextDraft.telefono = nextDraft.celular;
        setDraft(nextDraft);
      }
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
  const selectedSlotTime = slots.data?.find((slot) => slot.id === slotId)?.inicio ?? null;
  const selectedTimeLabel = selectedSlotTime ? formatTime(selectedSlotTime) : null;
  const primaryCell = draft.celular.trim();
  const primaryPhone = draft.telefono.trim();
  const hasMainPhoneContact = !!(primaryPhone || primaryCell);
  const phoneFallbackActive = !!patient && !patient.telefono?.trim() && !!primaryCell && primaryPhone === primaryCell;
  const missingPhoneContact = !!patient && !hasMainPhoneContact;

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
    mutationFn: () => {
      if (!hasMainPhoneContact) throw new Error('El paciente debe tener celular principal o teléfono registrado para agendar la cita.');
      return rescheduling
        ? api<{ id: number }>(`/api/reception/appointments/${rescheduling.id}/reschedule`, { method: 'POST', body: JSON.stringify({ expectedVersion: rescheduling.lockVersion, newSlotId: slotId, reasonCode: rescheduleReason }) })
        : api<{ id: number }>('/api/reception/appointments', { method: 'POST', body: JSON.stringify({ patientId: patient!.id, specialtyId, slotId, requestMedium: medium, modalityId }) });
    },
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

  const resetForSite = (value: number) => { setSiteId(value); setSpecialtyId(null); setSelectedDate(undefined); setDoctorId(null); setSlotId(null); setDatePickerExpanded(false); };
  const selectSpecialty = (value: number) => { setSpecialtyId(value); setSelectedDate(undefined); setDoctorId(null); setSlotId(null); setDatePickerExpanded(false); };
  const canBook = !!patient && hasMainPhoneContact && !!effectiveSiteId && !!specialtyId && !!selectedDate && !!doctorId && !!slotId && (!!rescheduling ? !!rescheduleReason : !!modalityId);
  return <ModulePageLayout moduleKey="admisiones" hideHero>
    <PatientDataForm patient={patient} documentNumber={documentNumber} documentType={documentType} draft={draft} options={profileOptions.data} canEdit={canEditPatient} profileChanged={!!profileChanged} validProfile={validProfile} searching={search.isPending} saving={saveProfile.isPending} notFound={notFound} ambiguousDocumentTypes={ambiguousDocumentTypes} onDocumentNumberChange={(value) => { setDocumentNumber(value); setNotFound(false); setAmbiguousDocumentTypes([]); }} onDocumentTypeChange={(value) => { setDocumentType(value); setNotFound(false); }} onDraftChange={(field, value) => setDraft((current) => ({ ...current, [field]: value }))} onSearch={() => { setNotFound(false); void search.mutateAsync(); }} onSave={() => saveProfile.mutate()} onClear={() => {
      setPatient(null);
      setDocumentNumber('');
      setDocumentType('');
      setDraft(emptyPatientDraft());
      setNotFound(false);
      setAmbiguousDocumentTypes([]);
      setSelectedDate(undefined);
      setDoctorId(null);
      setSlotId(null);
      setSpecialtyId(null);
      setRescheduling(null);
      setRescheduleReason('');
      setDatePickerExpanded(false);
      setTimePickerOpen(false);
    }} />

    {patient ? <div className="grid gap-4 [&>div:first-child]:contents [&>div:first-child>div:nth-child(1)]:order-2 [&>div:first-child>div:nth-child(2)]:order-3 [&>div:nth-child(2)]:order-1">
      <div className="space-y-4">
      <Card className="overflow-visible border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50/70 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-sky-700"><History className="h-4 w-4" aria-hidden="true" /></span>
            <div>
              <CardTitle className="text-sm text-slate-900">Historial de citas</CardTitle>
            </div>
          </div>
          <HistoryStateFilter values={historyStates} onChange={setHistoryStates} />
        </CardHeader>
        <CardContent className="p-4">{history.isLoading ? <p className="text-sm text-slate-500">Cargando historial…</p> : history.isError ? <div className="space-y-2 text-sm text-red-700" role="alert"><p>No fue posible cargar el historial.</p><Button size="sm" variant="outline" onClick={() => history.refetch()}>Reintentar</Button></div> : historyItems.length ? <div className="space-y-3">{historyItems.map((item) => <article key={item.id} className="rounded-lg border border-slate-200 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm">{item.especialidadNombre}</strong><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">{item.estado}</span></div><p className="mt-1 text-sm text-slate-600">{formatDateTime(item.inicioProgramado)} · {item.medicoNombre}</p><p className="text-xs text-slate-500">{item.sedeNombre} · {item.modalidadNombre}</p><div className="appointment-card-actions" role="group" aria-label={`Acciones de la cita de ${item.especialidadNombre}`}>
          <AppointmentIconAction id={`appointment-${item.id}-movements`} label="Ver movimientos" icon={<History aria-hidden="true" />} onClick={() => setMovementAppointment(item)} />
          {item.estado === 'ASIGNADA' ? <>
            <AppointmentIconAction id={`appointment-${item.id}-activate`} label={item.activadaAt ? 'Cita activada' : 'Activar cita'} tone="success" icon={<CircleCheck aria-hidden="true" />} disabled={!!item.activadaAt || act.isPending} onClick={() => act.mutate({ id: item.id, version: item.lockVersion, action: 'activate' })} />
            <AppointmentIconAction id={`appointment-${item.id}-reschedule`} label="Reprogramar cita" tone="primary" icon={<CalendarClock aria-hidden="true" />} onClick={() => { setRescheduling(item); setRescheduleReason(''); selectSpecialty(item.especialidadId); }} />
            {canPrintReminder ? <AppointmentIconAction id={`appointment-${item.id}-print`} label={reminder.isPending ? 'Generando recordatorio' : 'Imprimir recordatorio'} icon={<Printer aria-hidden="true" />} disabled={reminder.isPending} onClick={() => reminder.mutate({ appointmentId: item.id, target: window.open('', '_blank', 'noopener') })} /> : null}
            <AppointmentIconAction id={`appointment-${item.id}-cancel`} label="Cancelar cita" tone="danger" icon={<CalendarX2 aria-hidden="true" />} disabled={act.isPending} onClick={() => { setCancelReason(''); setCancelling(item); }} />
          </> : null}
        </div></article>)}{history.hasNextPage ? <Button className="w-full" variant="outline" onClick={() => history.fetchNextPage()} disabled={history.isFetchingNextPage}>{history.isFetchingNextPage ? 'Cargando…' : 'Cargar más citas'}</Button> : null}</div> : <p className="text-sm text-slate-500">Este paciente aún no tiene citas registradas.</p>}</CardContent>
      </Card>
      </div>
      <Card className="h-fit"><CardHeader className="border-b border-slate-200 bg-slate-50/80 px-4 py-3"><CardTitle className="flex items-center gap-2 text-sm"><CalendarDays className="h-4 w-4 text-sky-700" /> {rescheduling ? 'Reprogramar cita' : 'Asignar cita'}</CardTitle></CardHeader><CardContent className="grid items-start gap-2.5 p-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.85fr)_minmax(0,1.1fr)_minmax(0,1.55fr)_minmax(0,1.55fr)_minmax(0,0.85fr)_auto] xl:items-end">
        {rescheduling ? <><div className="flex items-center justify-between rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900 md:col-span-2 xl:col-span-full"><span>Elige un nuevo cupo para {rescheduling.especialidadNombre}.</span><Button size="sm" variant="ghost" onClick={() => { setRescheduling(null); setRescheduleReason(''); }}>Cancelar</Button></div><label className="block text-sm font-medium md:col-span-2 xl:col-span-2" htmlFor="reschedule-reason">Motivo de reprogramación<select id="reschedule-reason" className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3" value={rescheduleReason} onChange={(event) => setRescheduleReason(event.target.value)} required><option value="">Selecciona el motivo</option>{rescheduleReasons.data?.map((reason) => <option key={reason.codigo} value={reason.codigo}>{reason.nombre}</option>)}</select></label></> : null}
        {missingPhoneContact ? <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 md:col-span-2 xl:col-span-full" role="alert" aria-live="assertive">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>El paciente no tiene celular principal ni teléfono registrados. Completa al menos uno de esos datos antes de agendar la cita.</p>
        </div> : null}
        {phoneFallbackActive ? <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 md:col-span-2 xl:col-span-full" role="status" aria-live="polite">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>El paciente no tiene teléfono registrado. Se usará el celular principal <strong>{draft.telefono}</strong> como teléfono para agendar la cita.</p>
        </div> : null}
        <label className="block text-sm font-medium"><span className="mb-1 block text-[11px] font-medium text-slate-700">Sede de atención</span><select className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm" value={effectiveSiteId ?? ''} disabled={!context.data?.canSelectSite} onChange={(event) => resetForSite(Number(event.target.value))}><option value="">Selecciona una sede</option>{context.data?.sites.map((site) => <option key={site.id} value={site.id}>{site.nombre}</option>)}</select></label>
        {!rescheduling ? <label className="block text-sm font-medium"><span className="mb-1 block text-[11px] font-medium text-slate-700">Modalidad</span><select className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm" value={modalityId ?? ''} onChange={(event) => setModalityId(Number(event.target.value))}><option value="">Selecciona</option>{modalities.data?.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label> : null}
        <label className="block text-sm font-medium"><span className="mb-1 block text-[11px] font-medium text-slate-700">Especialidad</span><select className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm" value={specialtyId ?? ''} disabled={!effectiveSiteId || specialties.isLoading} onChange={(event) => selectSpecialty(Number(event.target.value))}><option value="">Selecciona una especialidad</option>{specialties.data?.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>
        <div className="appointment-date-popover block text-sm font-medium"><span className="mb-1 block text-[11px] font-medium text-slate-700">Fecha de cita</span><AppointmentDateField selected={selectedDate} disabled={!specialtyId} onOpen={() => setDatePickerExpanded((current) => !current)} />
          {datePickerExpanded ? <div className="appointment-date-popover__panel">
            {specialtyId ? <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <AvailabilityCalendar selected={selectedDate} availableDates={dates.data ?? []} range={range} isLoading={dates.isLoading} onSelect={(date) => { setSelectedDate(date); setDoctorId(null); setSlotId(null); if (date) setDatePickerExpanded(false); }} />
              <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
                <span className="min-w-0 truncate">{selectedDate ? `Fecha seleccionada: ${new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeZone: 'America/Bogota' }).format(selectedDate)}` : 'Selecciona una fecha disponible para continuar.'}</span>
                <Button variant="outline" className="h-10 shrink-0 border-slate-300 bg-white text-slate-700 hover:bg-slate-100" onClick={() => setDatePickerExpanded(false)}>Cerrar</Button>
              </div>
            </div> : null}
          </div> : null}
        </div>
        <div className="block text-sm font-medium"><span className="mb-1 block text-[11px] font-medium text-slate-700">Hora de cita</span><AppointmentTimeField selectedTime={selectedTimeLabel} disabled={!selectedDateKey} onOpen={() => setTimePickerOpen(true)} /></div>
        {!rescheduling ? <label className="block text-sm font-medium"><span className="mb-1 block text-[11px] font-medium text-slate-700">Medio</span><select className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm" value={medium} onChange={(event) => setMedium(event.target.value)}><option value="PRESENCIAL">Presencial</option><option value="TELEFONO">Teléfono</option><option value="CORREO">Correo</option><option value="WHATSAPP">WhatsApp</option></select></label> : null}
        <Tooltip id="appointment-book-tooltip" label={book.isPending ? 'Agendando cita' : rescheduling ? 'Continuar con la reprogramación' : 'Agendar cita'} align="right"><Button type="button" variant="outline" size="icon" className="appointment-icon-action is-success h-10 w-10 min-w-10" aria-label={book.isPending ? 'Agendando cita' : rescheduling ? 'Continuar con la reprogramación' : 'Agendar cita'} aria-describedby="appointment-book-tooltip" disabled={!canBook || book.isPending} onClick={() => {
          if (!hasMainPhoneContact) {
            toast.error('Debes registrar celular principal o teléfono antes de agendar la cita.');
            return;
          }
          if (rescheduling) {
            setRescheduleConfirmationOpen(true);
            return;
          }
          book.mutate();
        }}><CircleCheck aria-hidden="true" /></Button></Tooltip><p className="sr-only" aria-live="polite">{book.isSuccess ? (rescheduling ? 'Cita reprogramada correctamente.' : 'Cita agendada correctamente.') : ''}</p>
      </CardContent></Card>
    </div> : <InitialReceptionLayout />}
    <AlertDialog open={!!cancelling} onOpenChange={(open) => { if (!open && !act.isPending) { setCancelling(null); setCancelReason(''); } }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Cancelar cita</AlertDialogTitle><AlertDialogDescription>El cupo volverá a estar disponible. Selecciona el motivo institucional antes de confirmar.</AlertDialogDescription></AlertDialogHeader><label className="grid gap-1 text-sm font-medium text-slate-800" htmlFor="cancel-reason">Motivo de cancelación<select id="cancel-reason" className="h-11 rounded-md border border-slate-300 bg-white px-3" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} autoFocus><option value="">Selecciona el motivo</option>{cancelReasons.data?.map((reason) => <option key={reason.codigo} value={reason.codigo}>{reason.nombre}</option>)}</select></label><AlertDialogFooter><AlertDialogCancel disabled={act.isPending}>Volver</AlertDialogCancel><AlertDialogAction className="bg-red-600 hover:bg-red-700" disabled={!cancelReason || act.isPending} onClick={(event) => { event.preventDefault(); if (cancelling) act.mutate({ id: cancelling.id, version: cancelling.lockVersion, action: 'cancel' }, { onSuccess: () => setCancelling(null) }); }}> {act.isPending ? 'Cancelando…' : 'Confirmar cancelación'} </AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <AlertDialog open={rescheduleConfirmationOpen} onOpenChange={(open) => { if (!open && !book.isPending) setRescheduleConfirmationOpen(false); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar reprogramación</AlertDialogTitle><AlertDialogDescription>La cita actual quedará reprogramada y se asignará el nuevo cupo seleccionado.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={book.isPending}>Volver</AlertDialogCancel><AlertDialogAction disabled={book.isPending} onClick={(event) => { event.preventDefault(); book.mutate(undefined, { onSuccess: () => setRescheduleConfirmationOpen(false) }); }}>{book.isPending ? 'Reprogramando…' : 'Confirmar reprogramación'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <Dialog open={!!movementAppointment} onOpenChange={(open) => { if (!open) setMovementAppointment(null); }}>
      <DialogContent className="appointment-movements-dialog max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-2xl grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden border-slate-200 bg-white p-0 text-slate-950 shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
        <DialogHeader className="appointment-movements-dialog__header">
          <span className="appointment-movements-dialog__icon"><History aria-hidden="true" /></span>
          <div>
            <DialogTitle className="text-left text-lg text-slate-950">Movimientos de la cita</DialogTitle>
            <DialogDescription className="mt-1 text-left text-sm text-slate-600">{movementAppointment ? `${movementAppointment.especialidadNombre} · ${formatDateTime(movementAppointment.inicioProgramado)}` : 'Trazabilidad operativa de la cita.'}</DialogDescription>
          </div>
        </DialogHeader>
        <div className="appointment-movements-dialog__body">
          {movements.isLoading ? <div className="appointment-movements-dialog__message" aria-live="polite"><span className="appointment-movements-dialog__loader" aria-hidden="true" />Consultando movimientos…</div> : movements.isError ? <div className="appointment-movements-dialog__error" role="alert"><p>No fue posible cargar los movimientos.</p><Button size="sm" variant="outline" className="mt-3" onClick={() => movements.refetch()}>Reintentar</Button></div> : movementItems.length ? <ol className="appointment-movement-timeline" aria-label="Movimientos de la cita">{movementItems.map((movement) => <li key={movement.id} className={`appointment-movement-timeline__item is-${movement.tipoEvento.toLocaleLowerCase('es-CO')}`}>
            <span className="appointment-movement-timeline__marker" aria-hidden="true"><span /></span>
            <article className="appointment-movement-card">
              <header><strong>{movementEventLabel(movement.tipoEvento)}</strong><time dateTime={movement.createdAt}>{formatDateTime(movement.createdAt)}</time></header>
              {movement.estadoAnterior || movement.estadoNuevo ? <div className="appointment-movement-card__transition"><span>Estado de la cita</span><div><strong>{enumLabel(movement.estadoAnterior)}</strong><ArrowRight aria-hidden="true" /><strong>{enumLabel(movement.estadoNuevo)}</strong></div></div> : null}
              {movement.estadoCupoAnterior || movement.estadoCupoNuevo ? <div className="appointment-movement-card__transition"><span>Estado del cupo</span><div><strong>{enumLabel(movement.estadoCupoAnterior)}</strong><ArrowRight aria-hidden="true" /><strong>{enumLabel(movement.estadoCupoNuevo)}</strong></div></div> : null}
              {movementReason(movement.metadata) ? <p className="appointment-movement-card__reason"><span>Motivo:</span> {movementReason(movement.metadata)}</p> : null}
            </article>
          </li>)}</ol> : <div className="appointment-movements-dialog__message">Esta cita todavía no tiene movimientos registrados.</div>}
          {movements.hasNextPage ? <Button className="mt-4 w-full" variant="outline" onClick={() => movements.fetchNextPage()} disabled={movements.isFetchingNextPage}>{movements.isFetchingNextPage ? 'Cargando…' : 'Cargar más movimientos'}</Button> : null}
        </div>
        <DialogFooter className="appointment-movements-dialog__footer"><Button variant="outline" className="h-11 min-w-24 border-slate-300 bg-white text-slate-700 hover:bg-slate-100" onClick={() => setMovementAppointment(null)}>Cerrar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
    <Dialog open={timePickerOpen} onOpenChange={setTimePickerOpen}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-3xl grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden border-slate-200 bg-white p-0 text-slate-950 shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
        <DialogHeader className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-left text-base text-slate-950"><Clock3 className="h-4 w-4 text-sky-700" /> Hora de cita</DialogTitle>
          <DialogDescription className="mt-1 text-left text-sm text-slate-600">Selecciona el médico y luego el horario disponible para la fecha elegida.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 space-y-4 overflow-y-auto p-4">
          <label className="block text-sm font-medium">Médico<select className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3" value={doctorId ?? ''} disabled={!selectedDateKey} onChange={(event) => { setDoctorId(Number(event.target.value)); setSlotId(null); }}><option value="">{selectedDateKey ? 'Selecciona un médico' : 'Selecciona una fecha primero'}</option>{doctors.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <fieldset className="appointment-time-slots" disabled={!doctorId}>
            <legend className="sr-only">Hora disponible</legend>
            <div className="appointment-time-slots__header">
              <div>
                <span className="appointment-time-slots__eyebrow"><Clock3 aria-hidden="true" /> Horarios disponibles</span>
                <p>Elige la hora que mejor se ajuste a la atención.</p>
              </div>
              <div className="appointment-time-slots__selection" aria-live="polite">
                {slotId && selectedTimeLabel ? <><CircleCheck aria-hidden="true" /><span>Hora elegida</span><strong>{selectedTimeLabel}</strong></> : <span>Elige una hora</span>}
              </div>
            </div>
            <div className="appointment-time-slots__grid" aria-live="polite">
              {slots.isLoading ? <p className="appointment-time-slots__empty">Consultando horarios disponibles…</p> : slots.data?.length ? slots.data.map((slot) => {
                const selectedSlot = slotId === slot.id;
                return <button key={slot.id} type="button" className={`appointment-time-slot${selectedSlot ? ' is-selected' : ''}`} aria-pressed={selectedSlot} onClick={() => setSlotId(slot.id)}><strong>{formatTime(slot.inicio)}</strong><span>{selectedSlot ? 'Hora elegida' : 'Disponible'}</span></button>;
              }) : <p className="appointment-time-slots__empty">Selecciona un médico para consultar sus horarios.</p>}
            </div>
          </fieldset>
        </div>
        <DialogFooter className="border-t border-slate-200 bg-white px-5 py-4 sm:justify-between">
          <p className="text-sm text-slate-500">{selectedTimeLabel ? `Hora seleccionada: ${selectedTimeLabel}` : 'Selecciona una hora para continuar con la cita.'}</p>
          <Button variant="outline" className="h-11 border-slate-300 bg-white text-slate-700 hover:bg-slate-100" onClick={() => setTimePickerOpen(false)}>Listo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </ModulePageLayout>;
}
