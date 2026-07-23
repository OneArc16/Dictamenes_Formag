import { Prisma, type TipoDictamen } from '@prisma/client';
import type { z } from 'zod';

import type { AuthorizationContext } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import { parseColombiaDate } from '../domain/date';
import { buildNumeroDictamen } from '../domain/numero-dictamen';
import { registrarCasoDictamenSchema } from '../domain/schemas';
import { ApplicationError } from './errors';

type Input = z.infer<typeof registrarCasoDictamenSchema>;
type Tx = Prisma.TransactionClient;

function buildInitialRoute(
  dictamenId: number,
  documentoInicial: 'PCL' | 'ORIGEN',
) {
  return documentoInicial === 'ORIGEN'
    ? `/medico/dictamen/${dictamenId}/origen`
    : `/medico/dictamen/${dictamenId}`;
}

const optional = (value: unknown, max = 255) => {
  const normalized = String(value ?? '').trim();
  return normalized ? normalized.slice(0, max) : null;
};

function ageAt(date: Date | null, now = new Date()) {
  if (!date) return null;
  let age = now.getFullYear() - date.getFullYear();
  const month = now.getMonth() - date.getMonth();
  if (month < 0 || (month === 0 && now.getDate() < date.getDate())) age -= 1;
  return Math.max(0, age);
}

async function resolveCatalogs(tx: Tx, form: Input['form']) {
  const [country, department, municipality, eps, secretary, institution] =
    await Promise.all([
      tx.pais.findFirst({
        where: {
          OR: [
            { codigo: form.pais },
            { nombre: { equals: form.pais, mode: 'insensitive' } },
          ],
        },
        select: { codigo: true },
      }),
      form.departamento
        ? tx.departamento.findFirst({
            where: { nombre: { equals: form.departamento, mode: 'insensitive' } },
            select: { codigo: true },
          })
        : null,
      form.municipio
        ? tx.municipio.findFirst({
            where: { nombre: { equals: form.municipio, mode: 'insensitive' } },
            select: { codigo: true },
          })
        : null,
      tx.eps.findUnique({
        where: { codigo: form.codigoEps },
        select: { codigo: true },
      }),
      form.secretariaLabora
        ? tx.secretaria.findFirst({
            where: {
              nombre: { equals: form.secretariaLabora, mode: 'insensitive' },
            },
            select: { id: true },
          })
        : null,
      form.institucionLabora
        ? tx.institucionEducativa.findFirst({
            where: {
              nombre: { equals: form.institucionLabora, mode: 'insensitive' },
            },
            select: { id: true },
          })
        : null,
    ]);

  if (!eps) {
    throw new ApplicationError('INVALID_EPS', 'La EPS seleccionada no existe.', 400);
  }

  const barrio =
    municipality && form.barrio
      ? await tx.barrio.findFirst({
          where: {
            codigoMunicipio: municipality.codigo,
            nombre: { equals: form.barrio, mode: 'insensitive' },
          },
          select: { id: true },
        })
      : null;

  return {
    residenciaPais: country?.codigo ?? 'COL',
    codigoDepartamento: department?.codigo ?? null,
    codigoMunicipio: municipality?.codigo ?? null,
    codigoEps: eps.codigo,
    secretariaId: secretary?.id ?? null,
    institucionEducativaId: institution?.id ?? null,
    barrioId: barrio?.id ?? null,
  };
}

async function resolveSede(tx: Tx, empleadoId: number, usuarioId: number) {
  const [employee, user] = await Promise.all([
    tx.empleado.findUnique({ where: { id: empleadoId }, select: { idSede: true } }),
    tx.usuario.findUnique({ where: { id: usuarioId }, select: { idSede: true } }),
  ]);
  if (employee?.idSede) return employee.idSede;
  if (user?.idSede) return user.idSede;

  const active = await tx.sede.findMany({
    where: { estado: 1 },
    orderBy: { id: 'asc' },
    take: 2,
    select: { id: true },
  });
  if (active.length === 1) return active[0].id;

  throw new ApplicationError(
    'MISSING_SEDE',
    'No fue posible determinar la sede del expediente.',
    400,
  );
}

async function upsertDocente(tx: Tx, input: Input, actor: AuthorizationContext) {
  const form = input.form;
  const catalogs = await resolveCatalogs(tx, form);
  const birthDate = form.fechaNacimiento
    ? parseColombiaDate(form.fechaNacimiento)
    : null;
  const linkDate = form.fechaVinculacion
    ? parseColombiaDate(form.fechaVinculacion)
    : null;
  const sexo = form.sexo === 'M' ? 'H' : form.sexo === 'F' ? 'M' : 'O';
  const nivel = form.nivelEscalafon === 'NO_APLICA'
    ? '0'
    : form.nivelEscalafon.slice(0, 1);

  const data = {
    carnet: form.numeroDocumento,
    identificacion: form.numeroDocumento,
    tipoIdentificacion: form.tipoDocumento,
    primerNombre: form.primerNombre.toUpperCase(),
    segundoNombre: optional(form.segundoNombre, 50)?.toUpperCase() ?? null,
    primerApellido: form.primerApellido.toUpperCase(),
    segundoApellido: optional(form.segundoApellido, 50)?.toUpperCase() ?? null,
    direccion: optional(form.direccion),
    telefono: optional(form.telefono, 15),
    tipoUsuario: 'DO',
    unidadEdad: 'A',
    edad: ageAt(birthDate),
    sexo,
    residenciaPais: catalogs.residenciaPais,
    zonaResidencia: form.zona === 'RURAL' || form.zona === 'R' ? 'R' : 'U',
    fechaNacimiento: birthDate,
    estadoCivil: optional(form.estadoCivil, 20),
    sector: 'EDUCATIVO',
    codigoEps: catalogs.codigoEps,
    categoria: optional(form.categoria, 30),
    celular: optional(form.telefono, 15),
    barrio: optional(form.barrio, 50),
    barrioId: catalogs.barrioId,
    codigoDepartamento: catalogs.codigoDepartamento,
    codigoMunicipio: catalogs.codigoMunicipio,
    gradoEscalafon: form.gradoEscalafon,
    nivelEscalafon: nivel,
    formaVinculacion: form.formaVinculacion.toUpperCase(),
    secretariaId: catalogs.secretariaId,
    institucionEducativaId: catalogs.institucionEducativaId,
    cargoDocenteId: form.cargoDocenteId,
    escolaridad: optional(form.escolaridad, 5000),
    fechaVinculacion: linkDate,
    updatedBy: actor.name,
  };

  return tx.usuario.upsert({
    where: {
      identificacion_tipoIdentificacion: {
        identificacion: form.numeroDocumento,
        tipoIdentificacion: form.tipoDocumento,
      },
    },
    update: data,
    create: {
      ...data,
      createdBy: actor.name,
    },
    select: { id: true, identificacion: true },
  });
}

export async function registrarCasoDictamen(
  input: Input,
  auth: AuthorizationContext,
) {
  const existingOperation = await prisma.dictamen.findUnique({
    where: { operacionId: input.operacionId },
    select: { id: true, pclIniciadoEn: true },
  });
  if (existingOperation) {
    return {
      dictamenId: existingOperation.id,
      route: buildInitialRoute(
        existingOperation.id,
        existingOperation.pclIniciadoEn ? 'PCL' : 'ORIGEN',
      ),
      replayed: true,
    };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const docente = await upsertDocente(tx, input, auth);
      const activeCase = await tx.dictamen.findFirst({
        where: {
          usuarioId: docente.id,
          estado: true,
        },
        select: { id: true },
      });
      if (activeCase) {
        throw new ApplicationError(
          'ACTIVE_CASE_EXISTS',
          `El docente ya tiene un expediente activo (#${activeCase.id}).`,
          409,
        );
      }

      const sedeId = await resolveSede(tx, auth.empleadoId, docente.id);
      const today = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
      const date = parseColombiaDate(today);
      const originNumber = buildNumeroDictamen(today, docente.identificacion);
      const startsWithPcl = input.documentoInicial === 'PCL';

      const dictamen = await tx.dictamen.create({
        data: {
          usuarioId: docente.id,
          empleadoId: auth.empleadoId,
          sedeId,
          fechaDictamen: date,
          procedimientoPcl: 'A',
          tipoDictamen: input.form.tipoDictamen as TipoDictamen,
          flujoVersion: 'ORIGEN_PREVIO',
          operacionId: input.operacionId,
          ...(startsWithPcl
            ? {
                numeroDictamen: originNumber,
                pclIniciadoEn: new Date(),
              }
            : {}),
          formularioOrigen: {
            create: {
              fechaDictamenOrigen: date,
              numeroDictamenOrigen: originNumber,
              historial: {
                create: {
                  actorId: auth.empleadoId,
                  tipo: 'CREACION',
                  estadoNuevo: 'BORRADOR',
                  cambios: {
                    operacionId: input.operacionId,
                    documentoInicial: input.documentoInicial,
                  },
                },
              },
            },
          },
        },
        select: { id: true },
      });

      return {
        dictamenId: dictamen.id,
        route: buildInitialRoute(dictamen.id, input.documentoInicial),
        replayed: false,
      };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2002' || error.code === 'P2034')
    ) {
      const replay = await prisma.dictamen.findUnique({
        where: { operacionId: input.operacionId },
        select: { id: true, pclIniciadoEn: true },
      });
      if (replay) {
        return {
          dictamenId: replay.id,
          route: buildInitialRoute(replay.id, replay.pclIniciadoEn ? 'PCL' : 'ORIGEN'),
          replayed: true,
        };
      }
      throw new ApplicationError(
        'CASE_CONCURRENCY_CONFLICT',
        'Otro registro modificó este expediente. Reintenta la operación.',
        409,
      );
    }
    throw error;
  }
}
