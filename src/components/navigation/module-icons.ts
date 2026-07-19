import {
  BellRing,
  CalendarDays,
  CalendarPlus2,
  CalendarRange,
  Clock3,
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
  agenda: CalendarDays,
  dashboard: LayoutDashboard,
  employees: IdCard,
  profiles: UserRoundCog,
  reopen: RotateCcw,
  notifications: BellRing,
  audit: ClipboardList,
  'agenda-list': CalendarRange,
  'agenda-create': CalendarPlus2,
  'agenda-schedule': Clock3,
};
