import {
  BellRing,
  ClipboardList,
  ClipboardPlus,
  IdCard,
  LayoutDashboard,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  UserRoundCog,
  UserSquare2,
  type LucideIcon,
} from 'lucide-react';

import type { NavigationIconKey } from '@/lib/module-navigation';

export const navigationIconMap: Record<NavigationIconKey, LucideIcon> = {
  admin: ShieldCheck,
  medico: Stethoscope,
  admisiones: UserSquare2,
  recomendaciones: ClipboardPlus,
  dashboard: LayoutDashboard,
  employees: IdCard,
  profiles: UserRoundCog,
  reopen: RotateCcw,
  notifications: BellRing,
  audit: ClipboardList,
};
