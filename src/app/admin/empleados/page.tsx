import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import EmpleadosFilters from '@/components/admin/empleados/EmpleadosFilters';
import ToggleEmpleadoButton from '@/components/admin/empleados/ToggleEmpleadoButton';

type Props = {
  searchParams?: Promise<{
    q?: string;
    activo?: string;
    perfilId?: string;
    page?: string;
  }>;
};

export default async function EmpleadosPage({ searchParams }: Props) {
  await requireAdmin('admin.empleados.read');

  const sp = (await searchParams) ?? {};
  const q = (sp.q ?? '').trim();
  const activo = sp.activo ?? 'all';
  const perfilId = sp.perfilId ?? 'all';

  // ✅ paginación
  const pageSize = 20;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const skip = (page - 1) * pageSize;

  const perfiles = await prisma.perfil.findMany({
    where: { estado: 1 },
    orderBy: { nombre: 'asc' },
    select: { id: true, nombre: true },
  });

  const where: Prisma.EmpleadoWhereInput = {};

  if (q) {
    where.OR = [
      { primerNombre: { contains: q, mode: 'insensitive' } },
      { segundoNombre: { contains: q, mode: 'insensitive' } },
      { primerApellido: { contains: q, mode: 'insensitive' } },
      { segundoApellido: { contains: q, mode: 'insensitive' } },
      { usuario: { contains: q, mode: 'insensitive' } },
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

  const [total, empleados] = await Promise.all([
    prisma.empleado.count({ where }),
    prisma.empleado.findMany({
      where,
      orderBy: { id: 'desc' },
      skip,
      take: pageSize,
      include: { perfil: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (activo !== 'all') params.set('activo', activo);
    if (perfilId !== 'all') params.set('perfilId', perfilId);
    if (nextPage > 1) params.set('page', String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/empleados?${qs}` : '/admin/empleados';
  };

  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Empleados</h1>
          <p className="text-[11px] text-slate-500">
            Mostrando {from}-{to} de {total}
          </p>
        </div>

        <Link
          href="/admin/empleados/nuevo"
          className="rounded-full bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          + Nuevo empleado
        </Link>
      </div>

      <EmpleadosFilters
        perfiles={perfiles}
        initialQ={q}
        initialActivo={activo}
        initialPerfilId={perfilId}
      />

      <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-200">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Usuario</th>
              <th className="px-3 py-2">Documento</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Perfil</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {empleados.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={7}>
                  No hay resultados.
                </td>
              </tr>
            ) : (
              empleados.map((e) => (
                <tr key={e.id} className="text-slate-700">
                  <td className="px-3 py-2 font-medium text-slate-900">
                    {e.primerNombre} {e.segundoNombre ?? ''} {e.primerApellido}{' '}
                    {e.segundoApellido ?? ''}
                  </td>

                  <td className="px-3 py-2">{e.usuario ?? '-'}</td>

                  <td className="px-3 py-2">
                    {(e.tipoDocumento ?? '').toString()} {e.numeroIdentidad ?? ''}
                  </td>

                  <td className="px-3 py-2">{e.email ?? '-'}</td>

                  <td className="px-3 py-2">{e.perfil?.nombre ?? '-'}</td>

                  <td className="px-3 py-2">
                    <span
                      className={[
                        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        e.activo
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700',
                      ].join(' ')}
                    >
                      {e.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>

                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/empleados/${e.id}/editar`}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                      >
                        Editar
                      </Link>

                      <ToggleEmpleadoButton id={e.id} activo={e.activo} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ✅ Paginación */}
        <div className="flex items-center justify-between px-3 py-2 bg-white border-t border-slate-200">
          <span className="text-[11px] text-slate-500">
            Página {safePage} de {totalPages}
          </span>

          <div className="flex items-center gap-2">
            {safePage > 1 ? (
              <Link
                href={buildHref(safePage - 1)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                ← Anterior
              </Link>
            ) : (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-400">
                ← Anterior
              </span>
            )}

            {safePage < totalPages ? (
              <Link
                href={buildHref(safePage + 1)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Siguiente →
              </Link>
            ) : (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-400">
                Siguiente →
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
