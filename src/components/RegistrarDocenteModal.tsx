'use client';

import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useMedicoAccess } from '@/components/medico/MedicoAccessProvider';
import { DatosLaboralesSection } from '@/components/registrar-docente/DatosLaboralesSection';
import { FormActions } from '@/components/registrar-docente/FormActions';
import { IdentificacionUbicacionSection } from '@/components/registrar-docente/IdentificacionUbicacionSection';
import { Toast } from '@/components/registrar-docente/Toast';
import {
  isAbortError,
  readNestedRecord,
  readString,
  readUnknown,
} from '@/components/registrar-docente/api-adapters';
import {
  createDictamen,
  createRecomendacion,
  fetchInstituciones as fetchInstitucionesApi,
  fetchUbicacionOptions,
  saveDocente,
  searchCargoDocentes,
  searchDocenteByDocumento,
  updateDocente,
} from '@/components/registrar-docente/api';
import { emptyForm, STORAGE_KEY } from '@/components/registrar-docente/constants';
import type {
  BarrioOption,
  CargoDocenteOption,
  DepartamentoOption,
  DocenteForm,
  EpsOption,
  InstitucionOption,
  ModalProps,
  MunicipioOption,
  PaisOption,
  SecretariaOption,
  ToastType,
} from '@/components/registrar-docente/types';
import {
  buildStoredForm,
  calculateAge,
  getMissingRequiredFields,
  normalizeCargoId,
  normalizeDate,
  resolveMunicipioCodigoFromList,
  resolveMunicipioNombreFromList,
  todayIsoDate,
} from '@/components/registrar-docente/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [selectedMunicipio, setSelectedMunicipio] = useState('');

  const [ubicacionLoaded, setUbicacionLoaded] = useState(false);

  const [secretarias, setSecretarias] = useState<SecretariaOption[]>([]);
  const [instituciones, setInstituciones] = useState<InstitucionOption[]>([]);
  const [selectedSecretariaId, setSelectedSecretariaId] = useState<string>('');
  const [loadingInstituciones, setLoadingInstituciones] = useState(false);

  const [cargosDocentes, setCargosDocentes] = useState<CargoDocenteOption[]>([]);
  const [loadingCargos, setLoadingCargos] = useState(false);

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

  useEffect(() => {
    setInstituciones([]);
  }, [selectedSecretariaId, selectedMunicipio]);

  const ensureCargoInOptions = (cargoId: number | null, cargoNombre: string) => {
    if (!cargoId || !cargoNombre) return;
    setCargosDocentes((prev) => {
      if (prev.some((x) => x.id === cargoId)) return prev;
      return [{ id: cargoId, codigo: '', nombre: cargoNombre }, ...prev];
    });
  };

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
      setCargosDocentes(await searchCargoDocentes(q, controller.signal));
    } catch (err) {
      if (isAbortError(err)) return;
      console.error('Error buscando cargos docentes:', err);
      setCargosDocentes([]);
    } finally {
      if (!controller.signal.aborted) setLoadingCargos(false);
    }
  };

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

    const run = (municipio?: string) =>
      fetchInstitucionesApi({
        secretariaId: selectedSecretariaId,
        municipio,
        q,
        signal: controller.signal,
      });

    try {
      setLoadingInstituciones(true);

      const muniCodigo = currentMunicipioCodigo();
      const muniNombre = currentMunicipioNombre();

      let out = await run(muniCodigo);
      if (controller.signal.aborted) return;

      if (muniCodigo && out.length === 0 && muniNombre) {
        out = await run(muniNombre);
        if (controller.signal.aborted) return;
      }

      if (out.length === 0) {
        out = await run(undefined);
        if (controller.signal.aborted) return;
      }

      setInstituciones(out);
    } catch (err) {
      if (isAbortError(err)) return;
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

    const run = (municipio?: string) =>
      fetchInstitucionesApi({
        secretariaId,
        municipio,
        signal: controller.signal,
      });

    try {
      setLoadingInstituciones(true);

      const muniCodigo =
        resolveMunicipioCodigoFromList(municipios, municipioMaybe) ?? currentMunicipioCodigo();
      const muniNombre =
        resolveMunicipioNombreFromList(municipios, municipioMaybe) ?? currentMunicipioNombre();

      let out = await run(muniCodigo);
      if (controller.signal.aborted) return;

      if (muniCodigo && out.length === 0 && muniNombre) {
        out = await run(muniNombre);
        if (controller.signal.aborted) return;
      }

      if (out.length === 0) {
        out = await run(undefined);
        if (controller.signal.aborted) return;
      }

      setInstituciones(out);
    } catch (err) {
      if (isAbortError(err)) return;
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
        const storedForm = buildStoredForm(data);

        setForm(storedForm);

        if (storedForm.cargoDocenteId && storedForm.cargoDocenteNombre) {
          ensureCargoInOptions(storedForm.cargoDocenteId, storedForm.cargoDocenteNombre);
        }
      }
    } catch (err) {
      console.error('Error cargando localStorage', err);
    }
  }, []);

  useEffect(() => {
    const ageStr = calculateAge(form.fechaNacimiento);
    setForm((prev) => (prev.edad !== ageStr ? { ...prev, edad: ageStr } : prev));
  }, [form.fechaNacimiento]);

  // React Query: traer opciones de ubicación
  const { data: ubicacionData, isLoading: ubicacionLoading } = useQuery({
    queryKey: ['ubicacion-opciones'],
    queryFn: fetchUbicacionOptions,
    enabled: open && !ubicacionLoaded,
    staleTime: 1000 * 60 * 10,
  });

  // Mapear ubicacionData -> estados locales + sincronizar con el form
  useEffect(() => {
    if (!open) return;
    if (ubicacionLoaded) return;
    if (!ubicacionData) return;

    try {
      const {
        paises: paisesMapped,
        departamentos: departamentosMapped,
        municipios: municipiosMapped,
        barrios: barriosMapped,
        secretarias: secretariasMapped,
        eps: epsMapped,
      } = ubicacionData;

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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const d = await searchDocenteByDocumento(form.numeroDocumento);
      if (!d) {
        showToast('info', 'Este docente no existe');
        return;
      }

      const cargoDocente = readNestedRecord(d, 'cargoDocente');
      const edadRes = readUnknown(d, ['edad']);

      const codigoEpsRes = readUnknown(d, [
        'codigoEps',
        'Codigo_eps',
        'codigo_eps',
        'CODIGO_EPS',
        'Codigo_Eps',
      ]);

      const cargoDocenteIdRes =
        readUnknown(d, ['cargoDocenteId', 'cargo_docente_id']) ?? cargoDocente.id;

      const cargoDocenteNombreRes =
        readUnknown(d, ['cargoDocenteNombre', 'cargo_docente_nombre']) ?? cargoDocente.nombre;

      const escolaridadRes = readUnknown(d, ['escolaridad']);

      const fechaVinculacionRes =
        readUnknown(d, ['fechaVinculacion', 'fecha_vinculacion', 'fechaVinculacionDocente']);

      const updated: DocenteForm = {
        ...form,
        tipoDocumento: readString(d, ['tipoIdentificacion', 'tipoDocumento'], form.tipoDocumento),
        numeroDocumento: readString(d, ['identificacion', 'numeroDocumento'], form.numeroDocumento),
        fechaNacimiento: normalizeDate(readUnknown(d, ['fechaNacimiento']), form.fechaNacimiento),
        edad: edadRes != null ? String(edadRes) : form.edad,
        primerNombre: readString(d, ['primerNombre'], form.primerNombre),
        segundoNombre: readString(d, ['segundoNombre'], form.segundoNombre),
        primerApellido: readString(d, ['primerApellido'], form.primerApellido),
        segundoApellido: readString(d, ['segundoApellido'], form.segundoApellido),
        sexo: readString(d, ['sexo'], form.sexo),
        direccion: readString(d, ['direccion'], form.direccion),
        barrio: readString(d, ['barrio'], form.barrio),
        departamento: readString(d, ['departamento'], form.departamento),
        municipio: readString(d, ['municipio'], form.municipio),
        zona: readString(d, ['zonaResidencia', 'zona'], form.zona),
        telefono: readString(d, ['telefono'], form.telefono),
        pais: form.pais,
        codigoEps: codigoEpsRes == null ? form.codigoEps : String(codigoEpsRes),
        categoria: readString(d, ['categoria'], form.categoria),
        secretariaLabora: readString(d, ['secretaria'], form.secretariaLabora),
        formaVinculacion: readString(d, ['formaVinculacion'], form.formaVinculacion),
        estadoCivil: readString(d, ['estadoCivil'], form.estadoCivil),
        gradoEscalafon: readString(d, ['gradoEscalafon'], form.gradoEscalafon),
        nivelEscalafon: readString(d, ['nivelEscalafon'], form.nivelEscalafon),
        institucionLabora: readString(d, ['institucionEducativa'], form.institucionLabora),

        cargoDocenteId: normalizeCargoId(cargoDocenteIdRes),
        cargoDocenteNombre: String(cargoDocenteNombreRes ?? ''),
        escolaridad: String(escolaridadRes ?? ''),

        tipoDictamen: form.tipoDictamen,
        fechaVinculacion: normalizeDate(fechaVinculacionRes, form.fechaVinculacion),
      };

      setForm(updated);

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

  const validateRequiredFields = () => {
    const faltantes = getMissingRequiredFields(form);

    if (faltantes.length) {
      const nombres = faltantes.map((f) => f.label).join(', ');
      showToast('error', `Faltan datos del formulario: ${nombres}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving || !validateRequiredFields()) return;

    setSaving(true);

    try {
      const usuarioId = await saveDocente(form);

      if (isRecommendationMode) {
        await createRecomendacion(usuarioId, medicoResponsableId);

        showToast('success', 'Docente registrado y recomendacion lista en el listado');
        onDocenteSaved?.(usuarioId);
        handleLimpiar();
        setTimeout(() => onClose(), 1200);
        return;
      }

      await createDictamen({
        usuarioId,
        fechaDictamen: todayIsoDate(),
        tipoDictamen: form.tipoDictamen,
      });

      showToast('success', 'Docente y dictamen registrados correctamente');
      onDictamenCreated?.();
      handleLimpiar();

      setTimeout(() => onClose(), 1200);
    } catch (err) {
      console.error('Error guardando docente / dictamen:', err);
      showToast(
        'error',
        err instanceof Error
          ? err.message
          : isRecommendationMode
            ? 'Error guardando docente para recomendacion'
            : 'Error guardando docente / dictamen',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleActualizarDatos = async () => {
    if (saving || !validateRequiredFields()) return;

    setSaving(true);

    try {
      await updateDocente(form);
      showToast('success', 'Datos del docente actualizados correctamente');
    } catch (err) {
      console.error('Error actualizando datos del docente:', err);
      showToast(
        'error',
        err instanceof Error ? err.message : 'Error actualizando datos del docente',
      );
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

  const handlePaisChange = (codigo: string) => {
    setSelectedPaisCodigo(codigo);

    const pais = paises.find((item) => item.codigo === codigo);
    setForm((prev) => ({ ...prev, pais: pais?.nombre ?? '' }));
  };

  const handleDepartamentoChange = (codigo: string) => {
    setSelectedDepartamento(codigo);
    setSelectedMunicipio('');

    const departamento = departamentos.find((item) => item.codigo === codigo);

    setForm((prev) => ({
      ...prev,
      departamento: departamento?.nombre ?? '',
      municipio: '',
      barrio: '',
    }));

    if (selectedSecretariaId) fetchInstituciones(selectedSecretariaId, undefined);
  };

  const handleMunicipioChange = (codigo: string) => {
    setSelectedMunicipio(codigo);

    const municipio = municipiosFiltrados.find((item) => item.codigo === codigo);

    setForm((prev) => ({
      ...prev,
      municipio: municipio?.nombre ?? '',
      barrio: '',
    }));

    if (selectedSecretariaId) {
      fetchInstituciones(selectedSecretariaId, codigo || undefined);
    }
  };

  const handleCargoChange = (value: string) => {
    const id = normalizeCargoId(value);
    const cargo = cargosDocentes.find((item) => item.id === id);

    setForm((prev) => ({
      ...prev,
      cargoDocenteId: id,
      cargoDocenteNombre: cargo?.nombre ?? prev.cargoDocenteNombre,
    }));
  };

  const handleSecretariaChange = (id: string) => {
    setSelectedSecretariaId(id);

    const secretaria = secretarias.find((item) => String(item.id) === id);

    setForm((prev) => ({
      ...prev,
      secretariaLabora: secretaria?.nombre ?? '',
      institucionLabora: '',
    }));

    if (id) {
      fetchInstituciones(id, currentMunicipioCodigo());
    } else {
      setInstituciones([]);
    }
  };

  const handleInstitucionChange = (value: string) => {
    const institucion = instituciones.find((item) => item.nombre === value);

    setForm((prev) => ({
      ...prev,
      institucionLabora: institucion?.nombre ?? value,
    }));
  };

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
            <IdentificacionUbicacionSection
              form={form}
              selectedPaisCodigo={selectedPaisCodigo}
              selectedDepartamento={selectedDepartamento}
              selectedMunicipio={selectedMunicipio}
              paises={paises}
              departamentos={departamentos}
              municipios={municipiosFiltrados}
              barrios={barriosFiltrados}
              epsList={epsList}
              ubicacionLoading={ubicacionLoading}
              searching={searching}
              onFieldChange={handleChange}
              onBuscarDocente={handleBuscarDocente}
              onPaisChange={handlePaisChange}
              onDepartamentoChange={handleDepartamentoChange}
              onMunicipioChange={handleMunicipioChange}
              onBarrioChange={(barrio) => setForm((prev) => ({ ...prev, barrio }))}
              onEpsChange={(codigoEps) => setForm((prev) => ({ ...prev, codigoEps }))}
            />

            <DatosLaboralesSection
              form={form}
              isRecommendationMode={isRecommendationMode}
              cargosDocentes={cargosDocentes}
              secretarias={secretarias}
              instituciones={instituciones}
              selectedSecretariaId={selectedSecretariaId}
              loadingCargos={loadingCargos}
              loadingInstituciones={loadingInstituciones}
              onFieldChange={handleChange}
              onSearchCargoDocente={handleSearchCargoDocente}
              onCargoChange={handleCargoChange}
              onSecretariaChange={handleSecretariaChange}
              onInstitucionSearch={handleSearchInstitucion}
              onInstitucionChange={handleInstitucionChange}
            />

            <FormActions
              saving={saving}
              submitLabel={submitLabel}
              onClear={handleLimpiar}
              onCancel={onClose}
              onUpdate={handleActualizarDatos}
            />
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
