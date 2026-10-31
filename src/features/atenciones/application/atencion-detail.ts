import { hasAbility, type AuthorizationContext } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';

import type { AtencionForm } from '../domain/atencion-form';
import {
  PARSE_ANTECEDENTES,
  getAntecedentes,
  type AntecedenteKind,
  type AntecedentesFamiliaresDoc,
  type AntecedentesPersonalesDoc,
} from './antecedentes';

import { attendBlocker } from './attend-appointment';

const PREVIOUS_ATTENTIONS = 5;

export type AtencionEstado = 'ACTIVADA' | 'ATENDIDA';

export type AtencionDetalle = {
  id: number;
  estado: AtencionEstado;
  inicioProgramado: string;
  finProgramado: string;
  activadaAt: string | null;
  sedeNombre: string;
  especialidadNombre: string;
  modalidadNombre: string;
  medicoNombre: string;
  docente: {
    nombreCompleto: string;
    tipoDocumento: string;
    documento: string;
    edad: number | null;
    telefono: string | null;
    eps: string | null;
    cargo: string | null;
    secretaria: string | null;
    institucion: string | null;
  };
  anteriores: Array<{ id: number; inicioProgramado: string; especialidadNombre: string; medicoNombre: string }>;
  form: AtencionForm;
  antecedentesPersonales: AntecedentesPersonalesDoc;
  antecedentesFamiliares: AntecedentesFamiliaresDoc;
  /** La atención finalizada muestra la copia guardada al cerrarla, no los antecedentes actuales. */
  antecedentesDeEstaAtencion: boolean;
  /** Puede editar al docente, diligenciar y finalizar la atención. */
  canAttend: boolean;
};

function fullName(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

/** Solo las citas que muestra el listado (activadas o atendidas) tienen ficha de atención. */
export async function getAtencionDetalle(auth: AuthorizationContext, citaId: number): Promise<AtencionDetalle | null> {
  const cita = await prisma.cita.findUnique({
    where: { id: citaId },
    include: {
      atencion: {
        select: { motivoConsulta: true, enfermedadActual: true, antecedentesPersonales: true, antecedentesFamiliares: true },
      },
      paciente: {
        include: {
          eps: { select: { nombreEntidad: true } },
          cargoDocente: { select: { nombre: true } },
          secretariaRef: { select: { nombre: true } },
          institucionEducativaRef: { select: { nombre: true, secretaria: { select: { nombre: true } } } },
        },
      },
    },
  });
  const activada = cita?.estado === 'ASIGNADA' && cita.activadaAt !== null;
  if (!cita || (!activada && cita.estado !== 'ATENDIDA')) return null;

  const anteriores = await prisma.cita.findMany({
    where: { usuarioId: cita.usuarioId, estado: 'ATENDIDA', id: { not: cita.id } },
    orderBy: [{ inicioProgramado: 'desc' }, { id: 'desc' }],
    take: PREVIOUS_ATTENTIONS,
    select: { id: true, inicioProgramado: true, especialidadNombre: true, medicoNombre: true },
  });

  // Atención finalizada: se muestra la copia guardada al cerrarla, no los antecedentes actuales.
  const snapshot = !activada && cita.atencion?.antecedentesPersonales != null;
  const load = <K extends AntecedenteKind>(kind: K, saved: unknown) =>
    snapshot
      ? { datos: PARSE_ANTECEDENTES[kind](saved), version: 0, actualizadoEn: null, actualizadoPor: null }
      : getAntecedentes(kind, cita.usuarioId);
  const [antecedentesPersonales, antecedentesFamiliares] = await Promise.all([
    load('personales', cita.atencion?.antecedentesPersonales),
    load('familiares', cita.atencion?.antecedentesFamiliares),
  ]);

  const paciente = cita.paciente;
  return {
    id: cita.id,
    estado: activada ? 'ACTIVADA' : 'ATENDIDA',
    inicioProgramado: cita.inicioProgramado.toISOString(),
    finProgramado: cita.finProgramado.toISOString(),
    activadaAt: cita.activadaAt?.toISOString() ?? null,
    sedeNombre: cita.sedeNombre,
    especialidadNombre: cita.especialidadNombre,
    modalidadNombre: cita.modalidadNombre,
    medicoNombre: cita.medicoNombre,
    docente: {
      nombreCompleto:
        fullName(paciente.primerNombre, paciente.segundoNombre, paciente.primerApellido, paciente.segundoApellido) ||
        'Docente sin nombre',
      tipoDocumento: paciente.tipoIdentificacion,
      documento: paciente.identificacion,
      edad: paciente.edad,
      telefono: paciente.celular ?? paciente.telefono ?? null,
      eps: paciente.eps?.nombreEntidad ?? null,
      cargo: paciente.cargoDocente?.nombre ?? null,
      secretaria: paciente.secretariaRef?.nombre ?? paciente.institucionEducativaRef?.secretaria?.nombre ?? null,
      institucion: paciente.institucionEducativaRef?.nombre ?? null,
    },
    anteriores: anteriores.map((item) => ({
      id: item.id,
      inicioProgramado: item.inicioProgramado.toISOString(),
      especialidadNombre: item.especialidadNombre,
      medicoNombre: item.medicoNombre,
    })),
    form: {
      motivoConsulta: cita.atencion?.motivoConsulta ?? '',
      enfermedadActual: cita.atencion?.enfermedadActual ?? '',
    },
    antecedentesPersonales,
    antecedentesFamiliares,
    antecedentesDeEstaAtencion: snapshot,
    canAttend: hasAbility(auth, 'appointment.attend') && attendBlocker(cita, auth) === null,
  };
}
