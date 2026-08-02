import type { ReactNode } from 'react';

import { requireAbility } from '@/lib/auth/guards';

export default async function AdmisionesDictamenLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAbility('dictamen.read');
  return children;
}
