import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session'; // <-- ajusta a la ruta real donde tienes getSession

export type CurrentEmpleado = {
  id: number;
  nombre: string;
  activo: boolean;
  perfilNombre: string; // viene de Perfil.nombre
  email: string | null;
};

export async function getCurrentEmpleado(): Promise<CurrentEmpleado | null> {
  const session = await getSession();
  if (!session) return null;

  // Asumo que session.sub es el ID numérico de Empleado
  const empleadoId = Number(session.sub);
  if (!Number.isFinite(empleadoId)) return null;

  const emp = await prisma.empleado.findUnique({
    where: { id: empleadoId },
    include: { perfil: true },
  });

  if (!emp || !emp.activo) return null;

  return {
    id: emp.id,
    nombre: `${emp.primerNombre} ${emp.primerApellido}`,
    activo: emp.activo,
    perfilNombre: emp.perfil?.nombre ?? session.role, // fallback
    email: emp.email,
  };
}
