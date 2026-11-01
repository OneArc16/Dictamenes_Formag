import { prisma } from '@/lib/prisma';

export type AgendaModality = { id: number; codigo: string; nombre: string };

/** Modalidades activas; cada una tiene su propia agenda y sus propios horarios. */
export function listActiveModalities(): Promise<AgendaModality[]> {
  return prisma.modalidadCita.findMany({
    where: { estado: true },
    select: { id: true, codigo: true, nombre: true },
    orderBy: { id: 'asc' },
  });
}
