'use client';

import { Check, LoaderCircle, Search, UserRoundPlus, UsersRound } from 'lucide-react';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { AgendaDoctorOption } from './agenda-creation-types';

type AgendaDoctorComboboxProps = {
  inputId?: string;
  query: string;
  onQueryChange: (value: string) => void;
  options: AgendaDoctorOption[];
  selectedIds: Set<number>;
  onSelect: (doctor: AgendaDoctorOption) => void;
  minimumLength: number;
  isLoading: boolean;
  error: string;
  onRetry: () => void;
  onSelectAll: () => void;
  isSelectingAll: boolean;
  selectAllError: string;
  canSelectAll?: boolean;
  validationError?: string;
  disabled?: boolean;
};

export function AgendaDoctorCombobox({
  inputId: providedInputId,
  query,
  onQueryChange,
  options,
  selectedIds,
  onSelect,
  minimumLength,
  isLoading,
  error,
  onRetry,
  onSelectAll,
  isSelectingAll,
  selectAllError,
  canSelectAll = true,
  validationError,
  disabled = false,
}: AgendaDoctorComboboxProps) {
  const generatedInputId = useId();
  const inputId = providedInputId ?? generatedInputId;
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: globalThis.PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [open]);

  const selectDoctor = (doctor: AgendaDoctorOption) => {
    if (selectedIds.has(doctor.id)) return;
    onSelect(doctor);
    onQueryChange('');
    setOpen(false);
    setActiveIndex(-1);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) =>
        options.length === 0 ? -1 : current < options.length - 1 ? current + 1 : 0,
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) =>
        options.length === 0 ? -1 : current > 0 ? current - 1 : options.length - 1,
      );
      return;
    }

    if (event.key === 'Enter' && open && resolvedActiveIndex >= 0) {
      event.preventDefault();
      const doctor = options[resolvedActiveIndex];
      if (doctor) selectDoctor(doctor);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  };

  const handleOptionPointerDown = (
    event: PointerEvent<HTMLLIElement>,
    doctor: AgendaDoctorOption,
  ) => {
    event.preventDefault();
    selectDoctor(doctor);
  };

  const normalizedLength = query.trim().length;
  const showPanel = open && !disabled;
  const resolvedActiveIndex =
    options.length === 0 ? -1 : Math.min(Math.max(activeIndex, 0), options.length - 1);
  const activeOption =
    resolvedActiveIndex >= 0 ? options[resolvedActiveIndex] : undefined;

  return (
    <section aria-labelledby={`${inputId}-title`} className="space-y-2.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 id={`${inputId}-title`} className="text-base font-semibold text-slate-950">
            Agregar médicos
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            Busca por nombre, documento o especialidad.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onSelectAll}
          disabled={disabled || isSelectingAll || !canSelectAll}
          title="Agregar todos los médicos activos"
          aria-label={
            isSelectingAll
              ? 'Agregando todos los médicos activos'
              : 'Agregar todos los médicos activos'
          }
          aria-busy={isSelectingAll}
          aria-describedby={selectAllError ? `${inputId}-select-all-error` : undefined}
          className="h-11 w-11 shrink-0 rounded-full border-sky-200 bg-white text-sky-800 shadow-none hover:bg-sky-50 hover:text-sky-900"
        >
          {isSelectingAll ? (
            <LoaderCircle
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <UsersRound className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      {selectAllError ? (
        <p
          id={`${inputId}-select-all-error`}
          role="alert"
          className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700"
        >
          {selectAllError}
        </p>
      ) : null}

      <div ref={containerRef} className="relative" onBlur={handleBlur}>
        <Label htmlFor={inputId}>Buscar médicos</Label>
        <div className="relative mt-1.5">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <Input
            ref={inputRef}
            id={inputId}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showPanel}
            aria-controls={listboxId}
            aria-activedescendant={
              showPanel && activeOption ? `${listboxId}-option-${activeOption.id}` : undefined
            }
            aria-invalid={Boolean(validationError)}
            aria-describedby={`${inputId}-help${validationError ? ` ${inputId}-error` : ''}`}
            autoComplete="off"
            value={query}
            onChange={(event) => {
              onQueryChange(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Escribe nombre, documento o especialidad"
            className="min-h-11 pl-10 text-base sm:text-sm"
          />
          {isLoading ? (
            <LoaderCircle
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-sky-700 motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : null}
        </div>

        {showPanel ? (
          <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_55px_rgba(15,23,42,0.18)]">
            <ul
              id={listboxId}
              role="listbox"
              aria-label="Resultados de médicos"
              className="max-h-80 overflow-y-auto p-2"
            >
              {normalizedLength < minimumLength ? (
                <li className="px-3 py-4 text-sm text-slate-600">
                  Escribe al menos {minimumLength} caracteres para buscar.
                </li>
              ) : error ? (
                <li className="space-y-3 px-3 py-4 text-sm text-rose-800">
                  <p role="alert">{error}</p>
                  <Button type="button" variant="outline" className="min-h-11" onClick={onRetry}>
                    Reintentar búsqueda
                  </Button>
                </li>
              ) : isLoading && options.length === 0 ? (
                <li className="flex min-h-20 items-center gap-2 px-3 text-sm text-slate-600">
                  <LoaderCircle
                    className="h-4 w-4 animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  Buscando médicos…
                </li>
              ) : options.length === 0 ? (
                <li className="px-3 py-5 text-sm text-slate-600">
                  No encontramos médicos elegibles para esta búsqueda.
                </li>
              ) : (
                options.map((doctor, index) => {
                  const selected = selectedIds.has(doctor.id);
                  const active = resolvedActiveIndex === index;
                  return (
                    <li
                      key={doctor.id}
                      id={`${listboxId}-option-${doctor.id}`}
                      role="option"
                      aria-selected={selected}
                      aria-disabled={selected}
                      onPointerDown={(event) => handleOptionPointerDown(event, doctor)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn(
                        'flex min-h-16 cursor-pointer items-start gap-3 rounded-xl px-3 py-3 transition-colors',
                        active && 'bg-sky-50',
                        selected && 'cursor-default bg-slate-50 text-slate-500',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                          selected ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700',
                        )}
                      >
                        {selected ? (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <UserRoundPlus className="h-4 w-4" aria-hidden="true" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-slate-900">{doctor.nombre}</span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {doctor.documento ? `${doctor.documento} · ` : ''}
                          {doctor.especialidadPrincipal ?? 'Sin especialidad principal'}
                        </span>
                      </span>
                      {selected ? (
                        <span className="shrink-0 text-xs font-medium text-emerald-700">
                          Agregado
                        </span>
                      ) : null}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        ) : null}
        {validationError ? (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="mt-2 text-sm font-medium text-rose-700"
          >
            {validationError}
          </p>
        ) : null}
      </div>
    </section>
  );
}
