import type { Prisma } from '@prisma/client';

import { parseDatosRegistro, type DatosRegistro } from '@/features/atenciones/domain/datos-registro';
import { fechaDb } from '@/lib/edad';
import { prisma } from '@/lib/prisma';

type Db = Prisma.TransactionClient | typeof prisma;

const CITA_REGISTRO_SELECT = {
  paciente: {
    select: {
      primerNombre: true,
      segundoNombre: true,
      primerApellido: true,
      segundoApellido: true,
      tipoIdentificacion: true,
      identificacion: true,
      fechaNacimiento: true,
      edad: true,
      sexo: true,
      estadoCivil: true,
      direccion: true,
      celular: true,
      telefono: true,
      etnia: true,
      zonaResidencia: true,
      eps: { select: { nombreEntidad: true } },
      cargoDocente: { select: { nombre: true } },
      secretariaRef: { select: { nombre: true } },
      institucionEducativaRef: { select: { nombre: true, secretaria: { select: { nombre: true } } } },
    },
  },
  // El médico que atendió la cita es quien firma sus documentos.
  medico: {
    select: {
      tipoDocumento: true,
      numeroIdentidad: true,
      primerNombre: true,
      segundoNombre: true,
      primerApellido: true,
      segundoApellido: true,
      registroMedico: true,
      licencia: true,
      firma: true,
      firmaMime: true,
    },
  },
  sede: {
    select: {
      codigoHabilitacion: true,
      direccion: true,
      telefono: true,
      municipio: { select: { nombre: true } },
      centroMedico: {
        select: { codigoHabilitacion: true, direccion: true, telefono: true, municipio: { select: { nombre: true } } },
      },
    },
  },
} satisfies Prisma.CitaSelect;

export type CitaRegistro = Prisma.CitaGetPayload<{ select: typeof CITA_REGISTRO_SELECT }>;

function joinName(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function signatureDataUrl(bytes: Uint8Array | null, mime: string | null) {
  if (!bytes?.length) return null;
  const buffer = Buffer.from(bytes);
  const type = mime || (buffer[0] === 0xff && buffer[1] === 0xd8 ? 'image/jpeg' : 'image/png');
  return `data:${type};base64,${buffer.toString('base64')}`;
}

/** La identificación del docente tal como está hoy. */
export function pacienteRegistro(paciente: CitaRegistro['paciente']): DatosRegistro['paciente'] {
  return {
    nombreCompleto:
      joinName(paciente.primerNombre, paciente.segundoNombre, paciente.primerApellido, paciente.segundoApellido) ||
      'Docente sin nombre',
    tipoDocumento: paciente.tipoIdentificacion,
    documento: paciente.identificacion,
    fechaNacimiento: fechaDb(paciente.fechaNacimiento),
    edad: paciente.edad,
    sexo: paciente.sexo,
    estadoCivil: paciente.estadoCivil,
    direccion: paciente.direccion,
    telefono: paciente.celular ?? paciente.telefono ?? null,
    eps: paciente.eps?.nombreEntidad ?? null,
    cargo: paciente.cargoDocente?.nombre ?? null,
    secretaria: paciente.secretariaRef?.nombre ?? paciente.institucionEducativaRef?.secretaria?.nombre ?? null,
    institucion: paciente.institucionEducativaRef?.nombre ?? null,
    etnia: paciente.etnia,
    zonaResidencia: paciente.zonaResidencia,
  };
}

/** Los datos de registro tal como están hoy en el docente, el médico y la sede de la cita. */
export function toDatosRegistro({ paciente, medico, sede }: CitaRegistro): DatosRegistro {
  const centro = sede.centroMedico;
  return {
    version: 1,
    paciente: pacienteRegistro(paciente),
    profesional: {
      nombre: joinName(medico.primerNombre, medico.segundoNombre, medico.primerApellido, medico.segundoApellido),
      tipoDocumento: medico.tipoDocumento,
      documento: medico.numeroIdentidad,
      registroMedico: medico.registroMedico,
      licencia: medico.licencia,
      firmaSrc: signatureDataUrl(medico.firma, medico.firmaMime),
    },
    // La sede manda; lo que no tenga lo completa su centro médico.
    sede: {
      codigoHabilitacion: sede.codigoHabilitacion ?? centro.codigoHabilitacion ?? null,
      direccion: sede.direccion ?? centro.direccion ?? null,
      telefono: sede.telefono ?? centro.telefono ?? null,
      ciudad: sede.municipio?.nombre ?? centro.municipio?.nombre ?? null,
    },
  };
}

export async function datosRegistroActuales(db: Db, citaId: number): Promise<DatosRegistro> {
  const cita = await db.cita.findUniqueOrThrow({ where: { id: citaId }, select: CITA_REGISTRO_SELECT });
  return toDatosRegistro(cita);
}

/** La copia guardada al finalizar; si la atención no la tiene, los datos actuales. */
export async function datosRegistroDeAtencion(db: Db, citaId: number): Promise<DatosRegistro> {
  const atencion = await db.atencion.findUnique({ where: { citaId }, select: { datosRegistro: true } });
  return parseDatosRegistro(atencion?.datosRegistro) ?? datosRegistroActuales(db, citaId);
}
