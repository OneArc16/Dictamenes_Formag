import { redirect } from 'next/navigation';

import { requireAuthorizationContext } from '@/lib/auth/authorization';
import {
  canAccessModule,
  getModuleByKey,
  getModuleEntryPath,
} from '@/lib/module-navigation';

export default async function MedicinaLaboralEntryPage() {
  const authorization = await requireAuthorizationContext();
  const medicinaLaboral = getModuleByKey('medicina-laboral');

  if (!medicinaLaboral) {
    throw new Error('El módulo Medicina Laboral no está configurado.');
  }

  const access = { permissions: authorization.permissions };
  if (!canAccessModule(medicinaLaboral, access)) {
    redirect('/sin-acceso');
  }

  const entryPath = getModuleEntryPath(medicinaLaboral, access);
  if (entryPath === medicinaLaboral.href) {
    throw new Error('Medicina Laboral no tiene un submódulo autorizado.');
  }

  redirect(entryPath);
}
