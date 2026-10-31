'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

export type TooltipProps = {
  children: ReactNode;
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  /** Lado preferido; si no cabe en la pantalla se muestra en el contrario. */
  side?: 'top' | 'bottom';
};

type Placement = { top: number; left: number; arrowLeft: number; side: 'top' | 'bottom' };

const GAP = 8;
const VIEWPORT_MARGIN = 8;
const ARROW_INSET = 12;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Se dibuja en un portal con posición fija: así ningún contenedor con overflow (tablas, tarjetas,
 * diálogos) lo recorta, y se ajusta para no salirse de la pantalla.
 */
export function Tooltip({
  children,
  id,
  label,
  align = 'center',
  side = 'bottom',
}: TooltipProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<Placement | null>(null);

  const hide = useCallback(() => {
    setOpen(false);
    setPlacement(null);
  }, []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !contentRef.current) return;
    const trigger = triggerRef.current.getBoundingClientRect();
    const { width, height } = contentRef.current.getBoundingClientRect();

    const fitsTop = trigger.top - GAP - height >= VIEWPORT_MARGIN;
    const fitsBottom = trigger.bottom + GAP + height <= window.innerHeight - VIEWPORT_MARGIN;
    const finalSide = side === 'top' ? (fitsTop || !fitsBottom ? 'top' : 'bottom') : (fitsBottom || !fitsTop ? 'bottom' : 'top');

    const preferredLeft =
      align === 'left' ? trigger.left : align === 'right' ? trigger.right - width : trigger.left + trigger.width / 2 - width / 2;
    const left = clamp(preferredLeft, VIEWPORT_MARGIN, window.innerWidth - VIEWPORT_MARGIN - width);
    const top = finalSide === 'top' ? trigger.top - GAP - height : trigger.bottom + GAP;
    const arrowLeft = clamp(trigger.left + trigger.width / 2 - left, ARROW_INSET, width - ARROW_INSET);

    setPlacement({ top, left, arrowLeft, side: finalSide });
  }, [open, align, side, label]);

  // Fijo en pantalla: si algo se desplaza, se oculta en vez de quedar desalineado.
  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    return () => {
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
    };
  }, [open, hide]);

  return (
    <div
      ref={triggerRef}
      className="ui-tooltip relative inline-flex"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={hide}
      onPointerDown={hide}
      onFocus={(event) => {
        if (event.target.matches(':focus-visible')) setOpen(true);
      }}
      onBlur={hide}
    >
      {children}
      {open
        ? createPortal(
            <span
              ref={contentRef}
              id={id}
              role="tooltip"
              style={{ top: placement?.top ?? 0, left: placement?.left ?? 0 }}
              className={cn(
                'ui-tooltip-content pointer-events-none fixed z-[100] whitespace-nowrap rounded-md bg-slate-950 px-2.5 py-1.5 text-xs font-medium leading-4 text-white shadow-md ring-1 ring-white/10 transition-opacity duration-150 ease-out motion-reduce:transition-none',
                placement ? 'opacity-100' : 'invisible opacity-0',
              )}
            >
              {label}
              <span
                aria-hidden="true"
                style={{ left: placement?.arrowLeft ?? 0 }}
                className={cn(
                  'absolute h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-950',
                  placement?.side === 'bottom' ? '-top-1' : '-bottom-1',
                )}
              />
            </span>,
            document.body,
          )
        : null}
    </div>
  );
}

/** @deprecated Use Tooltip for new controls. */
export function IconTooltip(props: TooltipProps) {
  return <Tooltip {...props} />;
}
