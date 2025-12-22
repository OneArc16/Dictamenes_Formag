import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/guards';
import PerfilForm from '@/components/admin/perfiles/PerfilForm';

export default async function NuevoPerfilPage() {
  await requireAdmin();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Nuevo perfil</h1>
          <p className="text-[11px] text-slate-500">Crear perfil</p>
        </div>

        <Link
          href="/admin/perfiles"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Volver
        </Link>
      </div>

      <div className="p-4 bg-white border shadow-sm rounded-xl border-slate-200">
        <PerfilForm
          method="POST"
          apiUrl="/api/admin/perfiles"
          submitLabel="Crear perfil"
          successMessage="Perfil creado correctamente"
          onSuccessRedirectTo="/admin/perfiles"
        />
      </div>
    </div>
  );
}
