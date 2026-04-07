import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/guards';
import EmpleadoForm from '@/components/admin/empleados/EmpleadoForm';
import ResetPasswordButton from '@/components/admin/empleados/ResetPasswordButton';
import DeleteEmpleadoButton from '@/components/admin/empleados/DeleteEmpleadoButton';

export default async function EditarEmpleadoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin('admin.empleados.manage');

  const { id } = await params;
  const empleadoId = Number(id);

  if (!Number.isFinite(empleadoId)) {
    return (
      <div className="space-y-3">
        <h1 className="text-base font-semibold text-slate-900">Editar empleado</h1>
        <p className="text-[11px] text-slate-500">ID inválido</p>
      </div>
    );
  }

  const [perfiles, especialidades, empleado] = await Promise.all([
    prisma.perfil.findMany({
      where: { estado: 1 },
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true },
    }),
    prisma.especialidadMedica.findMany({
      where: { estado: true },
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true },
    }),
    prisma.empleado.findUnique({
      where: { id: empleadoId },
      include: {
        perfil: true,
        especialidades: { select: { especialidadId: true } }, // ✅ trae ids del join
      },
    }),
  ]);

  if (!empleado) {
    return (
      <div className="space-y-3">
        <h1 className="text-base font-semibold text-slate-900">Editar empleado</h1>
        <p className="text-[11px] text-slate-500">Empleado no encontrado</p>
        <Link
          href="/admin/empleados"
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
          <h1 className="text-base font-semibold text-slate-900">Editar empleado</h1>
          <p className="text-[11px] text-slate-500">ID {empleado.id} — actualiza datos y/o cambia contraseña</p>
        </div>

        <Link
          href="/admin/empleados"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Volver
        </Link>
      </div>

      {/* ✅ Card de Seguridad */}
      <div className="p-4 bg-white border shadow-sm rounded-xl border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Seguridad</h2>
            <p className="text-[11px] text-slate-500">Resetear contraseña del empleado</p>
          </div>

          <ResetPasswordButton id={empleado.id} />
        </div>
      </div>

      <div className="p-4 bg-white border shadow-sm rounded-xl border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Zona peligrosa</h2>
            <p className="text-[11px] text-slate-500">Eliminar definitivamente al empleado (si no tiene dictámenes)</p>
          </div>

          <DeleteEmpleadoButton id={empleado.id} />
        </div>
      </div>

      <div className="p-4 bg-white border shadow-sm rounded-xl border-slate-200">
        <EmpleadoForm
          perfiles={perfiles}
          especialidades={especialidades} // ✅ lista completa para el multiselect
          method="PATCH"
          apiUrl={`/api/admin/empleados/${empleado.id}`}
          submitLabel="Guardar cambios"
          successMessage="Empleado actualizado correctamente"
          onSuccessRedirectTo="/admin/empleados"
          showPassword={true}
          passwordRequired={false}
          passwordLabel="Nueva contraseña (opcional)"
          initialValues={{
            tipoDocumento: empleado.tipoDocumento ?? '',
            numeroIdentidad: empleado.numeroIdentidad ?? '',
            primerNombre: empleado.primerNombre ?? '',
            segundoNombre: empleado.segundoNombre ?? '',
            primerApellido: empleado.primerApellido ?? '',
            segundoApellido: empleado.segundoApellido ?? '',
            email: empleado.email ?? '',
            perfilId: empleado.perfilId != null ? String(empleado.perfilId) : '',
            activo: empleado.activo ?? true,
            telefonos: empleado.telefonos ?? '',
            direccion: empleado.direccion ?? '',
            registroMedico: empleado.registroMedico ?? '',
            licencia: empleado.licencia ?? '',

            // ✅ junta + especialidades seleccionadas
            esMiembroJunta: empleado.esMiembroJunta ?? false,
            especialidadIds: (empleado.especialidades ?? []).map((x) => x.especialidadId),
            tratamiento: empleado.tratamiento ?? '',
          }}
        />
      </div>
    </div>
  );
}