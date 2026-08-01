-- Department is part of the editable administrative profile and therefore
-- participates in the same optimistic-concurrency version as municipality.
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
    OR NEW."celular" IS DISTINCT FROM OLD."celular"
    OR NEW."telefono" IS DISTINCT FROM OLD."telefono"
    OR NEW."email" IS DISTINCT FROM OLD."email"
    OR NEW."direccion" IS DISTINCT FROM OLD."direccion" THEN
    NEW."profileVersion" := OLD."profileVersion" + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
