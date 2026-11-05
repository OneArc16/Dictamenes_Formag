'use client';

import { useState } from 'react';
import { Paperclip } from 'lucide-react';

import DictamenAdjuntosCard from '@/components/dictamen/DictamenAdjuntosCard';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip } from '@/components/ui/icon-tooltip';
import { useCan } from '@/hooks/useCan';

type Props = {
  dictamenId: number;
  isCerrado: boolean;
  docenteNombre?: string;
};

export default function AdjuntarDocumentosButton({ dictamenId, isCerrado, docenteNombre }: Props) {
  const [open, setOpen] = useState(false);
  const { can: canRead } = useCan('dictamen.adjunto.read');

  if (!canRead) return null;

  return (
    <>
      <Tooltip id={`dictamen-${dictamenId}-adjuntos-tooltip`} side="top" label="Documentos adjuntos">
        <button
          type="button"
          aria-label="Documentos adjuntos"
          onClick={() => setOpen(true)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-700 transition hover:bg-amber-50 active:bg-amber-100"
        >
          <Paperclip className="h-4 w-4" aria-hidden="true" />
        </button>
      </Tooltip>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Documentos adjuntos</DialogTitle>
            <DialogDescription>
              {docenteNombre ? `Dictamen de ${docenteNombre}` : `Dictamen ${dictamenId}`}
            </DialogDescription>
          </DialogHeader>
          {open ? <DictamenAdjuntosCard dictamenId={dictamenId} readOnly={isCerrado} /> : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
