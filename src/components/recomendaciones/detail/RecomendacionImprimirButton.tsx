'use client';

import { Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function RecomendacionImprimirButton({
  recomendacionId,
}: {
  recomendacionId: number;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-9 rounded-full border-blue-200 text-blue-700 hover:bg-blue-50"
      onClick={() => {
        window.open(
          `/api/recomendaciones/${recomendacionId}/pdf-react`,
          '_blank',
          'noopener,noreferrer',
        );
      }}
    >
      <Printer className="h-4 w-4" />
      Imprimir PDF
    </Button>
  );
}
