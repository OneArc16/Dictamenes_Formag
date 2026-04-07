import Link from 'next/link';

import PerfilPermisosForm from '@/components/admin/perfiles/PerfilPermisosForm';
import { requireAdmin } from '@/lib/auth/guards';
import { groupPermisos } from '@/lib/admin/permisos';
import { prisma } from '@/lib/prisma';

export default async function PerfilPermisosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin('admin.perfiles.manage');

  const { id } = await params;
  const perfilId = Number(id);

  if (!Number.isFinite(perfilId)) {
    return (
      <div className="space-y-3">
        <h1 className="text-base font-semibold text-slate-900">Permisos del perfil</h1>
        <p className="text-[11px] text-slate-500">ID invalido</p>
      </div>
    );
  }

  const [perfil, permisos] = await Promise.all([
    prisma.perfil.findUnique({
      where: { id: perfilId },
      select: {
        id: true,
        nombre: true,
        estado: true,
        permisos: {
          where: { permitido: true },
          select: { permisoId: true },
        },
      },
    }),
    prisma.permiso.findMany({
      where: { estado: 1 },
      orderBy: [{ modulo: 'asc' }, { nombre: 'asc' }],
      select: {
        id: true,
        codigo: true,
        nombre: true,
        descripcion: true,
        modulo: true,
      },
    }),
  ]);

  if (!perfil) {
    return (
      <div className="space-y-3">
        <h1 className="text-base font-semibold text-slate-900">Permisos del perfil</h1>
        <p className="text-[11px] text-slate-500">Perfil no encontrado</p>
        <Link
          href="/admin/perfiles"
          className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Volver
        </Link>
      </div>
    );
  }

  const groupedPermissions = groupPermisos(permisos);
  const selectedPermissionIds = perfil.permisos.map((item) => item.permisoId);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Permisos del perfil</h1>
          <p className="text-[11px] text-slate-500">{perfil.nombre}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              'inline-flex rounded-full px-3 py-1 text-[10px] font-semibold',
              perfil.estado === 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
            ].join(' ')}
          >
            {perfil.estado === 1 ? 'ACTIVO' : 'INACTIVO'}
          </span>

          <Link
            href={`/admin/perfiles/${perfil.id}`}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Editar perfil
          </Link>

          <Link
            href="/admin/perfiles"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Volver
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-900 shadow-sm">
        Asigna al menos un permiso de acceso al modulo correspondiente para que este perfil pueda entrar y operar dentro del sistema.
      </div>

      <PerfilPermisosForm
        perfilId={perfil.id}
        perfilNombre={perfil.nombre}
        groups={groupedPermissions}
        initialPermissionIds={selectedPermissionIds}
      />
    </div>
  );
}
