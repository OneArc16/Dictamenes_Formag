import { redirect } from 'next/navigation';

import { requireAuthorizationContext } from '@/lib/auth/authorization';
import {
  canAccessModule,
  getModuleByKey,
  getModuleEntryPath,
} from '@/lib/module-navigation';

export default async function AdmisionesEntryPage() {
  const authorization = await requireAuthorizationContext();
  const admisiones = getModuleByKey('admisiones');

  if (!admisiones) {
    throw new Error('El módulo Admisiones no está configurado.');
  }

  const access = { permissions: authorization.permissions };
  if (!canAccessModule(admisiones, access)) {
    redirect('/sin-acceso');
  }

  const entryPath = getModuleEntryPath(admisiones, access);
  if (entryPath === admisiones.href) {
    redirect('/sin-acceso');
  }

  redirect(entryPath);
}
