import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';

import { datosRegistroActuales } from '@/features/atenciones/application/datos-registro';
import { INSTITUCION, logoDataUrl } from '@/features/atenciones/application/documentos-clinicos-print';
import { formatFecha, formatFechaHora, formatHora } from '@/features/atenciones/presentation/print/documento-clinico-model';
import { RecordatorioPdf, type RecordatorioDocumento } from '@/features/atenciones/presentation/print/RecordatorioPdf';

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { AuthorizationContext } from '@/lib/auth/authorization';

import { ReceptionError } from './errors';
import { assertReceptionSite } from './reception-service';

type ReminderSnapshot = {
  patientName: string;
  documentNumber: string;
  siteName: string;
  specialtyName: string;
  doctorName: string;
  start: string;
  modalityName: string;
  appointmentCode: string;
  generatedAt: string;
};

function documentKey() {
  const encoded = process.env.RECEPTION_DOCUMENT_KEY;
  if (!encoded) throw new ReceptionError('DOCUMENT_KEY_UNAVAILABLE', 'No está disponible la clave institucional del documento.', 503);
  const key = Buffer.from(encoded, 'base64');
  if (key.length !== 32) throw new ReceptionError('DOCUMENT_KEY_UNAVAILABLE', 'La clave institucional del documento no es válida.', 503);
  return key;
}

function encrypt(snapshot: ReminderSnapshot) {
  const key = documentKey();
  const nonce = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, nonce);
  const plaintext = Buffer.from(JSON.stringify(snapshot), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return { nonce, ciphertext, authTag: cipher.getAuthTag(), checksum: createHash('sha256').update(ciphertext).digest('hex') };
}

function decrypt(document: { nonce: Uint8Array; authTag: Uint8Array; snapshotCiphertext: Uint8Array; checksumSha256: string }) {
  const ciphertext = Buffer.from(document.snapshotCiphertext);
  if (createHash('sha256').update(ciphertext).digest('hex') !== document.checksumSha256) throw new ReceptionError('DOCUMENT_DECRYPTION_FAILED', 'No se pudo verificar el documento.', 409);
  try {
    const decipher = createDecipheriv('aes-256-gcm', documentKey(), Buffer.from(document.nonce));
    decipher.setAuthTag(Buffer.from(document.authTag));
    return JSON.parse(Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')) as ReminderSnapshot;
  } catch (error) {
    if (error instanceof ReceptionError) throw error;
    throw new ReceptionError('DOCUMENT_DECRYPTION_FAILED', 'No se pudo descifrar el documento.', 409);
  }
}

export async function createReminderDocumentInTransaction(tx: Prisma.TransactionClient, auth: AuthorizationContext, appointmentId: number) {
  const appointment = await tx.cita.findUnique({ where: { id: appointmentId }, include: { paciente: true } });
  if (!appointment || appointment.estado !== 'ASIGNADA' || appointment.inicioProgramado <= new Date()) throw new ReceptionError('REMINDER_DOCUMENT_NOT_RENDERABLE', 'La cita no permite generar un recordatorio.', 409);
  await assertReceptionSite(auth, appointment.sedeId);
  const existing = await tx.documentoCita.findFirst({ where: { citaId: appointmentId, tipo: 'RECORDATORIO_CITA' }, select: { id: true } });
  if (existing) return { id: existing.id };
  const snapshot: ReminderSnapshot = {
    patientName: [appointment.paciente.primerNombre, appointment.paciente.segundoNombre, appointment.paciente.primerApellido, appointment.paciente.segundoApellido].filter(Boolean).join(' '),
    documentNumber: appointment.paciente.identificacion,
    siteName: appointment.sedeNombre,
    specialtyName: appointment.especialidadNombre,
    doctorName: appointment.medicoNombre,
    start: appointment.inicioProgramado.toISOString(),
    modalityName: appointment.modalidadNombre,
    appointmentCode: String(appointment.id), generatedAt: new Date().toISOString(),
  };
  const encrypted = encrypt(snapshot);
  const document = await tx.documentoCita.create({ data: { citaId: appointmentId, tipo: 'RECORDATORIO_CITA', snapshotCiphertext: encrypted.ciphertext, nonce: encrypted.nonce, authTag: encrypted.authTag, checksumSha256: encrypted.checksum, keyVersion: 'v1', createdBy: auth.empleadoId } });
  return { id: document.id };
}

export async function createReminderDocument(auth: AuthorizationContext, appointmentId: number) {
  return prisma.$transaction((tx) => createReminderDocumentInTransaction(tx, auth, appointmentId));
}

export async function renderReminderDocument(auth: AuthorizationContext, appointmentId: number, documentId: string) {
  const document = await prisma.documentoCita.findFirst({ where: { id: documentId, citaId: appointmentId, tipo: 'RECORDATORIO_CITA' }, include: { cita: true } });
  if (!document || document.cita.estado !== 'ASIGNADA') throw new ReceptionError('REMINDER_DOCUMENT_NOT_RENDERABLE', 'El recordatorio ya no se puede imprimir.', 409);
  await assertReceptionSite(auth, document.cita.sedeId);
  const snapshot = decrypt(document);
  const [registro, logoSrc] = await Promise.all([datosRegistroActuales(prisma, appointmentId), logoDataUrl()]);
  const doc: RecordatorioDocumento = {
    encabezado: { institucion: { ...INSTITUCION, ...registro.sede }, generadoEn: formatFechaHora(snapshot.generatedAt) },
    codigo: snapshot.appointmentCode,
    paciente: { nombre: snapshot.patientName, documento: snapshot.documentNumber },
    cita: { fecha: formatFecha(snapshot.start), hora: formatHora(snapshot.start), sede: snapshot.siteName, especialidad: snapshot.specialtyName, medico: snapshot.doctorName, modalidad: snapshot.modalityName },
  };
  return Buffer.from(await renderToBuffer(React.createElement(RecordatorioPdf, { doc, logoSrc }) as never));
}
