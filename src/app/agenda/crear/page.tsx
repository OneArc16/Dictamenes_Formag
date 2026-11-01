import {
  getAgendaCreationContext,
  getAgendaCreationContextForSite,
} from '@/features/agenda/application/agenda-creation-context';
import { listActiveModalities } from '@/features/agenda/infrastructure/modalities';
import AgendaCreationForm from '@/features/agenda/presentation/creation/AgendaCreationForm';
import { requireAbility } from '@/lib/auth/guards';
import { hasAbility } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';

type CreateAgendaPageProps = {
  searchParams?: Promise<{ sedeId?: string; modalidadId?: string }>;
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
  const params = await searchParams;
  const requestedSiteId = Number(params?.sedeId);
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
  const modalities = await listActiveModalities();
  const requestedModalityId = Number(params?.modalidadId);
  const modality = modalities.find((item) => item.id === requestedModalityId) ?? modalities[0];
  if (!modality) throw new Error('No hay modalidades de atención activas.');

  return (
    <AgendaCreationForm
      key={context.status === 'ready' ? `${context.site.id}-${modality.id}` : 'agenda-creation-blocked'}
      context={context}
      siteOptions={canSelectSite ? siteOptions : undefined}
      modalities={modalities}
      modality={modality}
    />
  );
}
