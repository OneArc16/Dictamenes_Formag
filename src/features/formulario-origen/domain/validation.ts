import type {
  DictamenOrigenEvento,
  DictamenTipoEvento,
  EstadoSoporteOrigen,
  JornadaEvento,
  TipoSoporteOrigen,
} from '@prisma/client';

export const FIXED_SUPPORT_TYPES: TipoSoporteOrigen[] = [
  'REPORTE_ACCIDENTE_TRABAJO',
  'DESCRIPCION_EVENTO',
  'EPICRISIS_RESUMEN_HISTORIA',
  'CERTIFICADO_DEFUNCION',
  'ANALISIS_PUESTO_TRABAJO',
  'EXAMENES_PREOCUPACIONALES',
  'INVESTIGACION_ACCIDENTE',
];

export type OriginValidationIssue = {
  section: 'descripcion' | 'historial-laboral' | 'informacion-fundamentos' | 'diagnostico-tratamiento' | 'sustentacion';
  field: string;
  message: string;
};

type ValidationInput = {
  fechaDictamenOrigen: string;
  descripcion: string | null;
  fechaOcurrencia: string | null;
  horaOcurrencia: string | null;
  jornadaEvento: JornadaEvento | null;
  concepto: string | null;
  fundamentosDerecho: string | null;
  tipoEvento: DictamenTipoEvento | null;
  origenEvento: DictamenOrigenEvento | null;
  historialLaboral: Array<{
    institucionNombreSnapshot: string;
    cargoNombreSnapshot: string;
    riesgosLaborales: string;
    jornadaLaboral: string;
    tiempoExposicionAnios: number;
  }>;
  soportes: Array<{
    tipo: TipoSoporteOrigen;
    estado: EstadoSoporteOrigen;
    fechaDocumento: string | null;
    seTuvoEnCuenta: string | null;
    nombreOtro: string | null;
  }>;
  diagnosticos: Array<{
    cie10Codigo: string;
    esPrincipal: boolean;
  }>;
};

const isBlank = (value: string | null | undefined) => !value?.trim();

export function validateFormularioOrigen(input: ValidationInput): OriginValidationIssue[] {
  const issues: OriginValidationIssue[] = [];
  const add = (
    section: OriginValidationIssue['section'],
    field: string,
    message: string,
  ) => issues.push({ section, field, message });

  if (isBlank(input.descripcion)) {
    add('descripcion', 'descripcion', 'La descripción es obligatoria.');
  }

  if (input.historialLaboral.length === 0) {
    add('historial-laboral', 'items', 'Registra al menos un antecedente laboral.');
  }

  input.historialLaboral.forEach((item, index) => {
    const prefix = `items.${index}`;
    if (isBlank(item.institucionNombreSnapshot)) {
      add('historial-laboral', `${prefix}.institucionNombreSnapshot`, 'Indica la institución.');
    }
    if (isBlank(item.cargoNombreSnapshot)) {
      add('historial-laboral', `${prefix}.cargoNombreSnapshot`, 'Indica el cargo.');
    }
    if (isBlank(item.riesgosLaborales)) {
      add('historial-laboral', `${prefix}.riesgosLaborales`, 'Describe los riesgos laborales.');
    }
    if (isBlank(item.jornadaLaboral)) {
      add('historial-laboral', `${prefix}.jornadaLaboral`, 'Indica la jornada laboral.');
    }
    if (!Number.isFinite(item.tiempoExposicionAnios) || item.tiempoExposicionAnios < 0) {
      add('historial-laboral', `${prefix}.tiempoExposicionAnios`, 'El tiempo de exposición no es válido.');
    }
  });

  for (const type of FIXED_SUPPORT_TYPES) {
    if (!input.soportes.some((support) => support.tipo === type)) {
      add('informacion-fundamentos', `soportes.${type}`, 'Selecciona un estado explícito.');
    }
  }

  input.soportes.forEach((support, index) => {
    if (support.estado === 'APORTADO') {
      if (!support.fechaDocumento) {
        add('informacion-fundamentos', `soportes.${index}.fechaDocumento`, 'La fecha es obligatoria.');
      }
      if (isBlank(support.seTuvoEnCuenta)) {
        add('informacion-fundamentos', `soportes.${index}.seTuvoEnCuenta`, 'Describe qué se tuvo en cuenta.');
      }
    }
    if (support.tipo === 'OTRO' && isBlank(support.nombreOtro)) {
      add('informacion-fundamentos', `soportes.${index}.nombreOtro`, 'Indica el nombre del soporte.');
    }
  });

  if (input.tipoEvento === 'ACCIDENTE') {
    if (!input.fechaOcurrencia) add('informacion-fundamentos', 'fechaOcurrencia', 'La fecha de ocurrencia es obligatoria.');
    if (!input.horaOcurrencia) add('informacion-fundamentos', 'horaOcurrencia', 'La hora de ocurrencia es obligatoria.');
    if (!input.jornadaEvento) add('informacion-fundamentos', 'jornadaEvento', 'Selecciona la jornada.');
  }
  if (input.fechaOcurrencia && input.fechaOcurrencia > input.fechaDictamenOrigen) {
    add('informacion-fundamentos', 'fechaOcurrencia', 'La ocurrencia no puede ser posterior al dictamen.');
  }
  const todayBogota = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  if (input.fechaOcurrencia && input.fechaOcurrencia > todayBogota) {
    add('informacion-fundamentos', 'fechaOcurrencia', 'La fecha de ocurrencia no puede estar en el futuro.');
  }

  if (input.diagnosticos.length === 0) {
    add('diagnostico-tratamiento', 'diagnosticos', 'Registra al menos un diagnóstico.');
  }
  if (input.diagnosticos.filter((diagnostico) => diagnostico.esPrincipal).length !== 1) {
    add('diagnostico-tratamiento', 'diagnosticos', 'Debe existir exactamente un diagnóstico principal.');
  }
  if (new Set(input.diagnosticos.map((diagnostico) => diagnostico.cie10Codigo)).size !== input.diagnosticos.length) {
    add('diagnostico-tratamiento', 'diagnosticos', 'No repitas códigos CIE-10.');
  }

  if (isBlank(input.concepto)) add('sustentacion', 'concepto', 'El concepto es obligatorio.');
  if (isBlank(input.fundamentosDerecho)) add('sustentacion', 'fundamentosDerecho', 'Los fundamentos de derecho son obligatorios.');
  if (!input.tipoEvento) add('sustentacion', 'tipoEvento', 'Selecciona el tipo de evento.');
  if (!input.origenEvento) add('sustentacion', 'origenEvento', 'Selecciona el origen.');

  return issues;
}

export function calculateSectionProgress(issues: OriginValidationIssue[]) {
  const sections: OriginValidationIssue['section'][] = [
    'descripcion',
    'historial-laboral',
    'informacion-fundamentos',
    'diagnostico-tratamiento',
    'sustentacion',
  ];
  const incomplete = sections.filter((section) =>
    issues.some((issue) => issue.section === section),
  );

  return {
    completed: sections.length - incomplete.length,
    total: sections.length,
    incomplete,
  };
}
