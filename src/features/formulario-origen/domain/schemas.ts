import { z } from 'zod';
import { isValidIsoDate } from './date';

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD.')
  .refine(isValidIsoDate, 'La fecha no existe en el calendario.');

export const optimisticVersionSchema = z.number().int().positive();

export const descripcionOrigenSchema = z.object({
  descripcion: z.string(),
  actividadExtralaboral: z.string().max(1000).optional().default(''),
  fechaDictamenOrigen: isoDateSchema.optional(),
  expectedVersion: optimisticVersionSchema,
});

export const historialLaboralItemSchema = z.object({
  institucionId: z.number().int().positive().nullable(),
  institucionNombreSnapshot: z.string().trim().max(200),
  cargoId: z.number().int().positive().nullable(),
  cargoNombreSnapshot: z.string().trim().max(200),
  riesgosLaborales: z.string(),
  jornadaLaboral: z.string().max(200),
  tiempoExposicionAnios: z.number().min(0).max(9999),
});

export const historialLaboralOrigenSchema = z.object({
  items: z.array(historialLaboralItemSchema).max(100),
  expectedVersion: optimisticVersionSchema,
});

export const soporteOrigenSchema = z
  .object({
    tipo: z.enum([
      'REPORTE_ACCIDENTE_TRABAJO',
      'DESCRIPCION_EVENTO',
      'EPICRISIS_RESUMEN_HISTORIA',
      'CERTIFICADO_DEFUNCION',
      'ANALISIS_PUESTO_TRABAJO',
      'EXAMENES_PREOCUPACIONALES',
      'INVESTIGACION_ACCIDENTE',
      'OTRO',
    ]),
    estado: z.enum(['APORTADO', 'NO_APORTADO', 'NO_APLICA']),
    fechaDocumento: isoDateSchema.nullable(),
    seTuvoEnCuenta: z.string().nullable(),
    nombreOtro: z.string().max(200).nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.tipo === 'OTRO' && !value.nombreOtro?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['nombreOtro'],
        message: 'Indica el nombre del soporte.',
      });
    }
  });

export const informacionFundamentosOrigenSchema = z
  .object({
    fechaOcurrencia: isoDateSchema.nullable(),
    horaOcurrencia: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'La hora debe tener formato HH:mm válido.')
      .nullable(),
    jornadaEvento: z.enum(['NORMAL', 'EXTRA', 'NO_DETERMINADA']).nullable(),
    soportes: z.array(soporteOrigenSchema).max(50),
    expectedVersion: optimisticVersionSchema,
  })
  .superRefine((value, ctx) => {
    const fixedTypes = value.soportes
      .filter((support) => support.tipo !== 'OTRO')
      .map((support) => support.tipo);
    if (new Set(fixedTypes).size !== fixedTypes.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['soportes'],
        message: 'Cada soporte fijo solo puede registrarse una vez.',
      });
    }
  });

export const diagnosticoOrigenSchema = z.object({
  cie10Codigo: z.string().trim().min(1).max(10),
  tipo: z.enum([
    'CONFIRMADO_NUEVO',
    'IMPRESION_DIAGNOSTICA',
    'CONFIRMADO_REPETIDO',
  ]),
  esPrincipal: z.boolean(),
});

export const diagnosticosOrigenSchema = z
  .object({
    diagnosticos: z.array(diagnosticoOrigenSchema).max(50),
    tratamiento: z.string().nullable(),
    expectedVersion: optimisticVersionSchema,
  })
  .superRefine((value, ctx) => {
    const codes = value.diagnosticos.map((item) => item.cie10Codigo.toUpperCase());
    if (new Set(codes).size !== codes.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['diagnosticos'],
        message: 'No repitas códigos CIE-10.',
      });
    }
  });

export const sustentacionOrigenSchema = z.object({
  concepto: z.string(),
  fundamentosDerecho: z.string(),
  tipoEvento: z.enum(['ENFERMEDAD', 'ACCIDENTE']).nullable(),
  origenEvento: z.enum(['LABORAL', 'COMUN']).nullable(),
  expectedVersion: optimisticVersionSchema,
});

export const finalizarOrigenSchema = z.object({
  expectedVersion: optimisticVersionSchema,
});

export const reaperturaDocumentoSchema = z.object({
  objetivo: z.enum(['ORIGEN', 'PCL']),
  motivoId: z.number().int().positive(),
  observacion: z.string().max(2000).nullable().optional(),
  expectedVersion: z.number().int().positive(),
});

export const registrarCasoDictamenSchema = z.object({
  operacionId: z.string().uuid(),
  documentoInicial: z.enum(['PCL', 'ORIGEN']).default('ORIGEN'),
  form: z
    .object({
      tipoDocumento: z.string().trim().min(1).max(2),
      numeroDocumento: z.string().trim().min(1).max(20),
      fechaNacimiento: isoDateSchema.or(z.literal('')),
      primerNombre: z.string().trim().min(1).max(50),
      segundoNombre: z.string().max(50).optional().default(''),
      primerApellido: z.string().trim().min(1).max(50),
      segundoApellido: z.string().max(50).optional().default(''),
      sexo: z.string().min(1),
      direccion: z.string().optional().default(''),
      barrio: z.string().optional().default(''),
      departamento: z.string().optional().default(''),
      municipio: z.string().optional().default(''),
      zona: z.string().optional().default('U'),
      telefono: z.string().optional().default(''),
      pais: z.string().optional().default('COLOMBIA'),
      codigoEps: z.string().trim().min(1).max(6),
      categoria: z.string().optional().default(''),
      secretariaLabora: z.string().optional().default(''),
      formaVinculacion: z.string().trim().min(1).max(45),
      estadoCivil: z.string().optional().default(''),
      gradoEscalafon: z.string().trim().min(1).max(2),
      nivelEscalafon: z.string().trim().min(1),
      institucionLabora: z.string().optional().default(''),
      cargoDocenteId: z.number().int().positive().nullable(),
      escolaridad: z.string().optional().default(''),
      tipoDictamen: z.enum(['CALIFICACION', 'RECALIFICACION']),
      fechaVinculacion: isoDateSchema.or(z.literal('')).optional().default(''),
    })
    .passthrough(),
});
