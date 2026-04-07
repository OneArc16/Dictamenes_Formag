import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import PerfilesFilters from '@/components/admin/perfiles/PerfilesFilters';
import TogglePerfilButton from '@/components/admin/perfiles/TogglePerfilButton';

type Props = {
  searchParams?: Promise<{ q?: string; estado?: string }>;
};

export default async function PerfilesPage({ searchParams }: Props) {
  await requireAdmin('admin.perfiles.read');

  const sp = (await searchParams) ?? {};
  const q = (sp.q ?? '').trim();
  const estado = sp.estado ?? 'all';

  const where: Prisma.PerfilWhereInput = {};

  if (q) {
    where.nombre = { contains: q, mode: 'insensitive' };
  }

  if (estado === '1') where.estado = 1;
  if (estado === '0') where.estado = 0;

  const perfiles = await prisma.perfil.findMany({
    where,
    orderBy: { nombre: 'asc' },
    take: 100,
    select: {
      id: true,
      nombre: true,
      estado: true,
      _count: {
        select: {
          permisos: {
            where: { permitido: true },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Perfiles</h1>
          <p className="text-[11px] text-slate-500">Listado</p>
        </div>

        <Link
          href="/admin/perfiles/nuevo"
          className="rounded-full bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          + Nuevo perfil
        </Link>
      </div>

      <PerfilesFilters initialQ={q} initialEstado={estado} />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Permisos</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {perfiles.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={4}>
                  No hay resultados.
                </td>
              </tr>
            ) : (
              perfiles.map((perfil) => (
                <tr key={perfil.id} className="text-slate-700">
                  <td className="px-3 py-2 font-medium text-slate-900">{perfil.nombre}</td>

                  <td className="px-3 py-2">
                    <span
                      className={[
                        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        perfil.estado === 1
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700',
                      ].join(' ')}
                    >
                      {perfil.estado === 1 ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>

                  <td className="px-3 py-2 text-slate-600">
                    {perfil._count.permisos} asignados
                  </td>

                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/perfiles/${perfil.id}/permisos`}
                        className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700 shadow-sm hover:bg-blue-100"
                      >
                        Permisos
                      </Link>

                      <Link
                        href={`/admin/perfiles/${perfil.id}`}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                      >
                        Editar
                      </Link>

                      <TogglePerfilButton id={perfil.id} estado={perfil.estado} />
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
