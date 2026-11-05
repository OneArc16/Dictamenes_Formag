import { Prisma } from '@prisma/client';

import { parseAntecedentesFamiliares } from '@/features/atenciones/domain/antecedentes-familiares';
import { esMujer, parseAntecedentesGinecobstetricos } from '@/features/atenciones/domain/antecedentes-ginecobstetricos';
import { parseAntecedentesPersonales } from '@/features/atenciones/domain/antecedentes-personales';
import {
  ATENCION_FORM_SELECT,
  atencionFormFromRecord,
  atencionPendientes,
  type AtencionForm,
} from '@/features/atenciones/domain/atencion-form';
import { SIGNO_SELECT, signosFromRecord, signosPendientes } from '@/features/atenciones/domain/signos-vitales';
import { datosRegistroActuales } from '@/features/atenciones/application/datos-registro';
import { resolveHallazgos } from '@/features/atenciones/application/hallazgos';
import { ReceptionError } from '@/features/reception/application/errors';
import { markAppointmentAttendedInTransaction } from '@/features/reception/application/reception-service';
import { hasAbility, type AuthorizationContext } from '@/lib/auth/authorization';

import { attendBlocker, editBlocker } from './attend-blocker';
import { abrirCasosJuntaPendientes } from './remisiones';
import { prisma } from '@/lib/prisma';

/** Origen con el que el módulo de Atenciones registra el encuentro clínico de la cita. */
export const ATENCIONES_ENCOUNTER_SOURCE = 'ATENCIONES';

export { attendBlocker, editBlocker } from './attend-blocker';

export async function attendAppointment(auth: AuthorizationContext, appointmentId: number) {
  return prisma.$transaction(
    async (tx) => {
      const cita = await tx.cita.findUnique({
        where: { id: appointmentId },
        select: {
          estado: true,
          activadaAt: true,
          medicoId: true,
          usuarioId: true,
          paciente: { select: { sexo: true } },
          atencion: { select: ATENCION_FORM_SELECT },
          signosVitales: { select: SIGNO_SELECT },
          _count: { select: { diagnosticos: true } },
        },
      });
      const blocker = attendBlocker(cita, auth);
      if (blocker || !cita)
        throw new ReceptionError('INVALID_TRANSITION', blocker ?? 'La cita no existe.', cita ? 409 : 404);
      const pendientes = [
        ...atencionPendientes(atencionFormFromRecord(cita.atencion)),
        ...signosPendientes(signosFromRecord(cita.signosVitales)),
        ...(cita._count.diagnosticos === 0 ? [{ label: 'Diagnóstico principal' }] : []),
      ];
      if (pendientes.length > 0) {
        throw new ReceptionError(
          'ATENCION_INCOMPLETA',
          `Completa antes de finalizar: ${pendientes.map((item) => item.label).join(', ')}.`,
          422,
        );
      }
      // La historia de esta atención conserva los antecedentes tal como estaban al finalizarla.
      const mujer = esMujer(cita.paciente.sexo);
      const [personales, familiares, gineco] = await Promise.all([
        tx.antecedentesPersonales.findUnique({ where: { usuarioId: cita.usuarioId }, select: { datos: true } }),
        tx.antecedentesFamiliares.findUnique({ where: { usuarioId: cita.usuarioId }, select: { datos: true } }),
        mujer
          ? tx.antecedentesGinecobstetricos.findUnique({
              where: { usuarioId: cita.usuarioId },
              select: { datos: true },
            })
          : null,
      ]);
      await tx.atencion.update({
        where: { citaId: appointmentId },
        data: {
          antecedentesPersonales: parseAntecedentesPersonales(personales?.datos) as unknown as Prisma.InputJsonValue,
          antecedentesFamiliares: parseAntecedentesFamiliares(familiares?.datos) as unknown as Prisma.InputJsonValue,
          // Si no se tocó la revisión, queda registrada la precargada (heredada o normal).
          revisionSistemas: (await resolveHallazgos(tx, 'revision-sistemas', appointmentId, cita.usuarioId))
            .datos as unknown as Prisma.InputJsonValue,
          examenFisico: (await resolveHallazgos(tx, 'examen-fisico', appointmentId, cita.usuarioId))
            .datos as unknown as Prisma.InputJsonValue,
          antecedentesGineco: mujer
            ? (parseAntecedentesGinecobstetricos(gineco?.datos) as unknown as Prisma.InputJsonValue)
            : Prisma.DbNull,
          // Paciente, médico y sede tal como estaban al firmar; las ediciones posteriores no la cambian.
          datosRegistro: (await datosRegistroActuales(tx, appointmentId)) as unknown as Prisma.InputJsonValue,
          updatedBy: auth.empleadoId,
        },
      });
      const attended = await markAppointmentAttendedInTransaction(tx, auth, appointmentId, {
        source: ATENCIONES_ENCOUNTER_SOURCE,
        id: `cita-${appointmentId}`,
        occurredAt: new Date(),
      });
      // Junta remissions open their Dictamen case only now, so mistakes made during the attention can be undone.
      const juntas = await abrirCasosJuntaPendientes(tx, auth, appointmentId, cita.usuarioId);
      return { ...attended, casosDictamen: juntas.casos, avisos: juntas.avisos };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function saveAtencion(auth: AuthorizationContext, appointmentId: number, patch: Partial<AtencionForm>) {
  if (!hasAbility(auth, 'appointment.attend')) {
    throw new ReceptionError('FORBIDDEN', 'No tienes permiso clínico para atender citas.', 403);
  }
  return prisma.$transaction(async (tx) => {
    const cita = await tx.cita.findUnique({
      where: { id: appointmentId },
      select: { estado: true, activadaAt: true, medicoId: true },
    });
    const blocker = editBlocker(cita, auth);
    if (blocker) throw new ReceptionError('INVALID_TRANSITION', blocker, cita ? 409 : 404);
    const saved = await tx.atencion.upsert({
      where: { citaId: appointmentId },
      create: { citaId: appointmentId, ...patch, createdBy: auth.empleadoId, updatedBy: auth.empleadoId },
      update: { ...patch, updatedBy: auth.empleadoId },
      select: { ...ATENCION_FORM_SELECT, updatedAt: true },
    });
    return { ...atencionFormFromRecord(saved), updatedAt: saved.updatedAt.toISOString() };
  });
}
