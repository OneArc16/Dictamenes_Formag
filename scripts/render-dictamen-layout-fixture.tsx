import fs from 'node:fs/promises';
import path from 'node:path';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import sharp from 'sharp';

import { DictamenReactPdf } from '../src/lib/react-pdf/DictamenReactPdf';

const ACTIVIDADES = [
  'MIRAR', 'ESCUCHAR', 'PENSAR', 'LEER', 'ESCRIBIR',
  'COMUNICARSE_CON_MENSAJES_ESCRITOS', 'HABLA', 'PRODUCCION_MENSAJES_NO_VERBALES',
  'MENSAJES_ESCRITOS', 'CONVERSACION', 'MANTENER_CAMBIAR_POSICION_CUERPO',
  'USO_MANO_BRAZO', 'DESPLAZARSE_ENTORNO', 'USO_TRANSPORTE_PASAJERO', 'CONDUCCION',
  'LAVARSE', 'CUIDADO_PARTES_CUERPO', 'VESTIRSE', 'COMER', 'BEBER',
  'ADQUIRIR_LO_NECESARIO_PARA_VIVIR', 'ADQUIRIR_BIENES_SERVICIOS', 'PREPARAR_COMIDAS',
  'QUEHACERES_CASA', 'AYUDAR_A_LOS_DEMAS',
];

const FACTORES = [
  'ATENCION', 'MEMORIA', 'COMPRENSION_RESOLUCION_PROBLEMAS', 'INICIATIVA_AUTONOMIA',
  'OBSERVACION', 'CAPACIDAD_ANALISIS_SINTESIS', 'COMPRENSION_ESPACIAL', 'ADAPTACION',
  'RELACIONES', 'TOMA_DECISIONES', 'RESP_HERRAMIENTAS_EQUIPOS',
  'RESP_MATERIALES_PRODUCTOS', 'RESP_INFORMACION_VALORES', 'RESP_TRABAJO_OTROS',
  'RESP_SEGURIDAD_OTROS', 'COMUNICACION_ORAL', 'COMUNICACION_GESTUAL', 'LECTURA',
  'ESCRITURA', 'MATEMATICAS', 'VISION', 'PERCEPCION_COLOR', 'PERCEPCION_FORMA',
  'PERCEPCION_TAMANO', 'PERCEPCION_TEMPORAL', 'ORIENTACION_ESPACIAL', 'AUDICION',
  'UBICACION_FUENTE_SONORA', 'DISCRIMINACION_AUDITIVA', 'SENSIBILIDAD_SUPERFICIAL',
  'ESTEROGNOSIA', 'BAROGNOSIA', 'PROPIOCEPCION_SENTIDO_KINETICO', 'OLFATO', 'GUSTO',
  'DESPLAZAMIENTO', 'TRANSPORTAR_PESO', 'ALCANZAR', 'HALAR', 'EMPUJAR', 'LEVANTAR',
  'POSICION_SENTADO', 'SUPLENCIA_SENTADO', 'POSICION_DE_PIE', 'SUPLENCIA_DE_PIE',
  'POSICION_RODILLAS', 'POSICION_CUCLILLAS', 'EQUILIBRIO_ESTATICO', 'AGARRE_MANO_LLENA',
  'AGARRE_CILINDRICO', 'DIGITO_DIGITAL', 'ENGANCHE', 'PINZA_FINA', 'PINZA_TRIPODE',
  'PINZA_LATERAL', 'EXACTITUD', 'PRECISION', 'PULSO', 'AGILIDAD', 'DESTREZA_MANUAL',
  'DESTREZA_DIGITAL', 'ARMONIA',
];

async function main() {
  const logo = await fs.readFile(path.join(process.cwd(), 'public/assets/logo-sism.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;
  const dictamen = {
    id: 20261021,
    numeroDictamen: 'SISM-FOMAG-2026-00127',
    fechaDictamen: '2026-10-21T00:00:00.000Z',
    procedimientoPcl: 'A',
    condicionSalud: 'Dolor lumbar crónico con irradiación a miembro inferior derecho, limitación funcional y exacerbación con bipedestación prolongada.',
    descripcionHallazgos: 'Resonancia magnética y examen físico compatibles con cambios degenerativos lumbares; se documenta disminución de movilidad y dolor a la palpación.',
    antecedentesClinicos: Array.from({ length: Number(process.env.FIXTURE_ANTECEDENTES ?? 1) }, (_, index) => `Antecedente clínico ${index + 1}: manejo médico, fisioterapia y controles de especialista. La persona valorada refiere persistencia de síntomas durante las actividades pedagógicas y administrativas, con limitación para la bipedestación prolongada, el uso de la voz y el desplazamiento entre aulas.`).join(' '),
    diagnosticos: Array.from({ length: 22 }, (_, index) => ({
      cie10: { codigo: `M${String(510 + index).padStart(2, '0')}`, nombre: `Diagnóstico clínico de prueba ${index + 1}` },
    })),
    deficiencias: Array.from({ length: 17 }, (_, index) => ({
      deficiencia: {
        nombre: `Deficiencia de prueba ${index + 1}`,
        capitulo: String((index % 8) + 1),
        tabla: String((index % 12) + 1),
      },
      clase: { nombre: 'II' },
      valorDeficiencia: (index % 9) + 1,
    })),
    totalTitulo1: 34.5,
    limitacionesAvdAivd: ACTIVIDADES.map((actividad, index) => ({ actividad, valor: [0.6, 0.3, 0][index % 3] })),
    claseLimitacionLaboral: 'II',
    totalCap2: 12,
    totalTitulo3: 18,
    analisisOcupacional: FACTORES.map((factor, index) => ({ factor, gravedad: ['0', 'I', 'II', 'III', 'IV'][index % 5] })),
    usuario: {
      primerNombre: 'MARÍA', segundoNombre: 'FERNANDA', primerApellido: 'RODRÍGUEZ', segundoApellido: 'MENDOZA',
      identificacion: '1088123456', sexo: 'M', escolaridad: 'ESPECIALIZACIÓN', estadoCivil: 'CASADA',
      fechaNacimiento: '1980-03-12T00:00:00.000Z', direccion: 'Carrera 18 No. 24-75, Santa Marta',
      zonaResidencia: 'U', municipio: { nombre: 'SANTA MARTA' }, departamento: { nombre: 'MAGDALENA' },
      cargoDocenteNombre: 'DOCENTE DE AULA', gradoEscalafon: '2', nivelEscalafon: 'A', formaVinculacion: 'PROPIEDAD',
      institucionEducativaRef: { nombre: 'INSTITUCIÓN EDUCATIVA DISTRITAL MODELO', secretaria: { nombre: 'SECRETARÍA DE EDUCACIÓN DISTRITAL' } },
    },
    junta: await Promise.all(
      ['ROSANA DE JESUS DIAZ DE LUQUE', 'CLAUDIA PATRICIA YEJAS OROZCO', 'CLARY MAR ALVAREZ ALVAREZ'].map(async (nombreCompleto, index) => ({
        orden: index + 1,
        nombreCompleto,
        tratamiento: index === 2 ? 'DRA' : 'DR',
        especialidad: ['MEDICINA LABORAL', 'MEDICINA GENERAL', 'FISIOTERAPEUTA'][index],
        registroMedico: `${36547432 + index}`,
        licencia: `SST ${4425 + index}`,
        firmaSrc: `data:image/png;base64,${(await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="120"><path d="M10 80 C 60 10, 90 120, 150 50 S 250 20, 290 70" stroke="#123" stroke-width="4" fill="none"/></svg>`)).png().toBuffer()).toString('base64')}`,
      })),
    ),
  };

  const rendered = await renderToBuffer(
    React.createElement(DictamenReactPdf, { dictamen, logoSrc }) as never,
  );
  await fs.writeFile(process.env.FIXTURE_OUT ?? '/tmp/formulario-dictamen-layout-fixture.pdf', rendered);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
