'use client';

import { Download } from 'lucide-react';
import { useMemo } from 'react';

type Procedimiento = 'A' | 'B' | string;

export interface DictamenExportRow {
  fechaDictamen: string | null; // YYYY-MM-DD (como ya lo dejamos)
  docenteDocumento: string;
  docenteNombre: string;
  procedimientoPcl: Procedimiento;
  totalTitulo1?: number | string | null;
  totalTitulo3?: number | string | null;
  estado: string; // 'PENDIENTE' | 'CERRADO' | etc.
}

interface DictamenExportButtonProps {
  rows: DictamenExportRow[];
  filename?: string;
}

export function DictamenExportButton({
  rows,
  filename = 'dictamenes_medico.csv',
}: DictamenExportButtonProps) {
  const hasRows = rows && rows.length > 0;

  // Nombre amigable para el botón
  const label = useMemo(
    () => (hasRows ? 'Descargar listado' : 'Sin datos'),
    [hasRows]
  );

  const handleDownload = () => {
    if (!hasRows) return;

    // Encabezados
    const headers = [
      'Fecha',
      'Documento docente',
      'Nombre docente',
      'Procedimiento',
      '% Título I',
      '% Título III',
      'Estado',
    ];

    // Filas
    const lines = rows.map((r) => {
      const fecha = r.fechaDictamen
        ? r.fechaDictamen.split('-').reverse().join('/') // DD/MM/YYYY
        : '';

      const proc = r.procedimientoPcl ?? '';

      const t1 =
        r.totalTitulo1 === null || r.totalTitulo1 === undefined
          ? ''
          : String(r.totalTitulo1);

      const t3 =
        r.totalTitulo3 === null || r.totalTitulo3 === undefined
          ? ''
          : String(r.totalTitulo3);

      const cols = [
        fecha,
        r.docenteDocumento ?? '',
        r.docenteNombre ?? '',
        proc,
        t1,
        t3,
        r.estado ?? '',
      ];

      // Escapar comas y comillas por si acaso
      return cols
        .map((c) => {
          const value = c ?? '';
          if (/[",;\n]/.test(value)) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(';'); // ; para que Excel lo abra bonito en es-CO
    });

    const csv = [headers.join(';'), ...lines].join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={!hasRows}
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      title={hasRows ? 'Descargar listado actual' : 'No hay datos para descargar'}
    >
      <Download className="h-3.5 w-3.5 text-slate-500" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
