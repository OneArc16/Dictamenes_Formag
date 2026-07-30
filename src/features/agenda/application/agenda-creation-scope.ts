import type { PrismaClient } from '@prisma/client';

import {
  getAgendaCreationContext,
  getAgendaCreationContextForSite,
} from '@/features/agenda/application/agenda-creation-context';
import { AgendaApplicationError } from '@/features/agenda/application/errors';
import { prisma } from '@/lib/prisma';

type AgendaCreationScopeDatabase = Pick<PrismaClient, 'empleado' | 'sede'>;

type AgendaCreationScopeOptions = {
  canSelectSite?: boolean;
};

export async function assertAgendaCreationScope(
  employeeId: number,
  requestedSiteId: number,
  db: AgendaCreationScopeDatabase = prisma,
  { canSelectSite = false }: AgendaCreationScopeOptions = {},
) {
  if (canSelectSite) {
    const context = await getAgendaCreationContextForSite(requestedSiteId, db);
    if (context.status === 'blocked') {
      throw new AgendaApplicationError(context.message, 409);
    }
    return context;
  }

  const context = await getAgendaCreationContext(employeeId, db);

  if (context.status === 'blocked') {
    throw new AgendaApplicationError(context.message, 409);
  }

  if (context.site.id !== requestedSiteId) {
    throw new AgendaApplicationError(
      'No puedes crear agendas para una sede diferente a la que tienes asignada.',
      403,
    );
  }

  return context;
}
