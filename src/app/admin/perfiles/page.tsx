import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import PerfilesFilters from '@/components/admin/perfiles/PerfilesFilters';
import TogglePerfilButton from '@/components/admin/perfiles/TogglePerfilButton';

type Props = {
  searchParams?: Promise<{ q?: string; estado?: string }>;
};

export default async function PerfilesPage({ searchParams }: Props) {
  await requireAdmin();

  const sp = (await searchParams) ?? {};
  const q = (sp.q ?? '').trim();
  const estado = sp.estado ?? 'all'; // all | 1 | 0

  const where: any = {};

  if (q) {
    where.nombre = { contains: q, mode: 'insensitive' };
  }

  if (estado === '1') where.estado = 1;
  if (estado === '0') where.estado = 0;

  const perfiles = await prisma.perfil.findMany({
    where,
    orderBy: { nombre: 'asc' },
    take: 100,
    select: { id: true, nombre: true, estado: true },
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

      <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-200">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {perfiles.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={3}>
                  No hay resultados.
                </td>
              </tr>
            ) : (
              perfiles.map((p) => (
                <tr key={p.id} className="text-slate-700">
                  <td className="px-3 py-2 font-medium text-slate-900">
                    {p.nombre}
                  </td>

                  <td className="px-3 py-2">
                    <span
                      className={[
                        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        p.estado === 1
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700',
                      ].join(' ')}
                    >
                      {p.estado === 1 ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>

                  <td className="flex items-center gap-2 px-3 py-2">
                    <Link
                      href={`/admin/perfiles/${p.id}`}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                      Editar
                    </Link>

                    <TogglePerfilButton id={p.id} estado={p.estado} />
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
