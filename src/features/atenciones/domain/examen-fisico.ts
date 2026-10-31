import { createHallazgosCatalog, type Hallazgos } from './hallazgos';

/**
 * Examen físico: un texto por región que inicia con el hallazgo normal del formulario original. Se
 * guarda en cada atención y se precarga con el último examen del docente.
 */
export const EXAMEN_FISICO = [
  { key: 'aspectoGeneral', label: 'Aspecto general', normal: 'BUEN ESTADO GENERAL' },
  { key: 'cabeza', label: 'Cabeza', normal: 'NORMOCÉFALO, CABELLO DE BUENA IMPLANTACIÓN' },
  { key: 'ojos', label: 'Ojos', normal: 'PUPILAS ISOCÓRICAS NORMORREACTIVAS A LA LUZ' },
  { key: 'nariz', label: 'Nariz', normal: 'ORIFICIOS NASALES NORMALES, SIN SECRECIONES' },
  { key: 'boca', label: 'Boca', normal: 'LIBRE DE SECRECIONES. DENTADURA SANA' },
  { key: 'oidos', label: 'Oídos', normal: 'PABELLÓN AURICULAR NORMAL, CONDUCTO AUDITIVO PERMEABLE' },
  { key: 'cuello', label: 'Cuello', normal: 'MÓVIL, SIN ADENOPATÍAS' },
  { key: 'torax', label: 'Tórax', normal: 'SIMÉTRICO. RUIDOS CARDÍACOS BIEN TIMBRADOS' },
  { key: 'pulmones', label: 'Pulmones', normal: 'VENTILADOS SIN AGREGADOS' },
  { key: 'cardiovascular', label: 'Cardiovascular', normal: 'RSCSRS SIN SOPLOS, PULSOS PERIFÉRICOS PRESENTES' },
  { key: 'abdomen', label: 'Abdomen', normal: 'BLANDO, DEPRESIBLE, NO DOLOROSO. RUIDOS INTESTINALES PRESENTES' },
  { key: 'mamas', label: 'Mamas', normal: 'SIMÉTRICAS, NO PROTUBERANCIAS, NO RETRACCIONES' },
  { key: 'genitoUrinario', label: 'Sistema genito-urinario', normal: 'NORMAL' },
  { key: 'genitales', label: 'Genitales', normal: 'NORMAL' },
  { key: 'columna', label: 'Columna', normal: 'NORMAL' },
  { key: 'musculoEsqueletico', label: 'Sistema músculo esquelético', normal: '' },
  { key: 'extremidades', label: 'Extremidades', normal: 'SIMÉTRICAS, MÓVILES, SIN EDEMA' },
  { key: 'piel', label: 'Piel', normal: 'SIN ALTERACIONES' },
  { key: 'sindromeFebril', label: 'Síndrome febril', normal: 'No', grupo: 'Tamizajes' },
  { key: 'sintomaticoRespiratorio', label: 'Sintomático respiratorio', normal: 'No', grupo: 'Tamizajes' },
  { key: 'sintomaticoPiel', label: 'Sintomático de piel', normal: 'No', grupo: 'Tamizajes' },
  {
    key: 'sintomaticoNerviosoPeriferico',
    label: 'Sintomático nervioso periférico',
    normal: 'No',
    grupo: 'Tamizajes',
  },
] as const;

export const EXAMEN_CATALOG = createHallazgosCatalog(EXAMEN_FISICO);

export type ExamenKey = (typeof EXAMEN_FISICO)[number]['key'];
export type ExamenFisico = Hallazgos<ExamenKey>;
