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
