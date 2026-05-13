// prisma/seed.ts
import {
  PrismaClient,
  Prisma,
  TipoCriterioDeficiencia,
  UnidadCriterio,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  /* ==========================
     1. PAISES
     ========================== */
  await prisma.pais.upsert({
    where: { codigo: 'COL' },
    update: {},
    create: {
      codigo: 'COL',
      nombre: 'COLOMBIA',
      codigoTelefono: '057',
    },
  });

  await prisma.pais.upsert({
    where: { codigo: 'VEN' },
    update: {},
    create: {
      codigo: 'VEN',
      nombre: 'VENEZUELA',
      codigoTelefono: '058',
    },
  });

  /* ==========================
     2. DEPARTAMENTOS
     ========================== */
  await prisma.departamento.upsert({
    where: { codigo: '47' },
    update: {},
    create: {
      codigo: '47',
      nombre: 'MAGDALENA',
    },
  });

  await prisma.departamento.upsert({
    where: { codigo: '20' },
    update: {},
    create: {
      codigo: '20',
      nombre: 'CESAR',
    },
  });

  /* ==========================
     3. MUNICIPIOS
     ========================== */
  await prisma.municipio.upsert({
    where: { codigo: '47001' },
    update: {},
    create: {
      codigo: '47001',
      nombre: 'SANTA MARTA',
      codigoDepartamento: '47',
    },
  });

  await prisma.municipio.upsert({
    where: { codigo: '20001' },
    update: {},
    create: {
      codigo: '20001',
      nombre: 'VALLEDUPAR',
      codigoDepartamento: '20',
    },
  });

  /* ==========================
     4. BARRIOS
     ========================== */
  const barrioLoperena = await prisma.barrio.upsert({
    where: {
      // @@unique([codigoMunicipio, nombre])
      codigoMunicipio_nombre: {
        codigoMunicipio: '20001',
        nombre: 'LOPERENA GARUPAL',
      },
    },
    update: {},
    create: {
      nombre: 'LOPERENA GARUPAL',
      codigoMunicipio: '20001',
    },
  });

  /* ==========================
     5. EPS
     ========================== */
  await prisma.eps.upsert({
    where: { codigo: 'FIDU24' },
    update: {},
    create: {
      codigo: 'FIDU24',
      nombreEntidad:
        'FIDEICOMISOS PATRIMONIOS AUTONOMOS FIDUCIARIA LA PREVISORA S.A.',
      codigoDepartamento: '47',
      codigoMunicipio: '47001',
      digitado: true,
      nit: '830000001',
      dv: '1',
      email: 'contacto@fiduprevisora.com',
      telefono: '6000000',
      direccion: 'Cra 1 # 1-01',
    },
  });

  await prisma.eps.upsert({
    where: { codigo: 'EPS024' },
    update: {},
    create: {
      codigo: 'EPS024',
      nombreEntidad: 'COOSALUD EPS',
      codigoDepartamento: '20',
      codigoMunicipio: '20001',
      digitado: true,
      nit: '800000024',
      dv: '4',
      email: 'servicioalusuario@coosalud.com',
      telefono: '6050000000',
      direccion: 'Calle 10 # 10-10',
    },
  });

  /* ==========================
     6. CENTRO MÉDICO
     ========================== */
  const centroMedico = await prisma.centroMedico.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      codigoHabilitacion: '4700100001',
      nombre: 'IPS SISM',
      email: 'info@ipssism.com',
      direccion: 'Calle 22 # 15-30',
      telefono: '6054200000',
      codigoDepartamento: '47',
      codigoMunicipio: '47001',
      estado: 1,
      resolucion: 'RES-001-2024',
      createdBy: 'seed',
      updatedBy: 'seed',
    },
  });

  /* ==========================
     7. SEDES
     ========================== */
  const sedeSantaMarta = await prisma.sede.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      centroMedicoId: centroMedico.id,
      nombre: 'IPS SISM SANTA MARTA',
      codigoHabilitacion: '4700100001-01',
      direccion: 'Calle 22 # 15-30',
      codigoDepartamento: '47',
      codigoMunicipio: '47001',
      telefono: '6054200001',
      estado: 1,
      createdBy: 'seed',
      updatedBy: 'seed',
    },
  });

  const sedeValledupar = await prisma.sede.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      centroMedicoId: centroMedico.id,
      nombre: 'IPS SISM VALLEDUPAR',
      codigoHabilitacion: '2000100001-01',
      direccion: 'Carrera 19 # 10-20',
      codigoDepartamento: '20',
      codigoMunicipio: '20001',
      telefono: '6055700000',
      estado: 1,
      createdBy: 'seed',
      updatedBy: 'seed',
    },
  });

  /* ==========================
     8. SECRETARÍAS
     ========================== */
  const secretariaCesar = await prisma.secretaria.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nombre: 'SECRETARÍA DE EDUCACIÓN DEL CESAR',
    },
  });

  /* ==========================
     9. INSTITUCIONES EDUCATIVAS
     ========================== */
  const institucionLoperena = await prisma.institucionEducativa.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nombre: 'LOPERENA GARUPAL',
      idDepartamento: '20',      // CESAR
      idMunicipio: '20001',      // VALLEDUPAR
      idSecretaria: secretariaCesar.id,
      codigoIed: '20001001',     // código de ejemplo
      direccion: 'Barrio Loperena Garupal',
    },
  });

  /* ==========================
     10. PERFILES
     ========================== */
  const perfilAdmisionista = await prisma.perfil.upsert({
    where: { nombre: 'ADMISIONISTA' },
    update: {},
    create: {
      nombre: 'ADMISIONISTA',
      estado: 1,
      createdBy: 'seed',
      updatedBy: 'seed',
    },
  });

  const perfilAdministrador = await prisma.perfil.upsert({
    where: { nombre: 'ADMINISTRADOR' },
    update: {},
    create: {
      nombre: 'ADMINISTRADOR',
      estado: 1,
      createdBy: 'seed',
      updatedBy: 'seed',
    },
  });

  const perfilMedico = await prisma.perfil.upsert({
    where: { nombre: 'MEDICO' },
    update: {},
    create: {
      nombre: 'MEDICO',
      estado: 1,
      createdBy: 'seed',
      updatedBy: 'seed',
    },
  });

  /* ==========================
     11. EMPLEADOS
     ========================== */
  // 11.1. KELLY JOHANNA TAMARA SALGADO - admisionista
  await prisma.empleado.upsert({
    where: { id: 1 },
    update: { usuario: 'kelly.tamara' },
    create: {
      id: 1,
      tipoDocumento: 'CC',
      numeroIdentidad: '57463398',
      usuario: 'kelly.tamara',
      primerNombre: 'KELLY',
      segundoNombre: 'JOHANNA',
      primerApellido: 'TAMARA',
      segundoApellido: 'SALGADO',
      direccion: 'Calle 22 # 15-30',
      telefonos: '3000000001',
      contrasena: 'sism12345',
      activo: true,
      registroMedico: null,
      licencia: null,
      perfilId: perfilAdmisionista.id,
      firma: null,
      email: 'kelly.tamara@ipssism.com',
      idSede: sedeSantaMarta.id,
    },
  });

  // 11.2. JONH CAMILO PERTUZ PERTUZ - administrador
  await prisma.empleado.upsert({
    where: { id: 2 },
    update: { usuario: 'jonh.pertuz' },
    create: {
      id: 2,
      tipoDocumento: 'CC',
      numeroIdentidad: '1221968097',
      usuario: 'jonh.pertuz',
      primerNombre: 'JONH',
      segundoNombre: 'CAMILO',
      primerApellido: 'PERTUZ',
      segundoApellido: 'PERTUZ',
      direccion: 'Cra 10 # 20-30',
      telefonos: '3000000002',
      contrasena: 'sism12345',
      activo: true,
      registroMedico: null,
      licencia: null,
      perfilId: perfilAdministrador.id,
      firma: null,
      email: 'jonh.pertuz@ipssism.com',
      idSede: sedeSantaMarta.id,
    },
  });

  // 11.3. DANIEL ANDRES CASTAÑO NAVARRO - médico
  const medicoDaniel = await prisma.empleado.upsert({
    where: { id: 3 },
    update: { usuario: 'daniel.castano' },
    create: {
      id: 3,
      tipoDocumento: 'CC',
      numeroIdentidad: '1004462425',
      usuario: 'daniel.castano',
      primerNombre: 'DANIEL',
      segundoNombre: 'ANDRES',
      primerApellido: 'CASTAÑO',
      segundoApellido: 'NAVARRO',
      direccion: 'Cra 8 # 12-45',
      telefonos: '3000000003',
      contrasena: 'sism12345',
      activo: true,
      registroMedico: 'RM-123456',
      licencia: 'LIC-987654',
      perfilId: perfilMedico.id,
      firma: null,
      email: 'daniel.castano@ipssism.com',
      idSede: sedeValledupar.id,
    },
  });

  /* ==========================
     12. USUARIOS (DOCENTES)
     ========================== */
  const usuarioAlexis = await prisma.usuario.upsert({
    where: {
      identificacion_tipoIdentificacion: {
        identificacion: '26802360',
        tipoIdentificacion: 'CC',
      },
    },
    update: {},
    create: {
      carnet: '26802360',
      identificacion: '26802360',
      tipoIdentificacion: 'CC',

      primerApellido: 'CARREÑO',
      segundoApellido: 'DE AVILA',
      primerNombre: 'ALEXIS',
      segundoNombre: null,

      direccion: 'Barrio Centro',
      telefono: '6055800000',
      tipoUsuario: 'DO', // docente

      codigoOcupacion: '2341', // código genérico docente

      unidadEdad: 'A',
      edad: 55,
      sexo: 'M',

      residenciaPais: 'COL',
      zonaResidencia: 'U',
      fechaNacimiento: new Date('1969-01-01'),

      estadoCivil: 'CASADO',
      estado: 'ACTIVO',
      fechaEstado: new Date(),

      sector: 'OFICIAL',

      nombreAcudiente: null,
      telefonoAcudiente: null,
      hemoclasificacion: 'O+',
      parentezco: null,

      discapacidad: false,
      estrato: 3,

      codigoEps: 'FIDU24',
      categoria: 'DOCENTE',
      etnia: null,
      lugarNacimiento: '20001', // Valledupar

      nroHijos: 0,
      escolaridad: 'UN', // universitaria

      fechaAfiliacion: new Date(),

      celular: '3000000004',
      email: 'alexis.carreno@example.com',
      religion: 'CATOLICA',
      telefonoSecundario: null,

      createdAt: new Date(),
      createdBy: 'seed',
      updatedBy: 'seed',

      genero: 'MASCULINO',
      gestacion: false,

      victimaConflictoArmado: false,
      victimaMaltrato: false,
      abandonoSocial: false,
      desescolarizado: false,
      desempleado: false,
      carcelario: false,
      migrante: false,
      trabajadoraSexual: false,
      poblacionLgtbi: false,

      orientacionSexual: 'NO REFIERE',

      barrio: 'LOPERENA GARUPAL',
      barrioId: barrioLoperena.id,

      confirmacionTelefono: 'SIN_CONFIRMAR',

      codigoDepartamento: '20',
      codigoMunicipio: '20001',
      codigoPais: '057',

      idSede: sedeValledupar.id,

      gradoEscalafon: '2',
      nivelEscalafon: 'A',
      formaVinculacion: 'EN PROPIEDAD',

      secretariaId: secretariaCesar.id,
      institucionEducativaId: institucionLoperena.id,
    },
  });

  /* ==========================
     13. CIE10
     ========================== */
  await prisma.cie10.upsert({
    where: { codigo: 'I10X' },
    update: {},
    create: {
      codigo: 'I10X',
      nombre: 'HIPERTENSION ESENCIAL (PRIMARIA)',
      estado: true,
    },
  });

  await prisma.cie10.upsert({
    where: { codigo: 'F412' },
    update: {},
    create: {
      codigo: 'F412',
      nombre: 'Trastorno mixto ansioso-depresivo',
      estado: true,
    },
  });

  await prisma.cie10.upsert({
    where: { codigo: 'M531' },
    update: {},
    create: {
      codigo: 'M531',
      nombre: 'Síndrome cervicobraquial',
      estado: true,
    },
  });

  /* =======================================================
     14. LIMPIAR CATÁLOGO DEFICIENCIAS + DICTÁMENES
     (para que el seed sea idempotente)
     ======================================================= */

  await prisma.dictamenEntrada.deleteMany({});
  await prisma.dictamenDeficiencia.deleteMany({});
  await prisma.dictamenDiagnostico.deleteMany({});
  await prisma.dictamenLimitacionesAvdAivd.deleteMany({});
  await prisma.dictamenAnalisisOcupacional.deleteMany({});
  await prisma.dictamen.deleteMany({});

  await prisma.cie10Deficiencia.deleteMany({});
  await prisma.reglaCondicion.deleteMany({});
  await prisma.deficienciaRegla.deleteMany({});
  await prisma.criterioRango.deleteMany({});
  await prisma.criterioOpcion.deleteMany({});
  await prisma.deficienciaCriterio.deleteMany({});
  await prisma.deficiencia.deleteMany({});

  /* =======================================================
     15. CATÁLOGO DE DEFICIENCIAS – TABLA 1.5
     ======================================================= */

  const uiTabla15: Prisma.JsonObject = {
    codigoTabla: '1.5',
    titulo: 'Tabla 1.5. Funciones del temperamento y la personalidad',
    clase: 'Única',
    criterio: {
      codigo: 'CRIT1',
      etiqueta: 'Presencia de sintomatología',
      tipo: 'BOOLEAN',
    },
    procedimientos: {
      A: 40,
      B: 15,
    },
    filas: [
      'Pobreza en los vínculos interpersonales; fantasías importantes de desconfianza, amenaza, o de carácter mágico, y/o',
      'Impulsividad, o emotividad marcada o especialmente lábil, poca tolerancia a la frustración, deficiente organización del sistema de intereses y valores e interés notorio en la propia persona y desconsideración de los demás, expresado en fantasías, actitudes y conductas, y/o',
      'Marcada preocupación por las relaciones interpersonales, asociadas con ansiedad y actitudes y/o conductas de evitación, sumisión y control, y/o',
      'Marcada hostilidad y desconfianza, aislamiento notorio, ansiedad y depresión, o marcada dependencia y demanda hacia las demás personas, incapacidad para mantener relaciones interpersonales, notoria pasividad y disminución de los intereses, actitud y conducta enfermiza acentuada.',
    ],
  };

  // Deficiencia principal (Tabla 1.5)
  const defTabla15 = await prisma.deficiencia.create({
    data: {
      codigo: 'TABLA_1_5',
      nombre: 'Funciones del temperamento y la personalidad (Tabla 1.5)',
      sistemaCorporal: 'FUNCIONES MENTALES Y DEL COMPORTAMIENTO',
      version: 'DECRETO_1507_2014',
      notas: 'Tabla 1.5. Funciones del temperamento y la personalidad.',
      uiPolitica: uiTabla15,
      estado: true,
    },
  });

  // Criterio 1: Presencia de sintomatología (sí / no)
  const critSintomatologia = await prisma.deficienciaCriterio.create({
    data: {
      deficienciaId: defTabla15.id,
      codigo: 'CRIT1',
      etiqueta: 'Presencia de sintomatología',
      tipo: TipoCriterioDeficiencia.BOOLEAN,
      unidad: UnidadCriterio.NONE,
      orden: 1,
      estado: true,
    },
  });

  // Regla: si hay sintomatología → A = 40%, B = 15%
  const reglaSintomatologia = await prisma.deficienciaRegla.create({
    data: {
      deficienciaId: defTabla15.id,
      etiqueta: 'Presencia de sintomatología (Tabla 1.5)',
      porcentajeA: '40.00',
      porcentajeB: '15.00',
      tablaOrigen: '1.5',
      notas:
        'La presencia de la sintomatología descrita en la Tabla 1.5 genera estos porcentajes de deficiencia para los procedimientos A y B.',
      estado: true,
    },
  });

  await prisma.reglaCondicion.create({
    data: {
      reglaId: reglaSintomatologia.id,
      criterioId: critSintomatologia.id,
      opcionId: null,
      rangoId: null,
      valorNumerico: null,
      valorBooleano: true, // cuando el médico marque que SÍ hay sintomatología
    },
  });

  /* =======================================================
     16. DICTÁMENES DE PRUEBA PARA MÓDULO MÉDICO
     ======================================================= */

  // 16.1. Dictamen PENDIENTE (no reabierto)
  await prisma.dictamen.create({
    data: {
      usuarioId: usuarioAlexis.id,
      numeroDictamen: 1,
      fechaDictamen: new Date('2024-11-10'),
      procedimientoPcl: 'A',
      antecedentesClinicos:
        'Hipertensión arterial esencial de varios años de evolución.',
      condicionSalud: 'Paciente con control parcial de cifras tensionales.',
      descripcionHallazgos: 'TA 150/95 mmHg en consulta.',
      aplicaAnalisisOcupacional: false,
      estado: true, // pendiente
      reabierto: false,
      empleadoId: medicoDaniel.id,

      diagnosticos: {
        create: [{ cie10Codigo: 'I10X' }],
      },
      deficiencias: {
        create: [
          {
            deficienciaId: defTabla15.id,
            procedimiento: 'A',
            porcentajeResultado: '40.00',
            entradas: {
              create: [
                {
                  criterioId: critSintomatologia.id,
                  valorBooleano: true,
                  reglaCoincidenteId: reglaSintomatologia.id,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // 16.2. Dictamen CERRADO
  await prisma.dictamen.create({
    data: {
      usuarioId: usuarioAlexis.id,
      numeroDictamen: 2,
      fechaDictamen: new Date('2024-10-15'),
      procedimientoPcl: 'B',
      antecedentesClinicos: 'Trastorno mixto ansioso-depresivo.',
      condicionSalud: 'Requiere seguimiento psiquiátrico y psicológico.',
      descripcionHallazgos:
        'Sintomatología ansiosa y depresiva persistente con impacto funcional.',
      aplicaAnalisisOcupacional: true,
      estado: false, // cerrado
      reabierto: false,
      empleadoId: medicoDaniel.id,

      diagnosticos: {
        create: [{ cie10Codigo: 'F412' }],
      },
      deficiencias: {
        create: [
          {
            deficienciaId: defTabla15.id,
            procedimiento: 'B',
            porcentajeResultado: '15.00',
            entradas: {
              create: [
                {
                  criterioId: critSintomatologia.id,
                  valorBooleano: true,
                  reglaCoincidenteId: reglaSintomatologia.id,
                },
              ],
            },
          },
        ],
      },
    },
  });

  // 16.3. Dictamen PENDIENTE REABIERTO
  await prisma.dictamen.create({
    data: {
      usuarioId: usuarioAlexis.id,
      numeroDictamen: 3,
      fechaDictamen: new Date('2024-11-12'),
      procedimientoPcl: 'A',
      antecedentesClinicos:
        'Reapertura por empeoramiento de sintomatología mixta ansioso-depresiva.',
      condicionSalud: 'Sintomatología exacerbada pese a manejo previo.',
      descripcionHallazgos:
        'Escalas de ansiedad y depresión con puntajes elevados.',
      aplicaAnalisisOcupacional: true,
      estado: true, // pendiente
      reabierto: true, // 👈 importante para las pruebas del módulo médico
      empleadoId: medicoDaniel.id,

      diagnosticos: {
        create: [{ cie10Codigo: 'F412' }, { cie10Codigo: 'I10X' }],
      },
      deficiencias: {
        create: [
          {
            deficienciaId: defTabla15.id,
            procedimiento: 'A',
            porcentajeResultado: '40.00',
            entradas: {
              create: [
                {
                  criterioId: critSintomatologia.id,
                  valorBooleano: true,
                  reglaCoincidenteId: reglaSintomatologia.id,
                },
              ],
            },
          },
        ],
      },
    },
  });
}

// Ejecutar seed
main()
  .then(async () => {
    console.log('✅ Seed ejecutado correctamente');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
