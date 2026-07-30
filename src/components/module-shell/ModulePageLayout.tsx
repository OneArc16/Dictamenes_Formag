'use client';

import type { ReactNode } from 'react';

import { navigationIconMap } from '@/components/navigation/module-icons';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  getModuleByKey,
  type NavigationModuleKey,
} from '@/lib/module-navigation';
import { cn } from '@/lib/utils';

type ModuleStat = {
  label: string;
  value: string;
};

type ModulePageLayoutProps = {
  actions?: ReactNode;
  children: ReactNode;
  compactHero?: boolean;
  description?: string;
  hideHero?: boolean;
  moduleKey: NavigationModuleKey;
  stats?: ModuleStat[];
  title?: string;
};

export default function ModulePageLayout({
  actions,
  children,
  compactHero = false,
  description,
  hideHero = false,
  moduleKey,
  stats = [],
  title,
}: ModulePageLayoutProps) {
  const currentModule = getModuleByKey(moduleKey);
  const Icon = currentModule
    ? navigationIconMap[currentModule.iconKey]
    : navigationIconMap.dashboard;

  return (
    <div className="space-y-4">
      {!hideHero ? (
        <Card className="overflow-hidden border-slate-200/80 bg-white/90 shadow-[0_20px_50px_rgba(148,163,184,0.14)] backdrop-blur">
          <CardHeader
            className={cn(
              'border-b border-slate-100 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.13),_transparent_30%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(255,255,255,0.96))] px-5',
              compactHero ? 'py-4' : 'py-5',
            )}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {currentModule?.label ?? 'Módulo'}
                </div>
                {title ? (
                  <h1 className="mt-3 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                    {title}
                  </h1>
                ) : null}
                {description ? (
                  <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                ) : null}
              </div>
              {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
            </div>
          </CardHeader>

          {stats.length > 0 ? (
            <CardContent className="grid gap-3 px-5 py-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 shadow-sm">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {stat.label}
                  </div>
                  <div className="mt-1.5 text-2xl font-semibold leading-none text-slate-950">
                    {stat.value}
                  </div>
                </div>
              ))}
            </CardContent>
          ) : null}
        </Card>
      ) : null}

      <div className="space-y-4">{children}</div>
    </div>
  );
}
