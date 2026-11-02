import { hasAbility, type AuthorizationContext } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import { edadPaciente, fechaBogota, fechaDb } from '@/lib/edad';

import { esMujer } from '../domain/antecedentes-ginecobstetricos';
import type { DiagnosticoAtencion } from '../domain/diagnosticos';
import type { Evolucion } from '../domain/evoluciones';
import type { Incapacidad } from '../domain/incapacidades';
import type { Remision, RemisionAtajo } from '../domain/remisiones';
import { getDiagnosticos } from './diagnosticos';
import { getEvoluciones } from './evoluciones';
import { getIncapacidades } from './incapacidades';
import { getRemisiones } from './remisiones';
import { resolveHallazgos, type HallazgosDoc } from './hallazgos';
import { getSignosVitales, type SignosHistorialItem, type SignosVitalesToma } from './signos-vitales';
import { ATENCION_FORM_SELECT, atencionFormFromRecord, type AtencionForm } from '../domain/atencion-form';
import {
  PARSE_ANTECEDENTES,
  getAntecedentes,
  type AntecedenteKind,
  type AntecedentesFamiliaresDoc,
  type AntecedentesGinecobstetricosDoc,
  type AntecedentesPersonalesDoc,
} from './antecedentes';

import { attendBlocker, editBlocker } from './attend-blocker';

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
  revisionSistemas: HallazgosDoc;
  examenFisico: HallazgosDoc;
  diagnosticos: DiagnosticoAtencion[];
  remisiones: Remision[];
  remisionesHistorial: Remision[];
  remisionAtajos: RemisionAtajo[];
  evoluciones: Evolucion[];
  /** Evoluciones del docente en otras atenciones, de la más reciente a la más antigua. */
  evolucionesHistorial: Evolucion[];
  incapacidades: Incapacidad[];
  /** Incapacidades del docente en otras atenciones, de la más reciente a la más antigua. */
  incapacidadesHistorial: Incapacidad[];
  /** Días de incapacidad acumulados del docente, incluidas las de esta atención. */
  incapacidadDiasAcumulados: number;
  mujer: boolean;
  signosVitales: SignosVitalesToma;
  /** Tomas de las demás atenciones del docente, de la más reciente a la más antigua. */
  signosHistorial: SignosHistorialItem[];
  /** Solo para docentes mujeres. */
  antecedentesGinecobstetricos: AntecedentesGinecobstetricosDoc | null;
  /** La atención finalizada muestra la copia guardada al cerrarla, no los antecedentes actuales. */
  antecedentesDeEstaAtencion: boolean;
  /** Puede editar al docente, diligenciar y finalizar la atención. */
  canAttend: boolean;
  canEdit: boolean;
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
        select: {
          ...ATENCION_FORM_SELECT,
          antecedentesPersonales: true,
          antecedentesFamiliares: true,
          antecedentesGineco: true,
        },
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
  const mujer = esMujer(cita.paciente.sexo);
  const [
    antecedentesPersonales,
    antecedentesFamiliares,
    antecedentesGinecobstetricos,
    signos,
    revisionSistemas,
    examenFisico,
    diagnosticos,
    remisiones,
    evoluciones,
    incapacidades,
  ] = await Promise.all([
    load('personales', cita.atencion?.antecedentesPersonales),
    load('familiares', cita.atencion?.antecedentesFamiliares),
    mujer ? load('ginecobstetricos', cita.atencion?.antecedentesGineco) : null,
    getSignosVitales(cita.id, cita.usuarioId),
    resolveHallazgos(prisma, 'revision-sistemas', cita.id, cita.usuarioId),
    resolveHallazgos(prisma, 'examen-fisico', cita.id, cita.usuarioId),
    getDiagnosticos(cita.id),
    getRemisiones(cita.id, cita.usuarioId),
    getEvoluciones(cita.id, cita.usuarioId),
    getIncapacidades(cita.id, cita.usuarioId),
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
      // Edad el día de la atención (la misma al volver a verla años después); la guardada solo sin fecha de nacimiento.
      edad: edadPaciente(
        { fechaNacimiento: fechaDb(paciente.fechaNacimiento), edad: paciente.edad },
        fechaBogota(cita.inicioProgramado),
      ),
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
    form: atencionFormFromRecord(cita.atencion),
    antecedentesPersonales,
    antecedentesFamiliares,
    antecedentesGinecobstetricos,
    revisionSistemas,
    examenFisico,
    diagnosticos,
    remisiones: remisiones.remisiones,
    remisionesHistorial: remisiones.historial,
    remisionAtajos: remisiones.atajos,
    evoluciones: evoluciones.evoluciones,
    evolucionesHistorial: evoluciones.historial,
    incapacidades: incapacidades.incapacidades,
    incapacidadesHistorial: incapacidades.historial,
    incapacidadDiasAcumulados: incapacidades.diasAcumulados,
    mujer,
    signosVitales: signos.toma,
    signosHistorial: signos.historial,
    antecedentesDeEstaAtencion: snapshot,
    canAttend: hasAbility(auth, 'appointment.attend') && attendBlocker(cita, auth) === null,
    /** Puede modificarla: antes de finalizar como atender; finalizada, solo el médico que la atendió. */
    canEdit: hasAbility(auth, 'appointment.attend') && editBlocker(cita, auth) === null,
  };
}
