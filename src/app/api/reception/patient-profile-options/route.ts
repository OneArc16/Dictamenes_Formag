import { prisma } from '@/lib/prisma';
import { receptionAuth, receptionError, receptionJson } from '@/lib/http/with-reception-api';

export async function GET(request: Request) {
  const auth = await receptionAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const [eps, departments, municipalities] = await Promise.all([
      prisma.eps.findMany({ select: { codigo: true, nombreEntidad: true }, orderBy: { nombreEntidad: 'asc' } }),
      prisma.departamento.findMany({ select: { codigo: true, nombre: true }, orderBy: { nombre: 'asc' } }),
      prisma.municipio.findMany({ select: { codigo: true, nombre: true, codigoDepartamento: true }, orderBy: { nombre: 'asc' } }),
    ]);
    return receptionJson(request, {
      eps: eps.map((item) => ({ value: item.codigo, label: item.nombreEntidad })),
      departments: departments.map((item) => ({ value: item.codigo, label: item.nombre })),
      municipalities: municipalities.map((item) => ({ value: item.codigo, label: item.nombre, departmentCode: item.codigoDepartamento })),
    });
  } catch (error) {
    return receptionError(request, error);
  }
}
