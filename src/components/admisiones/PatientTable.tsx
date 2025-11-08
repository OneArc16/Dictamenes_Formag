'use client';
import type { Paciente } from '@/types/paciente';
import EpsBadge from './EpsBadge';

export default function PatientTable({
  rows, loading, onSelect,
}: {
  rows: Paciente[];
  loading: boolean;
  onSelect: (p: Paciente) => void;
}) {
  return (
    <div className="overflow-hidden border shadow-sm rounded-2xl border-subtle bg-panel">
      <table className="w-full text-sm">
        <thead className="bg-bg/70">
          <tr className="text-left text-muted">
            <th className="px-4 py-3">Documento</th>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Sexo</th>
            <th className="px-4 py-3">Edad</th>
            <th className="px-4 py-3">EPS</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted">
                {loading ? 'Cargando…' : 'Sin resultados'}
              </td>
            </tr>
          )}
          {rows.map((p) => {
            const nombre = fullName(p);
            const esFidu = (p.Codigo_eps ?? '').toUpperCase() === 'FIDU24';
            return (
              <tr
                key={p.IdUsuario}
                className="border-t cursor-pointer border-subtle hover:bg-bg"
                onClick={() => onSelect(p)}
              >
                <td className="px-4 py-3">{p.Identificaci_n_usuario}</td>
                <td className="px-4 py-3">{nombre}</td>
                <td className="px-4 py-3">{p.Sexo}</td>
                <td className="px-4 py-3">{p.Edad}</td>
                <td className="px-4 py-3"><EpsBadge value={p.Codigo_eps} isFidu={esFidu} /></td>
                <td className="px-4 py-3 text-right">
                  <button
                    className="rounded-lg border border-subtle bg-panel px-3 py-1.5 text-xs hover:bg-bg"
                    onClick={(e) => { e.stopPropagation(); onSelect(p); }}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function fullName(p: Pick<Paciente,
  'Primer_nombre'|'Segundo_nombre'|'Primer_apellido'|'Segundo_apellido'>) {
  return [p.Primer_nombre, p.Segundo_nombre ?? '', p.Primer_apellido, p.Segundo_apellido ?? '']
    .join(' ').replace(/\s+/g, ' ').trim().toUpperCase();
}
