'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchableSelect } from '@/components/forms/SearchableSelect';

/* ==========
   Tipos base
   ========== */

type DocenteForm = {
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  edad: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  sexo: string;
  direccion: string;
  barrio: string;
  departamento: string;
  municipio: string;
  zona: string;
  telefono: string;
  pais: string;
  codigoEps: string;
  categoria: string;
  secretariaLabora: string;
  formaVinculacion: string;
  estadoCivil: string;
  gradoEscalafon: string;
  nivelEscalafon: string;
  institucionLabora: string;

  // ✅ NUEVOS
  cargoDocenteId: string; // guardamos el ID como string para el form (en BD es Int)
  escolaridad: string;
};

const emptyForm: DocenteForm = {
  tipoDocumento: '',
  numeroDocumento: '',
  fechaNacimiento: '',
  edad: '',
  primerNombre: '',
  segundoNombre: '',
  primerApellido: '',
  segundoApellido: '',
  sexo: '',
  direccion: '',
  barrio: '',
  departamento: '',
  municipio: '',
  zona: '',
  telefono: '',
  pais: 'COLOMBIA',
  codigoEps: '',
  categoria: '',
  secretariaLabora: '',
  formaVinculacion: '',
  estadoCivil: '',
  gradoEscalafon: '',
  nivelEscalafon: '',
  institucionLabora: '',

  // ✅ NUEVOS
  cargoDocenteId: '',
  escolaridad: '',
};

type UpdateDocenteModalProps = {
  open: boolean;
  onClose: () => void;
  numeroDocumento: string;
  onUpdate?: () => void;
};

// =====================
// Toast local
// =====================
type ToastType = 'success' | 'error' | 'info';

type ToastProps = {
  open: boolean;
  type: ToastType;
  message: string;
  onClose: () => void;
};

function Toast({ open, type, message, onClose }: ToastProps) {
  if (!open) return null;

  const bgClass =
    type === 'success'
      ? 'bg-emerald-600'
      : type === 'error'
      ? 'bg-red-600'
      : 'bg-slate-800';

  return (
    <div className="fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <div
        className={`flex items-center gap-3 rounded-xl ${bgClass} px-4 py-3 text-sm text-white shadow-2xl`}
      >
        <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-white/10">
          {type === 'success' ? '✓' : type === 'error' ? '!' : 'i'}
        </span>
        <span>{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-3 text-xs text-white/80 hover:text-white"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

// Tipos combos
type PaisOption = { codigo: string; nombre: string };
type DepartamentoOption = { codigo: string; nombre: string };
type MunicipioOption = {
  codigo: string;
  nombre: string;
  codigoDepartamento: string;
};
type BarrioOption = {
  id: number;
  nombre: string;
  codigoMunicipio: string;
};
type EpsOption = { codigo: string; nombre: string };

type SecretariaOption = { id: number; nombre: string };
type InstitucionOption = {
  id: number;
  nombre: string;
  idDepartamento: string | null;
  idMunicipio: string | null;
  idSecretaria: number | null;
};

// ✅ NUEVO: Cargo docente
type CargoDocenteOption = { id: number; codigo?: string | null; nombre: string };

export function ActualizarDocenteModal({
  open,
  onClose,
  numeroDocumento,
  onUpdate,
}: UpdateDocenteModalProps) {
  const [form, setForm] = useState<DocenteForm>({
    ...emptyForm,
    numeroDocumento: numeroDocumento ?? '',
  });

  const [paises, setPaises] = useState<PaisOption[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoOption[]>([]);
  const [municipios, setMunicipios] = useState<MunicipioOption[]>([]);
  const [barrios, setBarrios] = useState<BarrioOption[]>([]);
  const [epsList, setEpsList] = useState<EpsOption[]>([]);

  const [selectedPaisCodigo, setSelectedPaisCodigo] = useState('');
  const [selectedDepartamento, setSelectedDepartamento] = useState('');
  const [selectedMunicipio, setSelectedMunicipio] = useState('');

  const [secretarias, setSecretarias] = useState<SecretariaOption[]>([]);
  const [instituciones, setInstituciones] = useState<InstitucionOption[]>([]);
  const [selectedSecretariaId, setSelectedSecretariaId] = useState<string>('');
  const [loadingInstituciones, setLoadingInstituciones] = useState(false);

  // ✅ NUEVO: estados cargo docente
  const [cargosDocentes, setCargosDocentes] = useState<CargoDocenteOption[]>([]);
  const [loadingCargos, setLoadingCargos] = useState(false);

  const [ubicacionLoaded, setUbicacionLoaded] = useState(false);
  const [docenteLoaded, setDocenteLoaded] = useState(false);

  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
  } | null>(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
  };

  // Auto-cerrar toast
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  // Cuando cambia numeroDocumento desde afuera y se abre el modal
  useEffect(() => {
    if (!open) return;
    setForm((prev) => ({
      ...prev,
      numeroDocumento: numeroDocumento ?? prev.numeroDocumento,
    }));
  }, [open, numeroDocumento]);

  // Calcular edad automáticamente
  useEffect(() => {
    if (!form.fechaNacimiento) {
      setForm((prev) => (prev.edad !== '' ? { ...prev, edad: '' } : prev));
      return;
    }

    const birth = new Date(form.fechaNacimiento);
    if (Number.isNaN(birth.getTime())) {
      setForm((prev) => (prev.edad !== '' ? { ...prev, edad: '' } : prev));
      return;
    }

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    const ageStr = age >= 0 ? String(age) : '';

    setForm((prev) => (prev.edad !== ageStr ? { ...prev, edad: ageStr } : prev));
  }, [form.fechaNacimiento]);

    const ensureCargoInOptions = (cargoIdStr: string, cargoNombre?: string) => {
    const id = Number(cargoIdStr);
    if (!cargoIdStr || !Number.isFinite(id)) return;

    const name = (cargoNombre ?? '').trim() || `Cargo #${id}`;

    setCargosDocentes((prev) => {
      if (prev.some((x) => x.id === id)) return prev;
      return [{ id, codigo: null, nombre: name }, ...prev];
    });
  };

  /* ======================================================
     🔹 Búsqueda async de instituciones (typeahead)
     ====================================================== */
  const searchInstituciones = async (term: string) => {
    const secretariaId = selectedSecretariaId;

    if (!secretariaId) {
      setInstituciones([]);
      return;
    }

    const trimmed = term.trim();
    if (trimmed.length < 3) {
      setInstituciones([]);
      return;
    }

    try {
      setLoadingInstituciones(true);

      const params = new URLSearchParams();
      params.set('q', trimmed);
      params.set('secretariaId', secretariaId);

      const res = await fetch(`/api/instituciones/search?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        console.error(data.error || 'Error cargando instituciones');
        setInstituciones([]);
        return;
      }

      const byNombre = new Map<string, InstitucionOption>();
      for (const i of data.instituciones ?? []) {
        const item: InstitucionOption = {
          id: i.id,
          nombre: i.nombre,
          idDepartamento: i.idDepartamento ?? null,
          idMunicipio: i.idMunicipio ?? null,
          idSecretaria: i.idSecretaria ?? null,
        };
        if (!byNombre.has(item.nombre)) byNombre.set(item.nombre, item);
      }

      setInstituciones(Array.from(byNombre.values()));
    } catch (err) {
      console.error('Error cargando instituciones', err);
      setInstituciones([]);
    } finally {
      setLoadingInstituciones(false);
    }
  };

  /* ======================================================
     ✅ NUEVO: Búsqueda async de CARGOS DOCENTES (typeahead)
     ====================================================== */
  const CARGOS_ENDPOINT = '/api/cargos-docentes/search'; // si cambia tu ruta, cambia SOLO esto

  const searchCargosDocentes = async (term: string) => {
    const q = (term ?? '').trim();
    if (q.length < 3) {
      setCargosDocentes([]);
      return;
    }

    // cargoAbortRef.current?.abort();
    const controller = new AbortController();
    // cargoAbortRef.current = controller;

    try {
      setLoadingCargos(true);

      const res = await fetch(`${CARGOS_ENDPOINT}?q=${encodeURIComponent(q)}`, {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setCargosDocentes([]);
        return;
      }

      // soporta distintos nombres de respuesta
      const raw: any[] =
        (Array.isArray(data.items) && data.items) ||
        (Array.isArray(data.cargos) && data.cargos) ||
        (Array.isArray(data.rows) && data.rows) ||
        (Array.isArray(data.cargosDocentes) && data.cargosDocentes) ||
        [];

      const byId = new Map<number, CargoDocenteOption>();
      for (const c of raw) {
        const id = Number(c.id);
        if (!Number.isFinite(id)) continue;

        const nombre = String(c.nombre ?? c.Nombre ?? '').trim();
        if (!nombre) continue;

        byId.set(id, {
          id,
          codigo: c.codigo ?? c.Codigo ?? null,
          nombre,
        });
      }

      setCargosDocentes(Array.from(byId.values()));
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Error buscando cargos docentes', err);
      setCargosDocentes([]);
    } finally {
      if (!controller.signal.aborted) setLoadingCargos(false);
    }
  };

  /* ======================================================
     🔹 React Query: opciones de ubicación (una sola vez)
     ====================================================== */

  const { data: ubicacionData } = useQuery({
    queryKey: ['ubicacion-opciones'],
    queryFn: async () => {
      const res = await fetch('/api/ubicacion/opciones', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data?.error ?? 'Error cargando opciones de ubicación');
      }

      return data;
    },
    enabled: open && !ubicacionLoaded,
    staleTime: 1000 * 60 * 10,
  });

  // Mapear ubicacionData -> estados locales (solo una vez)
  useEffect(() => {
    if (!open) return;
    if (ubicacionLoaded) return;
    if (!ubicacionData) return;

    try {
      const data = ubicacionData;

      const paisesMapped: PaisOption[] = (data.paises ?? []).map((p: any) => ({
        codigo: p.codigo,
        nombre: p.nombre,
      }));

      const departamentosMapped: DepartamentoOption[] = (data.departamentos ?? []).map((d: any) => ({
        codigo: d.codigo,
        nombre: d.nombre,
      }));

      const municipiosMapped: MunicipioOption[] = (data.municipios ?? []).map((m: any) => ({
        codigo: m.codigo,
        nombre: m.nombre,
        codigoDepartamento: m.codigoDepartamento,
      }));

      const barriosMapped: BarrioOption[] = (data.barrios ?? []).map((b: any) => ({
        id: b.id,
        nombre: b.nombre,
        codigoMunicipio: b.codigoMunicipio,
      }));

      const secretariasMapped: SecretariaOption[] = (data.secretarias ?? []).map((s: any) => ({
        id: s.id,
        nombre: s.nombre,
      }));

      const epsMapped: EpsOption[] = (data.eps ?? []).map((e: any) => ({
        codigo: e.codigo,
        nombre: e.nombre,
      }));

      setPaises(paisesMapped);
      setDepartamentos(departamentosMapped);
      setMunicipios(municipiosMapped);
      setBarrios(barriosMapped);
      setSecretarias(secretariasMapped);
      setEpsList(epsMapped);
      setUbicacionLoaded(true);
    } catch (err) {
      console.error('Error mapeando ubicacionData en ActualizarDocente:', err);
    }
  }, [open, ubicacionData, ubicacionLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBuscarDocente = async (docParam?: string) => {
    const doc = docParam ?? form.numeroDocumento;

    if (!doc) {
      showToast('error', 'Ingresa un número de documento');
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/docentes/search?q=${encodeURIComponent(doc)}`, {
        method: 'GET',
        credentials: 'include',
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any;

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('Respuesta no JSON de /api/docentes/search:', text);
        showToast('error', 'Error buscando docente');
        return;
      }

      if (!res.ok || !data?.ok) {
        showToast('error', data?.error ?? 'Error buscando docente');
        return;
      }

      const rows = data.rows ?? [];
      if (!rows.length) {
        showToast('info', 'Este docente no existe');
        return;
      }

      const d = rows[0];

      const codigoEpsRes =
        (d as any).codigoEps ??
        (d as any).Codigo_eps ??
        (d as any).codigo_eps ??
        (d as any).CODIGO_EPS ??
        (d as any).Codigo_Eps;

      // ✅ NUEVOS (tolerante a nombres)
      const cargoDocenteIdRes =
        (d as any).cargoDocenteId ??
        (d as any).cargo_docente_id ??
        (d as any).cargoDocenteID ??
        (d as any).CARGO_DOCENTE_ID ??
        '';

      const cargoDocenteNombreRes =
        (d as any).cargoDocenteNombre ??
        (d as any).cargo_docente_nombre ??
        (d as any).cargoDocente?.nombre ??
        '';

      const escolaridadRes =
        (d as any).escolaridad ??
        (d as any).Escolaridad ??
        (d as any).ESCOLARIDAD;

      const updated: DocenteForm = {
        ...emptyForm,
        ...form,
        tipoDocumento: d.tipoIdentificacion ?? d.tipoDocumento ?? form.tipoDocumento,
        numeroDocumento: d.identificacion ?? d.numeroDocumento ?? doc,
        fechaNacimiento:
          (d.fechaNacimiento && String(d.fechaNacimiento).slice(0, 10)) ?? form.fechaNacimiento,
        edad: d.edad != null ? String(d.edad) : form.edad,
        primerNombre: d.primerNombre ?? form.primerNombre,
        segundoNombre: d.segundoNombre ?? form.segundoNombre,
        primerApellido: d.primerApellido ?? form.primerApellido,
        segundoApellido: d.segundoApellido ?? form.segundoApellido,
        sexo: d.sexo ?? form.sexo,
        direccion: d.direccion ?? form.direccion,
        barrio: d.barrio ?? form.barrio,
        departamento: d.departamento ?? form.departamento,
        municipio: d.municipio ?? form.municipio,
        zona: d.zonaResidencia ?? d.zona ?? form.zona,
        telefono: d.telefono ?? form.telefono,
        pais: form.pais,
        codigoEps: codigoEpsRes ?? form.codigoEps,
        categoria: d.categoria ?? form.categoria,
        secretariaLabora: d.secretaria ?? form.secretariaLabora,
        formaVinculacion: d.formaVinculacion ?? form.formaVinculacion,
        estadoCivil: d.estadoCivil ?? form.estadoCivil,
        gradoEscalafon: d.gradoEscalafon ?? form.gradoEscalafon,
        nivelEscalafon: d.nivelEscalafon ?? form.nivelEscalafon,
        institucionLabora: d.institucionEducativa ?? form.institucionLabora,

        // ✅ NUEVOS
        cargoDocenteId: cargoDocenteIdRes != null ? String(cargoDocenteIdRes) : form.cargoDocenteId,
        escolaridad: escolaridadRes ?? form.escolaridad,
      };

      // Sincronizar combos
      if (paises.length) {
        const p = paises.find((x) => x.nombre === updated.pais);
        if (p) setSelectedPaisCodigo(p.codigo);
      }

      if (departamentos.length && updated.departamento) {
        const dep = departamentos.find((x) => x.nombre === updated.departamento);
        if (dep) setSelectedDepartamento(dep.codigo);
      }

      if (municipios.length && updated.municipio) {
        const mun = municipios.find((x) => x.nombre === updated.municipio);
        if (mun) setSelectedMunicipio(mun.codigo);
      }

      if (secretarias.length && updated.secretariaLabora) {
        const sec = secretarias.find((s) => s.nombre === updated.secretariaLabora);
        if (sec) {
          const secId = String(sec.id);
          setSelectedSecretariaId(secId);
        }
      }

      setForm(updated);

      if (updated.cargoDocenteId) {
        ensureCargoInOptions(updated.cargoDocenteId, String(cargoDocenteNombreRes ?? ''));
      }

      setDocenteLoaded(true);
      showToast('success', 'Docente cargado correctamente');
    } catch (err) {
      console.error('Error buscando docente:', err);
      showToast('error', 'Error buscando docente');
    } finally {
      setSearching(false);
    }
  };

  // Al abrir el modal y tener documento + combos cargados, buscamos automáticamente
  useEffect(() => {
    if (open && numeroDocumento && !docenteLoaded && !searching) {
      handleBuscarDocente(numeroDocumento);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, numeroDocumento, docenteLoaded, searching]);

  // Sincronizar combos (país, depto, municipio, secretaría) cuando ya tengo ubicaciones y docente
  useEffect(() => {
    if (!open || !ubicacionLoaded || !docenteLoaded) return;

    // País
    if (!selectedPaisCodigo && form.pais && paises.length) {
      const p = paises.find((x) => x.nombre === form.pais);
      if (p) setSelectedPaisCodigo(p.codigo);
    }

    // Departamento
    if (!selectedDepartamento && form.departamento && departamentos.length) {
      const dep = departamentos.find((x) => x.nombre === form.departamento);
      if (dep) setSelectedDepartamento(dep.codigo);
    }

    // Municipio
    if (!selectedMunicipio && form.municipio && municipios.length) {
      const muni = municipios.find((x) => x.nombre === form.municipio);
      if (muni) setSelectedMunicipio(muni.codigo);
    }

    // Secretaría
    if (!selectedSecretariaId && form.secretariaLabora && secretarias.length) {
      const sec = secretarias.find((s) => s.nombre === form.secretariaLabora);
      if (sec) {
        const secId = String(sec.id);
        setSelectedSecretariaId(secId);
      }
    }
  }, [
    open,
    ubicacionLoaded,
    docenteLoaded,
    form.pais,
    form.departamento,
    form.municipio,
    form.secretariaLabora,
    paises,
    departamentos,
    municipios,
    secretarias,
    selectedPaisCodigo,
    selectedDepartamento,
    selectedMunicipio,
    selectedSecretariaId,
  ]);

  // Prefetch de la institución actual cuando ya sabemos secretaría
  useEffect(() => {
    if (!open) return;
    if (!selectedSecretariaId) return;
    if (!form.institucionLabora) return;
    if (instituciones.length) return;

    searchInstituciones(form.institucionLabora);
  }, [open, selectedSecretariaId, form.institucionLabora, instituciones.length]);

  const handleActualizarDatos = async () => {
    if (saving) return;

    const camposObligatorios: { key: keyof DocenteForm; label: string }[] = [
      { key: 'tipoDocumento', label: 'Tipo de documento' },
      { key: 'numeroDocumento', label: 'Número de documento' },
      { key: 'primerNombre', label: 'Primer nombre' },
      { key: 'primerApellido', label: 'Primer apellido' },
      { key: 'fechaNacimiento', label: 'Fecha de nacimiento' },
    ];

    const faltantes = camposObligatorios.filter(({ key }) => {
      const valor = (form[key] ?? '').toString().trim();
      return !valor;
    });

    if (faltantes.length > 0) {
      const nombres = faltantes.map((f) => f.label).join(', ');
      console.warn('Campos obligatorios faltantes (actualizar):', nombres, { formActual: form });
      showToast('error', `Faltan datos del formulario: ${nombres}`);
      return;
    }

    setSaving(true);

    try {

      const cargoIdNum =
        form.cargoDocenteId && /^\d+$/.test(form.cargoDocenteId) ? Number(form.cargoDocenteId) : null;

      const payloadForm: any = {
        ...form,
        cargoDocenteId: cargoIdNum,
      };

      const resDocente = await fetch('/api/docentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ form }),
      });

      const dataDocente = await resDocente.json();

      if (!resDocente.ok || !dataDocente?.ok) {
        console.error('Error actualizando docente', dataDocente);
        showToast('error', dataDocente?.error ?? 'Error actualizando docente');
        return;
      }

      showToast('success', 'Datos del docente actualizados correctamente');
      if (onUpdate) onUpdate();

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Error actualizando datos del docente:', err);
      showToast('error', 'Error actualizando datos del docente');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const municipiosFiltrados = selectedDepartamento
    ? municipios.filter((m) => m.codigoDepartamento === selectedDepartamento)
    : municipios;

  const barriosFiltrados = selectedMunicipio
    ? barrios.filter((b) => b.codigoMunicipio === selectedMunicipio)
    : barrios;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* Header modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Actualizar datos del docente</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleActualizarDatos();
          }}
          className="p-6 space-y-6"
        >
          {/* Card de datos de identificación y ubicación */}
          <section className="border rounded-lg">
            <header className="flex items-center gap-2 px-4 py-2 border-b bg-slate-50">
              <span className="px-2 py-1 text-xs bg-white rounded">🧾</span>
              <h3 className="text-sm font-semibold">Datos de identificación y ubicación</h3>
            </header>

            <div className="p-4 space-y-4">
              {/* Primera fila */}
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Tipo de documento
                  </label>
                  <select
                    name="tipoDocumento"
                    value={form.tipoDocumento}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccione…</option>
                    <option value="CC">Cédula de ciudadanía (CC)</option>
                    <option value="TI">Tarjeta de identidad (TI)</option>
                    <option value="CE">Cédula de extranjería (CE)</option>
                    <option value="PA">Pasaporte (PA)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Número de documento
                  </label>
                  <div className="flex gap-2">
                    <input
                      name="numeroDocumento"
                      value={form.numeroDocumento}
                      onChange={handleChange}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleBuscarDocente();
                        }
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleBuscarDocente()}
                      disabled={searching}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-60"
                    >
                      {searching ? 'Buscando…' : 'Buscar'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Fecha de nacimiento
                  </label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={form.fechaNacimiento}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Edad (años)
                  </label>
                  <input
                    name="edad"
                    value={form.edad}
                    readOnly
                    className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
              </div>

              {/* Nombres + apellidos */}
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Primer nombre
                  </label>
                  <input
                    name="primerNombre"
                    value={form.primerNombre}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Segundo nombre
                  </label>
                  <input
                    name="segundoNombre"
                    value={form.segundoNombre}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Primer apellido
                  </label>
                  <input
                    name="primerApellido"
                    value={form.primerApellido}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Segundo apellido
                  </label>
                  <input
                    name="segundoApellido"
                    value={form.segundoApellido}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Sexo + dirección */}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Sexo
                  </label>
                  <select
                    name="sexo"
                    value={form.sexo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccione…</option>
                    <option value="F">Femenino</option>
                    <option value="M">Masculino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Dirección
                  </label>
                  <input
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Barrio, depto, municipio */}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Departamento / Estado
                  </label>
                  <SearchableSelect
                    value={selectedDepartamento}
                    options={departamentos.map((d) => ({
                      value: d.codigo,
                      label: d.nombre,
                    }))}
                    placeholder="Seleccione departamento…"
                    onChange={(newCodigo) => {
                      setSelectedDepartamento(newCodigo);
                      setSelectedMunicipio('');

                      const dep = departamentos.find((d) => d.codigo === newCodigo);

                      setForm((prev) => ({
                        ...prev,
                        departamento: dep?.nombre ?? '',
                        municipio: '',
                        barrio: '',
                      }));

                      setInstituciones([]);
                    }}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Ciudad / Municipio
                  </label>
                  <SearchableSelect
                    value={selectedMunicipio}
                    options={municipiosFiltrados.map((m) => ({
                      value: m.codigo,
                      label: m.nombre,
                    }))}
                    placeholder="Seleccione municipio…"
                    onChange={(newCodigo) => {
                      setSelectedMunicipio(newCodigo);

                      const muni = municipiosFiltrados.find((m) => m.codigo === newCodigo);

                      setForm((prev) => ({
                        ...prev,
                        municipio: muni?.nombre ?? '',
                        barrio: '',
                      }));

                      setInstituciones([]);
                    }}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Barrio / Vereda
                  </label>
                  <SearchableSelect
                    value={form.barrio}
                    options={barriosFiltrados.map((b) => ({
                      value: b.nombre,
                      label: b.nombre,
                    }))}
                    placeholder="Seleccione barrio…"
                    onChange={(newBarrio) =>
                      setForm((prev) => ({
                        ...prev,
                        barrio: newBarrio,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Zona, teléfono, país */}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Zona
                  </label>
                  <select
                    name="zona"
                    value={form.zona}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccione…</option>
                    <option value="URBANA">Urbana</option>
                    <option value="RURAL">Rural</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Teléfono de contacto
                  </label>
                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    País
                  </label>
                  <SearchableSelect
                    value={selectedPaisCodigo}
                    options={paises.map((p) => ({
                      value: p.codigo,
                      label: p.nombre,
                    }))}
                    placeholder="Seleccione país…"
                    onChange={(newCodigo) => {
                      setSelectedPaisCodigo(newCodigo);

                      const pais = paises.find((p) => p.codigo === newCodigo);

                      setForm((prev) => ({
                        ...prev,
                        pais: pais?.nombre ?? '',
                      }));
                    }}
                  />
                </div>
              </div>

              {/* EPS + categoría */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Aseguradora (EPS)
                  </label>
                  <SearchableSelect
                    value={form.codigoEps}
                    options={epsList.map((eps) => ({
                      value: eps.codigo,
                      label: eps.nombre,
                    }))}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        codigoEps: value,
                      }))
                    }
                    placeholder="Seleccione EPS…"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Categoría
                  </label>
                  <select
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccione…</option>
                    <option value="CONTRIBUTIVO">Contributivo</option>
                    <option value="ESPECIAL">Especial</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Card de datos laborales */}
          <section className="border rounded-lg">
            <header className="flex items-center gap-2 px-4 py-2 border-b bg-slate-50">
              <span className="px-2 py-1 text-xs bg-white rounded">🧑‍🏫</span>
              <h3 className="text-sm font-semibold">Datos laborales del docente</h3>
            </header>

            <div className="p-4 space-y-4">
              {/* Secretaría + Institución */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Secretaría donde labora
                  </label>
                  <SearchableSelect
                    value={selectedSecretariaId}
                    options={secretarias.map((s) => ({
                      value: String(s.id),
                      label: s.nombre,
                    }))}
                    placeholder="Seleccione secretaría…"
                    onChange={(newId) => {
                      setSelectedSecretariaId(newId);

                      const secretaria = secretarias.find((s) => String(s.id) === newId);

                      setForm((prev) => ({
                        ...prev,
                        secretariaLabora: secretaria?.nombre ?? '',
                        institucionLabora: '',
                      }));

                      setInstituciones([]);
                    }}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Institución donde labora
                  </label>
                  <SearchableSelect
                    value={form.institucionLabora}
                    options={instituciones.map((i) => ({
                      value: i.nombre,
                      label: i.nombre,
                    }))}
                    placeholder={
                      !selectedSecretariaId
                        ? 'Seleccione primero una secretaría'
                        : 'Escriba al menos 3 letras para buscar…'
                    }
                    disabled={!selectedSecretariaId}
                    onSearch={(term) => {
                      if (!selectedSecretariaId) return;
                      searchInstituciones(term);
                    }}
                    minSearchLength={3}
                    isLoading={loadingInstituciones}
                    onChange={(newValue) => {
                      const inst = instituciones.find((i) => i.nombre === newValue);
                      setForm((prev) => ({
                        ...prev,
                        institucionLabora: inst?.nombre ?? '',
                      }));
                    }}
                  />
                </div>
              </div>

              {/* ✅ NUEVO: Cargo docente + Escolaridad */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Cargo docente</label>
                  <SearchableSelect
                    value={form.cargoDocenteId}
                    options={cargosDocentes.map((c) => ({
                      value: String(c.id),
                      label: c.codigo ? `${c.nombre} (${c.codigo})` : c.nombre,
                    }))}
                    placeholder={loadingCargos ? 'Buscando cargos…' : 'Escriba al menos 3 letras para buscar…'}
                    onSearch={searchCargosDocentes}
                    minSearchLength={3}
                    isLoading={loadingCargos}
                    onChange={(newId) =>
                      setForm((prev) => ({
                        ...prev,
                        cargoDocenteId: newId,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Escolaridad
                  </label>
                  <select
                    name="escolaridad"
                    value={form.escolaridad}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccione…</option>
                    <option value="PRIMARIA">PRIMARIA</option>
                    <option value="SECUNDARIA">SECUNDARIA</option>
                    <option value="TÉCNICO">TÉCNICO</option>
                    <option value="TECNÓLOGO">TECNÓLOGO</option>
                    <option value="PROFESIONAL">PROFESIONAL</option>
                    <option value="ESPECIALIZACIÓN">ESPECIALIZACIÓN</option>
                    <option value="MAESTRÍA">MAESTRÍA</option>
                    <option value="DOCTORADO">DOCTORADO</option>
                    <option value="OTRO">OTRO</option>
                  </select>
                </div>
              </div>

              {/* Forma vinculación + estado civil */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Forma de vinculación
                  </label>
                  <select
                    name="formaVinculacion"
                    value={form.formaVinculacion}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccione…</option>
                    <option value="PROPIEDAD">Propiedad</option>
                    <option value="PROVISIONALIDAD">Provisionalidad</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Estado civil
                  </label>
                  <select
                    name="estadoCivil"
                    value={form.estadoCivil}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccione…</option>
                    <option value="SOLTERO(A)">Soltero(a)</option>
                    <option value="CASADO(A)">Casado(a)</option>
                    <option value="UNIÓN LIBRE">Unión libre</option>
                    <option value="SEPARADO(A)">Separado(a)</option>
                    <option value="VIUDO(A)">Viudo(a)</option>
                  </select>
                </div>
              </div>

              {/* Escalafón */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Grado de escalafón
                  </label>
                  <input
                    name="gradoEscalafon"
                    value={form.gradoEscalafon}
                    onChange={handleChange}
                    placeholder="Ej: 14, 2A, etc."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Nivel de escalafón
                  </label>
                  <select
                    name="nivelEscalafon"
                    value={form.nivelEscalafon}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccione…</option>
                    <option value="NO_APLICA">No aplica</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Botones inferiores */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 ml-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Guardando…' : 'Actualizar datos'}
            </button>
          </div>
        </form>

        <Toast
          open={!!toast}
          type={toast?.type ?? 'info'}
          message={toast?.message ?? ''}
          onClose={() => setToast(null)}
        />
      </div>
    </div>
  );
}