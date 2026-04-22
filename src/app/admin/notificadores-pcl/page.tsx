import { requireAdmin } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';
import SedeNotificadoresManager, {
  type NotificadorEmpleadoOption,
  type SedeNotificadorRow,
} from '@/components/admin/notificadores-pcl/SedeNotificadoresManager';

function buildNombreCompleto(persona: {
  primerNombre: string | null;
  segundoNombre: string | null;
  primerApellido: string | null;
  segundoApellido: string | null;
}) {
  return [
    persona.primerNombre,
    persona.segundoNombre,
    persona.primerApellido,
    persona.segundoApellido,
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toDateInput(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}

export default async function NotificadoresPclPage() {
  await requireAdmin('admin.notificadores_pcl.read');

  const [sedesDb, empleadosDb] = await Promise.all([
    prisma.sede.findMany({
      where: { estado: 1 },
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        direccion: true,
        departamento: { select: { nombre: true } },
        municipio: { select: { nombre: true } },
        notificadores: {
          where: { estado: true },
          orderBy: [{ vigenteDesde: 'desc' }, { id: 'desc' }],
          take: 1,
          select: {
            empleadoId: true,
            vigenteDesde: true,
            vigenteHasta: true,
            empleado: {
              select: {
                primerNombre: true,
                segundoNombre: true,
                primerApellido: true,
                segundoApellido: true,
                firma: true,
              },
            },
          },
        },
      },
    }),
    prisma.empleado.findMany({
      where: { activo: true },
      orderBy: [{ primerApellido: 'asc' }, { primerNombre: 'asc' }],
      select: {
        id: true,
        tipoDocumento: true,
        numeroIdentidad: true,
        primerNombre: true,
        segundoNombre: true,
        primerApellido: true,
        segundoApellido: true,
        firma: true,
        sede: { select: { nombre: true } },
      },
    }),
  ]);

  const sedes: SedeNotificadorRow[] = sedesDb.map((sede) => {
    const current = sede.notificadores[0] ?? null;
    const ubicacion = [sede.municipio?.nombre, sede.departamento?.nombre, sede.direccion]
      .filter(Boolean)
      .join(' - ');

    return {
      id: sede.id,
      nombre: sede.nombre,
      ubicacion: ubicacion || null,
      current: current
        ? {
            empleadoId: current.empleadoId,
            nombreCompleto: buildNombreCompleto(current.empleado),
            vigenteDesde: toDateInput(current.vigenteDesde),
            vigenteHasta: toDateInput(current.vigenteHasta),
            tieneFirma: Boolean(current.empleado.firma),
          }
        : null,
    };
  });

  const empleados: NotificadorEmpleadoOption[] = empleadosDb.map((empleado) => ({
    id: empleado.id,
    nombreCompleto: buildNombreCompleto(empleado),
    documento: [empleado.tipoDocumento, empleado.numeroIdentidad].filter(Boolean).join(' ') || null,
    sedeNombre: empleado.sede?.nombre ?? null,
    tieneFirma: Boolean(empleado.firma),
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold text-slate-900">Notificadores PCL</h1>
          <p className="text-[11px] text-slate-500">
            Asigna el empleado que firmara o notificara el formato de notificacion PCL segun la sede.
          </p>
        </div>

        <div className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
          {sedes.length} sede{sedes.length === 1 ? '' : 's'} activa{sedes.length === 1 ? '' : 's'}
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-800">
        Solo puede quedar un notificador activo por sede. Si guardas otro empleado, la asignacion anterior queda inactiva.
      </div>

      <SedeNotificadoresManager sedes={sedes} empleados={empleados} />
    </div>
  );
}