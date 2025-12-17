import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import EmpleadoForm from './ui/EmpleadoForm';

export default async function NuevoEmpleadoPage() {
  await requireAdmin();

  const perfiles = await prisma.perfil.findMany({
    where: { estado: 1 },
    orderBy: { nombre: 'asc' },
    select: { id: true, nombre: true },
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Nuevo empleado</h1>
          <p className="text-[11px] text-slate-500">Crea usuarios del sistema (médico / admisión / admin)</p>
        </div>

        <Link
          href="/admin/empleados"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Volver
        </Link>
      </div>

      <div className="p-4 bg-white border shadow-sm rounded-xl border-slate-200">
        <EmpleadoForm perfiles={perfiles} />
      </div>
    </div>
  );
}
