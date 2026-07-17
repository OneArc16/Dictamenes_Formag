import Link from 'next/link';
import { ArrowRight, Blocks, CircleHelp } from 'lucide-react';

import HomeHeader from '@/components/home/HomeHeader';
import { navigationIconMap } from '@/components/navigation/module-icons';
import { requireAuthorizationContext } from '@/lib/auth/authorization';
import {
  getModuleEntryPath,
  getRoleLabel,
  getVisibleModules,
} from '@/lib/module-navigation';

export default async function InicioPage() {
  const authorization = await requireAuthorizationContext();
  const access = { permissions: authorization.permissions };
  const modules = getVisibleModules(access);
  const profileName =
    authorization.perfilNombre ?? getRoleLabel(authorization.role);

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.10),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(37,99,235,0.08),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eff6ff_100%)] text-slate-950">
      <HomeHeader userName={authorization.name} profileName={profileName} />

      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <section aria-labelledby="home-title">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-sky-800 shadow-sm">
              <Blocks className="h-4 w-4" aria-hidden="true" />
              Módulos disponibles
            </div>
            <h1 id="home-title" className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Bienvenido, {authorization.name.split(' ')[0] || 'Usuario'}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Selecciona el módulo en el que deseas trabajar. Las opciones se muestran de acuerdo con los permisos vigentes de tu perfil.
            </p>
          </div>

          {modules.length > 0 ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {modules.map((moduleItem) => {
                const Icon = navigationIconMap[moduleItem.iconKey];
                const href = getModuleEntryPath(moduleItem, access);

                return (
                  <Link
                    key={moduleItem.key}
                    href={href}
                    className="group flex min-h-56 flex-col rounded-[28px] border border-slate-200/90 bg-white/95 p-5 shadow-[0_16px_40px_rgba(148,163,184,0.13)] transition duration-200 ease-out hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_20px_48px_rgba(14,165,233,0.16)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700 transition-colors duration-200 group-hover:bg-sky-100 motion-reduce:transition-none">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">
                      {moduleItem.label}
                    </h2>
                    <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                      {moduleItem.description}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-700">
                      Ingresar
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden="true" />
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 max-w-2xl rounded-[28px] border border-amber-200 bg-white/95 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <CircleHelp className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-950">
                    Tu perfil no tiene módulos asignados
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Comunícate con el equipo administrador para revisar los permisos del perfil {profileName}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
