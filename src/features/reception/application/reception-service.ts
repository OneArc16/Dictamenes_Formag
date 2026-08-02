import { Prisma, type EstadoCita, type MedioSolicitudCita } from '@prisma/client';

import { dateInTimeZone } from '@/features/agenda/domain/date-time';
import { employeeFullName } from '@/features/agenda/infrastructure/schedulable-doctors';
import { hasAbility, type AuthorizationContext } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';

import type { PatientProfileCommand, ScheduleAppointmentCommand } from '../domain/schemas';
import { patientSexFromDatabase, patientSexToDatabase } from '../domain/patient-profile';
import { ReceptionError } from './errors';

const BOGOTA = 'America/Bogota';

export function patientProjection(patient: {
  id: number; identificacion: string; tipoIdentificacion: string; primerNombre: string;
  segundoNombre: string | null; primerApellido: string; segundoApellido: string | null;
  fechaNacimiento: Date | null; sexo: string; celular: string | null; telefono: string | null;
  email: string | null; direccion: string | null; profileVersion: number; codigoEps: string;
  codigoDepartamento: string | null; codigoMunicipio: string | null;
  barrio: string | null; zonaResidencia: string; residenciaPais: string; categoria: string | null;
  cargoDocenteId: number | null; escolaridad: string | null; fechaVinculacion: Date | null;
  secretariaId: number | null; institucionEducativaId: number | null; formaVinculacion: string;
  estadoCivil: string | null; gradoEscalafon: string; nivelEscalafon: string;
  eps: { nombreEntidad: string } | null; municipio: { nombre: string; codigoDepartamento: string } | null;
  departamento: { nombre: string } | null;
  barrioRef: { nombre: string } | null; paisResidencia: { nombre: string } | null;
  cargoDocente: { nombre: string; codigo: string | null } | null; secretariaRef: { nombre: string } | null;
  institucionEducativaRef: { nombre: string } | null;
}) {
  const fullName = [patient.primerNombre, patient.segundoNombre, patient.primerApellido, patient.segundoApellido]
    .filter(Boolean).join(' ');
  const birth = patient.fechaNacimiento ? dateInTimeZone(patient.fechaNacimiento, BOGOTA) : null;
  const age = birth ? Math.floor((Date.now() - patient.fechaNacimiento!.getTime()) / 31_556_952_000) : null;
  return {
    id: patient.id, documentNumber: patient.identificacion, documentType: patient.tipoIdentificacion,
    fullName, firstName: patient.primerNombre, middleName: patient.segundoNombre,
    lastName: patient.primerApellido, secondLastName: patient.segundoApellido,
    birthDate: birth, age, sex: patientSexFromDatabase(patient.sexo), epsCode: patient.codigoEps,
    eps: patient.eps?.nombreEntidad ?? null, departmentCode: patient.codigoDepartamento ?? patient.municipio?.codigoDepartamento ?? null,
    department: patient.departamento?.nombre ?? null, municipalityCode: patient.codigoMunicipio,
    municipality: patient.municipio?.nombre ?? null, neighborhood: patient.barrioRef?.nombre ?? patient.barrio,
    zone: patient.zonaResidencia.trim().toUpperCase() === 'R' ? 'R' : 'U', countryCode: patient.residenciaPais,
    country: patient.paisResidencia?.nombre ?? null, category: patient.categoria,
    teacherPositionId: patient.cargoDocenteId, teacherPosition: patient.cargoDocente?.nombre ?? null,
    teacherPositionCode: patient.cargoDocente?.codigo ?? null,
    education: patient.escolaridad, employmentStartDate: patient.fechaVinculacion ? dateInTimeZone(patient.fechaVinculacion, BOGOTA) : null,
    secretariatId: patient.secretariaId, secretariat: patient.secretariaRef?.nombre ?? null,
    institutionId: patient.institucionEducativaId, institution: patient.institucionEducativaRef?.nombre ?? null,
    employmentType: patient.formaVinculacion, civilStatus: patient.estadoCivil,
    salaryGrade: patient.gradoEscalafon, salaryLevel: patient.nivelEscalafon === '0' ? 'NO_APLICA' : patient.nivelEscalafon,
    celular: patient.celular, telefono: patient.telefono,
    email: patient.email, direccion: patient.direccion, profileVersion: patient.profileVersion,
    contactVersion: patient.profileVersion,
  };
}

const patientInclude = {
  eps: { select: { nombreEntidad: true } },
  departamento: { select: { nombre: true } },
  municipio: { select: { nombre: true, codigoDepartamento: true } },
  barrioRef: { select: { nombre: true } },
  paisResidencia: { select: { nombre: true } },
  cargoDocente: { select: { nombre: true, codigo: true } },
  secretariaRef: { select: { nombre: true } },
  institucionEducativaRef: { select: { nombre: true } },
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

export async function getPatient(patientId: number, db: Prisma.TransactionClient | typeof prisma = prisma) {
  const patient = await db.usuario.findUnique({ where: { id: patientId }, include: patientInclude });
  if (!patient) throw new ReceptionError('PATIENT_NOT_FOUND', 'El paciente ya no existe.', 404);
  return patientProjection(patient);
}

export async function updatePatientContactInTransaction(
  tx: Prisma.TransactionClient,
  patientId: number,
  input: { expectedContactVersion: number; celular?: string | null; telefono?: string | null; email?: string | null; direccion?: string | null },
) {
  const existing = await tx.usuario.findUnique({ where: { id: patientId }, select: { id: true } });
  if (!existing) throw new ReceptionError('PATIENT_NOT_FOUND', 'El paciente ya no existe.', 404);
  const result = await tx.usuario.updateMany({
    where: { id: patientId, profileVersion: input.expectedContactVersion },
    data: {
      ...(input.celular !== undefined ? { celular: input.celular } : {}),
      ...(input.telefono !== undefined ? { telefono: input.telefono } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.direccion !== undefined ? { direccion: input.direccion } : {}),
    },
  });
  if (result.count !== 1) throw new ReceptionError('STALE_CONTACT_VERSION', 'Los datos de contacto cambiaron. Recarga el paciente antes de guardar.', 409);
  return getPatient(patientId, tx);
}

export async function updatePatientContact(
  patientId: number,
  input: { expectedContactVersion: number; celular?: string | null; telefono?: string | null; email?: string | null; direccion?: string | null },
) {
  return prisma.$transaction((tx) => updatePatientContactInTransaction(tx, patientId, input), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function updatePatientProfileInTransaction(
  tx: Prisma.TransactionClient,
  patientId: number,
  input: PatientProfileCommand,
) {
  const existing = await tx.usuario.findUnique({ where: { id: patientId }, select: { id: true } });
  if (!existing) throw new ReceptionError('PATIENT_NOT_FOUND', 'El paciente ya no existe.', 404);

  const [duplicate, eps, department, municipality, country, neighborhood, position, secretariat, institution] = await Promise.all([
    tx.usuario.findFirst({ where: { identificacion: input.documentNumber, tipoIdentificacion: input.documentType, id: { not: patientId } }, select: { id: true } }),
    tx.eps.findUnique({ where: { codigo: input.epsCode }, select: { codigo: true } }),
    input.departmentCode ? tx.departamento.findUnique({ where: { codigo: input.departmentCode }, select: { codigo: true } }) : Promise.resolve(null),
    input.municipalityCode ? tx.municipio.findUnique({ where: { codigo: input.municipalityCode }, select: { codigo: true, codigoDepartamento: true } }) : Promise.resolve(null),
    tx.pais.findUnique({ where: { codigo: input.countryCode }, select: { codigo: true } }),
    input.neighborhood && input.municipalityCode
      ? tx.barrio.findFirst({ where: { codigoMunicipio: input.municipalityCode, nombre: { equals: input.neighborhood, mode: 'insensitive' } }, select: { id: true, nombre: true } })
      : Promise.resolve(null),
    input.teacherPositionId ? tx.cargoDocente.findFirst({ where: { id: input.teacherPositionId, estado: true }, select: { id: true } }) : Promise.resolve(null),
    input.secretariatId ? tx.secretaria.findUnique({ where: { id: input.secretariatId }, select: { id: true } }) : Promise.resolve(null),
    input.institutionId ? tx.institucionEducativa.findUnique({ where: { id: input.institutionId }, select: { id: true, idSecretaria: true, idMunicipio: true } }) : Promise.resolve(null),
  ]);
  if (duplicate) throw new ReceptionError('PATIENT_DOCUMENT_CONFLICT', 'Ya existe otro paciente con este tipo y número de documento.', 409);
  if (!eps) throw new ReceptionError('PATIENT_EPS_INVALID', 'La EPS seleccionada no existe.', 422);
  if (input.departmentCode && !department) throw new ReceptionError('PATIENT_DEPARTMENT_INVALID', 'El departamento seleccionado no existe.', 422);
  if (input.municipalityCode && !municipality) throw new ReceptionError('PATIENT_MUNICIPALITY_INVALID', 'El municipio seleccionado no existe.', 422);
  if (municipality && input.departmentCode !== municipality.codigoDepartamento) throw new ReceptionError('PATIENT_LOCATION_MISMATCH', 'El municipio no pertenece al departamento seleccionado.', 422);
  if (!country) throw new ReceptionError('PATIENT_COUNTRY_INVALID', 'El país seleccionado no existe.', 422);
  if (input.neighborhood && !neighborhood) throw new ReceptionError('PATIENT_NEIGHBORHOOD_INVALID', 'El barrio no pertenece al municipio seleccionado.', 422);
  if (input.teacherPositionId && !position) throw new ReceptionError('PATIENT_POSITION_INVALID', 'El cargo seleccionado no existe o está inactivo.', 422);
  if (input.secretariatId && !secretariat) throw new ReceptionError('PATIENT_SECRETARIAT_INVALID', 'La secretaría seleccionada no existe.', 422);
  if (input.institutionId && !institution) throw new ReceptionError('PATIENT_INSTITUTION_INVALID', 'La institución seleccionada no existe.', 422);
  if (institution?.idSecretaria && String(institution.idSecretaria) !== String(input.secretariatId ?? '')) throw new ReceptionError('PATIENT_EMPLOYMENT_MISMATCH', 'La institución no pertenece a la secretaría seleccionada.', 422);
  if (institution?.idMunicipio && input.municipalityCode && institution.idMunicipio !== input.municipalityCode) throw new ReceptionError('PATIENT_EMPLOYMENT_LOCATION_MISMATCH', 'La institución no pertenece al municipio seleccionado.', 422);

  const birthDate = input.birthDate ? new Date(`${input.birthDate}T00:00:00.000Z`) : null;
  const employmentStartDate = input.employmentStartDate ? new Date(`${input.employmentStartDate}T00:00:00.000Z`) : null;
  const age = birthDate ? Math.max(0, Math.floor((Date.now() - birthDate.getTime()) / 31_556_952_000)) : null;
  try {
    const result = await tx.usuario.updateMany({
      where: { id: patientId, profileVersion: input.expectedProfileVersion },
      data: {
        identificacion: input.documentNumber,
        tipoIdentificacion: input.documentType,
        primerNombre: input.firstName.toLocaleUpperCase('es-CO'),
        segundoNombre: input.middleName?.toLocaleUpperCase('es-CO') ?? null,
        primerApellido: input.lastName.toLocaleUpperCase('es-CO'),
        segundoApellido: input.secondLastName?.toLocaleUpperCase('es-CO') ?? null,
        fechaNacimiento: birthDate,
        edad: age,
        unidadEdad: 'A',
        sexo: patientSexToDatabase(input.sex),
        codigoEps: input.epsCode,
        codigoDepartamento: input.departmentCode,
        codigoMunicipio: input.municipalityCode,
        barrio: neighborhood?.nombre ?? input.neighborhood,
        barrioId: neighborhood?.id ?? null,
        zonaResidencia: input.zone,
        residenciaPais: input.countryCode,
        categoria: input.category,
        celular: input.celular,
        telefono: input.telefono,
        email: input.email,
        direccion: input.direccion,
        cargoDocenteId: input.teacherPositionId,
        escolaridad: input.education,
        fechaVinculacion: employmentStartDate,
        secretariaId: input.secretariatId,
        institucionEducativaId: input.institutionId,
        formaVinculacion: input.employmentType.toLocaleUpperCase('es-CO'),
        estadoCivil: input.civilStatus,
        gradoEscalafon: input.salaryGrade.toLocaleUpperCase('es-CO'),
        nivelEscalafon: input.salaryLevel === 'NO_APLICA' ? '0' : input.salaryLevel,
      },
    });
    if (result.count !== 1) throw new ReceptionError('STALE_PROFILE_VERSION', 'Los datos del paciente cambiaron. Vuelve a buscarlo antes de guardar.', 409);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ReceptionError('PATIENT_DOCUMENT_CONFLICT', 'Ya existe otro paciente con este tipo y número de documento.', 409);
    }
    throw error;
  }
  return getPatient(patientId, tx);
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

export async function scheduleAppointmentInTransaction(tx: Prisma.TransactionClient, auth: AuthorizationContext, command: ScheduleAppointmentCommand) {
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
}

export async function scheduleAppointment(auth: AuthorizationContext, command: ScheduleAppointmentCommand) {
  return prisma.$transaction((tx) => scheduleAppointmentInTransaction(tx, auth, command), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

type AppointmentCursor = { inicioProgramado: string; id: number };
type MovementCursor = { createdAt: string; id: number };

function encodeCursor(cursor: AppointmentCursor | MovementCursor) {
  return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

function decodeCursor(value: string | null, kind: 'appointment' | 'movement'): AppointmentCursor | MovementCursor | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Record<string, unknown>;
    const dateField = kind === 'appointment' ? 'inicioProgramado' : 'createdAt';
    const timestamp = typeof parsed[dateField] === 'string' ? new Date(parsed[dateField]) : null;
    if (!timestamp || Number.isNaN(timestamp.getTime()) || !Number.isInteger(parsed.id) || Number(parsed.id) < 1) throw new Error('invalid cursor');
    return { [dateField]: timestamp.toISOString(), id: Number(parsed.id) } as AppointmentCursor | MovementCursor;
  } catch {
    throw new ReceptionError('INVALID_CURSOR', 'El cursor de paginación no es válido.', 422);
  }
}

export async function appointmentHistory(patientId: number, statuses: EstadoCita[] = [], pageSize = 20, cursor: string | null = null) {
  const decoded = decodeCursor(cursor, 'appointment') as AppointmentCursor | null;
  const rows = await prisma.cita.findMany({
    where: {
      usuarioId: patientId,
      ...(statuses.length ? { estado: { in: statuses } } : {}),
      ...(decoded ? { OR: [{ inicioProgramado: { lt: new Date(decoded.inicioProgramado) } }, { inicioProgramado: new Date(decoded.inicioProgramado), id: { lt: decoded.id } }] } : {}),
    },
    orderBy: [{ inicioProgramado: 'desc' }, { id: 'desc' }], take: pageSize + 1,
    select: { id: true, estado: true, inicioProgramado: true, finProgramado: true, sedeNombre: true, medicoNombre: true, especialidadId: true, especialidadNombre: true, modalidadNombre: true, medioSolicitud: true, activadaAt: true, lockVersion: true },
  });
  const items = rows.slice(0, pageSize);
  const last = items.at(-1);
  return { items, nextCursor: rows.length > pageSize && last ? encodeCursor({ inicioProgramado: last.inicioProgramado.toISOString(), id: last.id }) : null };
}

export async function appointmentMovements(appointmentId: number, pageSize = 20, cursor: string | null = null) {
  const decoded = decodeCursor(cursor, 'movement') as MovementCursor | null;
  const appointment = await prisma.cita.findUnique({ where: { id: appointmentId }, select: { id: true } });
  if (!appointment) throw new ReceptionError('APPOINTMENT_NOT_FOUND', 'La cita no existe.', 404);
  const rows = await prisma.citaHistorial.findMany({
    where: { citaId: appointmentId, ...(decoded ? { OR: [{ createdAt: { lt: new Date(decoded.createdAt) } }, { createdAt: new Date(decoded.createdAt), id: { lt: decoded.id } }] } : {}) },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: pageSize + 1,
    select: { id: true, tipoEvento: true, estadoAnterior: true, estadoNuevo: true, estadoCupoAnterior: true, estadoCupoNuevo: true, createdAt: true, metadata: true },
  });
  const items = rows.slice(0, pageSize);
  const last = items.at(-1);
  return { items, nextCursor: rows.length > pageSize && last ? encodeCursor({ createdAt: last.createdAt.toISOString(), id: last.id }) : null };
}

export async function activateAppointmentInTransaction(tx: Prisma.TransactionClient, auth: AuthorizationContext, appointmentId: number, expectedVersion: number) {
    const appointment = await tx.cita.findUnique({ where: { id: appointmentId } });
    if (!appointment || appointment.estado !== 'ASIGNADA' || appointment.inicioProgramado <= new Date()) throw new ReceptionError('INVALID_TRANSITION', 'La cita no se puede activar.', 409);
    await assertReceptionSite(auth, appointment.sedeId);
    const updated = await tx.cita.updateMany({ where: { id: appointmentId, lockVersion: expectedVersion, activadaAt: null, estado: 'ASIGNADA' }, data: { activadaAt: new Date(), activadaBy: auth.empleadoId, updatedBy: auth.empleadoId, lockVersion: { increment: 1 } } });
    if (!updated.count) throw new ReceptionError('STALE_APPOINTMENT_VERSION', 'La cita cambió. Actualiza el historial.', 409);
    await tx.citaHistorial.create({ data: { citaId: appointment.id, usuarioId: appointment.usuarioId, cupoMedicoId: appointment.cupoMedicoId, tipoEvento: 'ACTIVADA', actorEmpleadoId: auth.empleadoId } });
    return { id: appointment.id, lockVersion: expectedVersion + 1 };
}

export async function activateAppointment(auth: AuthorizationContext, appointmentId: number, expectedVersion: number) {
  return prisma.$transaction((tx) => activateAppointmentInTransaction(tx, auth, appointmentId, expectedVersion), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function cancelAppointmentInTransaction(tx: Prisma.TransactionClient, auth: AuthorizationContext, appointmentId: number, expectedVersion: number, reasonCode: string) {
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
}

export async function cancelAppointment(auth: AuthorizationContext, appointmentId: number, expectedVersion: number, reasonCode: string) {
  return prisma.$transaction((tx) => cancelAppointmentInTransaction(tx, auth, appointmentId, expectedVersion, reasonCode), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function rescheduleAppointmentInTransaction(tx: Prisma.TransactionClient, auth: AuthorizationContext, appointmentId: number, expectedVersion: number, newSlotId: number, reasonCode: string) {
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
}

export async function rescheduleAppointment(auth: AuthorizationContext, appointmentId: number, expectedVersion: number, newSlotId: number, reasonCode: string) {
  return prisma.$transaction((tx) => rescheduleAppointmentInTransaction(tx, auth, appointmentId, expectedVersion, newSlotId, reasonCode), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

/** Invoked by an authenticated clinical workflow, never exposed as a reception action. */
export async function markAppointmentAttendedInTransaction(
  tx: Prisma.TransactionClient,
  auth: AuthorizationContext,
  appointmentId: number,
  encounter: { source: string; id: string; occurredAt: Date },
) {
  if (!hasAbility(auth, 'appointment.attend')) throw new ReceptionError('FORBIDDEN', 'No tienes permiso clínico para atender citas.', 403);
  if (encounter.occurredAt > new Date()) throw new ReceptionError('INVALID_CLINICAL_ENCOUNTER', 'El encuentro clínico no puede estar en el futuro.', 422);
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
}

/** Invoked by an authenticated clinical workflow, never exposed as a reception action. */
export async function markAppointmentAttended(
  auth: AuthorizationContext,
  appointmentId: number,
  encounter: { source: string; id: string; occurredAt: Date },
) {
  return prisma.$transaction((tx) => markAppointmentAttendedInTransaction(tx, auth, appointmentId, encounter), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
