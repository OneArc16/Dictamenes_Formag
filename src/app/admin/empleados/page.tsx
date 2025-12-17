import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';

type Props = {
  searchParams?: Promise<{ q?: string; activo?: string; perfilId?: string }>;
};

export default async function EmpleadosPage({ searchParams }: Props) {
  await requireAdmin();

  const sp = (await searchParams) ?? {};
  const q = (sp.q ?? '').trim();
  const activo = sp.activo ?? 'all';
  const perfilId = sp.perfilId ?? 'all';

  const perfiles = await prisma.perfil.findMany({
    where: { estado: 1 },
    orderBy: { nombre: 'asc' },
    select: { id: true, nombre: true },
  });

  const where: any = {};

  if (q) {
    where.OR = [
      { primerNombre: { contains: q, mode: 'insensitive' } },
      { segundoNombre: { contains: q, mode: 'insensitive' } },
      { primerApellido: { contains: q, mode: 'insensitive' } },
      { segundoApellido: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { numeroIdentidad: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (activo === '1') where.activo = true;
  if (activo === '0') where.activo = false;

  if (perfilId !== 'all') {
    const pid = Number(perfilId);
    if (Number.isFinite(pid)) where.perfilId = pid;
  }

  const empleados = await prisma.empleado.findMany({
    where,
    orderBy: { id: 'desc' },
    take: 50,
    include: { perfil: true },
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Empleados</h1>
          <p className="text-[11px] text-slate-500">Listado (últimos 50)</p>
        </div>

        <Link
          href="/admin/empleados/nuevo"
          className="rounded-full bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          + Nuevo empleado
        </Link>
      </div>

      <form className="grid grid-cols-12 gap-2 p-3 bg-white border shadow-sm rounded-xl border-slate-200" method="GET">
        <div className="col-span-12 md:col-span-6">
          <label className="block text-[11px] font-medium text-slate-600">Buscar</label>
          <input
            name="q"
            defaultValue={q}
            placeholder="Nombre, apellido, email o documento…"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <div className="col-span-6 md:col-span-3">
          <label className="block text-[11px] font-medium text-slate-600">Activo</label>
          <select
            name="activo"
            defaultValue={activo}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="all">Todos</option>
            <option value="1">Activos</option>
            <option value="0">Inactivos</option>
          </select>
        </div>

        <div className="col-span-6 md:col-span-3">
          <label className="block text-[11px] font-medium text-slate-600">Perfil</label>
          <select
            name="perfilId"
            defaultValue={perfilId}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="all">Todos</option>
            {perfiles.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end col-span-12">
          <button
            type="submit"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Filtrar
          </button>
        </div>
      </form>

      <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-200">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Documento</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Perfil</th>
              <th className="px-3 py-2">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {empleados.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={5}>
                  No hay resultados.
                </td>
              </tr>
            ) : (
              empleados.map((e) => (
                <tr key={e.id} className="text-slate-700">
                  <td className="px-3 py-2 font-medium text-slate-900">
                    {e.primerNombre} {e.segundoNombre ?? ''} {e.primerApellido} {e.segundoApellido ?? ''}
                  </td>
                  <td className="px-3 py-2">
                    {(e.tipoDocumento ?? '').toString()} {e.numeroIdentidad ?? ''}
                  </td>
                  <td className="px-3 py-2">{e.email ?? '-'}</td>
                  <td className="px-3 py-2">{e.perfil?.nombre ?? '-'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={[
                        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        e.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
                      ].join(' ')}
                    >
                      {e.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
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
