// app/medico/page.tsx
'use client';

import {
  useEffect,
  useState,
  ChangeEvent,
  FormEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  DictamenExportButton,
  DictamenExportRow,
} from '@/components/DictamenExportButton';

import Appnav from '@/components/AppNav';

import {
  DictamenFiltersBar,
  MedicoOption,
} from '@/components/dictamen/DictamenFiltersBar';
import { DictamenTable } from '@/components/dictamen/DictamenTable';
import {
  DictamenRow,
  EstadoDictamenFiltro,
} from '@/components/dictamen/types';

// =====================
// Helpers exportación
// =====================

// Fecha para exportar (simple: YYYY-MM-DD)
function formatFechaExport(value: any): string {
  if (!value) return '';
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  const str = String(value);
  if (str.includes('T')) {
    return str.split('T')[0];
  }
  return str;
}

// =====================
// Modal Registrar Docente
// =====================

const STORAGE_KEY = 'dictamy_registro_docente';

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
          {type === 'success'
            ? '✓'
            : type === 'error'
            ? '!'
            : 'i'}
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

type DocenteForm = {
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
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
  secretariaLabora: string;
  gradoEscalafon: string;
  nivelEscalafon: string;
  institucionLabora: string;
};

const emptyForm: DocenteForm = {
  tipoDocumento: '',
  numeroDocumento: '',
  fechaNacimiento: '',
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
  secretariaLabora: '',
  gradoEscalafon: '',
  nivelEscalafon: '',
  institucionLabora: '',
};

type RegistrarModalProps = {
  open: boolean;
  onClose: () => void;
};

function RegistrarDocenteModal({ open, onClose }: RegistrarModalProps) {
  const [form, setForm] = useState<DocenteForm>(emptyForm);
  const [searching, setSearching] = useState(false);

  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
  } | null>(null);

  // auto-cerrar el toast a los 3 segundos
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
  };

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (!open) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setForm({ ...emptyForm, ...data });
      } else {
        setForm(emptyForm);
      }
    } catch (err) {
      console.error('Error cargando localStorage', err);
    }
  }, [open]);

  // Guardar en localStorage cuando cambie el formulario
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch (err) {
      console.error('Error guardando en localStorage', err);
    }
  }, [form]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLimpiar = () => {
    setForm(emptyForm);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔍 Buscar docente por documento
  const handleBuscarDocente = async () => {
    if (!form.numeroDocumento) {
      showToast('error', 'Ingresa un número de documento');
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `/api/docentes/buscar?documento=${encodeURIComponent(
          form.numeroDocumento
        )}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      let data: any = null;
      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error(
          'Respuesta no JSON de /api/docentes/buscar:',
          text
        );
        showToast('error', 'Error buscando docente');
        return;
      }

      // Se espera una respuesta tipo: { ok: boolean, docente?: { ... } }
      if (!res.ok || !data.ok || !data.docente) {
        showToast('info', 'Este docente no existe');
        return;
      }

      const d = data.docente;

      setForm((prev) => ({
        ...prev,
        tipoDocumento: d.tipoDocumento ?? prev.tipoDocumento,
        numeroDocumento:
          d.numeroDocumento ?? prev.numeroDocumento,
        fechaNacimiento:
          (d.fechaNacimiento &&
            String(d.fechaNacimiento).slice(0, 10)) ??
          prev.fechaNacimiento,
        primerNombre: d.primerNombre ?? prev.primerNombre,
        segundoNombre: d.segundoNombre ?? prev.segundoNombre,
        primerApellido:
          d.primerApellido ?? prev.primerApellido,
        segundoApellido:
          d.segundoApellido ?? prev.segundoApellido,
        sexo: d.sexo ?? prev.sexo,
        direccion: d.direccion ?? prev.direccion,
        barrio: d.barrio ?? prev.barrio,
        departamento: d.departamento ?? prev.departamento,
        municipio: d.municipio ?? prev.municipio,
        zona: d.zona ?? prev.zona,
        telefono: d.telefono ?? prev.telefono,
        pais: d.pais ?? prev.pais,
        secretariaLabora:
          d.secretariaLabora ?? prev.secretariaLabora,
        gradoEscalafon:
          d.gradoEscalafon ?? prev.gradoEscalafon,
        nivelEscalafon:
          d.nivelEscalafon ?? prev.nivelEscalafon,
        institucionLabora:
          d.institucionLabora ?? prev.institucionLabora,
      }));

      showToast('success', 'Docente cargado correctamente');
    } catch (err) {
      console.error('Error buscando docente:', err);
      showToast('error', 'Error buscando docente');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // TODO: aquí conectas con tu API para crear/actualizar el docente en BD
    console.log('Datos a registrar docente:', form);

    // Si todo sale bien:
    // handleLimpiar();
    // onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* Header modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            Registrar docente
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Card datos de identificación y ubicación */}
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
              {/* Fila 1: tipo doc, número, fecha nacimiento */}
              <div className="grid gap-4 md:grid-cols-3">
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
              </div>

              {/* Nombres */}
              <div className="grid gap-4 md:grid-cols-2">
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
              </div>

              {/* Apellidos */}
              <div className="grid gap-4 md:grid-cols-2">
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
                    Barrio / Vereda
                  </label>
                  <input
                    name="barrio"
                    value={form.barrio}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Departamento / Estado
                  </label>
                  <input
                    name="departamento"
                    value={form.departamento}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Ciudad / Municipio
                  </label>
                  <input
                    name="municipio"
                    value={form.municipio}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <input
                    name="pais"
                    value={form.pais}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Card datos laborales */}
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
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Secretaría donde labora
                  </label>
                  <input
                    name="secretariaLabora"
                    value={form.secretariaLabora}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700">
                    Institución donde labora
                  </label>
                  <input
                    name="institucionLabora"
                    value={form.institucionLabora}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

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
                    <option value="PREESCOLAR">Preescolar</option>
                    <option value="BASICA">Básica</option>
                    <option value="MEDIA">Media</option>
                    <option value="SUPERIOR">Superior</option>
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
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Guardar
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

// =====================
// Página principal
// =====================

export default function MedicoPage() {
  const router = useRouter();

  // Filtros
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [documento, setDocumento] = useState('');

  // AHORA: múltiples estados
  const [estado, setEstado] = useState<EstadoDictamenFiltro[]>([
    'PENDIENTES',
  ]);

  // Médicos (para el combo)
  const [medicos, setMedicos] = useState<MedicoOption[]>([]);
  // AHORA: múltiples médicos seleccionados
  const [medicoIds, setMedicoIds] = useState<number[]>([]);

  // Datos
  const [rows, setRows] = useState<DictamenRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Control modal registrar
  const [showRegistrarModal, setShowRegistrarModal] =
    useState(false);

  // 1) Cargar médicos desde el backend
  useEffect(() => {
    async function loadMedicos() {
      try {
        const res = await fetch('/api/medicos/options', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok || !data.ok) {
          console.error(
            data.error || 'Error cargando médicos'
          );
          setMedicos([]);
          setMedicoIds([]);
          return;
        }

        const options: MedicoOption[] = data.options ?? [];
        setMedicos(options);

        if (data.medicoIdActual) {
          setMedicoIds([data.medicoIdActual]);
        } else if (options.length > 0) {
          setMedicoIds([options[0].id]);
        } else {
          setMedicoIds([]);
        }
      } catch (err) {
        console.error('Error fetching medicos:', err);
        setMedicos([]);
        setMedicoIds([]);
      }
    }

    loadMedicos();
  }, []);

  // 2) Cargar dictámenes según filtros
  useEffect(() => {
    async function loadDictamenes() {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        if (medicoIds.length > 0) {
          params.set('medicoIds', medicoIds.join(','));
        }

        if (estado.length > 0) {
          params.set('estado', estado.join(','));
        }

        if (documento) params.set('documento', documento);
        if (fechaDesde) params.set('fechaDesde', fechaDesde);
        if (fechaHasta) params.set('fechaHasta', fechaHasta);

        const res = await fetch(
          `/api/dictamenes/medico?${params.toString()}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        const data = await res.json();

        if (!res.ok || !data.ok) {
          console.error(
            data.error || 'Error en la consulta'
          );
          setRows([]);
          return;
        }

        const mapped: DictamenRow[] = (data.rows ?? []).map(
          (d: any) => ({
            id: d.id,
            fechaDictamen: d.fechaDictamen,
            docenteDocumento: d.docenteDocumento,
            docenteNombre: d.docenteNombre,
            secretaria: d.secretaria,
            estado: d.estado,
            medicoNombre: d.medicoNombre,
          })
        );

        setRows(mapped);
      } catch (err) {
        console.error(err);
        setRows([]);
      } finally {
        setLoading(false);
      }
    }

    loadDictamenes();
  }, [medicoIds, estado, fechaDesde, fechaHasta, documento]);

  // 3) Acción del botón Registrar (abre modal)
  const handleRegistrar = () => {
    setShowRegistrarModal(true);
  };

  // 4) Acción Ver
  const handleOpenDictamen = (id: number) => {
    router.push(`/medico/dictamenes/${id}`);
  };

  // 5) Filas para exportar (formato CSV)
  const exportRows: DictamenExportRow[] = rows.map(
    (r): DictamenExportRow => ({
      fecha: formatFechaExport(r.fechaDictamen),
      secretaria: r.secretaria ?? '',
      documento: r.docenteDocumento ?? '',
      docente: r.docenteNombre ?? '',
      estado: r.estado ?? '',
      medico: r.medicoNombre ?? '',
    })
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      {/* Barra de navegación principal */}
      <Appnav title="Módulo del Médico" />

      <main className="flex-1 w-full max-w-6xl px-4 py-4 mx-auto space-y-4">
        {/* Encabezado */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Dictámenes del médico
            </h1>
            <p className="text-xs text-slate-500">
              Visualiza y gestiona los dictámenes pendientes,
              reabiertos y cerrados.
            </p>
          </div>

          {/* Botón de descargar listado */}
          <DictamenExportButton
            rows={exportRows}
            filename="dictamenes_medico.csv"
          />
        </div>

        {/* Barra de filtros reutilizable */}
        <DictamenFiltersBar
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          onFechaDesdeChange={setFechaDesde}
          onFechaHastaChange={setFechaHasta}
          documento={documento}
          onDocumentoChange={setDocumento}
          estado={estado}
          onEstadoChange={setEstado}
          medicos={medicos}
          medicoIds={medicoIds}
          onMedicoChange={setMedicoIds}
          showMedicoSelect={true}
          selectedMedicoIds={medicoIds}
          onMedicoIdsChange={setMedicoIds}
          onRegistrar={handleRegistrar}
        />

        {/* Tabla de dictámenes */}
        <DictamenTable
          rows={rows}
          loading={loading}
          onOpenDictamen={handleOpenDictamen}
        />
      </main>

      {/* Modal registrar docente */}
      <RegistrarDocenteModal
        open={showRegistrarModal}
        onClose={() => setShowRegistrarModal(false)}
      />
    </div>
  );
}
