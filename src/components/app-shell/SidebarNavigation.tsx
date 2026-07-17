'use client';

import Link from 'next/link';
import {
  Home,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  User2,
  type LucideIcon,
} from 'lucide-react';

import { navigationIconMap } from '@/components/navigation/module-icons';
import { useLogout } from '@/hooks/useLogout';
import type { AuthUser } from '@/lib/auth/guards';
import {
  getModuleEntryPath,
  getRoleLabel,
  type ModuleDefinition,
  type ModuleNavigationItem,
} from '@/lib/module-navigation';
import { cn } from '@/lib/utils';

type SidebarNavigationProps = {
  currentModule: ModuleDefinition;
  expanded: boolean;
  modules: readonly ModuleDefinition[];
  onNavigate?: () => void;
  onTogglePinned?: () => void;
  pathname: string;
  pinned?: boolean;
  secondaryNavigation: readonly ModuleNavigationItem[];
  user: AuthUser;
};

function isModuleActive(pathname: string, moduleItem: ModuleDefinition) {
  return (
    pathname === moduleItem.href ||
    pathname.startsWith(`${moduleItem.href}/`)
  );
}

function isSecondaryActive(pathname: string, item: ModuleNavigationItem) {
  if (item.href === '/admin') return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavigationLink({
  active,
  expanded,
  href,
  icon: Icon,
  label,
  onNavigate,
  tabIndex,
}: {
  active: boolean;
  expanded: boolean;
  href: string;
  icon: LucideIcon;
  label: string;
  onNavigate?: () => void;
  tabIndex?: number;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      title={expanded ? undefined : label}
      tabIndex={tabIndex}
      className={cn(
        'group grid min-h-11 w-full grid-cols-[44px_1fr] items-center rounded-2xl border px-1.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 motion-reduce:transition-none',
        expanded
          ? active
            ? 'border-sky-200 bg-sky-50 text-sky-900 shadow-sm'
            : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-950'
          : active
            ? 'border-transparent bg-transparent text-sky-900'
            : 'border-transparent bg-transparent text-slate-600 hover:text-slate-950',
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl border transition-colors duration-150 motion-reduce:transition-none',
          active
            ? expanded
              ? 'border-transparent bg-white text-sky-700 shadow-sm'
              : 'border-sky-200 bg-sky-50 text-sky-700 shadow-sm'
            : 'border-transparent text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-800',
        )}
      >
        <Icon className="h-4.5 w-4.5" aria-hidden="true" />
      </span>
      <span
        className={cn(
          'min-w-0 truncate pr-3 font-medium transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none',
          expanded
            ? 'translate-x-0 opacity-100'
            : '-translate-x-1 opacity-0',
        )}
      >
        {label}
      </span>
    </Link>
  );
}

export default function SidebarNavigation({
  currentModule,
  expanded,
  modules,
  onNavigate,
  onTogglePinned,
  pathname,
  pinned = false,
  secondaryNavigation,
  user,
}: SidebarNavigationProps) {
  const logout = useLogout();
  const access = { permissions: user.permissions };

  return (
    <div className="flex h-full min-h-0 w-64 flex-col bg-[linear-gradient(180deg,_rgba(248,250,252,0.99),_rgba(239,246,255,0.97))] text-slate-800">
      <div className="flex min-h-16 items-center border-b border-slate-200/80 px-2.5">
        <Link
          href="/inicio"
          onClick={onNavigate}
          title={expanded ? undefined : 'Ir al inicio'}
          className="grid min-h-11 min-w-0 flex-1 grid-cols-[44px_1fr] items-center rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-100 bg-white text-sm font-bold text-sky-700 shadow-sm">
            D
          </span>
          <span
            className={cn(
              'min-w-0 truncate px-2 text-base font-semibold tracking-tight text-slate-950 transition-opacity duration-150 motion-reduce:transition-none',
              expanded ? 'opacity-100' : 'opacity-0',
            )}
          >
            Dictamy
          </span>
        </Link>

        {onTogglePinned ? (
          <button
            type="button"
            onClick={onTogglePinned}
            aria-label={pinned ? 'Desfijar menú lateral' : 'Fijar menú lateral'}
            aria-pressed={pinned}
            tabIndex={expanded ? 0 : -1}
            className={cn(
              'mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 motion-reduce:transition-none',
              expanded ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            {pinned ? (
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2.5 py-3">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden pr-0.5">
          <div
            className={cn(
              'grid min-h-14 grid-cols-[44px_1fr] items-center rounded-2xl border px-1.5 transition-[background-color,border-color,box-shadow] duration-150 motion-reduce:transition-none',
              expanded
                ? 'border-slate-200/80 bg-white/90 shadow-sm'
                : 'border-transparent bg-transparent shadow-none',
            )}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <User2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <span
              className={cn(
                'min-w-0 pr-3 leading-tight transition-opacity duration-150 motion-reduce:transition-none',
                expanded ? 'opacity-100' : 'opacity-0',
              )}
            >
              <span className="block truncate text-xs font-semibold text-slate-900">
                {user.name}
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                {user.perfilNombre ?? getRoleLabel(user.role)}
              </span>
            </span>
          </div>

          <nav aria-label="Navegación principal" className="space-y-1.5">
            <NavigationLink
              active={pathname === '/inicio'}
              expanded={expanded}
              href="/inicio"
              icon={Home}
              label="Inicio"
              onNavigate={onNavigate}
            />

            {modules.map((moduleItem) => {
              const Icon = navigationIconMap[moduleItem.iconKey];
              return (
                <NavigationLink
                  key={moduleItem.key}
                  active={isModuleActive(pathname, moduleItem)}
                  expanded={expanded}
                  href={getModuleEntryPath(moduleItem, access)}
                  icon={Icon}
                  label={moduleItem.label}
                  onNavigate={onNavigate}
                />
              );
            })}
          </nav>

          {secondaryNavigation.length > 0 ? (
            <section
              aria-label={`Accesos de ${currentModule.label}`}
              aria-hidden={!expanded}
              className={cn(
                'space-y-2 transition-opacity duration-150 motion-reduce:transition-none',
                expanded
                  ? 'visible opacity-100'
                  : 'invisible pointer-events-none opacity-0',
              )}
            >
              <div className="px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                {currentModule.label}
              </div>
              <nav className="space-y-1.5">
                {secondaryNavigation.map((item) => {
                  const Icon = navigationIconMap[item.iconKey];
                  return (
                    <NavigationLink
                      key={item.key}
                      active={isSecondaryActive(pathname, item)}
                      expanded={expanded}
                      href={item.href}
                      icon={Icon}
                      label={item.label}
                      onNavigate={onNavigate}
                      tabIndex={expanded ? undefined : -1}
                    />
                  );
                })}
              </nav>
            </section>
          ) : null}
        </div>

        <div className="mt-3 border-t border-slate-200 pt-3">
          <button
            type="button"
            onClick={logout}
            title={expanded ? undefined : 'Cerrar sesión'}
            className="group grid min-h-11 w-full grid-cols-[44px_1fr] items-center rounded-2xl border border-transparent px-1.5 text-sm text-slate-600 transition-colors duration-150 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 motion-reduce:transition-none"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl group-hover:bg-white">
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </span>
            <span
              className={cn(
                'truncate pr-3 text-left font-medium transition-opacity duration-150 motion-reduce:transition-none',
                expanded ? 'opacity-100' : 'opacity-0',
              )}
            >
              Cerrar sesión
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
