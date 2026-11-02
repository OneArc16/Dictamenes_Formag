import type { AtencionDetalle } from '@/features/atenciones/application/atencion-detail';
import { FAMILIAR_GROUPS } from '@/features/atenciones/domain/antecedentes-familiares';
import { FORMULA_FIELDS, GINECO_GROUPS } from '@/features/atenciones/domain/antecedentes-ginecobstetricos';
import { ANTECEDENTE_GROUPS, indicePaquetesAnio, refiere } from '@/features/atenciones/domain/antecedentes-personales';
import { TIPOS_DIAGNOSTICO } from '@/features/atenciones/domain/diagnosticos';
import { EXAMEN_CATALOG } from '@/features/atenciones/domain/examen-fisico';
import type { HallazgosCatalog } from '@/features/atenciones/domain/hallazgos';
import { categoriaLabel } from '@/features/atenciones/domain/incapacidades';
import { REVISION_CATALOG } from '@/features/atenciones/domain/revision-sistemas';
import {
  SIGNO_FIELDS,
  calcularImc,
  clasificarImc,
  formatSigno,
  type SignoKey,
} from '@/features/atenciones/domain/signos-vitales';

/**
 * Lo que imprime la historia clínica de una atención finalizada: solo lo registrado, ya con
 * etiquetas legibles y fechas en hora de Colombia. El PDF se limita a dibujarlo.
 */

const TIME_ZONE = 'America/Bogota';

/** Datos que no trae el detalle de la atención y que exige la historia clínica impresa. */
export type HistoriaClinicaExtras = {
  institucion: {
    nombre: string;
    nit: string;
    codigoHabilitacion: string | null;
    direccion: string | null;
    telefono: string | null;
    ciudad: string | null;
  };
  paciente: {
    /** YYYY-MM-DD */
    fechaNacimiento: string | null;
    sexo: string;
    estadoCivil: string | null;
    direccion: string | null;
    etnia: string | null;
    zonaResidencia: string | null;
  };
  /** El médico que atendió la cita; firma como data URL. */
  profesional: {
    nombre: string;
    tipoDocumento: string | null;
    documento: string | null;
    registroMedico: string | null;
    firmaSrc: string | null;
  };
  /** Cuando se finalizó la atención (ISO). */
  atendidaEn: string | null;
  generadoEn: string;
};

export type Dato = { label: string; valor: string };
export type GrupoDatos = { titulo: string; items: Dato[] };
export type Hallazgo = Dato & { alterado: boolean };

export type HistoriaClinicaDocumento = ReturnType<typeof buildHistoriaClinica>;

// Igual que esMujer: H es hombre; M (mujer) y F, femenino.
const SEXO: Record<string, string> = { H: 'Masculino', M: 'Femenino', F: 'Femenino', I: 'Indeterminado', O: 'Otro' };
const ZONA: Record<string, string> = { U: 'Urbana', R: 'Rural' };

function clean(value: string | null | undefined) {
  return (value ?? '').trim();
}

function capitalize(value: string) {
  const lower = value.toLocaleLowerCase('es-CO');
  return lower.charAt(0).toLocaleUpperCase('es-CO') + lower.slice(1);
}

/** YYYY-MM-DD → DD/MM/YYYY; un ISO con hora se lleva a la fecha de Colombia. */
export function formatFecha(value: string | null | undefined) {
  if (!value) return '';
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TIME_ZONE })
    .format(new Date(value));
}

export function formatHora(value: string | null | undefined) {
  if (!value) return '';
  return new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: TIME_ZONE })
    .format(new Date(value));
}

function formatFechaHora(value: string | null | undefined) {
  return value ? `${formatFecha(value)} ${formatHora(value)}` : '';
}

function antecedentesPersonales(detalle: AtencionDetalle) {
  const datos = detalle.antecedentesPersonales.datos;
  const negados: string[] = [];
  const grupos: GrupoDatos[] = ANTECEDENTE_GROUPS.map((group) => ({
    titulo: group.title,
    items: group.items.flatMap((item): Dato[] => {
      const valor = clean(datos.items[item.key]);
      if (!refiere(valor)) {
        negados.push(item.label);
        return [];
      }
      const detalleItem = 'detail' in item ? clean(datos.detalles[item.key]) : '';
      return [{ label: item.label, valor: detalleItem ? `${valor} — ${detalleItem}` : valor }];
    }),
  }));

  const h = datos.habitos;
  const paquetes = indicePaquetesAnio(h.cigarrillosDia, h.aniosFumando);
  const habitos: Dato[] = [
    { label: 'Tabaco', valor: [clean(h.tabaco), h.exfumador === 'SI' ? 'exfumador' : '', h.cigarrillosDia != null ? `${h.cigarrillosDia} cigarrillos/día` : '', h.aniosFumando != null ? `${h.aniosFumando} años` : '', paquetes != null ? `IPA ${formatSigno(paquetes)}` : ''] },
    { label: 'Alcohol', valor: [clean(h.alcohol), clean(h.cantidadAlcohol), clean(h.frecuenciaAlcohol)] },
    { label: 'Sustancias psicoactivas', valor: [clean(h.spa), clean(h.spaCuales), clean(h.spaFrecuencia)] },
  ].flatMap(({ label, valor: [principal, ...resto] }) =>
    refiere(principal) ? [{ label, valor: [principal, ...resto.filter(Boolean)].join(' · ') }] : [],
  );

  const otros: Dato[] = [
    { label: 'Otras medicaciones', valor: clean(datos.otrasMedicaciones) },
    { label: 'Otras enfermedades', valor: clean(datos.otrasEnfermedades) },
    { label: 'Otros antecedentes', valor: clean(datos.otrosAntecedentes) },
  ].filter((item) => refiere(item.valor));

  return {
    personales: [
      ...grupos,
      { titulo: 'Hábitos', items: habitos },
      { titulo: 'Otros', items: otros },
    ].filter((grupo) => grupo.items.length > 0),
    negados,
  };
}

function antecedentesFamiliares(detalle: AtencionDetalle): Dato[] {
  const items = detalle.antecedentesFamiliares.datos.items;
  return FAMILIAR_GROUPS.flatMap((group) =>
    group.items
      .map((item) => ({ label: item.label, valor: clean(items[item.key]) }))
      .filter((item) => refiere(item.valor)),
  );
}

function antecedentesGinecobstetricos(detalle: AtencionDetalle): Dato[] {
  const gineco = detalle.antecedentesGinecobstetricos?.datos;
  if (!gineco) return [];
  const formula = FORMULA_FIELDS.filter((field) => gineco.numeros[field.key] != null)
    .map((field) => `${field.label}${gineco.numeros[field.key]}`)
    .join(' ');
  const campos = GINECO_GROUPS.flatMap((group) =>
    group.fields.map((field): Dato => {
      const key = field.key as never;
      const valor =
        field.kind === 'date'
          ? formatFecha(gineco.fechas[key])
          : field.kind === 'number'
            ? String(gineco.numeros[key] ?? '')
            : clean(gineco.textos[key]);
      return { label: field.label, valor };
    }),
  ).filter((item) => refiere(item.valor) && !(item.label === 'Fórmula obstétrica' && formula));
  return [
    ...(formula ? [{ label: 'Fórmula obstétrica', valor: formula }] : []),
    ...campos,
    ...(refiere(clean(gineco.observaciones)) ? [{ label: 'Observaciones', valor: clean(gineco.observaciones) }] : []),
  ];
}

function hallazgos(catalog: HallazgosCatalog, sistemas: Record<string, string>, mujer: boolean): Hallazgo[] {
  return catalog
    .visibles(mujer)
    .map((item) => ({ key: item.key, label: item.label, valor: clean(sistemas[item.key]) }))
    .filter((item) => item.valor)
    .map(({ key, label, valor }) => ({ label, valor, alterado: catalog.modificado(key, valor) }));
}

function signos(values: AtencionDetalle['signosVitales']['values']): Dato[] {
  const field = (key: SignoKey) => SIGNO_FIELDS.find((item) => item.key === key)!;
  const conUnidad = (key: SignoKey) => `${formatSigno(values[key])} ${field(key).unit}`;
  const result: Dato[] = [];
  if (values.presionSistolica != null && values.presionDiastolica != null) {
    result.push({ label: 'Presión arterial', valor: `${values.presionSistolica}/${values.presionDiastolica} mmHg` });
  }
  for (const item of SIGNO_FIELDS) {
    if (item.key === 'presionSistolica' || item.key === 'presionDiastolica' || values[item.key] == null) continue;
    result.push({ label: item.label, valor: conUnidad(item.key) });
  }
  const imc = calcularImc(values.pesoKg, values.tallaCm);
  if (imc != null) result.push({ label: 'IMC', valor: `${formatSigno(imc)} kg/m² · ${clasificarImc(imc)!.label}` });
  return result;
}

function diagnosticoNombre(codigo: string, label: string) {
  const prefix = `${codigo} - `;
  return label.startsWith(prefix) ? label.slice(prefix.length) : label;
}

export function buildHistoriaClinica(detalle: AtencionDetalle, extras: HistoriaClinicaExtras) {
  const { docente } = detalle;
  const paciente = extras.paciente;
  const estadoCivil = clean(paciente.estadoCivil);
  const revisionCatalog = REVISION_CATALOG as unknown as HallazgosCatalog;
  const examenCatalog = EXAMEN_CATALOG as unknown as HallazgosCatalog;

  return {
    institucion: extras.institucion,
    atencion: {
      numero: String(detalle.id),
      fecha: formatFecha(detalle.inicioProgramado),
      hora: formatHora(detalle.inicioProgramado),
      cierre: formatFechaHora(extras.atendidaEn),
      sede: detalle.sedeNombre,
      especialidad: detalle.especialidadNombre,
      modalidad: detalle.modalidadNombre,
    },
    paciente: {
      nombre: docente.nombreCompleto,
      documento: `${docente.tipoDocumento} ${docente.documento}`,
      edad: docente.edad != null ? `${docente.edad} años` : '',
      fechaNacimiento: formatFecha(paciente.fechaNacimiento),
      sexo: SEXO[clean(paciente.sexo).toUpperCase()] ?? clean(paciente.sexo),
      estadoCivil: estadoCivil ? capitalize(estadoCivil) : '',
      direccion: clean(paciente.direccion),
      zona: ZONA[clean(paciente.zonaResidencia)] ?? clean(paciente.zonaResidencia),
      telefono: clean(docente.telefono),
      eps: clean(docente.eps),
      ocupacion: clean(docente.cargo),
      etnia: clean(paciente.etnia),
    },
    motivoConsulta: clean(detalle.form.motivoConsulta),
    enfermedadActual: clean(detalle.form.enfermedadActual),
    antecedentes: {
      ...antecedentesPersonales(detalle),
      familiares: antecedentesFamiliares(detalle),
      ginecobstetricos: antecedentesGinecobstetricos(detalle),
    },
    signos: signos(detalle.signosVitales.values),
    revisionSistemas: hallazgos(revisionCatalog, detalle.revisionSistemas.datos.sistemas, detalle.mujer),
    examenFisico: hallazgos(examenCatalog, detalle.examenFisico.datos.sistemas, detalle.mujer),
    diagnosticos: detalle.diagnosticos.map((item, index) => ({
      orden: index === 0 ? 'Principal' : `Relacionado ${index}`,
      codigo: item.cie10Codigo,
      nombre: diagnosticoNombre(item.cie10Codigo, item.cie10Label),
      tipo: TIPOS_DIAGNOSTICO.find((tipo) => tipo.value === item.tipo)?.label ?? item.tipo,
    })),
    analisis: clean(detalle.form.analisis),
    plan: clean(detalle.form.plan),
    tratamiento: clean(detalle.form.tratamiento),
    remisiones: detalle.remisiones.map((item) => ({
      servicio: `${item.cups.codigo} · ${item.cups.nombre}`,
      motivo: clean(item.motivo),
    })),
    incapacidades: detalle.incapacidades.map((item) => ({
      numero: item.numeroInterno,
      detalle: `${categoriaLabel(item.categoria)}${item.prorroga ? ' (prórroga)' : ''} · ${formatFecha(item.fechaInicio)} al ${formatFecha(item.fechaFin)} · ${item.dias} ${item.dias === 1 ? 'día' : 'días'}`,
    })),
    evoluciones: detalle.evoluciones.map((item) => ({
      fecha: formatFechaHora(item.fecha),
      medico: clean(item.medicoNombre),
      texto: clean(item.texto),
    })),
    profesional: {
      ...extras.profesional,
      documento: extras.profesional.documento
        ? `${extras.profesional.tipoDocumento ?? ''} ${extras.profesional.documento}`.trim()
        : '',
      especialidad: detalle.especialidadNombre,
    },
    generadoEn: formatFechaHora(extras.generadoEn),
  };
}
