import Link from 'next/link';

import PerfilForm from '@/components/admin/perfiles/PerfilForm';
import { requireAdmin } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';

export default async function EditarPerfilPage({
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
        <h1 className="text-base font-semibold text-slate-900">Editar perfil</h1>
        <p className="text-[11px] text-slate-500">ID invalido</p>
      </div>
    );
  }

  const perfil = await prisma.perfil.findUnique({
    where: { id: perfilId },
    select: { id: true, nombre: true, estado: true },
  });

  if (!perfil) {
    return (
      <div className="space-y-3">
        <h1 className="text-base font-semibold text-slate-900">Editar perfil</h1>
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Editar perfil</h1>
          <p className="text-[11px] text-slate-500">ID {perfil.id}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/perfiles/${perfil.id}/permisos`}
            className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-[11px] font-semibold text-blue-700 shadow-sm hover:bg-blue-100"
          >
            Permisos
          </Link>

          <Link
            href="/admin/perfiles"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Volver
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <PerfilForm
          method="PATCH"
          apiUrl={`/api/admin/perfiles/${perfil.id}`}
          submitLabel="Guardar cambios"
          successMessage="Perfil actualizado correctamente"
          onSuccessRedirectTo="/admin/perfiles"
          initialNombre={perfil.nombre ?? ''}
        />
      </div>
    </div>
  );
}
