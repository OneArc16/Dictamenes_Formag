// src/components/DictamenExportButton.tsx
'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

export type DictamenExportRow = {
  fecha: string;
  tipoDocumento: string;
  documento: string;
  docente: string;
  estado: string;
  medico: string;
};

interface DictamenExportButtonProps {
  rows: DictamenExportRow[];
  filename?: string;
}

export function DictamenExportButton({
  rows,
  filename = 'dictamenes.csv',
}: DictamenExportButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    if (!rows || rows.length === 0 || downloading) return;

    setDownloading(true);
    try {
      const header = [
        'Fecha',
        'Tipo documento',
        'Documento',
        'Docente',
        'Estado',
        'Médico',
      ];

      const lines: string[] = [header.join(';')];

      for (const r of rows) {
        const cols = [
          r.fecha ?? '',
          r.tipoDocumento ?? '',
          r.documento ?? '',
          r.docente ?? '',
          r.estado ?? '',
          r.medico ?? '',
        ]
          .map((v) => String(v).replace(/"/g, '""')) // escapar comillas
          .map((v) => `"${v}"`);

        lines.push(cols.join(';'));
      }

      const csv = lines.join('\r\n');
      const blob = new Blob([csv], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const disabled = !rows || rows.length === 0 || downloading;

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={disabled}
      className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      title={
        disabled && !downloading
          ? 'No hay datos para descargar'
          : 'Descargar listado'
      }
    >
      <Download className="h-3.5 w-3.5" />
      <span>{downloading ? 'Generando…' : 'Descargar listado'}</span>
    </button>
  );
}
