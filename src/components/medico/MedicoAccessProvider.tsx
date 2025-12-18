'use client';

import React, { createContext, useContext } from 'react';
import type { AuthUser } from '@/lib/auth/guards';

type MedicoAccess = {
  user: AuthUser;
  readOnly: boolean;
};

const Ctx = createContext<MedicoAccess | null>(null);

export default function MedicoAccessProvider({
  user,
  readOnly,
  children,
}: {
  user: AuthUser;
  readOnly: boolean;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={{ user, readOnly }}>{children}</Ctx.Provider>;
}

export function useMedicoAccess() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useMedicoAccess debe usarse dentro de MedicoAccessProvider');
  return ctx;
}
