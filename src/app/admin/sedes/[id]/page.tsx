import Link from 'next/link';

import { requireAdmin } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import SedeForm from '@/components/admin/sedes/SedeForm';

export default async function EditarSedePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin('admin.sedes.manage');

  const { id } = await params;
  const sedeId = Number(id);

  const sede = Number.isInteger(sedeId)
    ? await prisma.sede.findUnique({
        where: { id: sedeId },
        select: {
          id: true,
          centroMedicoId: true,
          nombre: true,
          codigoHabilitacion: true,
          direccion: true,
          telefono: true,
        },
      })
    : null;

  if (!sede) {
    return (
      <div className="space-y-3">
        <h1 className="text-base font-semibold text-slate-900">Editar sede</h1>
        <p className="text-[11px] text-slate-500">Sede no encontrada</p>
        <Link
          href="/admin/sedes"
          className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Volver
        </Link>
      </div>
    );
  }

  const centros = await prisma.centroMedico.findMany({
    orderBy: { nombre: 'asc' },
    select: { id: true, nombre: true },
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Editar sede</h1>
          <p className="text-[11px] text-slate-500">ID {sede.id}</p>
        </div>

        <Link
          href="/admin/sedes"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Volver
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <SedeForm
          method="PATCH"
          apiUrl={`/api/admin/sedes/${sede.id}`}
          centros={centros}
          submitLabel="Guardar cambios"
          successMessage="Sede actualizada correctamente"
          onSuccessRedirectTo="/admin/sedes"
          initialValues={sede}
        />
      </div>
    </div>
  );
}
