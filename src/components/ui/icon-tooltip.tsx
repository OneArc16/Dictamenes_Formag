import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type TooltipProps = {
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

export function Tooltip({
  children,
  id,
  label,
  align = 'center',
}: TooltipProps) {
  return (
    <div className="ui-tooltip group relative inline-flex">
      {children}
      <span
        id={id}
        role="tooltip"
        className={cn(
          'ui-tooltip-content pointer-events-none invisible absolute top-full z-50 mt-2 whitespace-nowrap rounded-md bg-slate-950 px-2.5 py-1.5 text-xs font-medium leading-4 text-white opacity-0 shadow-sm ring-1 ring-white/10 transition-[opacity,transform,visibility] duration-150 ease-out translate-y-1 scale-95 group-hover:visible group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 motion-reduce:transition-none',
          alignmentClass[align],
        )}
      >
        {label}
      </span>
    </div>
  );
}

/** @deprecated Use Tooltip for new controls. */
export function IconTooltip(props: TooltipProps) {
  return <Tooltip {...props} />;
}
