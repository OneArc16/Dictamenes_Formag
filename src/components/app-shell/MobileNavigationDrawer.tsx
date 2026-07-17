'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X } from 'lucide-react';

import SidebarNavigation from '@/components/app-shell/SidebarNavigation';
import { Button } from '@/components/ui/button';
import type { AuthUser } from '@/lib/auth/guards';
import type {
  ModuleDefinition,
  ModuleNavigationItem,
} from '@/lib/module-navigation';

type MobileNavigationDrawerProps = {
  currentModule: ModuleDefinition;
  modules: readonly ModuleDefinition[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
  pathname: string;
  secondaryNavigation: readonly ModuleNavigationItem[];
  user: AuthUser;
};

export default function MobileNavigationDrawer({
  currentModule,
  modules,
  onOpenChange,
  open,
  pathname,
  secondaryNavigation,
  user,
}: MobileNavigationDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-2xl border-slate-200 bg-white"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
          Menú
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-64 max-w-[88vw] border-r border-slate-200 bg-white shadow-2xl data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:animate-in data-[state=open]:slide-in-from-left motion-reduce:animate-none">
          <Dialog.Title className="sr-only">Menú principal</Dialog.Title>
          <Dialog.Description className="sr-only">
            Navegación entre los módulos autorizados y las opciones del módulo actual.
          </Dialog.Description>
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Cerrar menú"
              className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 motion-reduce:transition-none"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </Dialog.Close>
          <SidebarNavigation
            currentModule={currentModule}
            expanded
            modules={modules}
            onNavigate={() => onOpenChange(false)}
            pathname={pathname}
            secondaryNavigation={secondaryNavigation}
            user={user}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
