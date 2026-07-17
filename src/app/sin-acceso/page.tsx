import Link from 'next/link';
import { ArrowLeft, LockKeyhole } from 'lucide-react';

import HomeHeader from '@/components/home/HomeHeader';
import { Button } from '@/components/ui/button';
import { requireAuthorizationContext } from '@/lib/auth/authorization';
import { getRoleLabel } from '@/lib/module-navigation';

export default async function AccessDeniedPage() {
  const authorization = await requireAuthorizationContext();
  const profileName =
    authorization.perfilNombre ?? getRoleLabel(authorization.role);

  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,_#f8fafc_0%,_#eff6ff_100%)]">
      <HomeHeader userName={authorization.name} profileName={profileName} />

      <main className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-3xl place-items-center px-4 py-10">
        <section className="w-full rounded-[30px] border border-slate-200 bg-white p-7 text-center shadow-[0_24px_60px_rgba(148,163,184,0.18)] sm:p-10" aria-labelledby="access-denied-title">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <LockKeyhole className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 id="access-denied-title" className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
            No tienes acceso a esta sección
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Tu sesión está activa, pero el perfil actual no cuenta con el permiso requerido. Si consideras que se trata de un error, solicita la revisión de tus permisos.
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild className="h-11 rounded-2xl px-5">
              <Link href="/inicio">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Volver al inicio
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
