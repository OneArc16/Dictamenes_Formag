'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { useMedicoAccess } from '@/components/medico/MedicoAccessProvider';

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
};

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** Se dispara cuando se crea el dictamen correctamente */
  onDictamenCreated?: () => void;
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

// Tipos para combos
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

function DocenteModal({ open, onClose, onDictamenCreated }: ModalProps) {
  const [form, setForm] = useState<DocenteForm>(emptyForm);

  const [paises, setPaises] = useState<PaisOption[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoOption[]>(
    [],
  );
  const [municipios, setMunicipios] = useState<MunicipioOption[]>([]);
  const [barrios, setBarrios] = useState<BarrioOption[]>([]);
  const [epsList, setEpsList] = useState<EpsOption[]>([]);

  const [selectedPaisCodigo, setSelectedPaisCodigo] = useState('');
  const [selectedDepartamento, setSelectedDepartamento] = useState('');
  const [selectedMunicipio, setSelectedMunicipio] = useState('');

  const [ubicacionLoaded, setUbicacionLoaded] = useState(false);

  const [secretarias, setSecretarias] = useState<SecretariaOption[]>([]);
  const [instituciones, setInstituciones] = useState<InstitucionOption[]>(
    [],
  );
  const [selectedSecretariaId, setSelectedSecretariaId] =
    useState<string>('');
  const [loadingInstituciones, setLoadingInstituciones] = useState(false);

  // 🔔 Toast
  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
  } | null>(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
  };

  // 🔎 Búsqueda async de instituciones (autocomplete)
  const handleSearchInstitucion = async (term: string) => {
    if (!selectedSecretariaId) {
      setInstituciones([]);
      return;
    }

    if (!term || term.length < 3) {
      setInstituciones([]);
      return;
    }

    try {
      setLoadingInstituciones(true);

      const params = new URLSearchParams();
      params.set('q', term);
      params.set('secretariaId', selectedSecretariaId);
      if (selectedMunicipio) {
        params.set('municipio', selectedMunicipio);
      }

      const res = await fetch(
        `/api/instituciones/search?${params.toString()}`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        console.error(data?.error || 'Error buscando instituciones');
        setInstituciones([]);
        return;
      }

      const mapped: InstitucionOption[] = (data.instituciones ?? []).map(
        (i: any) => ({
          id: i.id,
          nombre: i.nombre,
          idDepartamento: i.idDepartamento ?? null,
          idMunicipio: i.idMunicipio ?? null,
          idSecretaria: i.idSecretaria ?? null,
        }),
      );

      setInstituciones(mapped);
    } catch (err) {
      console.error('Error buscando instituciones:', err);
      setInstituciones([]);
    } finally {
      setLoadingInstituciones(false);
    }
  };

  // ⭐ Cargar instituciones (por secretaría y opcional municipio)
  const fetchInstituciones = async (
    secretariaId?: string,
    municipioCodigo?: string,
  ) => {
    if (!secretariaId) {
      setInstituciones([]);
      return;
    }

    try {
      setLoadingInstituciones(true);

      const params = new URLSearchParams();
      if (secretariaId) params.set('secretariaId', secretariaId);
      if (municipioCodigo) params.set('municipio', municipioCodigo);

      const qs = params.toString();
      const url = qs
        ? `/api/instituciones/by-secretaria?${qs}`
        : '/api/instituciones/by-secretaria';

      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        console.error(data.error || 'Error cargando instituciones');
        setInstituciones([]);
        return;
      }

      const mapped: InstitucionOption[] = (data.instituciones ?? []).map(
        (i: any) => ({
          id: i.id,
          nombre: i.nombre,
          idDepartamento: i.idDepartamento ?? null,
          idMunicipio: i.idMunicipio ?? null,
          idSecretaria: i.idSecretaria ?? null,
        }),
      );

      setInstituciones(mapped);
    } catch (err) {
      console.error('Error cargando instituciones', err);
      setInstituciones([]);
    } finally {
      setLoadingInstituciones(false);
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
        setForm({ ...emptyForm, ...data });
      }
    } catch (err) {
      console.error('Error cargando localStorage', err);
    }
  }, []);

  // ⭐ Calcular edad automáticamente cuando cambia la fecha de nacimiento
  useEffect(() => {
    if (!form.fechaNacimiento) {
      setForm((prev) =>
        prev.edad !== '' ? { ...prev, edad: '' } : prev,
      );
      return;
    }

    const birth = new Date(form.fechaNacimiento);
    if (Number.isNaN(birth.getTime())) {
      setForm((prev) =>
        prev.edad !== '' ? { ...prev, edad: '' } : prev,
      );
      return;
    }

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    const ageStr = age >= 0 ? String(age) : '';

    setForm((prev) =>
      prev.edad !== ageStr ? { ...prev, edad: ageStr } : prev,
    );
  }, [form.fechaNacimiento]);

  // 🔹 React Query: traer opciones de ubicación (paises, deptos, municipios, barrios, secretarias, eps)
  const {
    data: ubicacionData,
    isLoading: ubicacionLoading,
    error: ubicacionError,
  } = useQuery({
    queryKey: ['ubicacion-opciones'],
    queryFn: async () => {
      const res = await fetch('/api/ubicacion/opciones', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(
          data?.error ?? 'Error cargando opciones de ubicación',
        );
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

      const paisesMapped: PaisOption[] = (data.paises ?? []).map(
        (p: any) => ({ codigo: p.codigo, nombre: p.nombre }),
      );
      const departamentosMapped: DepartamentoOption[] = (
        data.departamentos ?? []
      ).map((d: any) => ({
        codigo: d.codigo,
        nombre: d.nombre,
      }));
      const municipiosMapped: MunicipioOption[] = (
        data.municipios ?? []
      ).map((m: any) => ({
        codigo: m.codigo,
        nombre: m.nombre,
        codigoDepartamento: m.codigoDepartamento,
      }));
      const barriosMapped: BarrioOption[] = (data.barrios ?? []).map(
        (b: any) => ({
          id: b.id,
          nombre: b.nombre,
          codigoMunicipio: b.codigoMunicipio,
        }),
      );

      const secretariasMapped: SecretariaOption[] = (
        data.secretarias ?? []
      ).map((s: any) => ({
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
        const defaultPais =
          paisesMapped.find((x) => x.codigo === 'COL') ??
          paisesMapped[0];
        if (defaultPais) {
          setSelectedPaisCodigo(defaultPais.codigo);
          setForm((prev) => ({
            ...prev,
            pais: defaultPais.nombre,
          }));
        }
      }

      // Departamento
      if (form.departamento) {
        const dep = departamentosMapped.find(
          (x) => x.nombre === form.departamento,
        );
        if (dep) setSelectedDepartamento(dep.codigo);
      }

      // Municipio
      if (form.municipio) {
        const muni = municipiosMapped.find(
          (x) => x.nombre === form.municipio,
        );
        if (muni) setSelectedMunicipio(muni.codigo);
      }

      // Secretaría ya guardada
      if (form.secretariaLabora) {
        const sec = secretariasMapped.find(
          (s) => s.nombre === form.secretariaLabora,
        );
        if (sec) {
          const secId = String(sec.id);
          setSelectedSecretariaId(secId);
          fetchInstituciones(secId, form.municipio || undefined);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLimpiar = () => {
    setForm(emptyForm);
    setSelectedDepartamento('');
    setSelectedMunicipio('');
    setSelectedSecretariaId('');
    setInstituciones([]);
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
      const res = await fetch(
        `/api/docentes/search?q=${encodeURIComponent(
          form.numeroDocumento,
        )}`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );

      const contentType = res.headers.get('content-type') || '';
      let data: any;

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error(
          'Respuesta no JSON de /api/docentes/search:',
          text,
        );
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

      const updated: DocenteForm = {
        ...form,
        tipoDocumento:
          d.tipoIdentificacion ??
          d.tipoDocumento ??
          form.tipoDocumento,
        numeroDocumento:
          d.identificacion ?? d.numeroDocumento ?? form.numeroDocumento,
        fechaNacimiento:
          (d.fechaNacimiento &&
            String(d.fechaNacimiento).slice(0, 10)) ??
          form.fechaNacimiento,
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
        institucionLabora:
          d.institucionEducativa ?? form.institucionLabora,
      };

      setForm(updated);

      // Sincronizar combos con los datos cargados
      if (paises.length && updated.pais) {
        const p = paises.find((x) => x.nombre === updated.pais);
        if (p) {
          setSelectedPaisCodigo(p.codigo);
        }
      }

      if (departamentos.length && updated.departamento) {
        const dep = departamentos.find(
          (x) => x.nombre === updated.departamento,
        );
        if (dep) setSelectedDepartamento(dep.codigo);
      }

      if (municipios.length && updated.municipio) {
        const muni = municipios.find(
          (x) => x.nombre === updated.municipio,
        );
        if (muni) setSelectedMunicipio(muni.codigo);
      }

      if (secretarias.length && updated.secretariaLabora) {
        const sec = secretarias.find(
          (s) => s.nombre === updated.secretariaLabora,
        );
        if (sec) {
          const secId = String(sec.id);
          setSelectedSecretariaId(secId);
          fetchInstituciones(secId, updated.municipio || undefined);
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

    const camposObligatorios: {
      key: keyof DocenteForm;
      label: string;
    }[] = [
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
      console.warn('Campos obligatorios faltantes:', nombres, {
        formActual: form,
      });
      showToast('error', `Faltan datos del formulario: ${nombres}`);
      return;
    }

    setSaving(true);

    try {
      // 1️⃣ Guardar / actualizar DOCENTE
      const resDocente = await fetch('/api/docentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ form }),
      });

      const dataDocente = await resDocente.json();

      if (!resDocente.ok || !dataDocente?.ok) {
        console.error('Error guardando docente', dataDocente);
        showToast(
          'error',
          dataDocente?.error ?? 'Error guardando docente',
        );
        return;
      }

      const usuarioId: number | undefined = dataDocente.usuario?.id;
      if (!usuarioId) {
        console.error(
          'No llegó usuario.id en la respuesta de /api/docentes',
          dataDocente,
        );
        showToast('error', 'No se pudo obtener el ID del docente');
        return;
      }

      // 2️⃣ Crear DICTAMEN para ese docente
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
        }),
      });

      const dataDictamen = await resDictamen.json();

      if (!resDictamen.ok || !dataDictamen?.ok) {
        console.error('Error creando dictamen', dataDictamen);
        showToast(
          'error',
          dataDictamen?.error ?? 'Error creando dictamen',
        );
        return;
      }

      // 3️⃣ Todo OK
      showToast(
        'success',
        'Docente y dictamen registrados correctamente',
      );

      // 🔥 Avisar a la página que hay un dictamen nuevo
      onDictamenCreated?.();

      // Limpiar formulario
      handleLimpiar();

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Error guardando docente / dictamen:', err);
      showToast('error', 'Error guardando docente / dictamen');
    } finally {
      setSaving(false);
    }
  };

  const handleActualizarDatos = async () => {
    if (saving) return;

    const camposObligatorios: {
      key: keyof DocenteForm;
      label: string;
    }[] = [
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
      console.warn(
        'Campos obligatorios faltantes (actualizar):',
        nombres,
        { formActual: form },
      );
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
        console.error('Error actualizando docente', dataDocente);
        showToast(
          'error',
          dataDocente?.error ?? 'Error actualizando docente',
        );
        return;
      }

      showToast(
        'success',
        'Datos del docente actualizados correctamente',
      );
    } catch (err) {
      console.error('Error actualizando datos del docente:', err);
      showToast('error', 'Error actualizando datos del docente');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const municipiosFiltrados = selectedDepartamento
    ? municipios.filter(
        (m) => m.codigoDepartamento === selectedDepartamento,
      )
    : municipios;

  const barriosFiltrados = selectedMunicipio
    ? barrios.filter((b) => b.codigoMunicipio === selectedMunicipio)
    : barrios;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* Header modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Registrar docente</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Card de datos de identificación y ubicación */}
          <section className="border rounded-lg">
            <header className="flex items-center gap-2 px-4 py-2 border-b bg-slate-50">
              <span className="px-2 py-1 text-xs bg-white border rounded">
                🧾
              </span>
              <h3 className="text-sm font-semibold">
                Datos de identificación y ubicación
              </h3>
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
                    <option value="CC">
                      Cédula de ciudadanía (CC)
                    </option>
                    <option value="TI">
                      Tarjeta de identidad (TI)
                    </option>
                    <option value="CE">
                      Cédula de extranjería (CE)
                    </option>
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
                      onKeyDown={(
                        e: React.KeyboardEvent<HTMLInputElement>,
                      ) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleBuscarDocente();
                        }
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleBuscarDocente}
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

              {/* Barrio, departamento, municipio */}
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
                    placeholder={
                      ubicacionLoading
                        ? 'Cargando departamentos…'
                        : 'Seleccione departamento…'
                    }
                    onChange={(newCodigo) => {
                      setSelectedDepartamento(newCodigo);
                      setSelectedMunicipio('');

                      const dep = departamentos.find(
                        (d) => d.codigo === newCodigo,
                      );

                      setForm((prev) => ({
                        ...prev,
                        departamento: dep?.nombre ?? '',
                        municipio: '',
                        barrio: '',
                      }));

                      if (selectedSecretariaId) {
                        fetchInstituciones(selectedSecretariaId);
                      }
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

                      const muni = municipiosFiltrados.find(
                        (m) => m.codigo === newCodigo,
                      );

                      setForm((prev) => ({
                        ...prev,
                        municipio: muni?.nombre ?? '',
                        barrio: '',
                      }));

                      if (selectedSecretariaId) {
                        fetchInstituciones(
                          selectedSecretariaId,
                          newCodigo || undefined,
                        );
                      }
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

                      const pais = paises.find(
                        (p) => p.codigo === newCodigo,
                      );

                      setForm((prev) => ({
                        ...prev,
                        pais: pais?.nombre ?? '',
                      }));
                    }}
                  />
                </div>
              </div>

              {/* Aseguradora (EPS) + Categoría */}
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
              <span className="px-2 py-1 text-xs bg-white border rounded">
                🧑‍🏫
              </span>
              <h3 className="text-sm font-semibold">
                Datos laborales del docente
              </h3>
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

                      const secretaria = secretarias.find(
                        (s) => String(s.id) === newId,
                      );

                      setForm((prev) => ({
                        ...prev,
                        secretariaLabora: secretaria?.nombre ?? '',
                        institucionLabora: '',
                      }));

                      if (newId) {
                        fetchInstituciones(
                          newId,
                          selectedMunicipio || undefined,
                        );
                      } else {
                        setInstituciones([]);
                      }
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
                        : loadingInstituciones
                        ? 'Buscando instituciones…'
                        : 'Empiece a escribir para buscar…'
                    }
                    disabled={!selectedSecretariaId}
                    onSearch={handleSearchInstitucion}
                    isLoading={loadingInstituciones}
                    minSearchLength={3}
                    onChange={(newValue) => {
                      const inst = instituciones.find(
                        (i) => i.nombre === newValue,
                      );
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
                    <option value="PROVISIONALIDAD">
                      Provisionalidad
                    </option>
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
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleLimpiar}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Limpiar
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleActualizarDatos}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-slate-700 hover:bg-gray-50 disabled:opacity-60"
              >
                {saving ? 'Guardando…' : 'Actualizar datos'}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? 'Guardando…' : 'Registrar dictamen'}
              </button>
            </div>
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

export function RegistrarDocenteButton() {
  const [open, setOpen] = useState(false);
  const { readOnly } = useMedicoAccess();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={readOnly}
        className="rounded-lg bg-blue-600 px-3 py-2 text-[11px] font-semibold text-white disabled:opacity-60"
      >
        Registrar
      </button>

      <DocenteModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function RegistrarDocenteModal(props: ModalProps) {
  return <DocenteModal {...props} />;
}
