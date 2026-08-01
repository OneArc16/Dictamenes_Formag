import { Prisma } from '@prisma/client';

import type { AuthorizationContext } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';

import { ReceptionError } from './errors';
import { markAppointmentAttendedInTransaction } from './reception-service';

export type VerifiedClinicalEncounterMessage = {
  issuer: string;
  messageId: string;
  signatureKeyId: string;
  evidenceDigest: string;
  appointmentId: number;
  patientId: number;
  encounterSource: string;
  encounterId: string;
  occurredAt: Date;
};

function validateMessage(message: VerifiedClinicalEncounterMessage) {
  if (!/^[a-f0-9]{64}$/i.test(message.evidenceDigest)) throw new ReceptionError('INVALID_CLINICAL_EVIDENCE', 'La evidencia clínica verificada no es válida.', 422);
  if (!message.issuer || !message.messageId || !message.signatureKeyId || !message.encounterSource || !message.encounterId || message.appointmentId < 1 || message.patientId < 1 || message.occurredAt > new Date()) {
    throw new ReceptionError('INVALID_CLINICAL_ENCOUNTER', 'El mensaje clínico no es válido.', 422);
  }
}

async function receiveVerifiedMessage(message: VerifiedClinicalEncounterMessage) {
  try {
    return await prisma.$transaction(async (tx) => {
      const inbox = await tx.clinicalEncounterInboxMessage.create({ data: {
        issuer: message.issuer, messageId: message.messageId, signatureKeyId: message.signatureKeyId, evidenceDigest: message.evidenceDigest,
        citaIdEsperada: message.appointmentId, usuarioIdEsperado: message.patientId, clinicalEncounterSource: message.encounterSource,
        clinicalEncounterId: message.encounterId, encounterOccurredAt: message.occurredAt,
      } });
      await tx.clinicalEncounterInboxEvent.create({ data: { messageId: inbox.id, sequence: 1, tipoEvento: 'RECEIVED', metadata: { signatureKeyId: message.signatureKeyId } } });
      return inbox;
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error;
    const existing = await prisma.clinicalEncounterInboxMessage.findUnique({ where: { issuer_messageId: { issuer: message.issuer, messageId: message.messageId } } });
    if (!existing) throw new ReceptionError('CLINICAL_INBOX_IN_PROGRESS', 'El mensaje clínico se está procesando.', 409);
    const sameMessage = existing.evidenceDigest === message.evidenceDigest && existing.signatureKeyId === message.signatureKeyId && existing.citaIdEsperada === message.appointmentId && existing.usuarioIdEsperado === message.patientId && existing.clinicalEncounterSource === message.encounterSource && existing.clinicalEncounterId === message.encounterId;
    if (!sameMessage) throw new ReceptionError('CLINICAL_MESSAGE_REUSED', 'El identificador del mensaje clínico fue reutilizado.', 409);
    return existing;
  }
}

async function appendRejected(messageId: string, error: ReceptionError) {
  await prisma.$transaction(async (tx) => {
    const prior = await tx.clinicalEncounterInboxEvent.findFirst({ where: { messageId, tipoEvento: 'REJECTED' }, select: { id: true } });
    if (prior) return;
    await tx.clinicalEncounterInboxEvent.create({ data: { messageId, sequence: 2, tipoEvento: 'REJECTED', resultCode: error.code } });
  }).catch(() => undefined);
}

/**
 * Receives a message whose issuer authentication and signature were verified by
 * the integration adapter. It intentionally exposes no HTTP endpoint until that
 * institutional verifier is supplied.
 */
export async function processVerifiedClinicalEncounter(
  auth: AuthorizationContext,
  message: VerifiedClinicalEncounterMessage,
) {
  validateMessage(message);
  const inbox = await receiveVerifiedMessage(message);
  try {
    return await prisma.$transaction(async (tx) => {
      const events = await tx.clinicalEncounterInboxEvent.findMany({ where: { messageId: inbox.id }, select: { tipoEvento: true } });
      if (events.some((event) => event.tipoEvento === 'PROCESSED')) return { id: inbox.citaIdEsperada, replayed: true };
      if (events.some((event) => event.tipoEvento === 'REJECTED')) throw new ReceptionError('CLINICAL_MESSAGE_REJECTED', 'El mensaje clínico fue rechazado previamente.', 409);
      const appointment = await tx.cita.findUnique({ where: { id: inbox.citaIdEsperada }, select: { usuarioId: true } });
      if (!appointment || appointment.usuarioId !== inbox.usuarioIdEsperado) throw new ReceptionError('CLINICAL_SUBJECT_MISMATCH', 'El encuentro no corresponde al paciente de la cita.', 409);
      const result = await markAppointmentAttendedInTransaction(tx, auth, inbox.citaIdEsperada, { source: inbox.clinicalEncounterSource, id: inbox.clinicalEncounterId, occurredAt: inbox.encounterOccurredAt });
      await tx.clinicalEncounterInboxEvent.create({ data: { messageId: inbox.id, sequence: 2, tipoEvento: 'PROCESSED', metadata: { appointmentId: inbox.citaIdEsperada } } });
      return { id: result.id, replayed: result.replayed };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof ReceptionError) await appendRejected(inbox.id, error);
    throw error;
  }
}
