import Link from 'next/link';

import { requireAdmin } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import SedeForm from '@/components/admin/sedes/SedeForm';

export default async function NuevaSedePage() {
  await requireAdmin('admin.sedes.manage');

  const centros = await prisma.centroMedico.findMany({
    orderBy: { nombre: 'asc' },
    select: { id: true, nombre: true },
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Nueva sede</h1>
          <p className="text-[11px] text-slate-500">Registra una sede de atención</p>
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
          method="POST"
          apiUrl="/api/admin/sedes"
          centros={centros}
          submitLabel="Crear sede"
          successMessage="Sede creada correctamente"
          onSuccessRedirectTo="/admin/sedes"
        />
      </div>
    </div>
  );
}
