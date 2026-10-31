'use client';

import { ListFilter, Search, Stethoscope } from 'lucide-react';

import { DateRangePicker } from '@/components/filters/DateRangePicker';
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
import type { EstadoAtencionFiltro } from '@/features/atenciones/application/atenciones-query';

export type AtencionMedicoOption = {
  id: number;
  nombre: string;
};

type AtencionesFiltersBarProps = {
  fechaDesde: string;
  fechaHasta: string;
  onFechaDesdeChange: (value: string) => void;
  onFechaHastaChange: (value: string) => void;
  documento: string;
  onDocumentoChange: (value: string) => void;
  estado: EstadoAtencionFiltro;
  onEstadoChange: (value: EstadoAtencionFiltro) => void;
  medicos: AtencionMedicoOption[];
  medicoId: number | null;
  onMedicoChange: (value: number | null) => void;
};

const ESTADO_OPTIONS: Array<{ value: EstadoAtencionFiltro; label: string }> = [
  { value: 'ACTIVADAS', label: 'Activados' },
  { value: 'ATENDIDAS', label: 'Atendidos' },
  { value: 'TODAS', label: 'Todos' },
];

export function AtencionesFiltersBar({
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
}: AtencionesFiltersBarProps) {
  return (
    <Card className="rounded-xl border-slate-200 bg-white/95 px-3 py-3 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DateRangePicker
          from={fechaDesde}
          to={fechaHasta}
          onFromChange={onFechaDesdeChange}
          onToChange={onFechaHastaChange}
          className="min-w-0"
        />

        <div className="flex min-w-0 flex-col gap-1">
          <Label htmlFor="atenciones-documento" className="block text-[11px] font-medium leading-normal text-slate-600">
            Documento docente
          </Label>
          <div className="relative">
            <Input
              id="atenciones-documento"
              value={documento}
              onChange={(event) => onDocumentoChange(event.target.value)}
              placeholder="Buscar por documento"
              inputMode="numeric"
              className="h-10 w-full rounded-md border-slate-300 bg-white pr-9 text-xs shadow-sm placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-blue-500/60"
            />
            <Search className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <Label className="block text-[11px] font-medium leading-normal text-slate-600">
            Médico
          </Label>
          <Select
            value={medicoId === null ? '__all__' : String(medicoId)}
            onValueChange={(value) => onMedicoChange(value === '__all__' ? null : Number(value))}
          >
            <SelectTrigger className="h-10 min-w-0 overflow-hidden rounded-md border-slate-300 bg-white px-3 text-xs shadow-sm focus:ring-1 focus:ring-blue-500/60">
              <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                <Stethoscope className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                <SelectValue placeholder="Todos los médicos" className="block max-w-full truncate" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos los médicos</SelectItem>
              {medicos.map((medico) => (
                <SelectItem key={medico.id} value={String(medico.id)}>
                  {medico.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <Label className="block text-[11px] font-medium leading-normal text-slate-600">
            Estado
          </Label>
          <Select value={estado} onValueChange={(value) => onEstadoChange(value as EstadoAtencionFiltro)}>
            <SelectTrigger className="h-10 w-full rounded-md border-slate-300 bg-white px-3 text-xs shadow-sm focus:ring-1 focus:ring-blue-500/60">
              <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                <ListFilter className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                <SelectValue placeholder="Activados" />
              </div>
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
    </Card>
  );
}
