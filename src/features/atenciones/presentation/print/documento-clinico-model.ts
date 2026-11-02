import type { AtencionDetalle } from '@/features/atenciones/application/atencion-detail';
import { edadPaciente, fechaBogota } from '@/lib/edad';

/**
 * Lo común a los documentos clínicos impresos (historia clínica, remisión…): prestador, atención,
 * identificación del paciente y profesional que firma, ya con etiquetas legibles y fechas en hora
 * de Colombia.
 */

const TIME_ZONE = 'America/Bogota';

/** Datos que no trae el detalle de la atención y que exigen los documentos impresos. */
export type DocumentoClinicoExtras = {
  institucion: {
    nombre: string;
    nit: string;
    codigoHabilitacion: string | null;
    direccion: string | null;
    telefono: string | null;
    ciudad: string | null;
  };
  paciente: {
    /** YYYY-MM-DD */
    fechaNacimiento: string | null;
    sexo: string;
    estadoCivil: string | null;
    direccion: string | null;
    etnia: string | null;
    zonaResidencia: string | null;
  };
  /** El médico que atendió la cita; firma como data URL. */
  profesional: {
    nombre: string;
    tipoDocumento: string | null;
    documento: string | null;
    registroMedico: string | null;
    licencia: string | null;
    firmaSrc: string | null;
  };
  /** Cuando se finalizó la atención (ISO). */
  atendidaEn: string | null;
  generadoEn: string;
};

export type EncabezadoClinico = ReturnType<typeof buildEncabezadoClinico>;
export type Dato = { label: string; valor: string };
export type Hallazgo = Dato & { alterado: boolean };

// Igual que esMujer: H es hombre; M (mujer) y F, femenino.
const SEXO: Record<string, string> = { H: 'Masculino', M: 'Femenino', F: 'Femenino', I: 'Indeterminado', O: 'Otro' };
const ZONA: Record<string, string> = { U: 'Urbana', R: 'Rural' };

export function clean(value: string | null | undefined) {
  return (value ?? '').trim();
}

function capitalize(value: string) {
  const lower = value.toLocaleLowerCase('es-CO');
  return lower.charAt(0).toLocaleUpperCase('es-CO') + lower.slice(1);
}

/** YYYY-MM-DD → DD/MM/YYYY; un ISO con hora se lleva a la fecha de Colombia. */
export function formatFecha(value: string | null | undefined) {
  if (!value) return '';
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TIME_ZONE })
    .format(new Date(value));
}

export function formatHora(value: string | null | undefined) {
  if (!value) return '';
  return new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TIME_ZONE })
    .format(new Date(value));
}

export function formatFechaHora(value: string | null | undefined) {
  return value ? `${formatFecha(value)} ${formatHora(value)}` : '';
}

/** "I10X - HIPERTENSION…" → "HIPERTENSION…"; el código va en su propia columna. */
export function diagnosticoNombre(codigo: string, label: string) {
  const prefix = `${codigo} - `;
  return label.startsWith(prefix) ? label.slice(prefix.length) : label;
}

/** La licencia tal como está guardada; si no empieza por "Lic", se antepone "Licencia". */
function formatLicencia(value: string | null) {
  const licencia = clean(value);
  if (!licencia) return '';
  return /^lic/i.test(licencia) ? licencia : `Licencia ${licencia}`;
}

/** El primero es el principal; los demás, relacionados en su orden. */
export function ordenDiagnostico(index: number) {
  return index === 0 ? 'Principal' : `Relacionado ${index}`;
}

export function buildEncabezadoClinico(detalle: AtencionDetalle, extras: DocumentoClinicoExtras) {
  const { docente } = detalle;
  const paciente = extras.paciente;
  const estadoCivil = clean(paciente.estadoCivil);
  // La edad del día de la atención: igual al reimprimir años después.
  const edad = edadPaciente(
    { fechaNacimiento: paciente.fechaNacimiento, edad: docente.edad },
    fechaBogota(detalle.inicioProgramado),
  );

  return {
    institucion: extras.institucion,
    atencion: {
      numero: String(detalle.id),
      fecha: formatFecha(detalle.inicioProgramado),
      hora: formatHora(detalle.inicioProgramado),
      cierre: formatFechaHora(extras.atendidaEn),
      sede: detalle.sedeNombre,
      especialidad: detalle.especialidadNombre,
      modalidad: detalle.modalidadNombre,
    },
    paciente: {
      nombre: docente.nombreCompleto,
      documento: `${docente.tipoDocumento} ${docente.documento}`,
      edad: edad != null ? `${edad} años` : '',
      fechaNacimiento: formatFecha(paciente.fechaNacimiento),
      sexo: SEXO[clean(paciente.sexo).toUpperCase()] ?? clean(paciente.sexo),
      estadoCivil: estadoCivil ? capitalize(estadoCivil) : '',
      direccion: clean(paciente.direccion),
      zona: ZONA[clean(paciente.zonaResidencia)] ?? clean(paciente.zonaResidencia),
      telefono: clean(docente.telefono),
      eps: clean(docente.eps),
      ocupacion: clean(docente.cargo),
      etnia: clean(paciente.etnia),
    },
    profesional: {
      ...extras.profesional,
      documento: extras.profesional.documento
        ? `${extras.profesional.tipoDocumento ?? ''} ${extras.profesional.documento}`.trim()
        : '',
      licencia: formatLicencia(extras.profesional.licencia),
      especialidad: detalle.especialidadNombre,
    },
    generadoEn: formatFechaHora(extras.generadoEn),
  };
}
