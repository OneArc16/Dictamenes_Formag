import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

import { requireAdminApi } from '@/lib/auth/api-guards';
import {
  buildAuditExportFilename,
  buildCsv,
  buildDictamenAuditWhere,
  buildRecomendacionAuditWhere,
  formatAuditDateTime,
  fullName,
  normalizeModulo,
} from '@/lib/admin/auditoria';
import {
  buildDictamenHistoryChanges,
  parseDictamenHistorySnapshot,
} from '@/lib/dictamen/historial';
import { prisma } from '@/lib/prisma';
import {
  buildRecomendacionHistoryChanges,
  parseRecomendacionHistorySnapshot,
} from '@/lib/recomendaciones/historial';

export const runtime = 'nodejs';

const EXPORT_HEADER = [
  'Modulo',
  'Fecha',
  'Evento',
  'Estado anterior',
  'Estado nuevo',
  'Numero',
  'Docente',
  'Documento',
  'Medico responsable',
  'Actor',
  'Motivo',
  'Cambios',
  'Ruta',
] as const;

type ExportRow = Array<string | number | null | undefined>;

export async function GET(req: Request) {
  try {
    const auth = await requireAdminApi();
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') ?? '').trim();
    const tipo = (searchParams.get('tipo') ?? 'all').trim().toUpperCase();
    const modulo = normalizeModulo(searchParams.get('modulo') ?? 'RECOMENDACIONES');
    const fechaDesde = (searchParams.get('fechaDesde') ?? '').trim();
    const fechaHasta = (searchParams.get('fechaHasta') ?? '').trim();
    const format = (searchParams.get('format') ?? 'csv').trim().toLowerCase() === 'xlsx' ? 'xlsx' : 'csv';

    const rows =
      modulo === 'DICTAMENES'
        ? await getDictamenExportRows({ q, tipo, fechaDesde, fechaHasta })
        : await getRecomendacionExportRows({ q, tipo, fechaDesde, fechaHasta });

    if (format === 'xlsx') {
      const workbookBuffer = await buildExcelWorkbook({
        modulo,
        header: [...EXPORT_HEADER],
        rows,
      });

      return new NextResponse(workbookBuffer as BodyInit, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${buildAuditExportFilename(modulo, 'xlsx')}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    const csv = buildCsv([...EXPORT_HEADER], rows);
    return new NextResponse(`\uFEFF${csv}`, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${buildAuditExportFilename(modulo, 'csv')}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('ERROR GET /api/admin/auditoria/export:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Error exportando auditoria',
      },
      { status: 500 },
    );
  }
}

async function getDictamenExportRows({
  q,
  tipo,
  fechaDesde,
  fechaHasta,
}: {
  q: string;
  tipo: string;
  fechaDesde: string;
  fechaHasta: string;
}): Promise<ExportRow[]> {
  const items = await prisma.dictamenHistorial.findMany({
    where: buildDictamenAuditWhere({ q, tipo, fechaDesde, fechaHasta }),
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: {
      id: true,
      tipo: true,
      createdAt: true,
      estadoAnterior: true,
      estadoNuevo: true,
      formularioAnterior: true,
      formularioNuevo: true,
      motivoReapertura: { select: { nombre: true } },
      empleado: {
        select: {
          primerNombre: true,
          segundoNombre: true,
          primerApellido: true,
          segundoApellido: true,
        },
      },
      dictamen: {
        select: {
          id: true,
          numeroDictamen: true,
          usuario: {
            select: {
              identificacion: true,
              primerNombre: true,
              segundoNombre: true,
              primerApellido: true,
              segundoApellido: true,
            },
          },
          empleado: {
            select: {
              primerNombre: true,
              segundoNombre: true,
              primerApellido: true,
              segundoApellido: true,
            },
          },
        },
      },
    },
  });

  return items.map((item) => {
    const docente = item.dictamen.usuario;
    const actor = item.empleado;
    const medicoResponsable = item.dictamen.empleado;
    const cambios = buildDictamenHistoryChanges(
      parseDictamenHistorySnapshot(item.formularioAnterior as Prisma.JsonValue | null),
      parseDictamenHistorySnapshot(item.formularioNuevo as Prisma.JsonValue | null),
    );

    return [
      'Dictamenes',
      formatAuditDateTime(item.createdAt),
      item.tipo,
      item.estadoAnterior ?? '',
      item.estadoNuevo ?? '',
      item.dictamen.numeroDictamen ?? '',
      fullName(docente.primerNombre, docente.segundoNombre, docente.primerApellido, docente.segundoApellido) ||
        'Docente no disponible',
      docente.identificacion ?? '',
      fullName(
        medicoResponsable?.primerNombre,
        medicoResponsable?.segundoNombre,
        medicoResponsable?.primerApellido,
        medicoResponsable?.segundoApellido,
      ) || 'Sin medico asignado',
      fullName(actor?.primerNombre, actor?.segundoNombre, actor?.primerApellido, actor?.segundoApellido) ||
        'Usuario no disponible',
      item.motivoReapertura?.nombre ?? '',
      cambios.length > 0 ? cambios.map((cambio) => cambio.etiqueta).join(', ') : 'Solo cambio de estado',
      `/admisiones/dictamenes/${item.dictamen.id}`,
    ];
  });
}

async function getRecomendacionExportRows({
  q,
  tipo,
  fechaDesde,
  fechaHasta,
}: {
  q: string;
  tipo: string;
  fechaDesde: string;
  fechaHasta: string;
}): Promise<ExportRow[]> {
  const items = await prisma.recomendacionLaboralHistorial.findMany({
    where: buildRecomendacionAuditWhere({ q, tipo, fechaDesde, fechaHasta }),
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: {
      id: true,
      tipo: true,
      createdAt: true,
      estadoAnterior: true,
      estadoNuevo: true,
      formularioAnterior: true,
      formularioNuevo: true,
      motivoReapertura: { select: { nombre: true } },
      empleado: {
        select: {
          primerNombre: true,
          segundoNombre: true,
          primerApellido: true,
          segundoApellido: true,
        },
      },
      recomendacionLaboral: {
        select: {
          id: true,
          numeroRecomendacion: true,
          usuario: {
            select: {
              identificacion: true,
              primerNombre: true,
              segundoNombre: true,
              primerApellido: true,
              segundoApellido: true,
            },
          },
          empleado: {
            select: {
              primerNombre: true,
              segundoNombre: true,
              primerApellido: true,
              segundoApellido: true,
            },
          },
        },
      },
    },
  });

  return items.map((item) => {
    const docente = item.recomendacionLaboral.usuario;
    const actor = item.empleado;
    const medicoResponsable = item.recomendacionLaboral.empleado;
    const cambios = buildRecomendacionHistoryChanges(
      parseRecomendacionHistorySnapshot(item.formularioAnterior as Prisma.JsonValue | null),
      parseRecomendacionHistorySnapshot(item.formularioNuevo as Prisma.JsonValue | null),
    );

    return [
      'Recomendaciones',
      formatAuditDateTime(item.createdAt),
      item.tipo,
      item.estadoAnterior ?? '',
      item.estadoNuevo ?? '',
      item.recomendacionLaboral.numeroRecomendacion ?? '',
      fullName(docente.primerNombre, docente.segundoNombre, docente.primerApellido, docente.segundoApellido) ||
        'Docente no disponible',
      docente.identificacion ?? '',
      fullName(
        medicoResponsable?.primerNombre,
        medicoResponsable?.segundoNombre,
        medicoResponsable?.primerApellido,
        medicoResponsable?.segundoApellido,
      ) || 'Sin medico asignado',
      fullName(actor?.primerNombre, actor?.segundoNombre, actor?.primerApellido, actor?.segundoApellido) ||
        'Usuario no disponible',
      item.motivoReapertura?.nombre ?? '',
      cambios.length > 0 ? cambios.map((cambio) => cambio.etiqueta).join(', ') : 'Solo cambio de estado',
      `/recomendaciones/${item.recomendacionLaboral.id}`,
    ];
  });
}

async function buildExcelWorkbook({
  modulo,
  header,
  rows,
}: {
  modulo: 'RECOMENDACIONES' | 'DICTAMENES';
  header: string[];
  rows: ExportRow[];
}) {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Dictamy';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet(
    modulo === 'DICTAMENES' ? 'Auditoria Dictamenes' : 'Auditoria Recomendaciones',
    {
      views: [{ state: 'frozen', ySplit: 1 }],
    },
  );

  worksheet.addRow(header);
  rows.forEach((row) => worksheet.addRow(row));

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1D4ED8' },
  };
  headerRow.height = 20;

  worksheet.autoFilter = {
    from: 'A1',
    to: `${worksheet.getColumn(header.length).letter}${Math.max(1, worksheet.rowCount)}`,
  };

  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'CBD5E1' } },
        left: { style: 'thin', color: { argb: 'CBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
        right: { style: 'thin', color: { argb: 'CBD5E1' } },
      };

      if (rowNumber > 1) {
        cell.alignment = { vertical: 'top', wrapText: true };
      }
    });
  });

  const widths = header.map((title, index) => {
    const values = rows.map((row) => String(row[index] ?? ''));
    const maxLength = Math.max(title.length, ...values.map((value) => value.length));
    return Math.min(Math.max(maxLength + 2, 14), 42);
  });

  widths.forEach((width, index) => {
    worksheet.getColumn(index + 1).width = width;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
