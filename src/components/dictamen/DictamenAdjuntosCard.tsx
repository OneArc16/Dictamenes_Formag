'use client';

import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Eye, Loader2, PackageOpen, Paperclip, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { Tooltip } from '@/components/ui/icon-tooltip';
import { useCan } from '@/hooks/useCan';
import { ADJUNTO_ACCEPT, validateAdjunto } from '@/lib/dictamen/adjuntos';

type Adjunto = {
  id: number;
  nombre: string;
  mimeType: string;
  tamano: number;
  createdAt: string;
  createdBy: string | null;
};

type Props = {
  dictamenId: number;
  /** Con el dictamen cerrado solo se puede consultar y descargar. */
  readOnly?: boolean;
};

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

async function parseResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.ok) throw new Error(data?.error ?? 'No se pudo completar la acción');
  return data;
}

export default function DictamenAdjuntosCard({ dictamenId, readOnly = false }: Props) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { can: canRead } = useCan('dictamen.adjunto.read');
  const { can: canManage } = useCan('dictamen.adjunto.manage');

  const baseUrl = `/api/dictamenes/${dictamenId}/adjuntos`;
  const queryKey = ['dictamen-adjuntos', dictamenId];

  const { data: adjuntos = [], isLoading } = useQuery({
    queryKey,
    enabled: canRead,
    queryFn: async () => {
      const data = await parseResponse(await fetch(baseUrl, { credentials: 'include' }));
      return data.adjuntos as Adjunto[];
    },
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append('archivo', file);
      return parseResponse(await fetch(baseUrl, { method: 'POST', credentials: 'include', body }));
    },
    onSuccess: () => {
      toast.success('Documento adjuntado');
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : 'No se pudo adjuntar'),
  });

  const remove = useMutation({
    mutationFn: async (adjuntoId: number) =>
      parseResponse(await fetch(`${baseUrl}/${adjuntoId}`, { method: 'DELETE', credentials: 'include' })),
    onSuccess: () => {
      toast.success('Documento eliminado');
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : 'No se pudo eliminar'),
  });

  if (!canRead) return null;

  const handleFiles = (files: FileList | null) => {
    const list = Array.from(files ?? []);
    if (inputRef.current) inputRef.current.value = '';
    for (const file of list) {
      const validation = validateAdjunto(file);
      if (!validation.ok) {
        toast.error(`${file.name}: ${validation.error}`);
        continue;
      }
      upload.mutate(file);
    }
  };

  const showUpload = canManage && !readOnly;
  const hasFiles = (event: React.DragEvent) => event.dataTransfer.types.includes('Files');
  const dropProps = showUpload
    ? {
        onDragOver: (event: React.DragEvent) => {
          if (!hasFiles(event)) return;
          event.preventDefault();
          setDragging(true);
        },
        onDragLeave: (event: React.DragEvent) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
        },
        onDrop: (event: React.DragEvent) => {
          if (!hasFiles(event)) return;
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        },
      }
    : {};
  const iconButton =
    'inline-flex h-8 w-8 items-center justify-center rounded-full border bg-white transition-colors disabled:opacity-60';

  return (
    <section
      {...dropProps}
      className={[
        'relative rounded-2xl border bg-white p-4 shadow-sm transition-colors',
        dragging ? 'border-blue-400 bg-blue-50/60 ring-2 ring-blue-200' : 'border-slate-200',
      ].join(' ')}
    >
      {dragging && (
        <p className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-blue-50/80 text-xs font-semibold text-blue-700">
          Suelta los archivos para adjuntarlos
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Documentos adjuntos
          {adjuntos.length > 0 && <span className="ml-1 font-normal text-slate-400">({adjuntos.length})</span>}
        </h2>

        <div className="flex items-center gap-1.5">
          {adjuntos.length > 1 && (
            <Tooltip id={`adjuntos-zip-${dictamenId}`} side="top" label="Descargar todos (.zip)">
              <a
                href={`${baseUrl}/zip`}
                aria-label="Descargar todos (.zip)"
                className={`${iconButton} border-slate-200 text-slate-600 hover:bg-slate-50`}
              >
                <PackageOpen className="h-4 w-4" aria-hidden="true" />
              </a>
            </Tooltip>
          )}

          {showUpload && (
            <>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept={ADJUNTO_ACCEPT}
                className="sr-only"
                id={`adjuntos-input-${dictamenId}`}
                onChange={(event) => handleFiles(event.target.files)}
              />
              <Tooltip id={`adjuntos-add-${dictamenId}`} side="top" label="Adjuntar documento (PDF, JPG o PNG, máx. 10 MB)">
                <button
                  type="button"
                  aria-label="Adjuntar documento"
                  disabled={upload.isPending}
                  onClick={() => inputRef.current?.click()}
                  className={`${iconButton} border-blue-200 text-blue-700 hover:bg-blue-50`}
                >
                  {upload.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Paperclip className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      <ul className="mt-2 divide-y divide-slate-100" aria-live="polite">
        {isLoading ? (
          <li className="py-2 text-[11px] text-slate-400">Cargando…</li>
        ) : adjuntos.length === 0 ? (
          <li className="py-2 text-[11px] text-slate-400">No hay documentos adjuntos.</li>
        ) : (
          adjuntos.map((adjunto) => (
            <li key={adjunto.id} className="flex items-center gap-2 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-800" title={adjunto.nombre}>
                  {adjunto.nombre}
                </p>
                <p className="text-[11px] text-slate-400">
                  {formatSize(adjunto.tamano)} · {formatDate(adjunto.createdAt)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Tooltip id={`adjunto-${adjunto.id}-ver`} side="top" label="Ver">
                  <a
                    href={`${baseUrl}/${adjunto.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ver ${adjunto.nombre}`}
                    className={`${iconButton} h-7 w-7 border-transparent text-slate-500 hover:bg-slate-100`}
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </Tooltip>
                <Tooltip id={`adjunto-${adjunto.id}-descargar`} side="top" label="Descargar">
                  <a
                    href={`${baseUrl}/${adjunto.id}?download=1`}
                    aria-label={`Descargar ${adjunto.nombre}`}
                    className={`${iconButton} h-7 w-7 border-transparent text-slate-500 hover:bg-slate-100`}
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </Tooltip>
                {showUpload && (
                  <Tooltip id={`adjunto-${adjunto.id}-eliminar`} side="top" label="Eliminar">
                    <button
                      type="button"
                      aria-label={`Eliminar ${adjunto.nombre}`}
                      disabled={remove.isPending}
                      onClick={() => {
                        if (window.confirm(`¿Eliminar "${adjunto.nombre}"?`)) remove.mutate(adjunto.id);
                      }}
                      className={`${iconButton} h-7 w-7 border-transparent text-rose-500 hover:bg-rose-50`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </Tooltip>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
