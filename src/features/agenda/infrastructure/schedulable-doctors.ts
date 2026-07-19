import type { PrismaClient } from '@prisma/client';

import { prisma } from '@/lib/prisma';

type DoctorDatabase = Pick<PrismaClient, 'empleado'>;

export function employeeFullName(employee: {
  primerNombre: string;
  segundoNombre: string | null;
  primerApellido: string;
  segundoApellido: string | null;
}) {
  return [employee.primerNombre, employee.segundoNombre, employee.primerApellido, employee.segundoApellido]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function listSchedulableDoctors(
  input: { sedeId: number; search?: string; medicoIds?: number[]; limit?: number },
  db: DoctorDatabase = prisma,
) {
  const search = input.search?.trim();
  const rows = await db.empleado.findMany({
    where: {
      activo: true,
      idSede: input.sedeId,
      ...(input.medicoIds ? { id: { in: input.medicoIds } } : {}),
      perfil: {
        estado: 1,
        nombre: { equals: 'MEDICO', mode: 'insensitive' },
      },
      sede: { estado: 1 },
      ...(search
        ? {
            OR: [
              { primerNombre: { contains: search, mode: 'insensitive' } },
              { segundoNombre: { contains: search, mode: 'insensitive' } },
              { primerApellido: { contains: search, mode: 'insensitive' } },
              { segundoApellido: { contains: search, mode: 'insensitive' } },
              { numeroIdentidad: { contains: search, mode: 'insensitive' } },
              {
                especialidades: {
                  some: { especialidad: { nombre: { contains: search, mode: 'insensitive' } } },
                },
              },
            ],
          }
        : {}),
    },
    take: Math.min(input.limit ?? 100, 100),
    orderBy: [{ primerApellido: 'asc' }, { primerNombre: 'asc' }],
    select: {
      id: true,
      primerNombre: true,
      segundoNombre: true,
      primerApellido: true,
      segundoApellido: true,
      numeroIdentidad: true,
      tratamiento: true,
      idSede: true,
      sede: { select: { id: true, nombre: true } },
      especialidades: {
        where: { especialidad: { estado: true } },
        orderBy: [{ principal: 'desc' }, { id: 'asc' }],
        take: 1,
        select: { especialidad: { select: { nombre: true } } },
      },
      horariosLaborales: {
        where: { activo: true },
        take: 1,
        select: { id: true },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    nombre: employeeFullName(row),
    documento: row.numeroIdentidad,
    tratamiento: row.tratamiento,
    sedeId: row.sede?.id ?? row.idSede,
    sedeNombre: row.sede?.nombre ?? '',
    especialidadPrincipal: row.especialidades[0]?.especialidad.nombre ?? null,
    tieneHorarioParticular: row.horariosLaborales.length > 0,
  }));
}
