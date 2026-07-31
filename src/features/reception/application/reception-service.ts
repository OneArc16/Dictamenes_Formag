import { Prisma, type EstadoCita, type MedioSolicitudCita } from '@prisma/client';

import { dateInTimeZone } from '@/features/agenda/domain/date-time';
import { employeeFullName } from '@/features/agenda/infrastructure/schedulable-doctors';
import { hasAbility, type AuthorizationContext } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';

import type { ScheduleAppointmentCommand } from '../domain/schemas';
import { ReceptionError } from './errors';

const BOGOTA = 'America/Bogota';

export function patientProjection(patient: {
  id: number; identificacion: string; tipoIdentificacion: string; primerNombre: string;
  segundoNombre: string | null; primerApellido: string; segundoApellido: string | null;
  fechaNacimiento: Date | null; sexo: string; celular: string | null; telefono: string | null;
  email: string | null; direccion: string | null; contactVersion: number;
  eps: { nombreEntidad: string } | null; municipio: { nombre: string } | null;
}) {
  const fullName = [patient.primerNombre, patient.segundoNombre, patient.primerApellido, patient.segundoApellido]
    .filter(Boolean).join(' ');
  const birth = patient.fechaNacimiento ? dateInTimeZone(patient.fechaNacimiento, BOGOTA) : null;
  const age = birth ? Math.floor((Date.now() - patient.fechaNacimiento!.getTime()) / 31_556_952_000) : null;
  return {
    id: patient.id, documentNumber: patient.identificacion, documentType: patient.tipoIdentificacion,
    fullName, birthDate: birth, age, sex: patient.sexo, eps: patient.eps?.nombreEntidad ?? null,
    municipality: patient.municipio?.nombre ?? null, celular: patient.celular, telefono: patient.telefono,
    email: patient.email, direccion: patient.direccion, contactVersion: patient.contactVersion,
  };
}

const patientInclude = {
  eps: { select: { nombreEntidad: true } },
  municipio: { select: { nombre: true } },
} as const;

export async function searchPatient(documentNumber: string, documentType?: string) {
  const normalized = documentNumber.trim();
  const matches = await prisma.usuario.findMany({
    where: { identificacion: normalized, ...(documentType ? { tipoIdentificacion: documentType } : {}) },
    include: patientInclude,
    take: 3,
  });
  if (!documentType && matches.length > 1) {
    return { kind: 'ambiguous' as const, documentTypes: matches.map((patient) => patient.tipoIdentificacion) };
  }
  return { kind: 'result' as const, patient: matches[0] ? patientProjection(matches[0]) : null };
}

export async function getPatient(patientId: number) {
  const patient = await prisma.usuario.findUnique({ where: { id: patientId }, include: patientInclude });
  if (!patient) throw new ReceptionError('PATIENT_NOT_FOUND', 'El paciente ya no existe.', 404);
  return patientProjection(patient);
}

export async function updatePatientContact(
  patientId: number,
  input: { expectedContactVersion: number; celular?: string | null; telefono?: string | null; email?: string | null; direccion?: string | null },
) {
  const existing = await prisma.usuario.findUnique({ where: { id: patientId }, select: { id: true } });
  if (!existing) throw new ReceptionError('PATIENT_NOT_FOUND', 'El paciente ya no existe.', 404);
  const result = await prisma.usuario.updateMany({
    where: { id: patientId, contactVersion: input.expectedContactVersion },
    data: {
      ...(input.celular !== undefined ? { celular: input.celular } : {}),
      ...(input.telefono !== undefined ? { telefono: input.telefono } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.direccion !== undefined ? { direccion: input.direccion } : {}),
    },
  });
  if (result.count !== 1) throw new ReceptionError('STALE_CONTACT_VERSION', 'Los datos de contacto cambiaron. Recarga el paciente antes de guardar.', 409);
  return getPatient(patientId);
}

export async function receptionContext(auth: AuthorizationContext) {
  const employee = await prisma.empleado.findUnique({ where: { id: auth.empleadoId }, select: { idSede: true } });
  const canSelectSite = hasAbility(auth, 'reception.site.select');
  const sites = await prisma.sede.findMany({
    where: canSelectSite ? { estado: 1 } : { id: employee?.idSede ?? -1, estado: 1 },
    select: { id: true, nombre: true }, orderBy: { nombre: 'asc' },
  });
  return { assignedSiteId: employee?.idSede ?? null, canSelectSite, sites };
}

export async function assertReceptionSite(auth: AuthorizationContext, siteId: number) {
  const employee = await prisma.empleado.findUnique({ where: { id: auth.empleadoId }, select: { idSede: true } });
  if (!hasAbility(auth, 'reception.site.select') && employee?.idSede !== siteId) {
    throw new ReceptionError('SITE_FORBIDDEN', 'No tienes permiso para operar en esta sede.', 403);
  }
  const site = await prisma.sede.findFirst({ where: { id: siteId, estado: 1 }, select: { id: true } });
  if (!site) throw new ReceptionError('SITE_FORBIDDEN', 'La sede seleccionada no está activa.', 403);
}

export async function availableSpecialties(auth: AuthorizationContext, siteId: number) {
  await assertReceptionSite(auth, siteId);
  const rows = await prisma.especialidadMedica.findMany({
    where: { estado: true, empleados: { some: { empleado: { activo: true, idSede: siteId, cuposMedicos: { some: { estado: 'DISPONIBLE', inicio: { gt: new Date() } } } } } } },
    select: { id: true, nombre: true }, orderBy: { nombre: 'asc' },
  });
  return rows;
}

export async function availableDates(auth: AuthorizationContext, siteId: number, specialtyId: number, from: Date, to: Date) {
  await assertReceptionSite(auth, siteId);
  const slots = await prisma.cupoMedico.findMany({
    where: { sedeId: siteId, estado: 'DISPONIBLE', inicio: { gt: new Date(), gte: from, lt: to }, medico: { activo: true, especialidades: { some: { especialidadId: specialtyId, especialidad: { estado: true } } } } },
    select: { inicio: true }, distinct: ['inicio'], orderBy: { inicio: 'asc' }, take: 1000,
  });
  return [...new Set(slots.map((slot) => dateInTimeZone(slot.inicio, BOGOTA)))];
}

export async function availableDoctors(auth: AuthorizationContext, siteId: number, specialtyId: number, date: string) {
  await assertReceptionSite(auth, siteId);
  const slots = await prisma.cupoMedico.findMany({
    where: { sedeId: siteId, estado: 'DISPONIBLE', inicio: { gt: new Date() }, medico: { activo: true, especialidades: { some: { especialidadId: specialtyId } } } },
    select: { medico: { select: { id: true, primerNombre: true, segundoNombre: true, primerApellido: true, segundoApellido: true } }, inicio: true }, take: 1000,
  });
  const doctors = new Map<number, { id: number; name: string }>();
  for (const slot of slots) if (dateInTimeZone(slot.inicio, BOGOTA) === date) doctors.set(slot.medico.id, { id: slot.medico.id, name: employeeFullName(slot.medico) });
  return [...doctors.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function availableSlots(auth: AuthorizationContext, siteId: number, specialtyId: number, doctorId: number, date: string) {
  await assertReceptionSite(auth, siteId);
  const slots = await prisma.cupoMedico.findMany({
    where: { sedeId: siteId, medicoId: doctorId, estado: 'DISPONIBLE', inicio: { gt: new Date() }, medico: { especialidades: { some: { especialidadId: specialtyId } } } },
    select: { id: true, inicio: true, fin: true }, orderBy: { inicio: 'asc' }, take: 100,
  });
  return slots.filter((slot) => dateInTimeZone(slot.inicio, BOGOTA) === date).map((slot) => ({ id: slot.id, inicio: slot.inicio.toISOString(), fin: slot.fin.toISOString() }));
}

async function slotCommandContext(tx: Prisma.TransactionClient, command: ScheduleAppointmentCommand, auth: AuthorizationContext) {
  const [patient, slot, modality] = await Promise.all([
    tx.usuario.findFirst({ where: { id: command.patientId, estado: 'ACTIVO' }, select: { id: true } }),
    tx.cupoMedico.findUnique({ where: { id: command.slotId }, include: { sede: { select: { nombre: true, estado: true } }, medico: { include: { especialidades: { where: { especialidadId: command.specialtyId }, include: { especialidad: true } } } } } }),
    tx.modalidadCita.findFirst({ where: { id: command.modalityId, estado: true } }),
  ]);
  if (!patient) throw new ReceptionError('PATIENT_NOT_FOUND', 'El paciente no está disponible para agendar.', 404);
  if (!slot || slot.estado !== 'DISPONIBLE' || slot.inicio <= new Date()) throw new ReceptionError('SLOT_NOT_AVAILABLE', 'El cupo ya no está disponible.', 409);
  await assertReceptionSite(auth, slot.sedeId);
  const specialty = slot.medico.especialidades[0]?.especialidad;
  if (!slot.sede.estado || !slot.medico.activo || !specialty?.estado) throw new ReceptionError('SLOT_NOT_AVAILABLE', 'El cupo ya no está disponible.', 409);
  if (!modality) throw new ReceptionError('INVALID_MODALITY', 'La modalidad ya no está activa.', 422);
  return { slot, modality, specialty };
}

async function assertAppointmentWindow(
  tx: Prisma.TransactionClient,
  appointment: { sedeId: number; inicioProgramado: Date },
  action: 'cancel' | 'reschedule',
) {
  const policy = await tx.receptionSitePolicy.findFirst({ where: { sedeId: appointment.sedeId, active: true }, select: { id: true, version: true, cancelCutoffMinutes: true, rescheduleCutoffMinutes: true } });
  if (!policy) throw new ReceptionError('SITE_POLICY_UNAVAILABLE', 'La sede no tiene una política operativa activa.', 503);
  const cutoffMinutes = action === 'cancel' ? policy.cancelCutoffMinutes : policy.rescheduleCutoffMinutes;
  const deadline = new Date(appointment.inicioProgramado.getTime() - cutoffMinutes * 60_000);
  if (new Date() >= deadline) throw new ReceptionError('APPOINTMENT_WINDOW_CLOSED', 'La ventana para esta acción ya cerró.', 409);
  return policy;
}

async function assertAppointmentReason(
  tx: Prisma.TransactionClient,
  type: 'CANCELACION' | 'REPROGRAMACION',
  code: string,
) {
  const reason = await tx.motivoCambioCita.findFirst({ where: { tipo: type, codigo: code, estado: true }, select: { codigo: true, nombre: true } });
  if (!reason) throw new ReceptionError('INVALID_APPOINTMENT_REASON', 'El motivo seleccionado ya no está activo.', 422);
  return reason;
}

export async function scheduleAppointment(auth: AuthorizationContext, command: ScheduleAppointmentCommand) {
  return prisma.$transaction(async (tx) => {
    const { slot, modality, specialty } = await slotCommandContext(tx, command, auth);
    const claim = await tx.cupoMedico.updateMany({ where: { id: slot.id, estado: 'DISPONIBLE' }, data: { estado: 'ASIGNADO' } });
    if (claim.count !== 1) throw new ReceptionError('SLOT_NOT_AVAILABLE', 'El cupo acaba de ser asignado.', 409);
    const doctorName = employeeFullName(slot.medico);
    const appointment = await tx.cita.create({ data: {
      usuarioId: command.patientId, cupoMedicoId: slot.id, sedeId: slot.sedeId, medicoId: slot.medicoId,
      especialidadId: specialty.id, modalidadId: modality.id, inicioProgramado: slot.inicio, finProgramado: slot.fin,
      sedeNombre: slot.sede.nombre, medicoNombre: doctorName, especialidadNombre: specialty.nombre, modalidadNombre: modality.nombre,
      medioSolicitud: command.requestMedium as MedioSolicitudCita, createdBy: auth.empleadoId, updatedBy: auth.empleadoId,
    } });
    await tx.citaHistorial.create({ data: { citaId: appointment.id, usuarioId: appointment.usuarioId, cupoMedicoId: slot.id, tipoEvento: 'CREADA', estadoNuevo: 'ASIGNADA', estadoCupoAnterior: 'DISPONIBLE', estadoCupoNuevo: 'ASIGNADO', actorEmpleadoId: auth.empleadoId } });
    return appointment;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function appointmentHistory(patientId: number, statuses: EstadoCita[] = []) {
  return prisma.cita.findMany({
    where: { usuarioId: patientId, ...(statuses.length ? { estado: { in: statuses } } : {}) },
    orderBy: [{ inicioProgramado: 'desc' }, { id: 'desc' }], take: 50,
    select: { id: true, estado: true, inicioProgramado: true, finProgramado: true, sedeNombre: true, medicoNombre: true, especialidadId: true, especialidadNombre: true, modalidadNombre: true, medioSolicitud: true, activadaAt: true, lockVersion: true },
  });
}

export async function activateAppointment(auth: AuthorizationContext, appointmentId: number, expectedVersion: number) {
  return prisma.$transaction(async (tx) => {
    const appointment = await tx.cita.findUnique({ where: { id: appointmentId } });
    if (!appointment || appointment.estado !== 'ASIGNADA' || appointment.inicioProgramado <= new Date()) throw new ReceptionError('INVALID_TRANSITION', 'La cita no se puede activar.', 409);
    await assertReceptionSite(auth, appointment.sedeId);
    const updated = await tx.cita.updateMany({ where: { id: appointmentId, lockVersion: expectedVersion, activadaAt: null, estado: 'ASIGNADA' }, data: { activadaAt: new Date(), activadaBy: auth.empleadoId, updatedBy: auth.empleadoId, lockVersion: { increment: 1 } } });
    if (!updated.count) throw new ReceptionError('STALE_APPOINTMENT_VERSION', 'La cita cambió. Actualiza el historial.', 409);
    await tx.citaHistorial.create({ data: { citaId: appointment.id, usuarioId: appointment.usuarioId, cupoMedicoId: appointment.cupoMedicoId, tipoEvento: 'ACTIVADA', actorEmpleadoId: auth.empleadoId } });
    return { id: appointment.id, lockVersion: expectedVersion + 1 };
  });
}

export async function cancelAppointment(auth: AuthorizationContext, appointmentId: number, expectedVersion: number, reasonCode: string) {
  return prisma.$transaction(async (tx) => {
    const appointment = await tx.cita.findUnique({ where: { id: appointmentId } });
    if (!appointment || appointment.estado !== 'ASIGNADA' || appointment.inicioProgramado <= new Date()) throw new ReceptionError('INVALID_TRANSITION', 'La cita no se puede cancelar.', 409);
    const policy = await assertAppointmentWindow(tx, appointment, 'cancel');
    const reason = await assertAppointmentReason(tx, 'CANCELACION', reasonCode);
    await assertReceptionSite(auth, appointment.sedeId);
    const updated = await tx.cita.updateMany({ where: { id: appointmentId, lockVersion: expectedVersion, estado: 'ASIGNADA' }, data: { estado: 'CANCELADA', updatedBy: auth.empleadoId, lockVersion: { increment: 1 } } });
    if (!updated.count) throw new ReceptionError('STALE_APPOINTMENT_VERSION', 'La cita cambió. Actualiza el historial.', 409);
    await tx.cupoMedico.update({ where: { id: appointment.cupoMedicoId }, data: { estado: 'DISPONIBLE' } });
    await tx.citaHistorial.create({ data: { citaId: appointment.id, usuarioId: appointment.usuarioId, cupoMedicoId: appointment.cupoMedicoId, tipoEvento: 'CANCELADA', estadoAnterior: 'ASIGNADA', estadoNuevo: 'CANCELADA', estadoCupoAnterior: 'ASIGNADO', estadoCupoNuevo: 'DISPONIBLE', actorEmpleadoId: auth.empleadoId, metadata: { reasonCode, reasonLabel: reason.nombre, policyId: policy.id, policyVersion: policy.version } } });
    return { id: appointment.id, lockVersion: expectedVersion + 1 };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function rescheduleAppointment(auth: AuthorizationContext, appointmentId: number, expectedVersion: number, newSlotId: number, reasonCode: string) {
  return prisma.$transaction(async (tx) => {
    const original = await tx.cita.findUnique({ where: { id: appointmentId } });
    if (!original || original.estado !== 'ASIGNADA' || original.inicioProgramado <= new Date()) throw new ReceptionError('INVALID_TRANSITION', 'La cita no se puede reprogramar.', 409);
    const policy = await assertAppointmentWindow(tx, original, 'reschedule');
    const reason = await assertAppointmentReason(tx, 'REPROGRAMACION', reasonCode);
    await assertReceptionSite(auth, original.sedeId);
    const replacementSlot = await tx.cupoMedico.findUnique({ where: { id: newSlotId }, include: { sede: true, medico: { include: { especialidades: { where: { especialidadId: original.especialidadId }, include: { especialidad: true } } } } } });
    if (!replacementSlot || replacementSlot.estado !== 'DISPONIBLE' || replacementSlot.inicio <= new Date()) throw new ReceptionError('SLOT_NOT_AVAILABLE', 'El nuevo cupo ya no está disponible.', 409);
    await assertReceptionSite(auth, replacementSlot.sedeId);
    const specialty = replacementSlot.medico.especialidades[0]?.especialidad;
    if (!replacementSlot.sede.estado || !replacementSlot.medico.activo || !specialty?.estado) throw new ReceptionError('SLOT_NOT_AVAILABLE', 'El nuevo cupo ya no está disponible.', 409);
    const claim = await tx.cupoMedico.updateMany({ where: { id: newSlotId, estado: 'DISPONIBLE' }, data: { estado: 'ASIGNADO' } });
    if (!claim.count) throw new ReceptionError('SLOT_NOT_AVAILABLE', 'El nuevo cupo acaba de ser asignado.', 409);
    const changed = await tx.cita.updateMany({ where: { id: original.id, lockVersion: expectedVersion, estado: 'ASIGNADA' }, data: { estado: 'REPROGRAMADA', updatedBy: auth.empleadoId, lockVersion: { increment: 1 } } });
    if (!changed.count) throw new ReceptionError('STALE_APPOINTMENT_VERSION', 'La cita cambió. Actualiza el historial.', 409);
    await tx.cupoMedico.update({ where: { id: original.cupoMedicoId }, data: { estado: 'DISPONIBLE' } });
    const newAppointment = await tx.cita.create({ data: {
      usuarioId: original.usuarioId, cupoMedicoId: replacementSlot.id, sedeId: replacementSlot.sedeId, medicoId: replacementSlot.medicoId,
      especialidadId: original.especialidadId, modalidadId: original.modalidadId, inicioProgramado: replacementSlot.inicio, finProgramado: replacementSlot.fin,
      sedeNombre: replacementSlot.sede.nombre, medicoNombre: employeeFullName(replacementSlot.medico), especialidadNombre: specialty.nombre, modalidadNombre: original.modalidadNombre,
      medioSolicitud: original.medioSolicitud, citaOrigenId: original.id, createdBy: auth.empleadoId, updatedBy: auth.empleadoId,
    } });
    await tx.citaHistorial.createMany({ data: [
      { citaId: original.id, usuarioId: original.usuarioId, cupoMedicoId: original.cupoMedicoId, tipoEvento: 'REPROGRAMADA', estadoAnterior: 'ASIGNADA', estadoNuevo: 'REPROGRAMADA', estadoCupoAnterior: 'ASIGNADO', estadoCupoNuevo: 'DISPONIBLE', actorEmpleadoId: auth.empleadoId, metadata: { reasonCode, reasonLabel: reason.nombre, newAppointmentId: newAppointment.id, policyId: policy.id, policyVersion: policy.version } },
      { citaId: newAppointment.id, usuarioId: newAppointment.usuarioId, cupoMedicoId: newAppointment.cupoMedicoId, tipoEvento: 'CREADA', estadoNuevo: 'ASIGNADA', estadoCupoAnterior: 'DISPONIBLE', estadoCupoNuevo: 'ASIGNADO', actorEmpleadoId: auth.empleadoId, metadata: { rescheduledFrom: original.id } },
    ] });
    return { id: newAppointment.id, originalId: original.id, lockVersion: newAppointment.lockVersion };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

/** Invoked by an authenticated clinical workflow, never exposed as a reception action. */
export async function markAppointmentAttended(
  auth: AuthorizationContext,
  appointmentId: number,
  encounter: { source: string; id: string; occurredAt: Date },
) {
  if (!hasAbility(auth, 'appointment.attend')) throw new ReceptionError('FORBIDDEN', 'No tienes permiso clínico para atender citas.', 403);
  if (encounter.occurredAt > new Date()) throw new ReceptionError('INVALID_CLINICAL_ENCOUNTER', 'El encuentro clínico no puede estar en el futuro.', 422);
  return prisma.$transaction(async (tx) => {
    const appointment = await tx.cita.findUnique({ where: { id: appointmentId } });
    if (!appointment || appointment.estado !== 'ASIGNADA') throw new ReceptionError('INVALID_TRANSITION', 'La cita no se puede marcar como atendida.', 409);
    const duplicate = await tx.cita.findFirst({ where: { clinicalEncounterSource: encounter.source, clinicalEncounterId: encounter.id } });
    if (duplicate) {
      if (duplicate.id === appointmentId) return { id: appointmentId, lockVersion: duplicate.lockVersion, replayed: true };
      throw new ReceptionError('CLINICAL_ENCOUNTER_ALREADY_LINKED', 'El encuentro ya está asociado a otra cita.', 409);
    }
    const updated = await tx.cita.updateMany({ where: { id: appointmentId, estado: 'ASIGNADA' }, data: { estado: 'ATENDIDA', clinicalEncounterSource: encounter.source, clinicalEncounterId: encounter.id, updatedBy: auth.empleadoId, lockVersion: { increment: 1 } } });
    if (!updated.count) throw new ReceptionError('INVALID_TRANSITION', 'La cita cambió durante la actualización.', 409);
    await tx.citaHistorial.create({ data: { citaId: appointment.id, usuarioId: appointment.usuarioId, cupoMedicoId: appointment.cupoMedicoId, tipoEvento: 'ATENDIDA', estadoAnterior: 'ASIGNADA', estadoNuevo: 'ATENDIDA', estadoCupoAnterior: 'ASIGNADO', estadoCupoNuevo: 'ASIGNADO', actorEmpleadoId: auth.empleadoId, metadata: { clinicalEncounterSource: encounter.source, clinicalEncounterId: encounter.id } } });
    return { id: appointmentId, lockVersion: appointment.lockVersion + 1, replayed: false };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
