// src/components/dictamen/EstadoBadge.tsx
import { FC } from 'react';

interface EstadoBadgeProps {
  estado: 'PENDIENTE' | 'CERRADO';
  reabierto?: boolean;
}

export const EstadoBadge: FC<EstadoBadgeProps> = ({ estado, reabierto }) => {
  if (estado === 'PENDIENTE') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
        Pendiente
        {reabierto && (
          <span className="text-[10px] uppercase tracking-wide">
            Reabierto
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
      Cerrado
    </span>
  );
};
