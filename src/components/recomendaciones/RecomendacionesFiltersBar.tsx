'use client';

import { CalendarDays, FilePlus2, Search, Stethoscope } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { EstadoRecomendacionFiltro } from './types';

export type RecomendacionMedicoOption = {
  id: number;
  nombre: string;
};

type RecomendacionesFiltersBarProps = {
  fechaDesde: string;
  fechaHasta: string;
  onFechaDesdeChange: (value: string) => void;
  onFechaHastaChange: (value: string) => void;
  documento: string;
  onDocumentoChange: (value: string) => void;
  estado: EstadoRecomendacionFiltro;
  onEstadoChange: (value: EstadoRecomendacionFiltro) => void;
  medicos: RecomendacionMedicoOption[];
  medicoId: number | null;
  onMedicoChange: (value: number | null) => void;
  onRegistrar?: () => void;
};

const ESTADO_OPTIONS: Array<{
  value: EstadoRecomendacionFiltro;
  label: string;
}> = [
  { value: 'PENDIENTES', label: 'Pendientes' },
  { value: 'REABIERTAS', label: 'Reabiertas' },
  { value: 'CERRADAS', label: 'Cerradas' },
  { value: 'ANULADAS', label: 'Anuladas' },
  { value: 'TODOS', label: 'Todos' },
];

export function RecomendacionesFiltersBar({
  fechaDesde,
  fechaHasta,
  onFechaDesdeChange,
  onFechaHastaChange,
  documento,
  onDocumentoChange,
  estado,
  onEstadoChange,
  medicos,
  medicoId,
  onMedicoChange,
  onRegistrar,
}: RecomendacionesFiltersBarProps) {
  return (
    <Card className="rounded-xl border-slate-200 bg-white/95 px-3 py-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-slate-600">Desde</Label>
            <div className="relative">
              <Input
                type="date"
                value={fechaDesde}
                onChange={(event) => onFechaDesdeChange(event.target.value)}
                className="h-10 rounded-md border-slate-300 bg-white pr-9 text-xs shadow-sm focus-visible:ring-1 focus-visible:ring-blue-500/60"
              />
              <CalendarDays className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-slate-600">Hasta</Label>
            <div className="relative">
              <Input
                type="date"
                value={fechaHasta}
                onChange={(event) => onFechaHastaChange(event.target.value)}
                className="h-10 rounded-md border-slate-300 bg-white pr-9 text-xs shadow-sm focus-visible:ring-1 focus-visible:ring-blue-500/60"
              />
              <CalendarDays className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-slate-600">Documento docente</Label>
            <div className="relative">
              <Input
                value={documento}
                onChange={(event) => onDocumentoChange(event.target.value)}
                placeholder="Buscar por documento"
                className="h-10 rounded-md border-slate-300 bg-white pr-9 text-xs shadow-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-blue-500/60"
              />
              <Search className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-slate-600">Medico</Label>
            <Select
              value={medicoId === null ? '__all__' : String(medicoId)}
              onValueChange={(value) => {
                onMedicoChange(value === '__all__' ? null : Number(value));
              }}
            >
              <SelectTrigger className="h-10 min-w-0 overflow-hidden rounded-md border-slate-300 bg-white px-3 text-xs shadow-sm focus:ring-1 focus:ring-blue-500/60">
                <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                  <Stethoscope className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                  <SelectValue placeholder="Todos los medicos" className="block max-w-full truncate" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los medicos</SelectItem>
                {medicos.map((medico) => (
                  <SelectItem key={medico.id} value={String(medico.id)}>
                    {medico.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-slate-600">Estado</Label>
            <Select value={estado} onValueChange={(value) => onEstadoChange(value as EstadoRecomendacionFiltro)}>
              <SelectTrigger className="h-10 rounded-md border-slate-300 bg-white text-xs shadow-sm focus:ring-1 focus:ring-blue-500/60">
                <SelectValue placeholder="Pendientes" />
              </SelectTrigger>
              <SelectContent>
                {ESTADO_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {onRegistrar ? (
          <div className="flex justify-end lg:mt-0">
            <Button
              type="button"
              onClick={onRegistrar}
              className="h-10 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <FilePlus2 className="mr-2 h-3.5 w-3.5" />
              Registrar
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
