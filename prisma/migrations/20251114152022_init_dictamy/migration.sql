-- CreateEnum
CREATE TYPE "public"."EstadoUsuario" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "public"."ConfirmacionTelefono" AS ENUM ('SIN_CONFIRMAR', 'CONFIRMADO');

-- CreateEnum
CREATE TYPE "public"."ProcedimientoPcl" AS ENUM ('A', 'B');

-- CreateEnum
CREATE TYPE "public"."ClaseLimitacionLaboral" AS ENUM ('I', 'II', 'III', 'IV');

-- CreateEnum
CREATE TYPE "public"."GravedadAnalisis" AS ENUM ('CERO', 'I', 'II', 'III', 'IV');

-- CreateEnum
CREATE TYPE "public"."TipoCriterioDeficiencia" AS ENUM ('ENUM', 'RANGE', 'BOOLEAN', 'NUMBER');

-- CreateEnum
CREATE TYPE "public"."UnidadCriterio" AS ENUM ('NONE', 'DEGREE', 'METS', 'TNM_T', 'TNM_N', 'TNM_M', 'SCORE');

-- CreateEnum
CREATE TYPE "public"."ActividadAvdAivd" AS ENUM ('MIRAR', 'ESCUCHAR', 'PENSAR', 'LEER', 'ESCRIBIR', 'COMUNICARSE_CON_MENSAJES_ESCRITOS', 'HABLA', 'PRODUCCION_MENSAJES_NO_VERBALES', 'MENSAJES_ESCRITOS', 'CONVERSACION', 'MANTENER_CAMBIAR_POSICION_CUERPO', 'USO_MANO_BRAZO', 'DESPLAZARSE_ENTORNO', 'USO_TRANSPORTE_PASAJERO', 'CONDUCCION', 'LAVARSE', 'CUIDADO_PARTES_CUERPO', 'VESTIRSE', 'COMER', 'BEBER', 'ADQUIRIR_LO_NECESARIO_PARA_VIVIR', 'ADQUIRIR_BIENES_SERVICIOS', 'PREPARAR_COMIDAS', 'QUEHACERES_CASA', 'AYUDAR_A_LOS_DEMAS');

-- CreateEnum
CREATE TYPE "public"."FactorAnalisisOcupacional" AS ENUM ('ATENCION', 'MEMORIA', 'COMPRENSION_RESOLUCION_PROBLEMAS', 'INICIATIVA_AUTONOMIA', 'OBSERVACION', 'CAPACIDAD_ANALISIS_SINTESIS', 'COMPRENSION_ESPACIAL', 'ADAPTACION', 'RELACIONES', 'TOMA_DECISIONES', 'RESP_HERRAMIENTAS_EQUIPOS', 'RESP_MATERIALES_PRODUCTOS', 'RESP_INFORMACION_VALORES', 'RESP_TRABAJO_OTROS', 'RESP_SEGURIDAD_OTROS', 'COMUNICACION_ORAL', 'COMUNICACION_GESTUAL', 'LECTURA', 'ESCRITURA', 'MATEMATICAS', 'VISION', 'PERCEPCION_COLOR', 'PERCEPCION_FORMA', 'PERCEPCION_TAMANO', 'PERCEPCION_TEMPORAL', 'ORIENTACION_ESPACIAL', 'AUDICION', 'UBICACION_FUENTE_SONORA', 'DISCRIMINACION_AUDITIVA', 'SENSIBILIDAD_SUPERFICIAL', 'ESTEROGNOSIA', 'BAROGNOSIA', 'PROPIOCEPCION_SENTIDO_KINETICO', 'OLFATO', 'GUSTO', 'DESPLAZAMIENTO', 'TRANSPORTAR_PESO', 'ALCANZAR', 'HALAR', 'EMPUJAR', 'LEVANTAR', 'POSICION_SENTADO', 'SUPLENCIA_SENTADO', 'POSICION_DE_PIE', 'SUPLENCIA_DE_PIE', 'POSICION_RODILLAS', 'POSICION_CUCLILLAS', 'EQUILIBRIO_ESTATICO', 'AGARRE_MANO_LLENA', 'AGARRE_CILINDRICO', 'DIGITO_DIGITAL', 'ENGANCHE', 'PINZA_FINA', 'PINZA_TRIPODE', 'PINZA_LATERAL', 'EXACTITUD', 'PRECISION', 'PULSO', 'AGILIDAD', 'DESTREZA_MANUAL', 'DESTREZA_DIGITAL', 'ARMONIA');

-- CreateTable
CREATE TABLE "public"."paises" (
    "codigo" CHAR(3) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "codigoTelefono" CHAR(3) NOT NULL,

    CONSTRAINT "paises_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "public"."departamentos" (
    "codigo" CHAR(2) NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "departamentos_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "public"."municipios" (
    "codigo" CHAR(5) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "codigoDepartamento" CHAR(2) NOT NULL,

    CONSTRAINT "municipios_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "public"."barrios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "codigoMunicipio" CHAR(5) NOT NULL,

    CONSTRAINT "barrios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."eps" (
    "codigo" VARCHAR(6) NOT NULL,
    "nombreEntidad" VARCHAR(255) NOT NULL,
    "codigoDepartamento" CHAR(2),
    "codigoMunicipio" CHAR(5),
    "digitado" BOOLEAN NOT NULL DEFAULT false,
    "nit" VARCHAR(15) NOT NULL,
    "dv" CHAR(1) NOT NULL,
    "email" VARCHAR(80) NOT NULL,
    "telefono" VARCHAR(15) NOT NULL,
    "direccion" VARCHAR(100) NOT NULL,

    CONSTRAINT "eps_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "public"."centro_medico" (
    "id" SERIAL NOT NULL,
    "codigoHabilitacion" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "email" VARCHAR(100),
    "direccion" VARCHAR(100),
    "telefono" VARCHAR(20),
    "codigoDepartamento" CHAR(2),
    "codigoMunicipio" CHAR(5),
    "logo" BYTEA,
    "estado" SMALLINT NOT NULL DEFAULT 1,
    "resolucion" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR(100),
    "updatedBy" VARCHAR(100),

    CONSTRAINT "centro_medico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sedes" (
    "id" SERIAL NOT NULL,
    "centroMedicoId" INTEGER NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "codigoHabilitacion" VARCHAR(50),
    "direccion" VARCHAR(225),
    "codigoDepartamento" CHAR(2),
    "codigoMunicipio" CHAR(5),
    "telefono" VARCHAR(50),
    "estado" SMALLINT NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR(100),
    "updatedBy" VARCHAR(100),

    CONSTRAINT "sedes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."perfiles" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "estado" SMALLINT NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR(100),
    "updatedBy" VARCHAR(100),

    CONSTRAINT "perfiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usuarios" (
    "id" SERIAL NOT NULL,
    "carnet" VARCHAR(50) NOT NULL,
    "identificacion" VARCHAR(20) NOT NULL,
    "tipoIdentificacion" CHAR(2) NOT NULL,
    "primerApellido" VARCHAR(50) NOT NULL,
    "segundoApellido" VARCHAR(50),
    "primerNombre" VARCHAR(50) NOT NULL,
    "segundoNombre" VARCHAR(50),
    "direccion" VARCHAR(255),
    "telefono" VARCHAR(15),
    "tipoUsuario" CHAR(2) NOT NULL,
    "codigoOcupacion" CHAR(4),
    "unidadEdad" CHAR(1) NOT NULL,
    "edad" SMALLINT,
    "sexo" CHAR(1) NOT NULL,
    "residenciaPais" CHAR(3) NOT NULL,
    "zonaResidencia" CHAR(1) NOT NULL,
    "fechaNacimiento" DATE,
    "estadoCivil" VARCHAR(20),
    "estado" "public"."EstadoUsuario" NOT NULL DEFAULT 'ACTIVO',
    "fechaEstado" DATE,
    "sector" VARCHAR(50) NOT NULL,
    "nombreAcudiente" VARCHAR(100),
    "telefonoAcudiente" VARCHAR(15),
    "hemoclasificacion" VARCHAR(3),
    "parentezco" CHAR(1),
    "discapacidad" BOOLEAN NOT NULL DEFAULT false,
    "estrato" SMALLINT,
    "codigoEps" VARCHAR(6) NOT NULL,
    "categoria" VARCHAR(30),
    "etnia" VARCHAR(10),
    "lugarNacimiento" VARCHAR(5),
    "nroHijos" SMALLINT NOT NULL DEFAULT 0,
    "escolaridad" VARCHAR(2),
    "fechaAfiliacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "celular" VARCHAR(15),
    "email" VARCHAR(100),
    "religion" VARCHAR(50),
    "telefonoSecundario" VARCHAR(15),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR(100),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" VARCHAR(100),
    "genero" VARCHAR(20),
    "gestacion" BOOLEAN NOT NULL DEFAULT false,
    "victimaConflictoArmado" BOOLEAN NOT NULL DEFAULT false,
    "victimaMaltrato" BOOLEAN NOT NULL DEFAULT false,
    "abandonoSocial" BOOLEAN NOT NULL DEFAULT false,
    "desescolarizado" BOOLEAN NOT NULL DEFAULT false,
    "desempleado" BOOLEAN NOT NULL DEFAULT false,
    "carcelario" BOOLEAN NOT NULL DEFAULT false,
    "migrante" BOOLEAN NOT NULL DEFAULT false,
    "trabajadoraSexual" BOOLEAN NOT NULL DEFAULT false,
    "poblacionLgtbi" BOOLEAN NOT NULL DEFAULT false,
    "orientacionSexual" VARCHAR(50) NOT NULL DEFAULT 'NO REFIERE',
    "barrio" VARCHAR(50),
    "barrioId" INTEGER,
    "confirmacionTelefono" "public"."ConfirmacionTelefono" NOT NULL DEFAULT 'SIN_CONFIRMAR',
    "codigoDepartamento" CHAR(2),
    "codigoMunicipio" CHAR(5),
    "codigoPais" CHAR(3) NOT NULL DEFAULT '057',
    "idSede" INTEGER,
    "gradoEscalafon" VARCHAR(2) NOT NULL,
    "nivelEscalafon" VARCHAR(1) NOT NULL,
    "formaVinculacion" VARCHAR(45) NOT NULL,
    "secretaria" VARCHAR(45) NOT NULL,
    "institucionEducativa" VARCHAR(150) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."empleados" (
    "id" SERIAL NOT NULL,
    "tipoDocumento" VARCHAR(3),
    "numeroIdentidad" VARCHAR(18),
    "primerNombre" VARCHAR(40) NOT NULL,
    "segundoNombre" VARCHAR(40),
    "primerApellido" VARCHAR(40) NOT NULL,
    "segundoApellido" VARCHAR(40),
    "direccion" VARCHAR(50),
    "telefonos" VARCHAR(30),
    "contrasena" VARCHAR(60),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "registroMedico" VARCHAR(25),
    "licencia" VARCHAR(30),
    "perfilId" INTEGER,
    "firma" BYTEA,
    "email" VARCHAR(50),
    "idSede" INTEGER,

    CONSTRAINT "empleados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."deficiencias" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "sistemaCorporal" TEXT,
    "version" TEXT,
    "notas" TEXT,
    "uiPolitica" JSONB NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "deficiencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."deficiencia_criterios" (
    "id" SERIAL NOT NULL,
    "deficienciaId" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "etiqueta" TEXT NOT NULL,
    "tipo" "public"."TipoCriterioDeficiencia" NOT NULL,
    "unidad" "public"."UnidadCriterio" NOT NULL DEFAULT 'NONE',
    "orden" INTEGER NOT NULL DEFAULT 0,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "deficiencia_criterios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."criterio_opciones" (
    "id" SERIAL NOT NULL,
    "criterioId" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "etiqueta" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "criterio_opciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."criterio_rangos" (
    "id" SERIAL NOT NULL,
    "criterioId" INTEGER NOT NULL,
    "etiqueta" TEXT NOT NULL,
    "valorMinimo" DECIMAL(10,3),
    "valorMaximo" DECIMAL(10,3),
    "minInclusivo" BOOLEAN NOT NULL DEFAULT true,
    "maxInclusivo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "criterio_rangos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."deficiencia_reglas" (
    "id" SERIAL NOT NULL,
    "deficienciaId" INTEGER NOT NULL,
    "etiqueta" TEXT,
    "porcentajeA" DECIMAL(6,2) NOT NULL,
    "porcentajeB" DECIMAL(6,2) NOT NULL,
    "tablaOrigen" TEXT,
    "notas" TEXT,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "deficiencia_reglas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."regla_condiciones" (
    "id" SERIAL NOT NULL,
    "reglaId" INTEGER NOT NULL,
    "criterioId" INTEGER NOT NULL,
    "opcionId" INTEGER,
    "rangoId" INTEGER,
    "valorNumerico" DECIMAL(10,3),
    "valorBooleano" BOOLEAN,

    CONSTRAINT "regla_condiciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cie10" (
    "codigo" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cie10_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "public"."cie10_deficiencias" (
    "cie10Codigo" VARCHAR(10) NOT NULL,
    "deficienciaId" INTEGER NOT NULL,

    CONSTRAINT "cie10_deficiencias_pkey" PRIMARY KEY ("cie10Codigo","deficienciaId")
);

-- CreateTable
CREATE TABLE "public"."dictamenes" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "numeroDictamen" INTEGER,
    "fechaDictamen" DATE NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "procedimientoPcl" "public"."ProcedimientoPcl" NOT NULL,
    "totalTitulo1" DECIMAL(6,2),
    "totalCap1" DECIMAL(6,2),
    "claseLimitacionLaboral" "public"."ClaseLimitacionLaboral",
    "totalCap2" DECIMAL(6,2),
    "totalTitulo3" DECIMAL(6,2),
    "antecedentesClinicos" TEXT,
    "condicionSalud" TEXT,
    "descripcionHallazgos" TEXT,
    "aplicaAnalisisOcupacional" BOOLEAN NOT NULL DEFAULT false,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "dictamenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dictamen_diagnosticos" (
    "id" SERIAL NOT NULL,
    "dictamenId" INTEGER NOT NULL,
    "cie10Codigo" VARCHAR(10) NOT NULL,

    CONSTRAINT "dictamen_diagnosticos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dictamen_deficiencias" (
    "id" SERIAL NOT NULL,
    "dictamenId" INTEGER NOT NULL,
    "deficienciaId" INTEGER NOT NULL,
    "procedimiento" "public"."ProcedimientoPcl" NOT NULL,
    "porcentajeResultado" DECIMAL(6,2),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dictamen_deficiencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dictamen_entradas" (
    "id" SERIAL NOT NULL,
    "dictamenDeficienciaId" INTEGER NOT NULL,
    "criterioId" INTEGER,
    "opcionId" INTEGER,
    "rangoId" INTEGER,
    "valorNumerico" DECIMAL(10,3),
    "valorBooleano" BOOLEAN,
    "reglaCoincidenteId" INTEGER,

    CONSTRAINT "dictamen_entradas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dictamen_limitaciones_avd_aivd" (
    "id" SERIAL NOT NULL,
    "dictamenId" INTEGER NOT NULL,
    "actividad" "public"."ActividadAvdAivd" NOT NULL,
    "valor" DECIMAL(3,1) NOT NULL,

    CONSTRAINT "dictamen_limitaciones_avd_aivd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dictamen_analisis_ocupacional" (
    "id" SERIAL NOT NULL,
    "dictamenId" INTEGER NOT NULL,
    "factor" "public"."FactorAnalisisOcupacional" NOT NULL,
    "gravedad" "public"."GravedadAnalisis" NOT NULL,
    "valor" INTEGER,

    CONSTRAINT "dictamen_analisis_ocupacional_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "municipios_codigoDepartamento_idx" ON "public"."municipios"("codigoDepartamento");

-- CreateIndex
CREATE INDEX "barrios_codigoMunicipio_idx" ON "public"."barrios"("codigoMunicipio");

-- CreateIndex
CREATE UNIQUE INDEX "barrios_codigoMunicipio_nombre_key" ON "public"."barrios"("codigoMunicipio", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "eps_nit_key" ON "public"."eps"("nit");

-- CreateIndex
CREATE INDEX "eps_codigoDepartamento_idx" ON "public"."eps"("codigoDepartamento");

-- CreateIndex
CREATE INDEX "eps_codigoMunicipio_idx" ON "public"."eps"("codigoMunicipio");

-- CreateIndex
CREATE INDEX "centro_medico_codigoDepartamento_idx" ON "public"."centro_medico"("codigoDepartamento");

-- CreateIndex
CREATE INDEX "centro_medico_codigoMunicipio_idx" ON "public"."centro_medico"("codigoMunicipio");

-- CreateIndex
CREATE INDEX "sedes_centroMedicoId_idx" ON "public"."sedes"("centroMedicoId");

-- CreateIndex
CREATE INDEX "sedes_codigoDepartamento_idx" ON "public"."sedes"("codigoDepartamento");

-- CreateIndex
CREATE INDEX "sedes_codigoMunicipio_idx" ON "public"."sedes"("codigoMunicipio");

-- CreateIndex
CREATE UNIQUE INDEX "perfiles_nombre_key" ON "public"."perfiles"("nombre");

-- CreateIndex
CREATE INDEX "usuarios_codigoEps_idx" ON "public"."usuarios"("codigoEps");

-- CreateIndex
CREATE INDEX "usuarios_codigoDepartamento_idx" ON "public"."usuarios"("codigoDepartamento");

-- CreateIndex
CREATE INDEX "usuarios_codigoMunicipio_idx" ON "public"."usuarios"("codigoMunicipio");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "public"."usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_identificacion_tipoIdentificacion_key" ON "public"."usuarios"("identificacion", "tipoIdentificacion");

-- CreateIndex
CREATE UNIQUE INDEX "deficiencias_codigo_key" ON "public"."deficiencias"("codigo");

-- CreateIndex
CREATE INDEX "deficiencia_criterios_deficienciaId_idx" ON "public"."deficiencia_criterios"("deficienciaId");

-- CreateIndex
CREATE UNIQUE INDEX "deficiencia_criterios_deficienciaId_codigo_key" ON "public"."deficiencia_criterios"("deficienciaId", "codigo");

-- CreateIndex
CREATE INDEX "criterio_opciones_criterioId_idx" ON "public"."criterio_opciones"("criterioId");

-- CreateIndex
CREATE UNIQUE INDEX "criterio_opciones_criterioId_codigo_key" ON "public"."criterio_opciones"("criterioId", "codigo");

-- CreateIndex
CREATE INDEX "criterio_rangos_criterioId_idx" ON "public"."criterio_rangos"("criterioId");

-- CreateIndex
CREATE UNIQUE INDEX "criterio_rangos_criterioId_etiqueta_key" ON "public"."criterio_rangos"("criterioId", "etiqueta");

-- CreateIndex
CREATE INDEX "deficiencia_reglas_deficienciaId_idx" ON "public"."deficiencia_reglas"("deficienciaId");

-- CreateIndex
CREATE INDEX "regla_condiciones_reglaId_idx" ON "public"."regla_condiciones"("reglaId");

-- CreateIndex
CREATE INDEX "regla_condiciones_criterioId_idx" ON "public"."regla_condiciones"("criterioId");

-- CreateIndex
CREATE INDEX "regla_condiciones_opcionId_idx" ON "public"."regla_condiciones"("opcionId");

-- CreateIndex
CREATE INDEX "regla_condiciones_rangoId_idx" ON "public"."regla_condiciones"("rangoId");

-- CreateIndex
CREATE INDEX "cie10_deficiencias_deficienciaId_idx" ON "public"."cie10_deficiencias"("deficienciaId");

-- CreateIndex
CREATE INDEX "dictamenes_usuarioId_idx" ON "public"."dictamenes"("usuarioId");

-- CreateIndex
CREATE INDEX "dictamen_diagnosticos_dictamenId_idx" ON "public"."dictamen_diagnosticos"("dictamenId");

-- CreateIndex
CREATE INDEX "dictamen_diagnosticos_cie10Codigo_idx" ON "public"."dictamen_diagnosticos"("cie10Codigo");

-- CreateIndex
CREATE INDEX "dictamen_deficiencias_deficienciaId_idx" ON "public"."dictamen_deficiencias"("deficienciaId");

-- CreateIndex
CREATE UNIQUE INDEX "dictamen_deficiencias_dictamenId_deficienciaId_key" ON "public"."dictamen_deficiencias"("dictamenId", "deficienciaId");

-- CreateIndex
CREATE INDEX "dictamen_entradas_dictamenDeficienciaId_idx" ON "public"."dictamen_entradas"("dictamenDeficienciaId");

-- CreateIndex
CREATE INDEX "dictamen_entradas_criterioId_idx" ON "public"."dictamen_entradas"("criterioId");

-- CreateIndex
CREATE INDEX "dictamen_entradas_opcionId_idx" ON "public"."dictamen_entradas"("opcionId");

-- CreateIndex
CREATE INDEX "dictamen_entradas_rangoId_idx" ON "public"."dictamen_entradas"("rangoId");

-- CreateIndex
CREATE INDEX "dictamen_entradas_reglaCoincidenteId_idx" ON "public"."dictamen_entradas"("reglaCoincidenteId");

-- CreateIndex
CREATE INDEX "dictamen_limitaciones_avd_aivd_dictamenId_idx" ON "public"."dictamen_limitaciones_avd_aivd"("dictamenId");

-- CreateIndex
CREATE UNIQUE INDEX "dictamen_limitaciones_avd_aivd_dictamenId_actividad_key" ON "public"."dictamen_limitaciones_avd_aivd"("dictamenId", "actividad");

-- CreateIndex
CREATE INDEX "dictamen_analisis_ocupacional_dictamenId_idx" ON "public"."dictamen_analisis_ocupacional"("dictamenId");

-- CreateIndex
CREATE UNIQUE INDEX "dictamen_analisis_ocupacional_dictamenId_factor_key" ON "public"."dictamen_analisis_ocupacional"("dictamenId", "factor");

-- AddForeignKey
ALTER TABLE "public"."municipios" ADD CONSTRAINT "municipios_codigoDepartamento_fkey" FOREIGN KEY ("codigoDepartamento") REFERENCES "public"."departamentos"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."barrios" ADD CONSTRAINT "barrios_codigoMunicipio_fkey" FOREIGN KEY ("codigoMunicipio") REFERENCES "public"."municipios"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."eps" ADD CONSTRAINT "eps_codigoDepartamento_fkey" FOREIGN KEY ("codigoDepartamento") REFERENCES "public"."departamentos"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."eps" ADD CONSTRAINT "eps_codigoMunicipio_fkey" FOREIGN KEY ("codigoMunicipio") REFERENCES "public"."municipios"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."centro_medico" ADD CONSTRAINT "centro_medico_codigoDepartamento_fkey" FOREIGN KEY ("codigoDepartamento") REFERENCES "public"."departamentos"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."centro_medico" ADD CONSTRAINT "centro_medico_codigoMunicipio_fkey" FOREIGN KEY ("codigoMunicipio") REFERENCES "public"."municipios"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sedes" ADD CONSTRAINT "sedes_centroMedicoId_fkey" FOREIGN KEY ("centroMedicoId") REFERENCES "public"."centro_medico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sedes" ADD CONSTRAINT "sedes_codigoDepartamento_fkey" FOREIGN KEY ("codigoDepartamento") REFERENCES "public"."departamentos"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sedes" ADD CONSTRAINT "sedes_codigoMunicipio_fkey" FOREIGN KEY ("codigoMunicipio") REFERENCES "public"."municipios"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_residenciaPais_fkey" FOREIGN KEY ("residenciaPais") REFERENCES "public"."paises"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_codigoEps_fkey" FOREIGN KEY ("codigoEps") REFERENCES "public"."eps"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_barrioId_fkey" FOREIGN KEY ("barrioId") REFERENCES "public"."barrios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_codigoDepartamento_fkey" FOREIGN KEY ("codigoDepartamento") REFERENCES "public"."departamentos"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_codigoMunicipio_fkey" FOREIGN KEY ("codigoMunicipio") REFERENCES "public"."municipios"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."empleados" ADD CONSTRAINT "empleados_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "public"."perfiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deficiencia_criterios" ADD CONSTRAINT "deficiencia_criterios_deficienciaId_fkey" FOREIGN KEY ("deficienciaId") REFERENCES "public"."deficiencias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."criterio_opciones" ADD CONSTRAINT "criterio_opciones_criterioId_fkey" FOREIGN KEY ("criterioId") REFERENCES "public"."deficiencia_criterios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."criterio_rangos" ADD CONSTRAINT "criterio_rangos_criterioId_fkey" FOREIGN KEY ("criterioId") REFERENCES "public"."deficiencia_criterios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."deficiencia_reglas" ADD CONSTRAINT "deficiencia_reglas_deficienciaId_fkey" FOREIGN KEY ("deficienciaId") REFERENCES "public"."deficiencias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."regla_condiciones" ADD CONSTRAINT "regla_condiciones_reglaId_fkey" FOREIGN KEY ("reglaId") REFERENCES "public"."deficiencia_reglas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."regla_condiciones" ADD CONSTRAINT "regla_condiciones_criterioId_fkey" FOREIGN KEY ("criterioId") REFERENCES "public"."deficiencia_criterios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."regla_condiciones" ADD CONSTRAINT "regla_condiciones_opcionId_fkey" FOREIGN KEY ("opcionId") REFERENCES "public"."criterio_opciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."regla_condiciones" ADD CONSTRAINT "regla_condiciones_rangoId_fkey" FOREIGN KEY ("rangoId") REFERENCES "public"."criterio_rangos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cie10_deficiencias" ADD CONSTRAINT "cie10_deficiencias_cie10Codigo_fkey" FOREIGN KEY ("cie10Codigo") REFERENCES "public"."cie10"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cie10_deficiencias" ADD CONSTRAINT "cie10_deficiencias_deficienciaId_fkey" FOREIGN KEY ("deficienciaId") REFERENCES "public"."deficiencias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dictamenes" ADD CONSTRAINT "dictamenes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dictamen_diagnosticos" ADD CONSTRAINT "dictamen_diagnosticos_dictamenId_fkey" FOREIGN KEY ("dictamenId") REFERENCES "public"."dictamenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dictamen_diagnosticos" ADD CONSTRAINT "dictamen_diagnosticos_cie10Codigo_fkey" FOREIGN KEY ("cie10Codigo") REFERENCES "public"."cie10"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dictamen_deficiencias" ADD CONSTRAINT "dictamen_deficiencias_dictamenId_fkey" FOREIGN KEY ("dictamenId") REFERENCES "public"."dictamenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dictamen_deficiencias" ADD CONSTRAINT "dictamen_deficiencias_deficienciaId_fkey" FOREIGN KEY ("deficienciaId") REFERENCES "public"."deficiencias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dictamen_entradas" ADD CONSTRAINT "dictamen_entradas_dictamenDeficienciaId_fkey" FOREIGN KEY ("dictamenDeficienciaId") REFERENCES "public"."dictamen_deficiencias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dictamen_entradas" ADD CONSTRAINT "dictamen_entradas_criterioId_fkey" FOREIGN KEY ("criterioId") REFERENCES "public"."deficiencia_criterios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dictamen_entradas" ADD CONSTRAINT "dictamen_entradas_opcionId_fkey" FOREIGN KEY ("opcionId") REFERENCES "public"."criterio_opciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dictamen_entradas" ADD CONSTRAINT "dictamen_entradas_rangoId_fkey" FOREIGN KEY ("rangoId") REFERENCES "public"."criterio_rangos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dictamen_entradas" ADD CONSTRAINT "dictamen_entradas_reglaCoincidenteId_fkey" FOREIGN KEY ("reglaCoincidenteId") REFERENCES "public"."deficiencia_reglas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dictamen_limitaciones_avd_aivd" ADD CONSTRAINT "dictamen_limitaciones_avd_aivd_dictamenId_fkey" FOREIGN KEY ("dictamenId") REFERENCES "public"."dictamenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dictamen_analisis_ocupacional" ADD CONSTRAINT "dictamen_analisis_ocupacional_dictamenId_fkey" FOREIGN KEY ("dictamenId") REFERENCES "public"."dictamenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
