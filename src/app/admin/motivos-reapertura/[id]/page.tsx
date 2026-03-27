import Link from 'next/link';

import { requireAdmin } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import MotivoReaperturaForm from '@/components/admin/motivos-reapertura/MotivoReaperturaForm';

export default async function EditarMotivoReaperturaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const motivoId = Number(id);

  if (!Number.isFinite(motivoId)) {
    return (
      <div className="space-y-3">
        <h1 className="text-base font-semibold text-slate-900">Editar motivo de reapertura</h1>
        <p className="text-[11px] text-slate-500">ID inválido</p>
      </div>
    );
  }

  const motivo = await prisma.motivoReapertura.findUnique({
    where: { id: motivoId },
    select: {
      id: true,
      codigo: true,
      nombre: true,
      descripcion: true,
      orden: true,
      estado: true,
    },
  });

  if (!motivo) {
    return (
      <div className="space-y-3">
        <h1 className="text-base font-semibold text-slate-900">Editar motivo de reapertura</h1>
        <p className="text-[11px] text-slate-500">Motivo no encontrado</p>
        <Link
          href="/admin/motivos-reapertura"
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
          <h1 className="text-base font-semibold text-slate-900">Editar motivo de reapertura</h1>
          <p className="text-[11px] text-slate-500">ID {motivo.id}</p>
        </div>

        <Link
          href="/admin/motivos-reapertura"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Volver
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <MotivoReaperturaForm
          method="PATCH"
          apiUrl={`/api/admin/motivos-reapertura/${motivo.id}`}
          submitLabel="Guardar cambios"
          successMessage="Motivo actualizado correctamente"
          onSuccessRedirectTo="/admin/motivos-reapertura"
          initialValues={{
            codigo: motivo.codigo,
            nombre: motivo.nombre,
            descripcion: motivo.descripcion,
            orden: motivo.orden,
            estado: motivo.estado,
          }}
        />
      </div>
    </div>
  );
}

