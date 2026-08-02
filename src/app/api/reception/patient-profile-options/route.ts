import { prisma } from '@/lib/prisma';
import { receptionAuth, receptionError, receptionJson } from '@/lib/http/with-reception-api';
import { isFideicomisosEps } from '@/features/reception/domain/patient-profile';

export async function GET(request: Request) {
  const auth = await receptionAuth(request);
  if (!auth.ok) return auth.response;
  try {
    const [eps, countries, departments, municipalities, neighborhoods, secretariats] = await Promise.all([
      prisma.eps.findMany({ select: { codigo: true, nombreEntidad: true }, orderBy: { nombreEntidad: 'asc' } }),
      prisma.pais.findMany({ select: { codigo: true, nombre: true }, orderBy: { nombre: 'asc' } }),
      prisma.departamento.findMany({ select: { codigo: true, nombre: true }, orderBy: { nombre: 'asc' } }),
      prisma.municipio.findMany({ select: { codigo: true, nombre: true, codigoDepartamento: true }, orderBy: { nombre: 'asc' } }),
      prisma.barrio.findMany({ select: { id: true, nombre: true, codigoMunicipio: true }, orderBy: { nombre: 'asc' } }),
      prisma.secretaria.findMany({ select: { id: true, nombre: true }, orderBy: { nombre: 'asc' } }),
    ]);
    return receptionJson(request, {
      eps: eps.map((item) => ({
        value: item.codigo,
        label: item.nombreEntidad,
        isFideicomisos: isFideicomisosEps(item.nombreEntidad),
      })),
      countries: countries.map((item) => ({ value: item.codigo, label: item.nombre })),
      departments: departments.map((item) => ({ value: item.codigo, label: item.nombre })),
      municipalities: municipalities.map((item) => ({ value: item.codigo, label: item.nombre, departmentCode: item.codigoDepartamento })),
      neighborhoods: neighborhoods.map((item) => ({ id: item.id, value: item.nombre, label: item.nombre, municipalityCode: item.codigoMunicipio })),
      secretariats: secretariats.map((item) => ({ value: String(item.id), label: item.nombre })),
    });
  } catch (error) {
    return receptionError(request, error);
  }
}
