import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type IconTooltipProps = {
  children: ReactNode;
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
};

const alignmentClass = {
  left: 'left-0',
  center: 'left-1/2 -translate-x-1/2',
  right: 'right-0',
};

export function IconTooltip({
  children,
  id,
  label,
  align = 'center',
}: IconTooltipProps) {
  return (
    <div className="group relative inline-flex">
      {children}
      <span
        id={id}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute top-full z-50 mt-2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none',
          alignmentClass[align],
        )}
      >
        {label}
      </span>
    </div>
  );
}
