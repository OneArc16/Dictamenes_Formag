import type { ChangeEvent } from 'react';

import { SearchableSelect } from '@/components/forms/SearchableSelect';

import {
  ESCOLARIDAD_OPTIONS,
  ESTADO_CIVIL_OPTIONS,
  FORMA_VINCULACION_OPTIONS,
  NIVEL_ESCALAFON_OPTIONS,
  TIPO_DICTAMEN_OPTIONS,
} from './constants';
import { Field, FormSection, SelectInput, TextInput } from './FormPrimitives';
import type {
  CargoDocenteOption,
  DocenteForm,
  InstitucionOption,
  SecretariaOption,
} from './types';

type Props = {
  form: DocenteForm;
  isRecommendationMode: boolean;
  cargosDocentes: CargoDocenteOption[];
  secretarias: SecretariaOption[];
  instituciones: InstitucionOption[];
  selectedSecretariaId: string;
  loadingCargos: boolean;
  loadingInstituciones: boolean;
  onFieldChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSearchCargoDocente: (term: string) => void;
  onCargoChange: (value: string) => void;
  onSecretariaChange: (value: string) => void;
  onInstitucionSearch: (term: string) => void;
  onInstitucionChange: (value: string) => void;
};

export function DatosLaboralesSection({
  form,
  isRecommendationMode,
  cargosDocentes,
  secretarias,
  instituciones,
  selectedSecretariaId,
  loadingCargos,
  loadingInstituciones,
  onFieldChange,
  onSearchCargoDocente,
  onCargoChange,
  onSecretariaChange,
  onInstitucionSearch,
  onInstitucionChange,
}: Props) {
  return (
    <FormSection title="Datos laborales del docente">
      <div className="ml-0 mr-auto w-full max-w-[1400px] space-y-2.5">
        <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-16">
          <div className="xl:col-span-10">
            <Field label="Cargo docente">
              <SearchableSelect
                value={form.cargoDocenteId ? String(form.cargoDocenteId) : ''}
                options={cargosDocentes.map((cargo) => ({
                  value: String(cargo.id),
                  label: cargo.codigo ? `${cargo.nombre} (${cargo.codigo})` : cargo.nombre,
                }))}
                placeholder={loadingCargos ? 'Buscando cargos...' : 'Escribe mínimo 3 letras...'}
                onSearch={onSearchCargoDocente}
                isLoading={loadingCargos}
                minSearchLength={3}
                onChange={onCargoChange}
                className="h-8 text-xs"
              />
            </Field>
          </div>

          <div className="xl:col-span-6">
            <Field label="Escolaridad">
              <SelectInput
                name="escolaridad"
                value={form.escolaridad}
                onChange={onFieldChange}
                options={ESCOLARIDAD_OPTIONS}
                placeholder="Seleccione..."
                className="h-8"
              />
            </Field>
          </div>
        </div>

        <div className="grid gap-2.5 xl:grid-cols-16">
          <div className={isRecommendationMode ? 'xl:col-span-2' : 'xl:col-span-2'}>
            <Field label="Fecha de vinculación">
              <TextInput
                type="date"
                name="fechaVinculacion"
                value={form.fechaVinculacion}
                onChange={onFieldChange}
                className="h-8"
              />
            </Field>
          </div>

          <div className={isRecommendationMode ? 'xl:col-span-4' : 'xl:col-span-3'}>
            <Field label="Secretaría donde labora">
              <SearchableSelect
                value={selectedSecretariaId}
                options={secretarias.map((secretaria) => ({
                  value: String(secretaria.id),
                  label: secretaria.nombre,
                }))}
                placeholder="Seleccione secretaría..."
                onChange={onSecretariaChange}
                className="h-8 text-xs"
              />
            </Field>
          </div>

          <div className={isRecommendationMode ? 'xl:col-span-10' : 'xl:col-span-7'}>
            <Field label="Institución donde labora">
              <SearchableSelect
                value={form.institucionLabora}
                options={instituciones.map((institucion) => ({
                  value: institucion.nombre,
                  label: institucion.nombre,
                }))}
                placeholder={
                  !selectedSecretariaId
                    ? 'Seleccione primero una secretaría'
                    : loadingInstituciones
                      ? 'Buscando instituciones...'
                      : 'Empiece a escribir para buscar...'
                }
                disabled={!selectedSecretariaId}
                onSearch={onInstitucionSearch}
                isLoading={loadingInstituciones}
                minSearchLength={3}
                onChange={onInstitucionChange}
                className="h-8 text-xs"
              />
            </Field>
          </div>

          {!isRecommendationMode ? (
            <div className="xl:col-span-4">
              <Field label="Tipo de dictamen">
                <SelectInput
                  name="tipoDictamen"
                  value={form.tipoDictamen}
                  onChange={onFieldChange}
                  options={TIPO_DICTAMEN_OPTIONS}
                  placeholder=""
                  className="h-8"
                />
              </Field>
            </div>
          ) : null}
        </div>

        <div className="grid gap-2.5 xl:grid-cols-13">
          <div className="xl:col-span-4">
            <Field label="Forma de vinculación">
              <SelectInput
                name="formaVinculacion"
                value={form.formaVinculacion}
                onChange={onFieldChange}
                options={FORMA_VINCULACION_OPTIONS}
                placeholder="Seleccione..."
                className="h-8"
              />
            </Field>
          </div>

          <div className="xl:col-span-3">
            <Field label="Grado de escalafón">
              <TextInput
                name="gradoEscalafon"
                value={form.gradoEscalafon}
                onChange={onFieldChange}
                placeholder="Ej: 14"
                className="h-8"
              />
            </Field>
          </div>

          <div className="xl:col-span-3">
            <Field label="Nivel de escalafón">
              <SelectInput
                name="nivelEscalafon"
                value={form.nivelEscalafon}
                onChange={onFieldChange}
                options={NIVEL_ESCALAFON_OPTIONS}
                placeholder="Seleccione..."
                className="h-8"
              />
            </Field>
          </div>

          <div className="xl:col-span-3">
            <Field label="Estado civil">
              <SelectInput
                name="estadoCivil"
                value={form.estadoCivil}
                onChange={onFieldChange}
                options={ESTADO_CIVIL_OPTIONS}
                placeholder="Seleccione..."
                className="h-8"
              />
            </Field>
          </div>
        </div>
      </div>
    </FormSection>
  );
}
