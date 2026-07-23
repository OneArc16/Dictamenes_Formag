'use client';

import { usePathname } from 'next/navigation';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import MobileNavigationDrawer from '@/components/app-shell/MobileNavigationDrawer';
import SidebarNavigation from '@/components/app-shell/SidebarNavigation';
import { usePinnedSidebar } from '@/components/app-shell/usePinnedSidebar';
import { navigationIconMap } from '@/components/navigation/module-icons';
import type { AuthUser } from '@/lib/auth/guards';
import {
  getModuleByKey,
  getVisibleModules,
  getVisibleSecondaryNavigation,
  type NavigationModuleKey,
} from '@/lib/module-navigation';
import { cn } from '@/lib/utils';

type ModuleAppShellProps = {
  children: ReactNode;
  moduleKey: NavigationModuleKey;
  user: AuthUser;
};

export default function ModuleAppShell({
  children,
  moduleKey,
  user,
}: ModuleAppShellProps) {
  const pathname = usePathname() || '';
  const currentModule = getModuleByKey(moduleKey);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const previousPathname = useRef(pathname);
  const storageKey = `dictamy:sidebar:pinned:${user.id}`;
  const { pinned, togglePinned } = usePinnedSidebar(storageKey);

  const modules = useMemo(
    () => getVisibleModules({ permissions: user.permissions }),
    [user.permissions],
  );

  const secondaryNavigation = useMemo(
    () =>
      currentModule
        ? getVisibleSecondaryNavigation(currentModule, {
            permissions: user.permissions,
          })
        : [],
    [currentModule, user.permissions],
  );

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      mainRef.current?.focus();
    }
  }, [pathname]);

  if (!currentModule) return <>{children}</>;

  const expanded = pinned || preview;
  const ModuleIcon = navigationIconMap[currentModule.iconKey];

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setPreview(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && preview && !pinned) {
      setPreview(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.08),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.07),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_100%)]">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform focus:translate-y-0 motion-reduce:transition-none"
      >
        Saltar al contenido principal
      </a>

      <div className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
            <ModuleIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-950">
              {currentModule.label}
            </div>
            <div className="truncate text-xs text-slate-500">Dictamy</div>
          </div>
        </div>

        <MobileNavigationDrawer
          currentModule={currentModule}
          modules={modules}
          onOpenChange={setMobileOpen}
          open={mobileOpen}
          pathname={pathname}
          secondaryNavigation={secondaryNavigation}
          user={user}
        />
      </div>

      <div className="flex min-h-dvh gap-3 p-3 lg:gap-4 lg:p-4">
        <aside
          aria-label="Menú lateral"
          className={cn(
            'relative hidden shrink-0 transition-[width] duration-200 ease-out motion-reduce:transition-none lg:block',
            expanded ? 'w-64' : 'w-[72px]',
          )}
          onMouseEnter={() => setPreview(true)}
          onMouseLeave={() => setPreview(false)}
          onFocusCapture={() => setPreview(true)}
          onBlurCapture={handleBlur}
          onKeyDown={handleKeyDown}
        >
          <div className="sticky top-4 h-[calc(100dvh-2rem)]">
            <div
              className="module-sidebar-panel absolute inset-y-0 left-0 z-40 overflow-hidden rounded-[26px] border border-slate-200/90 bg-white shadow-[0_18px_45px_rgba(148,163,184,0.16)]"
              data-expanded={expanded}
            >
              <SidebarNavigation
                currentModule={currentModule}
                expanded={expanded}
                modules={modules}
                onTogglePinned={togglePinned}
                pathname={pathname}
                pinned={pinned}
                secondaryNavigation={secondaryNavigation}
                user={user}
              />
            </div>
          </div>
        </aside>

        <main
          ref={mainRef}
          id="main-content"
          tabIndex={-1}
          className="min-w-0 flex-1 pb-5 focus:outline-none"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
