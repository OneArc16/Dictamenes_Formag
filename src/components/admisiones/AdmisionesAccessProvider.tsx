'use client';

import React, { createContext, useContext } from 'react';
import type { AuthUser } from '@/lib/auth/guards';

type AdmisionesAccess = {
  user: AuthUser;
  canReabrirDictamen: boolean;
};

const Ctx = createContext<AdmisionesAccess | null>(null);

export default function AdmisionesAccessProvider({
  user,
  canReabrirDictamen,
  children,
}: {
  user: AuthUser;
  canReabrirDictamen: boolean;
  children: React.ReactNode;
}) {
  return (
    <Ctx.Provider value={{ user, canReabrirDictamen }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdmisionesAccess() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAdmisionesAccess debe usarse dentro de AdmisionesAccessProvider');
  return ctx;
}
