'use client';

import type { ReactNode } from 'react';
import { Stethoscope } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/icon-tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type AtencionRow = {
  id: number;
  estado: 'ACTIVADA' | 'ATENDIDA';
  inicioProgramado: string;
  finProgramado: string;
  activadaAt: string | null;
  docenteDocumento: string;
  docenteNombre: string;
  secretaria: string | null;
  medicoId: number;
  medicoNombre: string;
  especialidadNombre: string;
  modalidadNombre: string;
};

type AtencionesTableProps = {
  rows: AtencionRow[];
  loading: boolean;
  errorMessage?: string;
  canAttend: (row: AtencionRow) => boolean;
  onAttend: (row: AtencionRow) => void;
};

const TIME_ZONE = 'America/Bogota';
const HEAD_CLASS = 'px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500';
const CELL_CLASS = 'px-3 py-2 align-top text-[11px] text-slate-700';
const COLUMNS = 10;

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat('es-CO', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: TIME_ZONE,
});

export function formatAtencionFecha(value: string) {
  return dateFormatter.format(new Date(value));
}

export function formatAtencionHora(value: string) {
  return timeFormatter.format(new Date(value));
}

function EstadoBadge({ row }: { row: AtencionRow }) {
  if (row.estado === 'ATENDIDA') {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
        Atendido
      </span>
    );
  }

  return (
    <div className="space-y-0.5">
      <span className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700">
        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" aria-hidden="true" />
        Activado
      </span>
      {row.activadaAt ? (
        <p className="text-[10px] leading-4 text-slate-500">
          Desde {formatAtencionFecha(row.activadaAt)} · {formatAtencionHora(row.activadaAt)}
        </p>
      ) : null}
    </div>
  );
}

function MessageRow({ children }: { children: ReactNode }) {
  return (
    <TableRow>
      <TableCell colSpan={COLUMNS} className="px-3 py-6 text-center text-xs text-slate-500">
        {children}
      </TableCell>
    </TableRow>
  );
}

export function AtencionesTable({ rows, loading, errorMessage, canAttend, onAttend }: AtencionesTableProps) {
  return (
    <Card className="overflow-hidden rounded-xl border-slate-200 bg-white/95 shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50/90">
          <TableRow className="border-slate-200 hover:bg-slate-50/90">
            <TableHead className={`w-10 ${HEAD_CLASS}`}>#</TableHead>
            <TableHead className={HEAD_CLASS}>Fecha</TableHead>
            <TableHead className={HEAD_CLASS}>Hora</TableHead>
            <TableHead className={HEAD_CLASS}>Secretaria</TableHead>
            <TableHead className={HEAD_CLASS}>Documento</TableHead>
            <TableHead className={HEAD_CLASS}>Docente</TableHead>
            <TableHead className={HEAD_CLASS}>Especialidad</TableHead>
            <TableHead className={HEAD_CLASS}>Estado</TableHead>
            <TableHead className={HEAD_CLASS}>Medico</TableHead>
            <TableHead className={`w-24 text-center ${HEAD_CLASS}`}>Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading && rows.length === 0 ? <MessageRow>Cargando atenciones...</MessageRow> : null}

          {!loading && errorMessage ? <MessageRow>{errorMessage}</MessageRow> : null}

          {!loading && !errorMessage && rows.length === 0 ? (
            <MessageRow>No hay atenciones para los filtros seleccionados.</MessageRow>
          ) : null}

          {rows.map((row, index) => (
            <TableRow key={row.id} className="border-slate-100 hover:bg-slate-50/70">
              <TableCell className="px-3 py-2 align-top text-[11px] text-slate-500">{index + 1}</TableCell>
              <TableCell className={CELL_CLASS}>{formatAtencionFecha(row.inicioProgramado)}</TableCell>
              <TableCell className={`${CELL_CLASS} whitespace-nowrap`}>{formatAtencionHora(row.inicioProgramado)}</TableCell>
              <TableCell className={CELL_CLASS}>{row.secretaria || 'Sin secretaria'}</TableCell>
              <TableCell className={CELL_CLASS}>{row.docenteDocumento}</TableCell>
              <TableCell className={CELL_CLASS}>{row.docenteNombre}</TableCell>
              <TableCell className={CELL_CLASS}>
                {row.especialidadNombre}
                <span className="block text-[10px] text-slate-500">{row.modalidadNombre}</span>
              </TableCell>
              <TableCell className="px-3 py-2 align-top">
                <EstadoBadge row={row} />
              </TableCell>
              <TableCell className={CELL_CLASS}>{row.medicoNombre}</TableCell>
              <TableCell className="px-3 py-2 text-center">
                {row.estado === 'ACTIVADA' && canAttend(row) ? (
                  <Tooltip id={`atencion-${row.id}-atender-tooltip`} side="top" label="Atender paciente">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`Atender a ${row.docenteNombre}`}
                    className="h-9 w-9 rounded-full border-emerald-300 bg-emerald-50 text-emerald-700 shadow-none hover:bg-emerald-100 hover:text-emerald-900"
                    onClick={() => onAttend(row)}
                  >
                    <Stethoscope className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  </Tooltip>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
