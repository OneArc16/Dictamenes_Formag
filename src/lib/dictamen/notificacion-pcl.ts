import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

type DbClient = typeof prisma | Prisma.TransactionClient;

type SedeSource = {
  sedeId?: number | null;
  empleado?: { idSede?: number | null } | null;
  usuario?: { idSede?: number | null } | null;
};

export type NotificacionPclData = {
  sede: {
    id: number;
    nombre: string;
    direccion: string | null;
    telefono: string | null;
    departamento: string | null;
    municipio: string | null;
  };
  notificador: {
    id: number;
    nombreCompleto: string;
    tipoDocumento: string | null;
    numeroIdentidad: string | null;
    registroMedico: string | null;
    licencia: string | null;
    email: string | null;
    telefonos: string | null;
    tratamiento: string | null;
    firmaMime: string | null;
    firmaSrc: string | null;
  } | null;
};

function isValidId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function buildNombreCompleto(empleado: {
  primerNombre: string | null;
  segundoNombre: string | null;
  primerApellido: string | null;
  segundoApellido: string | null;
}) {
  return [
    empleado.primerNombre,
    empleado.segundoNombre,
    empleado.primerApellido,
    empleado.segundoApellido,
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function guessFirmaMime(bytes: Buffer): string {
  if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'image/png';
  }

  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    return 'image/jpeg';
  }

  return 'image/png';
}

function firmaToDataUrl(bytes: Uint8Array | null, mime?: string | null) {
  if (!bytes || bytes.byteLength === 0) return null;

  const buffer = Buffer.from(bytes);
  const resolvedMime = mime || guessFirmaMime(buffer);

  return `data:${resolvedMime};base64,${buffer.toString('base64')}`;
}

export function resolveSedeIdFromDictamen(source: SedeSource): number | null {
  if (isValidId(source.sedeId)) return source.sedeId;
  if (isValidId(source.empleado?.idSede)) return source.empleado.idSede;
  if (isValidId(source.usuario?.idSede)) return source.usuario.idSede;

  return null;
}

export async function resolveSedeIdParaNuevoDictamen(
  params: { empleadoId: number | null; usuarioId: number },
  db: DbClient = prisma,
) {
  if (isValidId(params.empleadoId)) {
    const empleado = await db.empleado.findUnique({
      where: { id: params.empleadoId },
      select: { idSede: true },
    });

    if (isValidId(empleado?.idSede)) return empleado.idSede;
  }

  const usuario = await db.usuario.findUnique({
    where: { id: params.usuarioId },
    select: { idSede: true },
  });

  return isValidId(usuario?.idSede) ? usuario.idSede : null;
}

export async function getNotificacionPclPorSede(
  sedeId: number | null,
  db: DbClient = prisma,
  referenceDate = new Date(),
): Promise<NotificacionPclData | null> {
  if (!isValidId(sedeId)) return null;

  const sede = await db.sede.findUnique({
    where: { id: sedeId },
    select: {
      id: true,
      nombre: true,
      direccion: true,
      telefono: true,
      departamento: { select: { nombre: true } },
      municipio: { select: { nombre: true } },
    },
  });

  if (!sede) return null;

  const asignacion = await db.sedeNotificador.findFirst({
    where: {
      sedeId,
      estado: true,
      empleado: { activo: true },
      AND: [
        {
          OR: [
            { vigenteDesde: null },
            { vigenteDesde: { lte: referenceDate } },
          ],
        },
        {
          OR: [
            { vigenteHasta: null },
            { vigenteHasta: { gte: referenceDate } },
          ],
        },
      ],
    },
    orderBy: [
      { vigenteDesde: 'desc' },
      { id: 'desc' },
    ],
    select: {
      empleado: {
        select: {
          id: true,
          tipoDocumento: true,
          numeroIdentidad: true,
          primerNombre: true,
          segundoNombre: true,
          primerApellido: true,
          segundoApellido: true,
          registroMedico: true,
          licencia: true,
          email: true,
          telefonos: true,
          tratamiento: true,
          firma: true,
          firmaMime: true,
        },
      },
    },
  });

  const empleado = asignacion?.empleado ?? null;

  return {
    sede: {
      id: sede.id,
      nombre: sede.nombre,
      direccion: sede.direccion ?? null,
      telefono: sede.telefono ?? null,
      departamento: sede.departamento?.nombre ?? null,
      municipio: sede.municipio?.nombre ?? null,
    },
    notificador: empleado
      ? {
          id: empleado.id,
          nombreCompleto: buildNombreCompleto(empleado),
          tipoDocumento: empleado.tipoDocumento ?? null,
          numeroIdentidad: empleado.numeroIdentidad ?? null,
          registroMedico: empleado.registroMedico ?? null,
          licencia: empleado.licencia ?? null,
          email: empleado.email ?? null,
          telefonos: empleado.telefonos ?? null,
          tratamiento: empleado.tratamiento ?? null,
          firmaMime: empleado.firmaMime ?? null,
          firmaSrc: firmaToDataUrl(empleado.firma, empleado.firmaMime),
        }
      : null,
  };
}

export async function getNotificacionPclParaDictamen(
  dictamen: SedeSource,
  db: DbClient = prisma,
  referenceDate = new Date(),
) {
  return getNotificacionPclPorSede(resolveSedeIdFromDictamen(dictamen), db, referenceDate);
}