import { prisma } from '@/lib/prisma';
import { receptionAuth, receptionError, receptionJson } from '@/lib/http/with-reception-api';
import { uniqueByNormalizedName } from '@/features/reception/domain/catalog-options';

export async function GET(request: Request) {
  const auth = await receptionAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const params = new URL(request.url).searchParams;
    const query = params.get('q')?.trim() ?? '';
    const secretariatId = Number(params.get('secretariatId'));
    const municipalityCode = params.get('municipalityCode')?.trim() || undefined;

    if (query.length < 3 || !Number.isInteger(secretariatId) || secretariatId <= 0) {
      return receptionJson(request, []);
    }

    const institutions = await prisma.institucionEducativa.findMany({
      where: {
        idSecretaria: secretariatId,
        ...(municipalityCode ? { OR: [{ idMunicipio: municipalityCode }, { idMunicipio: null }] } : {}),
        nombre: { contains: query, mode: 'insensitive' },
      },
      select: { id: true, nombre: true },
      orderBy: [{ nombre: 'asc' }, { id: 'asc' }],
      take: 250,
    });

    const uniqueInstitutions = uniqueByNormalizedName(institutions).slice(0, 50);
    return receptionJson(request, uniqueInstitutions.map((item) => ({
      value: String(item.id),
      label: item.nombre,
    })));
  } catch (error) {
    return receptionError(request, error);
  }
}
