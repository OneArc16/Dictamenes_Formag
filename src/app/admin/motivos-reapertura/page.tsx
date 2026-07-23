import Link from 'next/link';
import { Prisma } from '@prisma/client';

import { requireAdmin } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import MotivosReaperturaFilters from '@/components/admin/motivos-reapertura/MotivosReaperturaFilters';
import ToggleMotivoReaperturaEstadoButton from '@/components/admin/motivos-reapertura/ToggleMotivoReaperturaEstadoButton';

type Props = {
  searchParams?: Promise<{ q?: string; estado?: string }>;
};

function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(value);
}

export default async function MotivosReaperturaPage({ searchParams }: Props) {
  await requireAdmin('admin.motivos_reapertura.read');

  const sp = (await searchParams) ?? {};
  const q = (sp.q ?? '').trim();
  const estado = sp.estado ?? 'all';

  const where: Prisma.MotivoReaperturaWhereInput = {};

  if (q) {
    where.OR = [
      { codigo: { contains: q, mode: 'insensitive' } },
      { nombre: { contains: q, mode: 'insensitive' } },
      { descripcion: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (estado === '1') where.estado = true;
  if (estado === '0') where.estado = false;

  const motivos = await prisma.motivoReapertura.findMany({
    where,
    orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
    take: 100,
    select: {
      id: true,
      codigo: true,
      nombre: true,
      descripcion: true,
      orden: true,
      estado: true,
      updatedAt: true,
      alcances: { select: { alcance: true } },
    },
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Motivos de reapertura</h1>
          <p className="text-[11px] text-slate-500">Catálogo compartido para reabrir recomendaciones y dictámenes</p>
        </div>

        <Link
          href="/admin/motivos-reapertura/nuevo"
          className="rounded-full bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          + Nuevo motivo
        </Link>
      </div>

      <MotivosReaperturaFilters initialQ={q} initialEstado={estado} />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2">Código</th>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Descripción</th>
              <th className="px-3 py-2">Aplica a</th>
              <th className="px-3 py-2">Orden</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Actualizado</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {motivos.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={8}>
                  No hay motivos de reapertura para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              motivos.map((motivo) => (
                <tr key={motivo.id} className="text-slate-700">
                  <td className="px-3 py-2 text-slate-600">{motivo.codigo ?? '—'}</td>

                  <td className="px-3 py-2 font-medium text-slate-900">{motivo.nombre}</td>

                  <td className="px-3 py-2 text-slate-600">
                    <p className="max-w-xl leading-5">{motivo.descripcion ?? '—'}</p>
                  </td>

                  <td className="px-3 py-2 text-slate-600">
                    {motivo.alcances.map((item) => item.alcance).join(', ') || '—'}
                  </td>

                  <td className="px-3 py-2">{motivo.orden}</td>

                  <td className="px-3 py-2">
                    <span
                      className={[
                        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        motivo.estado
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700',
                      ].join(' ')}
                    >
                      {motivo.estado ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>

                  <td className="px-3 py-2 text-slate-500">{formatDateTime(motivo.updatedAt)}</td>

                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/motivos-reapertura/${motivo.id}`}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                      >
                        Editar
                      </Link>

                      <ToggleMotivoReaperturaEstadoButton motivoId={motivo.id} estado={motivo.estado} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

