import Link from 'next/link';
import { type Prisma } from '@prisma/client';
import { notFound } from 'next/navigation';

import AppNav from '@/components/AppNav';
import { DictamenFormLayout } from '@/components/dictamen/DictamenFormLayout';
import { RecomendacionDetalleCenterPanel } from '@/components/recomendaciones/detail/RecomendacionDetalleCenterPanel';
import { RecomendacionDetalleLeftPanel } from '@/components/recomendaciones/detail/RecomendacionDetalleLeftPanel';
import { RecomendacionDetalleRightPanel } from '@/components/recomendaciones/detail/RecomendacionDetalleRightPanel';
import {
  type RecomendacionDetalleViewModel,
  type RecomendacionMotivoReaperturaOption,
} from '@/components/recomendaciones/detail/types';
import {
  buildRecomendacionHistoryChanges,
  parseRecomendacionHistorySnapshot,
} from '@/lib/recomendaciones/historial';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { hasAbility } from '@/lib/auth/ability-utils';

function formatDate(value: Date | null) {
  if (!value) return 'Sin fecha';

  return value.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatDateTime(value: Date) {
  return value.toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDecimal(value: unknown) {
  if (value == null) return null;
  const formatted = String(value).trim();
  return formatted.length > 0 ? formatted : null;
}

function fullName(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

export default async function RecomendacionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recomendacionId = Number(id);

  if (!Number.isFinite(recomendacionId)) {
    notFound();
  }

  const [recomendacion, session, motivosReapertura] = await Promise.all([
    prisma.recomendacionLaboral.findUnique({
      where: { id: recomendacionId },
      include: {
        usuario: {
          include: {
            eps: true,
            cargoDocente: true,
            secretariaRef: true,
            institucionEducativaRef: {
              include: {
                secretaria: true,
              },
            },
          },
        },
        empleado: true,
        historial: {
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          select: {
            id: true,
            tipo: true,
            estadoAnterior: true,
            estadoNuevo: true,
            formularioAnterior: true,
            formularioNuevo: true,
            createdAt: true,
            empleado: {
              select: {
                primerNombre: true,
                segundoNombre: true,
                primerApellido: true,
                segundoApellido: true,
              },
            },
            motivoReapertura: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
    }),
    getSession(),
    prisma.motivoReapertura.findMany({
      where: { estado: true },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
      select: {
        id: true,
        nombre: true,
        descripcion: true,
      },
    }),
  ]);

  if (!recomendacion) {
    notFound();
  }

  const docente = recomendacion.usuario;
  const medico = recomendacion.empleado;
  const sessionRole = session?.role ?? null;
  const sessionEmpleadoId = Number(session?.sub ?? Number.NaN);
  const ownsRecomendacion =
    Number.isFinite(sessionEmpleadoId) &&
    recomendacion.empleadoId != null &&
    recomendacion.empleadoId === sessionEmpleadoId;

  const canEdit =
    sessionRole === 'MEDICO' &&
    hasAbility(session, 'recomendacion.edit') &&
    (recomendacion.empleadoId == null || ownsRecomendacion);

  const canClose =
    sessionRole === 'MEDICO' &&
    hasAbility(session, 'recomendacion.close') &&
    (recomendacion.empleadoId == null || ownsRecomendacion) &&
    (recomendacion.estado === 'BORRADOR' || recomendacion.estado === 'REABIERTO');

  const canReopen =
    recomendacion.estado === 'CERRADA' &&
    hasAbility(session, 'recomendacion.reopen') &&
    (sessionRole === 'ADMIN' ||
      sessionRole === 'ADMISIONISTA' ||
      (sessionRole === 'MEDICO' && ownsRecomendacion));

  const canPrint = hasAbility(session, 'recomendacion.print');

  const detalle: RecomendacionDetalleViewModel = {
    id: recomendacion.id,
    numeroReferencia: recomendacion.numeroRecomendacion,
    fechaAtencion: formatDate(recomendacion.fechaRecomendacion),
    estado: recomendacion.estado,
    docente: {
      nombreCompleto:
        fullName(
          docente.primerNombre,
          docente.segundoNombre,
          docente.primerApellido,
          docente.segundoApellido,
        ) || 'Docente sin nombre',
      tipoDocumento: docente.tipoIdentificacion,
      numeroDocumento: docente.identificacion,
      estadoCivil: docente.estadoCivil,
      edad: docente.edad != null ? `${docente.edad} anos` : null,
      direccion: docente.direccion,
      telefono: docente.telefono ?? docente.celular ?? null,
      aseguradora: docente.eps?.nombreEntidad ?? null,
      cargo: docente.cargoDocente?.nombre ?? null,
      secretaria:
        docente.secretariaRef?.nombre ??
        docente.institucionEducativaRef?.secretaria?.nombre ??
        null,
      institucion: docente.institucionEducativaRef?.nombre ?? null,
    },
    medicoResponsable:
      medico
        ? fullName(
            medico.primerNombre,
            medico.segundoNombre,
            medico.primerApellido,
            medico.segundoApellido,
          ) || 'Sin medico asignado'
        : 'Sin medico asignado',
    datosAtencion: {
      talla: formatDecimal(recomendacion.tallaM),
      peso: formatDecimal(recomendacion.pesoKg),
      imc: formatDecimal(recomendacion.imc),
    },
    examenesRealizados: recomendacion.examenesRealizados ?? '',
    motivo: recomendacion.motivo ?? '',
    recomendacionesObservacionesRestricciones:
      recomendacion.recomendacionesObservacionesRestricciones ?? '',
    historial: recomendacion.historial.map((item) => {
      const actorNombre =
        fullName(
          item.empleado?.primerNombre,
          item.empleado?.segundoNombre,
          item.empleado?.primerApellido,
          item.empleado?.segundoApellido,
        ) || 'Usuario no disponible';

      const previousSnapshot = parseRecomendacionHistorySnapshot(
        item.formularioAnterior as Prisma.JsonValue | null,
      );
      const nextSnapshot = parseRecomendacionHistorySnapshot(
        item.formularioNuevo as Prisma.JsonValue | null,
      );

      return {
        id: item.id,
        tipo: item.tipo,
        fecha: formatDateTime(item.createdAt),
        actorNombre,
        estadoAnterior: item.estadoAnterior,
        estadoNuevo: item.estadoNuevo,
        motivoReapertura: item.motivoReapertura?.nombre ?? null,
        cambios: buildRecomendacionHistoryChanges(previousSnapshot, nextSnapshot),
      };
    }),
  };


  const motivos: RecomendacionMotivoReaperturaOption[] = motivosReapertura.map((item) => ({
    id: item.id,
    nombre: item.nombre,
    descripcion: item.descripcion,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav title="Recomendaciones Laborales" showModulesButton={false} />

      <main className="px-4 py-4 lg:px-8">
        <Link
          href="/recomendaciones"
          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
        >
          Volver al listado de recomendaciones
        </Link>

        <div className="mt-4">
          <DictamenFormLayout
            stickyTopClassName="top-20"
            left={<RecomendacionDetalleLeftPanel detalle={detalle} canEdit={canEdit} />}
            center={<RecomendacionDetalleCenterPanel detalle={detalle} canEdit={canEdit} />}
            right={
              <RecomendacionDetalleRightPanel
                recomendacionId={detalle.id}
                estado={detalle.estado}
                canClose={canClose}
                canReopen={canReopen}
                canPrint={canPrint}
                motivosReapertura={motivos}
              />
            }
          />
        </div>
      </main>
    </div>
  );
}


