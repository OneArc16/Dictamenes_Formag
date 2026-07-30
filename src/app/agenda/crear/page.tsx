import {
  getAgendaCreationContext,
  getAgendaCreationContextForSite,
} from '@/features/agenda/application/agenda-creation-context';
import AgendaCreationForm from '@/features/agenda/presentation/creation/AgendaCreationForm';
import { requireAbility } from '@/lib/auth/guards';
import { hasAbility } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';

type CreateAgendaPageProps = {
  searchParams?: Promise<{ sedeId?: string }>;
};

export default async function CreateAgendaPage({ searchParams }: CreateAgendaPageProps) {
  const auth = await requireAbility('agenda.create');
  const canSelectSite = hasAbility(auth, 'agenda.site.select');
  const assignedContext = await getAgendaCreationContext(auth.empleadoId);
  const sites = canSelectSite
    ? await prisma.sede.findMany({
        where: { estado: 1 },
        orderBy: { nombre: 'asc' },
        select: { id: true, nombre: true },
      })
    : [];
  const requestedSiteId = Number((await searchParams)?.sedeId);
  const selectedSiteId = sites.some((site) => site.id === requestedSiteId)
    ? requestedSiteId
    : assignedContext.status === 'ready'
      ? assignedContext.site.id
      : sites[0]?.id;
  const context =
    canSelectSite && selectedSiteId
      ? await getAgendaCreationContextForSite(selectedSiteId)
      : assignedContext;
  const siteOptions = sites.map((site) => ({ id: site.id, name: site.nombre }));

  return (
    <AgendaCreationForm
      key={context.status === 'ready' ? context.site.id : 'agenda-creation-blocked'}
      context={context}
      siteOptions={canSelectSite ? siteOptions : undefined}
    />
  );
}
