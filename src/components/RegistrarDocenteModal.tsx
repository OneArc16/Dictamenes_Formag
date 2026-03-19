'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { useMedicoAccess } from '@/components/medico/MedicoAccessProvider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const STORAGE_KEY = 'dictamy_registro_docente';

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
  municipio: string; // guardas NOMBRE en el form
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

  // ✅ NUEVO
  cargoDocenteId: number | null;
  cargoDocenteNombre: string;
  escolaridad: string;

  // ✅ NUEVO (agregado)
  tipoDictamen: 'CALIFICACION' | 'RECALIFICACION' | '';
  fechaVinculacion: string;
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

  cargoDocenteId: null,
  cargoDocenteNombre: '',
  escolaridad: '',

  tipoDictamen: 'CALIFICACION',
  fechaVinculacion: '',
};

type DocenteModalMode = 'DICTAMEN' | 'RECOMENDACION';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  mode?: DocenteModalMode;
  medicoResponsableId?: number | null;
  onDictamenCreated?: () => void;
  onDocenteSaved?: (usuarioId: number) => void;
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
      <div className={`flex items-center gap-3 rounded-xl ${bgClass} px-4 py-3 text-sm text-white shadow-2xl`}>
        <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-white/10">
          {type === 'success' ? '✓' : type === 'error' ? '!' : 'i'}
        </span>
        <span>{message}</span>
        <button type="button" onClick={onClose} className="ml-3 text-xs text-white/80 hover:text-white">
          Cerrar
        </button>
      </div>
    </div>
  );
}

// Tipos para combos
type PaisOption = { codigo: string; nombre: string };
type DepartamentoOption = { codigo: string; nombre: string };
type MunicipioOption = {
  codigo: string; // DANE
  nombre: string;
  codigoDepartamento: string;
};
type BarrioOption = {
  id: number;
  nombre: string;
  codigoMunicipio: string; // DANE
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

// ✅ Cargo docente (buscador)
type CargoDocenteOption = { id: number; codigo: string; nombre: string };

function DocenteModal({
  open,
  onClose,
  mode = 'DICTAMEN',
  medicoResponsableId = null,
  onDictamenCreated,
  onDocenteSaved,
}: ModalProps) {
  const [form, setForm] = useState<DocenteForm>(emptyForm);

  const [paises, setPaises] = useState<PaisOption[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoOption[]>([]);
  const [municipios, setMunicipios] = useState<MunicipioOption[]>([]);
  const [barrios, setBarrios] = useState<BarrioOption[]>([]);
  const [epsList, setEpsList] = useState<EpsOption[]>([]);

  const [selectedPaisCodigo, setSelectedPaisCodigo] = useState('');
  const [selectedDepartamento, setSelectedDepartamento] = useState('');
  const [selectedMunicipio, setSelectedMunicipio] = useState(''); // <- CÓDIGO DANE

  const [ubicacionLoaded, setUbicacionLoaded] = useState(false);

  const [secretarias, setSecretarias] = useState<SecretariaOption[]>([]);
  const [instituciones, setInstituciones] = useState<InstitucionOption[]>([]);
  const [selectedSecretariaId, setSelectedSecretariaId] = useState<string>('');
  const [loadingInstituciones, setLoadingInstituciones] = useState(false);

  // ✅ cargos docentes
  const [cargosDocentes, setCargosDocentes] = useState<CargoDocenteOption[]>([]);
  const [loadingCargos, setLoadingCargos] = useState(false);

  // 🔔 Toast
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const isRecommendationMode = mode === 'RECOMENDACION';
  const modalTitle = 'Registrar docente';
  const modalDescription = isRecommendationMode
    ? 'Crea o actualiza la informacion base del docente antes de diligenciar su recomendacion laboral.'
    : 'Crea o actualiza la informacion base del docente antes de abrir su dictamen clinico.';
  const submitLabel = saving
    ? 'Guardando...'
    : isRecommendationMode
    ? 'Registrar docente'
    : 'Registrar dictamen';

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
  };

  // =========================
  // Helpers: municipio (código/nombre)
  // =========================
  function normTxt(s: string) {
    return (s ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function resolveMunicipioCodigoFromList(list: MunicipioOption[], nombreOrCodigo?: string) {
    if (!nombreOrCodigo) return undefined;
    if (/^\d{5}$/.test(nombreOrCodigo)) return nombreOrCodigo;

    const n = normTxt(nombreOrCodigo);
    const found = list.find((m) => normTxt(m.nombre) === n);
    return found?.codigo;
  }

  function resolveMunicipioNombreFromList(list: MunicipioOption[], nombreOrCodigo?: string) {
    if (!nombreOrCodigo) return undefined;
    if (/^\d{5}$/.test(nombreOrCodigo)) {
      const found = list.find((m) => m.codigo === nombreOrCodigo);
      return found?.nombre;
    }

    const n = normTxt(nombreOrCodigo);
    const found = list.find((m) => normTxt(m.nombre) === n);
    return found?.nombre ?? nombreOrCodigo;
  }

  function currentMunicipioCodigo() {
    return (
      resolveMunicipioCodigoFromList(municipios, selectedMunicipio) ??
      resolveMunicipioCodigoFromList(municipios, form.municipio)
    );
  }

  function currentMunicipioNombre() {
    return (
      resolveMunicipioNombreFromList(municipios, selectedMunicipio) ??
      resolveMunicipioNombreFromList(municipios, form.municipio)
    );
  }

  // =========================
  // Abort controllers
  // =========================
  const instAbortRef = useRef<AbortController | null>(null);
  const instFetchAbortRef = useRef<AbortController | null>(null);
  const cargoAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      instAbortRef.current?.abort();
      instFetchAbortRef.current?.abort();
      cargoAbortRef.current?.abort();
    };
  }, []);

  // Limpia instituciones si cambian filtros
  useEffect(() => {
    setInstituciones([]);
  }, [selectedSecretariaId, selectedMunicipio]);

  // ✅ helper: asegurar cargo actual dentro de options (para que quede seleccionado)
  const ensureCargoInOptions = (cargoId: number | null, cargoNombre: string) => {
    if (!cargoId || !cargoNombre) return;
    setCargosDocentes((prev) => {
      if (prev.some((x) => x.id === cargoId)) return prev;
      return [{ id: cargoId, codigo: '', nombre: cargoNombre }, ...prev];
    });
  };

  // ✅ Búsqueda async de cargos docentes (soporta items|cargos|rows)
  const handleSearchCargoDocente = async (term: string) => {
    const q = term?.trim() ?? '';
    if (q.length < 3) {
      setCargosDocentes([]);
      return;
    }

    cargoAbortRef.current?.abort();
    const controller = new AbortController();
    cargoAbortRef.current = controller;

    try {
      setLoadingCargos(true);

      const res = await fetch(`/api/cargos-docentes/search?q=${encodeURIComponent(q)}`, {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setCargosDocentes([]);
        return;
      }

      const raw =
        (Array.isArray(data.items) && data.items) ||
        (Array.isArray(data.cargos) && data.cargos) ||
        (Array.isArray(data.rows) && data.rows) ||
        [];

      const mapped: CargoDocenteOption[] = raw
        .map((c: any) => ({
          id: Number(c.id),
          codigo: String(c.codigo ?? c.Codigo ?? ''),
          nombre: String(c.nombre ?? c.Nombre ?? ''),
        }))
        .filter((c: CargoDocenteOption) => Number.isFinite(c.id) && !!c.nombre);

      setCargosDocentes(mapped);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Error buscando cargos docentes:', err);
      setCargosDocentes([]);
    } finally {
      if (!controller.signal.aborted) setLoadingCargos(false);
    }
  };

  // 🔎 Búsqueda instituciones (igual que tenías)
  const handleSearchInstitucion = async (term: string) => {
    if (!selectedSecretariaId) {
      setInstituciones([]);
      return;
    }

    const q = term?.trim() ?? '';
    if (q.length < 3) {
      setInstituciones([]);
      return;
    }

    instAbortRef.current?.abort();
    const controller = new AbortController();
    instAbortRef.current = controller;

    const run = async (municipioValue?: string) => {
      const params = new URLSearchParams();
      params.set('q', q);
      params.set('secretariaId', selectedSecretariaId);
      if (municipioValue) params.set('municipio', municipioValue);

      const res = await fetch(`/api/instituciones/search?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        return { ok: false as const, instituciones: [] as any[] };
      }
      return { ok: true as const, instituciones: (data.instituciones ?? []) as any[] };
    };

    try {
      setLoadingInstituciones(true);

      const muniCodigo = currentMunicipioCodigo();
      const muniNombre = currentMunicipioNombre();

      let out = await run(muniCodigo);
      if (controller.signal.aborted) return;

      if (muniCodigo && out.instituciones.length === 0 && muniNombre) {
        out = await run(muniNombre);
        if (controller.signal.aborted) return;
      }

      if (out.instituciones.length === 0) {
        out = await run(undefined);
        if (controller.signal.aborted) return;
      }

      const mapped: InstitucionOption[] = out.instituciones.map((i: any) => ({
        id: i.id,
        nombre: i.nombre,
        idDepartamento: i.idDepartamento ?? null,
        idMunicipio: i.idMunicipio ?? null,
        idSecretaria: i.idSecretaria ?? null,
      }));

      setInstituciones(mapped);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Error buscando instituciones:', err);
      setInstituciones([]);
    } finally {
      if (!controller.signal.aborted) setLoadingInstituciones(false);
    }
  };

  const fetchInstituciones = async (secretariaId?: string, municipioMaybe?: string) => {
    if (!secretariaId) {
      setInstituciones([]);
      return;
    }

    instFetchAbortRef.current?.abort();
    const controller = new AbortController();
    instFetchAbortRef.current = controller;

    const run = async (municipioValue?: string) => {
      const params = new URLSearchParams();
      params.set('secretariaId', secretariaId);
      if (municipioValue) params.set('municipio', municipioValue);

      const url = `/api/instituciones/by-secretaria?${params.toString()}`;
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        return { ok: false as const, instituciones: [] as any[] };
      }
      return { ok: true as const, instituciones: (data.instituciones ?? []) as any[] };
    };

    try {
      setLoadingInstituciones(true);

      const muniCodigo =
        resolveMunicipioCodigoFromList(municipios, municipioMaybe) ?? currentMunicipioCodigo();
      const muniNombre =
        resolveMunicipioNombreFromList(municipios, municipioMaybe) ?? currentMunicipioNombre();

      let out = await run(muniCodigo);
      if (controller.signal.aborted) return;

      if (muniCodigo && out.instituciones.length === 0 && muniNombre) {
        out = await run(muniNombre);
        if (controller.signal.aborted) return;
      }

      if (out.instituciones.length === 0) {
        out = await run(undefined);
        if (controller.signal.aborted) return;
      }

      const mapped: InstitucionOption[] = out.instituciones.map((i: any) => ({
        id: i.id,
        nombre: i.nombre,
        idDepartamento: i.idDepartamento ?? null,
        idMunicipio: i.idMunicipio ?? null,
        idSecretaria: i.idSecretaria ?? null,
      }));

      setInstituciones(mapped);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Error cargando instituciones', err);
      setInstituciones([]);
    } finally {
      if (!controller.signal.aborted) setLoadingInstituciones(false);
    }
  };

  // Auto-cerrar toast
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  // Cargar datos guardados al montar
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);

        const cargoId =
          data?.cargoDocenteId == null || data?.cargoDocenteId === ''
            ? null
            : Number(data.cargoDocenteId);

        const safeCargoId = Number.isFinite(cargoId as any) ? (cargoId as number) : null;

        setForm({
          ...emptyForm,
          ...data,
          cargoDocenteId: safeCargoId,
          cargoDocenteNombre: data?.cargoDocenteNombre ?? '',
          escolaridad: data?.escolaridad ?? '',
          tipoDictamen: (data?.tipoDictamen ?? 'CALIFICACION') as any,
          fechaVinculacion: data?.fechaVinculacion ?? '',
        });

        // asegura que el select pueda mostrarlo
        if (safeCargoId && (data?.cargoDocenteNombre ?? '')) {
          ensureCargoInOptions(safeCargoId, String(data.cargoDocenteNombre ?? ''));
        }
      }
    } catch (err) {
      console.error('Error cargando localStorage', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

    const ageStr = age >= 0 ? String(age) : '';
    setForm((prev) => (prev.edad !== ageStr ? { ...prev, edad: ageStr } : prev));
  }, [form.fechaNacimiento]);

  // React Query: traer opciones de ubicación
  const { data: ubicacionData, isLoading: ubicacionLoading } = useQuery({
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

  // Mapear ubicacionData -> estados locales + sincronizar con el form
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

      // País
      if (form.pais) {
        const p = paisesMapped.find((x) => x.nombre === form.pais);
        if (p) setSelectedPaisCodigo(p.codigo);
      } else if (paisesMapped.length > 0) {
        const defaultPais = paisesMapped.find((x) => x.codigo === 'COL') ?? paisesMapped[0];
        if (defaultPais) {
          setSelectedPaisCodigo(defaultPais.codigo);
          setForm((prev) => ({ ...prev, pais: defaultPais.nombre }));
        }
      }

      // Departamento
      if (form.departamento) {
        const dep = departamentosMapped.find((x) => x.nombre === form.departamento);
        if (dep) setSelectedDepartamento(dep.codigo);
      }

      // Municipio: si viene guardado como NOMBRE, conviértelo a CÓDIGO
      if (form.municipio) {
        const muniCodigo = resolveMunicipioCodigoFromList(municipiosMapped, form.municipio);
        if (muniCodigo) setSelectedMunicipio(muniCodigo);
      }

      // Secretaría ya guardada
      if (form.secretariaLabora) {
        const sec = secretariasMapped.find((s) => s.nombre === form.secretariaLabora);
        if (sec) {
          const secId = String(sec.id);
          setSelectedSecretariaId(secId);

          const muniCodigo = resolveMunicipioCodigoFromList(municipiosMapped, form.municipio);
          fetchInstituciones(secId, muniCodigo);
        }
      }
    } catch (err) {
      console.error('Error mapeando ubicacionData:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ubicacionData, ubicacionLoaded]);

  // Guardar en localStorage cada vez que cambie algo
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch (err) {
      console.error('Error guardando en localStorage', err);
    }
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value } as DocenteForm));
  };

  const handleLimpiar = () => {
    setForm(emptyForm);
    setSelectedDepartamento('');
    setSelectedMunicipio('');
    setSelectedSecretariaId('');
    setInstituciones([]);
    setCargosDocentes([]);

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔍 Buscar docente por número de documento
  const handleBuscarDocente = async () => {
    if (!form.numeroDocumento) {
      showToast('error', 'Ingresa un número de documento');
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/docentes/search?q=${encodeURIComponent(form.numeroDocumento)}`, {
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

      // ✅ cargo docente y escolaridad (tolerante)
      const cargoDocenteIdRes =
        (d as any).cargoDocenteId ??
        (d as any).cargo_docente_id ??
        (d as any).cargoDocente?.id ??
        null;

      const cargoDocenteNombreRes =
        (d as any).cargoDocenteNombre ??
        (d as any).cargo_docente_nombre ??
        (d as any).cargoDocente?.nombre ??
        '';

      const escolaridadRes = (d as any).escolaridad ?? '';

      const cargoIdNum =
        cargoDocenteIdRes != null && cargoDocenteIdRes !== '' ? Number(cargoDocenteIdRes) : null;

      const fechaVinculacionRes =
        (d as any).fechaVinculacion ??
        (d as any).fecha_vinculacion ??
        (d as any).fechaVinculacionDocente ??
        null;

      const updated: DocenteForm = {
        ...form,
        tipoDocumento: d.tipoIdentificacion ?? d.tipoDocumento ?? form.tipoDocumento,
        numeroDocumento: d.identificacion ?? d.numeroDocumento ?? form.numeroDocumento,
        fechaNacimiento: (d.fechaNacimiento && String(d.fechaNacimiento).slice(0, 10)) ?? form.fechaNacimiento,
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

        cargoDocenteId: Number.isFinite(cargoIdNum as any) ? cargoIdNum : null,
        cargoDocenteNombre: String(cargoDocenteNombreRes ?? ''),
        escolaridad: String(escolaridadRes ?? ''),

        tipoDictamen: form.tipoDictamen,
        fechaVinculacion:
          (fechaVinculacionRes && String(fechaVinculacionRes).slice(0, 10)) ?? form.fechaVinculacion,
      };

      setForm(updated);

      // ✅ asegura que el cargo quede seleccionado aunque no hayas buscado cargos aún
      ensureCargoInOptions(updated.cargoDocenteId, updated.cargoDocenteNombre);

      // Sincronizar combos
      if (paises.length && updated.pais) {
        const p = paises.find((x) => x.nombre === updated.pais);
        if (p) setSelectedPaisCodigo(p.codigo);
      }

      if (departamentos.length && updated.departamento) {
        const dep = departamentos.find((x) => x.nombre === updated.departamento);
        if (dep) setSelectedDepartamento(dep.codigo);
      }

      if (municipios.length && updated.municipio) {
        const muniCodigo = resolveMunicipioCodigoFromList(municipios, updated.municipio);
        if (muniCodigo) setSelectedMunicipio(muniCodigo);
      }

      if (secretarias.length && updated.secretariaLabora) {
        const sec = secretarias.find((s) => s.nombre === updated.secretariaLabora);
        if (sec) {
          const secId = String(sec.id);
          setSelectedSecretariaId(secId);

          const muniCodigo =
            resolveMunicipioCodigoFromList(municipios, selectedMunicipio) ??
            resolveMunicipioCodigoFromList(municipios, updated.municipio);

          fetchInstituciones(secId, muniCodigo);
        }
      }

      showToast('success', 'Docente cargado correctamente');
    } catch (err) {
      console.error('Error buscando docente:', err);
      showToast('error', 'Error buscando docente');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const camposObligatorios: { key: keyof DocenteForm; label: string }[] = [
      { key: 'tipoDocumento', label: 'Tipo de documento' },
      { key: 'numeroDocumento', label: 'Numero de documento' },
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
      showToast('error', `Faltan datos del formulario: ${nombres}`);
      return;
    }

    setSaving(true);

    try {
      const resDocente = await fetch('/api/docentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ form }),
      });

      const dataDocente = await resDocente.json();

      if (!resDocente.ok || !dataDocente?.ok) {
        showToast('error', dataDocente?.error ?? 'Error guardando docente');
        return;
      }

      const usuarioId = dataDocente.usuario?.id;
      if (!usuarioId) {
        showToast('error', 'No se pudo obtener el ID del docente');
        return;
      }

      if (isRecommendationMode) {
        const resRecomendacion = await fetch('/api/recomendaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            usuarioId,
            empleadoId: medicoResponsableId,
          }),
        });

        const dataRecomendacion = await resRecomendacion.json();

        if (!resRecomendacion.ok || !dataRecomendacion?.ok) {
          showToast('error', dataRecomendacion?.error ?? 'Error creando recomendacion laboral');
          return;
        }

        showToast('success', 'Docente registrado y recomendacion lista en el listado');
        onDocenteSaved?.(usuarioId);
        handleLimpiar();
        setTimeout(() => onClose(), 1200);
        return;
      }

      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const fechaDictamen = `${yyyy}-${mm}-${dd}`;

      const resDictamen = await fetch('/api/dictamenes/medico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          usuarioId,
          fechaDictamen,
          procedimientoPcl: 'A',
          tipoDictamen: form.tipoDictamen || 'CALIFICACION',
        }),
      });

      const dataDictamen = await resDictamen.json();

      if (!resDictamen.ok || !dataDictamen?.ok) {
        showToast('error', dataDictamen?.error ?? 'Error creando dictamen');
        return;
      }

      showToast('success', 'Docente y dictamen registrados correctamente');
      onDictamenCreated?.();
      handleLimpiar();

      setTimeout(() => onClose(), 1200);
    } catch (err) {
      console.error('Error guardando docente / dictamen:', err);
      showToast(
        'error',
        isRecommendationMode
          ? 'Error guardando docente para recomendacion'
          : 'Error guardando docente / dictamen',
      );
    } finally {
      setSaving(false);
    }
  };

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
      showToast('error', `Faltan datos del formulario: ${nombres}`);
      return;
    }

    setSaving(true);

    try {
      const resDocente = await fetch('/api/docentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ form }),
      });

      const dataDocente = await resDocente.json();

      if (!resDocente.ok || !dataDocente?.ok) {
        showToast('error', dataDocente?.error ?? 'Error actualizando docente');
        return;
      }

      showToast('success', 'Datos del docente actualizados correctamente');
    } catch (err) {
      console.error('Error actualizando datos del docente:', err);
      showToast('error', 'Error actualizando datos del docente');
    } finally {
      setSaving(false);
    }
  };

  const municipiosFiltrados = selectedDepartamento
    ? municipios.filter((m) => m.codigoDepartamento === selectedDepartamento)
    : municipios;

  const barriosFiltrados = selectedMunicipio
    ? barrios.filter((b) => b.codigoMunicipio === selectedMunicipio)
    : barrios;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="grid h-[min(92vh,960px)] w-[min(1080px,calc(100vw-2rem))] max-w-none grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden border border-slate-200 bg-white p-0 text-slate-950 shadow-[0_30px_90px_rgba(15,23,42,0.32)] sm:rounded-2xl">
        <DialogHeader className="px-6 py-5 space-y-2 bg-white border-b border-slate-200 pr-14">
          <DialogTitle className="text-xl text-slate-950">{modalTitle}</DialogTitle>
          <DialogDescription className="max-w-3xl text-sm leading-6 text-slate-600">
            {modalDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto bg-white">
          <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white">
          {/* Card identificación y ubicación */}
          <section className="bg-white border shadow-sm rounded-2xl border-slate-200">
            <header className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50/80">
              <span className="px-2 py-1 text-xs bg-white border rounded">🧾</span>
              <h3 className="text-sm font-semibold">Datos de identificación y ubicación</h3>
            </header>

            <div className="p-4 space-y-4 bg-white">
              {/* Primera fila */}
              <div className="grid gap-4 md:grid-cols-12">
                <div className="md:col-span-3">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Tipo de documento</label>
                  <select
                    name="tipoDocumento"
                    value={form.tipoDocumento}
                    onChange={handleChange}
                    className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccione</option>
                    <option value="CC">Cedula de ciudadania (CC)</option>
                    <option value="TI">Tarjeta de identidad (TI)</option>
                    <option value="CE">Cedula de extranjeria (CE)</option>
                    <option value="PA">Pasaporte (PA)</option>
                  </select>
                </div>

                <div className="md:col-span-4">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Número de documento</label>
                  <div className="flex items-stretch rounded-md shadow-sm">
                    <input
                      name="numeroDocumento"
                      value={form.numeroDocumento}
                      onChange={handleChange}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleBuscarDocente();
                        }
                      }}
                      className="flex-1 h-10 min-w-0 px-3 text-sm border border-r-0 border-gray-300 rounded-r-none shadow-sm rounded-l-md focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBuscarDocente}
                      disabled={searching}
                      className="h-10 px-4 text-xs font-semibold border-gray-300 rounded-l-none text-slate-700 hover:bg-slate-50"
                    >
                      {searching ? "Buscando..." : "Buscar"}
                    </Button>
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Fecha de nacimiento</label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={form.fechaNacimiento}
                    onChange={handleChange}
                    className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Edad (años)</label>
                  <input
                    name="edad"
                    value={form.edad}
                    readOnly
                    className="w-full h-10 px-3 text-sm text-gray-700 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
              </div>

              {/* Nombres + apellidos */}
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Primer nombre</label>
                  <input
                    name="primerNombre"
                    value={form.primerNombre}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Segundo nombre</label>
                  <input
                    name="segundoNombre"
                    value={form.segundoNombre}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Primer apellido</label>
                  <input
                    name="primerApellido"
                    value={form.primerApellido}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Segundo apellido</label>
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
                  <label className="block mb-1 text-xs font-medium text-gray-700">Sexo</label>
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
                  <label className="block mb-1 text-xs font-medium text-gray-700">Dirección</label>
                  <input
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Barrio, departamento, municipio */}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Departamento / Estado</label>
                  <SearchableSelect
                    value={selectedDepartamento}
                    options={departamentos.map((d) => ({ value: d.codigo, label: d.nombre }))}
                    placeholder={ubicacionLoading ? 'Cargando departamentos…' : 'Seleccione departamento…'}
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

                      if (selectedSecretariaId) fetchInstituciones(selectedSecretariaId, undefined);
                    }}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Ciudad / Municipio</label>
                  <SearchableSelect
                    value={selectedMunicipio}
                    options={municipiosFiltrados.map((m) => ({ value: m.codigo, label: m.nombre }))}
                    placeholder="Seleccione municipio…"
                    onChange={(newCodigo) => {
                      setSelectedMunicipio(newCodigo);

                      const muni = municipiosFiltrados.find((m) => m.codigo === newCodigo);

                      setForm((prev) => ({
                        ...prev,
                        municipio: muni?.nombre ?? '',
                        barrio: '',
                      }));

                      if (selectedSecretariaId) fetchInstituciones(selectedSecretariaId, newCodigo || undefined);
                    }}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Barrio / Vereda</label>
                  <SearchableSelect
                    value={form.barrio}
                    options={barriosFiltrados.map((b) => ({ value: b.nombre, label: b.nombre }))}
                    placeholder="Seleccione barrio…"
                    onChange={(newBarrio) => setForm((prev) => ({ ...prev, barrio: newBarrio }))}
                  />
                </div>
              </div>

              {/* Zona, teléfono, país */}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Zona</label>
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
                  <label className="block mb-1 text-xs font-medium text-gray-700">Teléfono de contacto</label>
                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">País</label>
                  <SearchableSelect
                    value={selectedPaisCodigo}
                    options={paises.map((p) => ({ value: p.codigo, label: p.nombre }))}
                    placeholder="Seleccione país…"
                    onChange={(newCodigo) => {
                      setSelectedPaisCodigo(newCodigo);
                      const pais = paises.find((p) => p.codigo === newCodigo);
                      setForm((prev) => ({ ...prev, pais: pais?.nombre ?? '' }));
                    }}
                  />
                </div>
              </div>

              {/* Aseguradora (EPS) + Categoría */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="block mb-1 text-xs font-medium text-gray-700">Aseguradora (EPS)</label>
                  <SearchableSelect
                    value={form.codigoEps}
                    options={epsList.map((eps) => ({ value: eps.codigo, label: eps.nombre }))}
                    onChange={(value) => setForm((prev) => ({ ...prev, codigoEps: value }))}
                    placeholder="Seleccione EPS…"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Categoría</label>
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

          {/* Card laborales */}
          <section className="bg-white border shadow-sm rounded-2xl border-slate-200">
            <header className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50/80">
              <span className="px-2 py-1 text-xs bg-white border rounded">🧑‍🏫</span>
              <h3 className="text-sm font-semibold">Datos laborales del docente</h3>
            </header>

            <div className="p-4 space-y-4 bg-white">
              {/* ✅ Cargo docente + Escolaridad */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Cargo docente</label>
                  <SearchableSelect
                    value={form.cargoDocenteId ? String(form.cargoDocenteId) : ''}
                    options={cargosDocentes.map((c) => ({
                      value: String(c.id),
                      label: c.codigo ? `${c.nombre} (${c.codigo})` : c.nombre,
                    }))}
                    placeholder={loadingCargos ? 'Buscando cargos…' : 'Escribe mínimo 3 letras…'}
                    onSearch={handleSearchCargoDocente}
                    isLoading={loadingCargos}
                    minSearchLength={3}
                    onChange={(newValue) => {
                      const id = newValue ? Number(newValue) : null;
                      const c = cargosDocentes.find((x) => x.id === id);

                      setForm((prev) => ({
                        ...prev,
                        cargoDocenteId: Number.isFinite(id as any) ? (id as number) : null,
                        cargoDocenteNombre: c?.nombre ?? prev.cargoDocenteNombre,
                      }));
                    }}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Escolaridad</label>
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


          {/* Fecha de vinculacion y tipo de dictamen */}
              {isRecommendationMode ? (
                <div className="grid gap-4 md:grid-cols-1">
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">Fecha de vinculacion</label>
                    <input
                      type="date"
                      name="fechaVinculacion"
                      value={form.fechaVinculacion}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">Fecha de vinculacion</label>
                    <input
                      type="date"
                      name="fechaVinculacion"
                      value={form.fechaVinculacion}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-gray-700">Tipo de dictamen</label>
                    <select
                      name="tipoDictamen"
                      value={form.tipoDictamen}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CALIFICACION">Calificacion</option>
                      <option value="RECALIFICACION">Recalificacion</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Secretaria + Institucion */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Secretaría donde labora</label>
                  <SearchableSelect
                    value={selectedSecretariaId}
                    options={secretarias.map((s) => ({ value: String(s.id), label: s.nombre }))}
                    placeholder="Seleccione secretaría…"
                    onChange={(newId) => {
                      setSelectedSecretariaId(newId);

                      const secretaria = secretarias.find((s) => String(s.id) === newId);

                      setForm((prev) => ({
                        ...prev,
                        secretariaLabora: secretaria?.nombre ?? '',
                        institucionLabora: '',
                      }));

                      if (newId) {
                        const muniCodigo = currentMunicipioCodigo();
                        fetchInstituciones(newId, muniCodigo);
                      } else {
                        setInstituciones([]);
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Institución donde labora</label>
                  <SearchableSelect
                    value={form.institucionLabora}
                    options={instituciones.map((i) => ({ value: i.nombre, label: i.nombre }))}
                    placeholder={
                      !selectedSecretariaId
                        ? 'Seleccione primero una secretaría'
                        : loadingInstituciones
                        ? 'Buscando instituciones…'
                        : 'Empiece a escribir para buscar…'
                    }
                    disabled={!selectedSecretariaId}
                    onSearch={handleSearchInstitucion}
                    isLoading={loadingInstituciones}
                    minSearchLength={3}
                    onChange={(newValue) => {
                      const inst = instituciones.find((i) => i.nombre === newValue);
                      setForm((prev) => ({
                        ...prev,
                        institucionLabora: inst?.nombre ?? newValue,
                      }));
                    }}
                  />
                </div>
              </div>

              {/* Forma de vinculación + Estado civil */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Forma de vinculación</label>
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
                  <label className="block mb-1 text-xs font-medium text-gray-700">Estado civil</label>
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
                  <label className="block mb-1 text-xs font-medium text-gray-700">Grado de escalafón</label>
                  <input
                    name="gradoEscalafon"
                    value={form.gradoEscalafon}
                    onChange={handleChange}
                    placeholder="Ej: 14, 2A, etc."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">Nivel de escalafón</label>
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
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleLimpiar}
              className="rounded-lg"
            >
              Limpiar
            </Button>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-lg"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleActualizarDatos}
                disabled={saving}
                className="rounded-lg"
              >
                {saving ? 'Guardando...' : 'Actualizar datos'}
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                {submitLabel}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <Toast
        open={!!toast}
        type={toast?.type ?? 'info'}
        message={toast?.message ?? ''}
        onClose={() => setToast(null)}
      />
    </DialogContent>
  </Dialog>
  );
}

export function RegistrarDocenteButton() {
  const [open, setOpen] = useState(false);
  const { readOnly } = useMedicoAccess();

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        disabled={readOnly}
        className="rounded-lg bg-blue-600 px-3 py-2 text-[11px] font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        Registrar
      </Button>

      <DocenteModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function RegistrarDocenteModal(props: ModalProps) {
  return <DocenteModal {...props} />;
}