'use client';

import type { ReactNode } from 'react';
import { Eye, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { RecomendacionRow } from './types';

type RecomendacionesTableProps = {
  rows: RecomendacionRow[];
  loading: boolean;
  onOpenRecommendation: (id: number) => void;
  renderActions?: (row: RecomendacionRow) => ReactNode;
};

function formatFecha(value: string | Date | null | undefined) {
  if (!value) return '';

  if (value instanceof Date) {
    return value.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  const normalized = String(value);
  if (normalized.includes('T')) {
    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
      });
    }
  }

  const [year, month, day] = normalized.split('T')[0].split('-');
  if (year && month && day) {
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  return normalized;
}

function getEstadoStyles(estado: string | undefined) {
  const normalized = String(estado ?? '').toUpperCase();

  if (normalized === 'PENDIENTE') {
    return 'border border-amber-100 bg-amber-50 text-amber-700';
  }

  if (normalized === 'REABIERTO') {
    return 'border border-sky-100 bg-sky-50 text-sky-700';
  }

  if (normalized === 'ANULADA') {
    return 'border border-rose-100 bg-rose-50 text-rose-700';
  }

  return 'border border-emerald-100 bg-emerald-50 text-emerald-700';
}

function getEstadoLabel(estado: string | undefined) {
  const normalized = String(estado ?? '').toUpperCase();

  if (normalized === 'PENDIENTE') return 'Pendiente';
  if (normalized === 'REABIERTO') return 'Reabierta';
  if (normalized === 'ANULADA') return 'Anulada';
  return 'Cerrada';
}

function getRowClassName(row: RecomendacionRow) {
  if (String(row.estado ?? '').toUpperCase() === 'REABIERTO') {
    return 'border-sky-100 bg-sky-50/30 hover:bg-sky-50/50';
  }

  return 'border-slate-100 hover:bg-slate-50/70';
}

function buildReaperturaMeta(row: RecomendacionRow) {
  const parts: string[] = [];

  if (row.reabiertaEn) {
    parts.push(`Ult. reapertura: ${formatFecha(row.reabiertaEn)}`);
  }

  if (row.reabiertaPorNombre) {
    parts.push(`Por: ${row.reabiertaPorNombre}`);
  }

  return parts.join(' · ');
}

export function RecomendacionesTable({
  rows,
  loading,
  onOpenRecommendation,
  renderActions,
}: RecomendacionesTableProps) {
  return (
    <Card className="overflow-hidden rounded-xl border-slate-200 bg-white/95 shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50/90">
          <TableRow className="border-slate-200 hover:bg-slate-50/90">
            <TableHead className="w-10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">#</TableHead>
            <TableHead className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Fecha</TableHead>
            <TableHead className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Secretaria</TableHead>
            <TableHead className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Documento</TableHead>
            <TableHead className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Docente</TableHead>
            <TableHead className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Estado</TableHead>
            <TableHead className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Medico</TableHead>
            <TableHead className="w-24 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="px-3 py-6 text-center text-xs text-slate-500">
                Cargando recomendaciones...
              </TableCell>
            </TableRow>
          ) : null}

          {!loading && rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="px-3 py-6 text-center text-xs text-slate-500">
                No hay recomendaciones para los filtros seleccionados.
              </TableCell>
            </TableRow>
          ) : null}

          {!loading
            ? rows.map((row, index) => {
                const reaperturaMeta = buildReaperturaMeta(row);
                const hasReaperturaContext = Boolean(
                  row.fueReabierta || row.reabiertaEn || row.reabiertaPorNombre || row.motivoReapertura,
                );
                const currentEstado = String(row.estado ?? '').toUpperCase();

                return (
                  <TableRow key={row.id} className={getRowClassName(row)}>
                    <TableCell className="px-3 py-2 align-top text-[11px] text-slate-500">{index + 1}</TableCell>
                    <TableCell className="px-3 py-2 align-top text-[11px] text-slate-700">
                      {formatFecha(row.fechaRecomendacion)}
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top text-[11px] text-slate-700">
                      {row.secretaria || 'Sin secretaria'}
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top text-[11px] text-slate-700">
                      {row.docenteDocumento || '-'}
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top text-[11px] text-slate-700">
                      {row.docenteNombre || '-'}
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      <div className="max-w-[240px] space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getEstadoStyles(row.estado)}`}
                          >
                            {getEstadoLabel(row.estado)}
                          </span>
                          {hasReaperturaContext && currentEstado !== 'REABIERTO' ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                              <RotateCcw className="h-3 w-3" />
                              Con reapertura
                            </span>
                          ) : null}
                        </div>
                        {hasReaperturaContext ? (
                          <div className="space-y-0.5 text-[10px] leading-4 text-slate-500">
                            {reaperturaMeta ? <p>{reaperturaMeta}</p> : null}
                            {row.motivoReapertura ? (
                              <p className="break-words text-slate-600">
                                Motivo: {row.motivoReapertura}
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top text-[11px] text-slate-700">
                      {row.medicoNombre || '-'}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      <div className="inline-flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          title="Ver recomendacion"
                          className="h-8 w-8 rounded-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                          onClick={() => onOpenRecommendation(row.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {renderActions ? renderActions(row) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            : null}
        </TableBody>
      </Table>
    </Card>
  );
}
