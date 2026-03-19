import { requireRecomendacionesModule } from '@/lib/auth/guards';

export default async function RecomendacionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRecomendacionesModule();
  return children;
}