import { notFound } from 'next/navigation';

import { getAtencionDetalle } from '@/features/atenciones/application/atencion-detail';
import AtencionDetailPage from '@/features/atenciones/presentation/detail/AtencionDetailPage';
import { requireAuthorizationContext } from '@/lib/auth/authorization';

export default async function AtencionPage({ params }: { params: Promise<{ id: string }> }) {
  const citaId = Number((await params).id);
  if (!Number.isInteger(citaId) || citaId < 1) notFound();

  const auth = await requireAuthorizationContext();
  const detalle = await getAtencionDetalle(auth, citaId);
  if (!detalle) notFound();

  return <AtencionDetailPage detalle={detalle} />;
}
