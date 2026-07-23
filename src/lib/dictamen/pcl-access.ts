import type { AuthorizationContext } from '@/lib/auth/authorization';
import { hasCaseScope } from '@/lib/auth/case-scope';
import { prisma } from '@/lib/prisma';
import { canAccessPcl } from '@/features/formulario-origen/domain/policies';

type Failure = {
  ok: false;
  status: number;
  code: string;
  error: string;
  redirectTo?: string;
};

type Success = {
  ok: true;
  flujoVersion: 'LEGACY' | 'ORIGEN_PREVIO';
  originVersion: number | null;
};

export async function checkPclAccess(
  dictamenId: number,
  auth: Pick<AuthorizationContext, 'empleadoId' | 'permissions'>,
  options: { edit?: boolean; markStarted?: boolean; allowHistoricalClosed?: boolean } = {},
): Promise<Failure | Success> {
  const record = await prisma.dictamen.findUnique({
    where: { id: dictamenId },
    select: {
      id: true,
      empleadoId: true,
      estado: true,
      flujoVersion: true,
      pclIniciadoEn: true,
      formularioOrigen: {
        select: {
          estado: true,
          versionActual: true,
        },
      },
    },
  });

  if (!record) {
    return { ok: false, status: 404, code: 'PCL_NOT_FOUND', error: 'Dictamen no encontrado.' };
  }
  if (!hasCaseScope(auth, record.empleadoId)) {
    return { ok: false, status: 403, code: 'PCL_FORBIDDEN', error: 'No tiene acceso a este dictamen.' };
  }

  const access = canAccessPcl({
    flujoVersion: record.flujoVersion,
    formularioOrigenEstado: record.formularioOrigen?.estado,
    pclIniciado: record.pclIniciadoEn != null,
  });
  if (!access && !(options.allowHistoricalClosed && record.estado === false)) {
    return {
      ok: false,
      status: 409,
      code: 'PCL_BLOCKED_BY_ORIGIN',
      error:
        record.formularioOrigen?.estado === 'REABIERTO'
          ? 'El PCL está bloqueado mientras el Formulario de Origen se encuentra reabierto.'
          : 'Debes finalizar el Formulario de Determinación de Origen para diligenciar el Dictamen PCL.',
      redirectTo: `/medico/dictamen/${dictamenId}/origen`,
    };
  }
  if (options.edit && record.estado === false) {
    return { ok: false, status: 409, code: 'PCL_CLOSED', error: 'El Dictamen PCL está cerrado.' };
  }
  if (options.edit && !auth.permissions.includes('dictamen.edit')) {
    return { ok: false, status: 403, code: 'PCL_FORBIDDEN', error: 'No tiene permiso para editar el PCL.' };
  }

  if (
    options.markStarted &&
    access &&
    record.estado &&
    record.pclIniciadoEn == null
  ) {
    await prisma.dictamen.updateMany({
      where: { id: dictamenId, pclIniciadoEn: null },
      data: {
        pclIniciadoEn: new Date(),
        origenVersionUtilizadaPcl: record.formularioOrigen?.versionActual ?? null,
      },
    });
  }

  return {
    ok: true,
    flujoVersion: record.flujoVersion,
    originVersion: record.formularioOrigen?.versionActual ?? null,
  };
}
