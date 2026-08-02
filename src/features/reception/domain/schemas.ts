import { z } from 'zod';

const positiveId = z.coerce.number().int().positive();
const nullableTrimmed = (max: number) =>
  z.string().trim().max(max).transform((value) => value || null).nullable().optional();

export const patientSearchSchema = z.object({
  documentNumber: z.string().trim().min(1).max(20),
  documentType: z.string().trim().length(2).optional(),
}).strict();

export const patientContactSchema = z.object({
  expectedContactVersion: z.number().int().min(0),
  celular: nullableTrimmed(15),
  telefono: nullableTrimmed(15),
  email: z.string().trim().email().max(100).transform((value) => value || null).nullable().optional(),
  direccion: nullableTrimmed(255),
}).strict();

const optionalDate = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida').refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date <= new Date();
}, 'La fecha de nacimiento no puede ser futura').nullable();

const optionalPastDate = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida').refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date <= new Date();
}, 'La fecha no puede ser futura').nullable();

export const patientProfileSchema = z.object({
  expectedProfileVersion: z.number().int().min(0),
  documentType: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  documentNumber: z.string().trim().min(1).max(20),
  firstName: z.string().trim().min(1).max(50),
  middleName: nullableTrimmed(50),
  lastName: z.string().trim().min(1).max(50),
  secondLastName: nullableTrimmed(50),
  birthDate: optionalDate,
  sex: z.enum(['F', 'M', 'O']),
  epsCode: z.string().trim().min(1).max(6),
  departmentCode: nullableTrimmed(2),
  municipalityCode: nullableTrimmed(5),
  neighborhood: nullableTrimmed(50),
  zone: z.enum(['U', 'R']),
  countryCode: z.string().trim().length(3),
  category: nullableTrimmed(30),
  celular: nullableTrimmed(15),
  telefono: nullableTrimmed(15),
  email: z.string().trim().email().max(100).transform((value) => value || null).nullable(),
  direccion: nullableTrimmed(255),
  teacherPositionId: positiveId.nullable(),
  education: nullableTrimmed(100),
  employmentStartDate: optionalPastDate,
  secretariatId: positiveId.nullable(),
  institutionId: positiveId.nullable(),
  employmentType: z.string().trim().max(45),
  civilStatus: nullableTrimmed(20),
  salaryGrade: z.string().trim().max(2),
  salaryLevel: z.enum(['', 'NO_APLICA', 'A', 'B', 'C', 'D']),
}).strict();

export const appointmentSchema = z.object({
  patientId: positiveId,
  specialtyId: positiveId,
  slotId: positiveId,
  requestMedium: z.enum(['PRESENCIAL', 'TELEFONO', 'CORREO', 'WHATSAPP']),
  modalityId: positiveId,
}).strict();

export const appointmentActionSchema = z.object({
  expectedVersion: z.number().int().min(0),
}).strict();

export const rescheduleSchema = appointmentActionSchema.extend({
  newSlotId: positiveId,
  reasonCode: z.string().trim().min(1).max(50),
}).strict();

export const cancelSchema = appointmentActionSchema.extend({
  reasonCode: z.string().trim().min(1).max(50),
}).strict();

export type ScheduleAppointmentCommand = z.infer<typeof appointmentSchema>;
export type PatientProfileCommand = z.infer<typeof patientProfileSchema>;
