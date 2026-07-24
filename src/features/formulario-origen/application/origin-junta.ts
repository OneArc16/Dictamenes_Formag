import { prisma } from '@/lib/prisma';

export type OriginJuntaSnapshot = {
  tipoDocumento: string | null;
  numeroDocumento: string | null;
  nombreCompleto: string;
  especialidad: string | null;
  registroMedico: string | null;
  licencia: string | null;
  firmaSrc: string | null;
};

function fullName(person: {
  primerNombre: string | null;
  segundoNombre: string | null;
  primerApellido: string | null;
  segundoApellido: string | null;
}) {
  return [
    person.primerNombre,
    person.segundoNombre,
    person.primerApellido,
    person.segundoApellido,
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function signatureDataUrl(
  bytes: Uint8Array | null,
  storedMime: string | null,
): string | null {
  if (!bytes?.length) return null;
  const buffer = Buffer.from(bytes);
  const detectedMime =
    buffer[0] === 0xff && buffer[1] === 0xd8 ? 'image/jpeg' : 'image/png';
  return `data:${storedMime || detectedMime};base64,${buffer.toString('base64')}`;
}

export async function getActiveOriginJuntaSnapshot(): Promise<
  OriginJuntaSnapshot[]
> {
  const members = await prisma.empleado.findMany({
    where: {
      activo: true,
      esMiembroJunta: true,
    },
    orderBy: [{ id: 'asc' }],
    select: {
      tipoDocumento: true,
      numeroIdentidad: true,
      primerNombre: true,
      segundoNombre: true,
      primerApellido: true,
      segundoApellido: true,
      registroMedico: true,
      licencia: true,
      firma: true,
      firmaMime: true,
      especialidades: {
        orderBy: [{ principal: 'desc' }, { id: 'asc' }],
        select: {
          especialidad: { select: { nombre: true } },
        },
      },
    },
  });

  return members.map((member) => ({
    tipoDocumento: member.tipoDocumento,
    numeroDocumento: member.numeroIdentidad,
    nombreCompleto: fullName(member),
    especialidad: member.especialidades[0]?.especialidad.nombre ?? null,
    registroMedico: member.registroMedico,
    licencia: member.licencia,
    firmaSrc: signatureDataUrl(member.firma, member.firmaMime),
  }));
}
