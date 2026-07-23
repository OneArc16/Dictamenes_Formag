import type { DocenteForm } from './types';
import type { ApiRecord } from './api-adapters';
import {
  asApiRecord,
  mapCargoDocentes,
  mapInstituciones,
  mapUbicacionOptions,
  readErrorMessage,
  readFirstRecordArray,
  readUsuarioId,
} from './api-adapters';

async function readJsonResponse(response: Response, fallback: string) {
  const data = asApiRecord(await response.json().catch(() => ({})));

  if (!response.ok || data.ok !== true) {
    throw new Error(readErrorMessage(data, fallback));
  }

  return data;
}

export async function fetchUbicacionOptions() {
  const response = await fetch('/api/ubicacion/opciones', {
    method: 'GET',
    credentials: 'include',
  });

  const data = await readJsonResponse(response, 'Error cargando opciones de ubicación');
  return mapUbicacionOptions(data);
}

export async function searchCargoDocentes(term: string, signal: AbortSignal) {
  const response = await fetch(`/api/cargos-docentes/search?q=${encodeURIComponent(term)}`, {
    method: 'GET',
    credentials: 'include',
    signal,
  });

  const data = await readJsonResponse(response, 'Error buscando cargos docentes');
  return mapCargoDocentes(data);
}

type FetchInstitucionesParams = {
  secretariaId: string;
  municipio?: string;
  signal: AbortSignal;
  q?: string;
};

export async function fetchInstituciones({
  secretariaId,
  municipio,
  signal,
  q,
}: FetchInstitucionesParams) {
  const params = new URLSearchParams();
  params.set('secretariaId', secretariaId);
  if (q) params.set('q', q);
  if (municipio) params.set('municipio', municipio);

  const endpoint = q ? '/api/instituciones/search' : '/api/instituciones/by-secretaria';
  const response = await fetch(`${endpoint}?${params.toString()}`, {
    method: 'GET',
    credentials: 'include',
    signal,
  });

  const data = await readJsonResponse(response, 'Error cargando instituciones');
  return mapInstituciones(data.instituciones);
}

export async function searchDocenteByDocumento(documento: string): Promise<ApiRecord | null> {
  const response = await fetch(`/api/docentes/search?q=${encodeURIComponent(documento)}`, {
    method: 'GET',
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Respuesta no JSON de /api/docentes/search:', text);
    throw new Error('Error buscando docente');
  }

  const data = await readJsonResponse(response, 'Error buscando docente');
  const rows = readFirstRecordArray(data, ['rows']);

  return rows[0] ?? null;
}

export async function saveDocente(form: DocenteForm) {
  const response = await fetch('/api/docentes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ form }),
  });

  const data = await readJsonResponse(response, 'Error guardando docente');
  const usuarioId = readUsuarioId(data);

  if (!usuarioId) {
    throw new Error('No se pudo obtener el ID del docente');
  }

  return usuarioId;
}

export async function updateDocente(form: DocenteForm) {
  const response = await fetch('/api/docentes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ form }),
  });

  await readJsonResponse(response, 'Error actualizando docente');
}

export async function createRecomendacion(usuarioId: number, empleadoId: number | null) {
  const response = await fetch('/api/recomendaciones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ usuarioId, empleadoId }),
  });

  await readJsonResponse(response, 'Error creando recomendacion laboral');
}

export async function createDictamenCase(
  form: DocenteForm,
  operacionId: string,
) {
  const response = await fetch('/api/dictamenes/casos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ form, operacionId }),
  });

  const data = await readJsonResponse(
    response,
    'Error registrando el expediente y el Formulario de Origen',
  );
  if (typeof data.route !== 'string') {
    throw new Error('El servidor no devolvió la ruta del formulario.');
  }

  return {
    dictamenId: Number(data.dictamenId),
    route: data.route,
  };
}
