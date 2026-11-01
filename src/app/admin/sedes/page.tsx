import Link from 'next/link';
import { Prisma } from '@prisma/client';

import { requireAdmin } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import SedesFilters from '@/components/admin/sedes/SedesFilters';
import ToggleSedeEstadoButton from '@/components/admin/sedes/ToggleSedeEstadoButton';

type Props = {
  searchParams?: Promise<{ q?: string; estado?: string }>;
};

export default async function SedesPage({ searchParams }: Props) {
  await requireAdmin('admin.sedes.read');

  const sp = (await searchParams) ?? {};
  const q = (sp.q ?? '').trim();
  const estado = sp.estado ?? 'all';

  const where: Prisma.SedeWhereInput = {};
  if (q) {
    where.OR = [
      { nombre: { contains: q, mode: 'insensitive' } },
      { codigoHabilitacion: { contains: q, mode: 'insensitive' } },
      { direccion: { contains: q, mode: 'insensitive' } },
      { telefono: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (estado === '1') where.estado = 1;
  if (estado === '0') where.estado = 0;

  const sedes = await prisma.sede.findMany({
    where,
    orderBy: [{ estado: 'desc' }, { nombre: 'asc' }],
    take: 200,
    select: {
      id: true,
      nombre: true,
      codigoHabilitacion: true,
      direccion: true,
      telefono: true,
      estado: true,
      centroMedico: { select: { nombre: true } },
    },
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Sedes</h1>
          <p className="text-[11px] text-slate-500">Sedes de atención disponibles en el sistema</p>
        </div>

        <Link
          href="/admin/sedes/nuevo"
          className="rounded-full bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          + Nueva sede
        </Link>
      </div>

      <SedesFilters initialQ={q} initialEstado={estado} />

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Centro médico</th>
              <th className="px-3 py-2">Cód. habilitación</th>
              <th className="px-3 py-2">Dirección</th>
              <th className="px-3 py-2">Teléfono</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {sedes.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={7}>
                  No hay sedes para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              sedes.map((sede) => (
                <tr key={sede.id} className="text-slate-700">
                  <td className="px-3 py-2 font-medium text-slate-900">{sede.nombre}</td>
                  <td className="px-3 py-2 text-slate-600">{sede.centroMedico.nombre}</td>
                  <td className="px-3 py-2 text-slate-600">{sede.codigoHabilitacion ?? '—'}</td>
                  <td className="px-3 py-2 text-slate-600">{sede.direccion ?? '—'}</td>
                  <td className="px-3 py-2 text-slate-600">{sede.telefono ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={[
                        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        sede.estado === 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
                      ].join(' ')}
                    >
                      {sede.estado === 1 ? 'ACTIVA' : 'INACTIVA'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/sedes/${sede.id}`}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                      >
                        Editar
                      </Link>
                      <ToggleSedeEstadoButton sedeId={sede.id} activa={sede.estado === 1} />
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
