-- Every field editable from reception participates in the same optimistic
-- concurrency token, including location and teacher employment information.
CREATE OR REPLACE FUNCTION increment_usuario_profile_version()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."identificacion" IS DISTINCT FROM OLD."identificacion"
    OR NEW."tipoIdentificacion" IS DISTINCT FROM OLD."tipoIdentificacion"
    OR NEW."primerNombre" IS DISTINCT FROM OLD."primerNombre"
    OR NEW."segundoNombre" IS DISTINCT FROM OLD."segundoNombre"
    OR NEW."primerApellido" IS DISTINCT FROM OLD."primerApellido"
    OR NEW."segundoApellido" IS DISTINCT FROM OLD."segundoApellido"
    OR NEW."fechaNacimiento" IS DISTINCT FROM OLD."fechaNacimiento"
    OR NEW."sexo" IS DISTINCT FROM OLD."sexo"
    OR NEW."codigoEps" IS DISTINCT FROM OLD."codigoEps"
    OR NEW."codigoDepartamento" IS DISTINCT FROM OLD."codigoDepartamento"
    OR NEW."codigoMunicipio" IS DISTINCT FROM OLD."codigoMunicipio"
    OR NEW."barrio" IS DISTINCT FROM OLD."barrio"
    OR NEW."barrioId" IS DISTINCT FROM OLD."barrioId"
    OR NEW."zonaResidencia" IS DISTINCT FROM OLD."zonaResidencia"
    OR NEW."residenciaPais" IS DISTINCT FROM OLD."residenciaPais"
    OR NEW."categoria" IS DISTINCT FROM OLD."categoria"
    OR NEW."celular" IS DISTINCT FROM OLD."celular"
    OR NEW."telefono" IS DISTINCT FROM OLD."telefono"
    OR NEW."email" IS DISTINCT FROM OLD."email"
    OR NEW."direccion" IS DISTINCT FROM OLD."direccion"
    OR NEW."cargo_docente_id" IS DISTINCT FROM OLD."cargo_docente_id"
    OR NEW."escolaridad" IS DISTINCT FROM OLD."escolaridad"
    OR NEW."fecha_vinculacion" IS DISTINCT FROM OLD."fecha_vinculacion"
    OR NEW."secretariaId" IS DISTINCT FROM OLD."secretariaId"
    OR NEW."institucionEducativaId" IS DISTINCT FROM OLD."institucionEducativaId"
    OR NEW."formaVinculacion" IS DISTINCT FROM OLD."formaVinculacion"
    OR NEW."estadoCivil" IS DISTINCT FROM OLD."estadoCivil"
    OR NEW."gradoEscalafon" IS DISTINCT FROM OLD."gradoEscalafon"
    OR NEW."nivelEscalafon" IS DISTINCT FROM OLD."nivelEscalafon" THEN
    NEW."profileVersion" := OLD."profileVersion" + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
