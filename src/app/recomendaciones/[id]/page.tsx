import Link from 'next/link';
import { notFound } from 'next/navigation';

import AppNav from '@/components/AppNav';
import { DictamenFormLayout } from '@/components/dictamen/DictamenFormLayout';
import { RecomendacionDetalleCenterPanel } from '@/components/recomendaciones/detail/RecomendacionDetalleCenterPanel';
import { RecomendacionDetalleLeftPanel } from '@/components/recomendaciones/detail/RecomendacionDetalleLeftPanel';
import { RecomendacionDetalleRightSpacer } from '@/components/recomendaciones/detail/RecomendacionDetalleRightSpacer';
import { type RecomendacionDetalleViewModel } from '@/components/recomendaciones/detail/types';
import { prisma } from '@/lib/prisma';

function formatDate(value: Date | null) {
  if (!value) return 'Sin fecha';

  return value.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatDateInput(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
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

  const recomendacion = await prisma.recomendacionLaboral.findUnique({
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
      examenes: {
        orderBy: { orden: 'asc' },
      },
    },
  });

  if (!recomendacion) {
    notFound();
  }

  const docente = recomendacion.usuario;
  const medico = recomendacion.empleado;

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
    concepto: recomendacion.concepto ?? '',
    recomendacionesObservaciones: recomendacion.recomendacionesObservaciones ?? '',
    restriccionesLaborales: recomendacion.restriccionesLaborales ?? '',
    examenes: recomendacion.examenes.map((examen) => ({
      id: examen.id,
      nombre: examen.nombre,
      resultado: examen.resultado,
      observacion: examen.observacion,
      fechaExamen: formatDateInput(examen.fechaExamen),
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav title="Recomendaciones Laborales" showModulesButton={false} />

      <main className="px-4 py-4 lg:px-8">
        <Link
          href="/recomendaciones"
          className="text-xs text-blue-600 hover:underline"
        >
          Volver al listado de recomendaciones
        </Link>

        <div className="mt-4">
          <DictamenFormLayout
            stickyTopClassName="top-20"
            left={<RecomendacionDetalleLeftPanel detalle={detalle} />}
            center={<RecomendacionDetalleCenterPanel detalle={detalle} />}
            right={<RecomendacionDetalleRightSpacer />}
          />
        </div>
      </main>
    </div>
  );
}
