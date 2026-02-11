'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';

type PerfilOption = { id: number; nombre: string };
type EspecialidadOption = { id: number; nombre: string };

type Tratamiento = 'DR' | 'DRA';

type InitialValues = {
  tipoDocumento?: string;
  numeroIdentidad?: string;
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  email?: string;
  perfilId?: string; // '' para null
  activo?: boolean;

  telefonos?: string;
  direccion?: string;

  registroMedico?: string;
  licencia?: string;

  // ✅ NUEVO
  esMiembroJunta?: boolean;
  especialidadIds?: number[];

  tratamiento?: Tratamiento;
};

type Props = {
  perfiles: PerfilOption[];
  especialidades?: EspecialidadOption[];

  method: 'POST' | 'PATCH';
  apiUrl: string;

  submitLabel?: string;
  successMessage?: string;
  onSuccessRedirectTo?: string;

  showPassword?: boolean;
  passwordRequired?: boolean;
  passwordLabel?: string;

  initialValues?: InitialValues;
};

const TIPOS_DOCUMENTO = [
  { value: 'CC', label: 'CC - Cédula de ciudadanía' },
  { value: 'TI', label: 'TI - Tarjeta de identidad' },
  { value: 'CE', label: 'CE - Cédula de extranjería' },
  { value: 'PA', label: 'PA - Pasaporte' },
  { value: 'RC', label: 'RC - Registro civil' },
  { value: 'NIT', label: 'NIT - Número de identificación tributaria' },
  { value: 'PEP', label: 'PEP - Permiso especial de permanencia' },
  { value: 'PPT', label: 'PPT - Permiso por protección temporal' },
];

function upper(v: string) {
  return (v ?? '').trim().toUpperCase();
}
function lower(v: string) {
  return (v ?? '').trim().toLowerCase();
}
function clean(v: string) {
  return (v ?? '').trim();
}

function isAllowedFirma(file: File) {
  const okType = file.type === 'image/png' || file.type === 'image/jpeg';
  const okSize = file.size <= 2 * 1024 * 1024; // 2MB
  return okType && okSize;
}

export default function EmpleadoForm({
  perfiles,
  especialidades = [],

  method,
  apiUrl,
  submitLabel = 'Guardar',
  successMessage = 'Guardado correctamente',
  onSuccessRedirectTo,

  showPassword = false,
  passwordRequired = true,
  passwordLabel = 'Contraseña',

  initialValues,
}: Props) {
  const router = useRouter();

  const initial = useMemo<Required<InitialValues>>(
    () => ({
      tipoDocumento: initialValues?.tipoDocumento ?? '',
      numeroIdentidad: initialValues?.numeroIdentidad ?? '',
      primerNombre: initialValues?.primerNombre ?? '',
      segundoNombre: initialValues?.segundoNombre ?? '',
      primerApellido: initialValues?.primerApellido ?? '',
      segundoApellido: initialValues?.segundoApellido ?? '',
      email: initialValues?.email ?? '',
      perfilId: initialValues?.perfilId ?? '',
      activo: initialValues?.activo ?? true,
      telefonos: initialValues?.telefonos ?? '',
      direccion: initialValues?.direccion ?? '',
      registroMedico: initialValues?.registroMedico ?? '',
      licencia: initialValues?.licencia ?? '',

      esMiembroJunta: initialValues?.esMiembroJunta ?? false,
      especialidadIds: initialValues?.especialidadIds ?? [],

      tratamiento: (initialValues?.tratamiento as Tratamiento) ?? 'DR',
    }),
    [initialValues]
  );

  const [tipoDocumento, setTipoDocumento] = useState(initial.tipoDocumento);
  const [numeroIdentidad, setNumeroIdentidad] = useState(initial.numeroIdentidad);
  const [primerNombre, setPrimerNombre] = useState(initial.primerNombre);
  const [segundoNombre, setSegundoNombre] = useState(initial.segundoNombre);
  const [primerApellido, setPrimerApellido] = useState(initial.primerApellido);
  const [segundoApellido, setSegundoApellido] = useState(initial.segundoApellido);
  const [email, setEmail] = useState(initial.email);
  const [perfilId, setPerfilId] = useState(initial.perfilId);
  const [activo, setActivo] = useState<boolean>(initial.activo);

  const [telefonos, setTelefonos] = useState(initial.telefonos);
  const [direccion, setDireccion] = useState(initial.direccion);

  const [registroMedico, setRegistroMedico] = useState(initial.registroMedico);
  const [licencia, setLicencia] = useState(initial.licencia);

  const [password, setPassword] = useState('');

  // ✅ NUEVO
  const [esMiembroJunta, setEsMiembroJunta] = useState<boolean>(initial.esMiembroJunta);
  const [especialidadIds, setEspecialidadIds] = useState<number[]>(initial.especialidadIds);
  const [firmaFile, setFirmaFile] = useState<File | null>(null);

  const [tratamiento, setTratamiento] = useState<Tratamiento>(initial.tratamiento);

  useEffect(() => {
    setTipoDocumento(initial.tipoDocumento);
    setNumeroIdentidad(initial.numeroIdentidad);
    setPrimerNombre(initial.primerNombre);
    setSegundoNombre(initial.segundoNombre);
    setPrimerApellido(initial.primerApellido);
    setSegundoApellido(initial.segundoApellido);
    setEmail(initial.email);
    setPerfilId(initial.perfilId);
    setActivo(initial.activo);
    setTelefonos(initial.telefonos);
    setDireccion(initial.direccion);
    setRegistroMedico(initial.registroMedico);
    setLicencia(initial.licencia);
    setPassword('');

    setEsMiembroJunta(initial.esMiembroJunta);
    setEspecialidadIds(initial.especialidadIds);
    setFirmaFile(null);

    setTratamiento(initial.tratamiento)
  }, [initial]);

  const mutation = useMutation({
    mutationFn: async (payload: Record<string, any> | FormData) => {
      const isForm = payload instanceof FormData;

      const res = await fetch(apiUrl, {
        method,
        credentials: 'include',
        headers: isForm ? undefined : { 'Content-Type': 'application/json' },
        body: isForm ? payload : JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? 'No se pudo guardar');
      }
      return data;
    },
    onSuccess: () => {
      toast.success(successMessage);

      if (onSuccessRedirectTo) {
        router.replace(onSuccessRedirectTo);
        return;
      }

      router.refresh();
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'No se pudo guardar');
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mutation.isPending) return;

    const base: any = {
      tipoDocumento: upper(tipoDocumento),
      numeroIdentidad: clean(numeroIdentidad),

      primerNombre: upper(primerNombre),
      segundoNombre: clean(segundoNombre) ? upper(segundoNombre) : '',
      primerApellido: upper(primerApellido),
      segundoApellido: clean(segundoApellido) ? upper(segundoApellido) : '',

      email: lower(email),

      perfilId: perfilId ? Number(perfilId) : null,
      activo: Boolean(activo),

      telefonos: clean(telefonos) ? upper(telefonos) : null,
      direccion: clean(direccion) ? upper(direccion) : null,

      registroMedico: clean(registroMedico) ? upper(registroMedico) : null,
      licencia: clean(licencia) ? upper(licencia) : null,

      esMiembroJunta: Boolean(esMiembroJunta),
      especialidadIds,

      tratamiento,
    };

    if (!base.tipoDocumento || !base.numeroIdentidad) {
      toast.error('Tipo y número de documento son obligatorios');
      return;
    }
    if (!base.primerNombre || !base.primerApellido) {
      toast.error('Primer nombre y primer apellido son obligatorios');
      return;
    }
    if (!base.email) {
      toast.error('Email es obligatorio');
      return;
    }

    const pass = clean(password);
    if (showPassword) {
      if (passwordRequired && (!pass || pass.length < 6)) {
        toast.error('La contraseña debe tener mínimo 6 caracteres');
        return;
      }
      if (!passwordRequired && pass && pass.length < 6) {
        toast.error('La contraseña debe tener mínimo 6 caracteres');
        return;
      }
      if (pass) base.password = pass;
    }

    if (!base.segundoNombre) base.segundoNombre = null;
    if (!base.segundoApellido) base.segundoApellido = null;

    if (method === 'POST' && esMiembroJunta) {
      if (!firmaFile) {
        toast.error('Si es miembro de junta, debes cargar la firma (PNG/JPG).');
        return;
      }
    }

    if (firmaFile && !isAllowedFirma(firmaFile)) {
      toast.error('Firma inválida. Solo PNG/JPG y máximo 2MB.');
      return;
    }

    const shouldSendForm = method === 'POST' || !!firmaFile;

    if (shouldSendForm) {
      const fd = new FormData();

      fd.append('tipoDocumento', base.tipoDocumento);
      fd.append('numeroIdentidad', base.numeroIdentidad);
      fd.append('primerNombre', base.primerNombre);
      fd.append('primerApellido', base.primerApellido);
      fd.append('email', base.email);

      if (base.segundoNombre) fd.append('segundoNombre', base.segundoNombre);
      if (base.segundoApellido) fd.append('segundoApellido', base.segundoApellido);
      if (base.telefonos) fd.append('telefonos', base.telefonos);
      if (base.direccion) fd.append('direccion', base.direccion);
      if (base.registroMedico) fd.append('registroMedico', base.registroMedico);
      if (base.licencia) fd.append('licencia', base.licencia);

      if (base.perfilId != null) fd.append('perfilId', String(base.perfilId));
      fd.append('activo', base.activo ? 'true' : 'false');

      if (base.password) fd.append('password', base.password);

      fd.append('esMiembroJunta', base.esMiembroJunta ? 'true' : 'false');

      for (const id of especialidadIds) {
        fd.append('especialidadIds', String(id));
      }

      fd.append('tratamiento', base.tratamiento);

      if (firmaFile) {
        fd.append('firma', firmaFile);
      }

      mutation.mutate(fd);
      return;
    }

    mutation.mutate(base);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-12 md:col-span-3">
          <label className="block text-[11px] font-medium text-slate-600">Tratamiento</label>
          <select
            value={tratamiento}
            onChange={(e) => setTratamiento(e.target.value as Tratamiento)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="DR">Dr.</option>
            <option value="DRA">Dra.</option>
          </select>
        </div>
        
        <div className="col-span-12 md:col-span-3">
          <label className="block text-[11px] font-medium text-slate-600">Tipo documento *</label>
          <select
            value={tipoDocumento}
            onChange={(e) => setTipoDocumento(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="">Seleccione…</option>
            {TIPOS_DOCUMENTO.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-12 md:col-span-3">
          <label className="block text-[11px] font-medium text-slate-600">Número documento *</label>
          <input
            value={numeroIdentidad}
            onChange={(e) => setNumeroIdentidad(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
            placeholder="Ej: 123456789"
          />
        </div>

        <div className="col-span-12 md:col-span-6">
          <label className="block text-[11px] font-medium text-slate-600">Email *</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
            placeholder="correo@dominio.com"
          />
        </div>

        <div className="col-span-12 md:col-span-3">
          <label className="block text-[11px] font-medium text-slate-600">Primer nombre *</label>
          <input
            value={primerNombre}
            onChange={(e) => setPrimerNombre(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <div className="col-span-12 md:col-span-3">
          <label className="block text-[11px] font-medium text-slate-600">Segundo nombre</label>
          <input
            value={segundoNombre}
            onChange={(e) => setSegundoNombre(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <div className="col-span-12 md:col-span-3">
          <label className="block text-[11px] font-medium text-slate-600">Primer apellido *</label>
          <input
            value={primerApellido}
            onChange={(e) => setPrimerApellido(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <div className="col-span-12 md:col-span-3">
          <label className="block text-[11px] font-medium text-slate-600">Segundo apellido</label>
          <input
            value={segundoApellido}
            onChange={(e) => setSegundoApellido(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className="block text-[11px] font-medium text-slate-600">Perfil</label>
          <select
            value={perfilId}
            onChange={(e) => setPerfilId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="">Sin perfil</option>
            {perfiles.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className="block text-[11px] font-medium text-slate-600">Teléfonos</label>
          <input
            value={telefonos}
            onChange={(e) => setTelefonos(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
            placeholder="Ej: 3000000000"
          />
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className="block text-[11px] font-medium text-slate-600">Dirección</label>
          <input
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className="block text-[11px] font-medium text-slate-600">Registro médico</label>
          <input
            value={registroMedico}
            onChange={(e) => setRegistroMedico(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className="block text-[11px] font-medium text-slate-600">Licencia</label>
          <input
            value={licencia}
            onChange={(e) => setLicencia(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <div className="col-span-12 md:col-span-4">
          <label className="block text-[11px] font-medium text-slate-600">Estado</label>
          <select
            value={activo ? '1' : '0'}
            onChange={(e) => setActivo(e.target.value === '1')}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="1">ACTIVO</option>
            <option value="0">INACTIVO</option>
          </select>
        </div>

        {/* ✅ Especialidades */}
        <div className="col-span-12 md:col-span-6">
          <label className="block text-[11px] font-medium text-slate-600">Especialidades médicas</label>
          <select
            multiple
            value={especialidadIds.map(String)}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
              setEspecialidadIds(values.filter((n) => Number.isFinite(n)));
            }}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40 min-h-[90px]"
          >
            {especialidades.length === 0 ? (
              <option value="" disabled>
                (No hay especialidades cargadas)
              </option>
            ) : (
              especialidades.map((esp) => (
                <option key={esp.id} value={String(esp.id)}>
                  {esp.nombre}
                </option>
              ))
            )}
          </select>
          <p className="mt-1 text-[10px] text-slate-500">Puedes seleccionar varias (Ctrl / Cmd + click).</p>
        </div>

        {/* ✅ Junta */}
        <div className="col-span-12 md:col-span-6">
          <label className="block text-[11px] font-medium text-slate-600">Junta médica</label>

          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              checked={esMiembroJunta}
              onChange={(e) => setEsMiembroJunta(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300"
            />
            <span className="text-[11px] text-slate-700">Es miembro de junta</span>
          </div>

          <div className="mt-2">
            <label className="block text-[11px] font-medium text-slate-600">
              Firma (PNG/JPG) {esMiembroJunta && method === 'POST' ? '*' : ''}
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFirmaFile(f);
              }}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            {!!firmaFile && (
              <p className="mt-1 text-[10px] text-slate-500">
                Archivo: {firmaFile.name} ({Math.round(firmaFile.size / 1024)} KB)
              </p>
            )}
            <p className="mt-1 text-[10px] text-slate-500">Recomendado: fondo blanco, firma centrada, ancho ~800px.</p>
          </div>
        </div>

        {showPassword && (
          <div className="col-span-12">
            <label className="block text-[11px] font-medium text-slate-600">
              {passwordLabel} {passwordRequired ? '*' : ''}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/40"
              placeholder={passwordRequired ? 'Mínimo 6 caracteres' : 'Dejar vacío para no cambiar'}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-full bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {mutation.isPending ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </form>
  );
}