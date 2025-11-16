// src/components/dictamen/EstadoBadge.tsx
import { FC } from 'react';

interface EstadoBadgeProps {
  estado: 'PENDIENTE' | 'REABIERTO' | 'CERRADO';
  /** Compatibilidad hacia atrás: si viene en true, se muestra como REABIERTO */
  reabierto?: boolean;
}

export const EstadoBadge: FC<EstadoBadgeProps> = ({ estado, reabierto }) => {
  // Si por compatibilidad viene reabierto=true, lo tratamos como REABIERTO
  const isReabierto = estado === 'REABIERTO' || reabierto;

  if (estado === 'CERRADO') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700">
        Cerrado
      </span>
    );
  }

  if (isReabierto) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700">
        Reabierto
      </span>
    );
  }

  // Por defecto: pendiente
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">
      Pendiente
    </span>
  );
};
