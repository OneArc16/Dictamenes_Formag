import type { PrismaClient } from '@prisma/client';

import { dateInTimeZone, parseDateOnly } from '@/features/agenda/domain/date-time';
import { prisma } from '@/lib/prisma';

const TIME_ZONE = 'America/Bogota';

type AgendaCreationContextDatabase = Pick<PrismaClient, 'empleado'>;

type AgendaCreationLimits = {
  maxDoctors: number;
  maxRangeDays: number;
  minDurationMinutes: number;
  maxDurationMinutes: number;
  durationStepMinutes: number;
};

export type AgendaCreationContext =
  | {
      status: 'ready';
      site: {
        id: number;
        name: string;
      };
      timeZone: typeof TIME_ZONE;
      today: string;
      defaultEndDate: string;
      limits: AgendaCreationLimits;
    }
  | {
      status: 'blocked';
      message: string;
    };

const LIMITS: AgendaCreationLimits = {
  maxDoctors: 50,
  maxRangeDays: 90,
  minDurationMinutes: 5,
  maxDurationMinutes: 240,
  durationStepMinutes: 5,
};

function addDays(date: string, days: number) {
  const value = parseDateOnly(date);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export async function getAgendaCreationContext(
  employeeId: number,
  db: AgendaCreationContextDatabase = prisma,
  now = new Date(),
): Promise<AgendaCreationContext> {
  const employee = await db.empleado.findFirst({
    where: { id: employeeId, activo: true },
    select: {
      idSede: true,
      sede: {
        select: {
          id: true,
          nombre: true,
          estado: true,
        },
      },
    },
  });

  if (!employee?.idSede) {
    return {
      status: 'blocked',
      message: 'No tienes una sede asignada. Contacta al administrador para crear agendas.',
    };
  }

  if (!employee.sede || employee.sede.estado !== 1) {
    return {
      status: 'blocked',
      message: 'Tu sede asignada no está activa. Contacta al administrador o recarga la página.',
    };
  }

  const today = dateInTimeZone(now, TIME_ZONE);
  return {
    status: 'ready',
    site: {
      id: employee.sede.id,
      name: employee.sede.nombre,
    },
    timeZone: TIME_ZONE,
    today,
    defaultEndDate: addDays(today, 6),
    limits: LIMITS,
  };
}
