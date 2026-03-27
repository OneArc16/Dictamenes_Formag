import Link from 'next/link';

import { requireAdmin } from '@/lib/auth/guards';
import MotivoReaperturaForm from '@/components/admin/motivos-reapertura/MotivoReaperturaForm';

export default async function NuevoMotivoReaperturaPage() {
  await requireAdmin();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Nuevo motivo de reapertura</h1>
          <p className="text-[11px] text-slate-500">Crea un motivo para reabrir recomendaciones y dictámenes cerrados</p>
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
          method="POST"
          apiUrl="/api/admin/motivos-reapertura"
          submitLabel="Crear motivo"
          successMessage="Motivo creado correctamente"
          onSuccessRedirectTo="/admin/motivos-reapertura"
        />
      </div>
    </div>
  );
}

