import type { ChangeEvent, KeyboardEvent } from 'react';

import { SearchableSelect } from '@/components/forms/SearchableSelect';
import { Button } from '@/components/ui/button';

import {
  CATEGORIA_OPTIONS,
  SEXO_OPTIONS,
  TIPO_DOCUMENTO_OPTIONS,
  ZONA_OPTIONS,
} from './constants';
import { Field, FormSection, SelectInput, TextInput } from './FormPrimitives';
import type {
  BarrioOption,
  DepartamentoOption,
  DocenteForm,
  EpsOption,
  MunicipioOption,
  PaisOption,
} from './types';

type Props = {
  form: DocenteForm;
  selectedPaisCodigo: string;
  selectedDepartamento: string;
  selectedMunicipio: string;
  paises: PaisOption[];
  departamentos: DepartamentoOption[];
  municipios: MunicipioOption[];
  barrios: BarrioOption[];
  epsList: EpsOption[];
  ubicacionLoading: boolean;
  searching: boolean;
  onFieldChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBuscarDocente: () => void;
  onPaisChange: (codigo: string) => void;
  onDepartamentoChange: (codigo: string) => void;
  onMunicipioChange: (codigo: string) => void;
  onBarrioChange: (barrio: string) => void;
  onEpsChange: (codigo: string) => void;
};

export function IdentificacionUbicacionSection({
  form,
  selectedPaisCodigo,
  selectedDepartamento,
  selectedMunicipio,
  paises,
  departamentos,
  municipios,
  barrios,
  epsList,
  ubicacionLoading,
  searching,
  onFieldChange,
  onBuscarDocente,
  onPaisChange,
  onDepartamentoChange,
  onMunicipioChange,
  onBarrioChange,
  onEpsChange,
}: Props) {
  const handleDocumentoKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onBuscarDocente();
    }
  };

  return (
    <FormSection title="Datos de identificación y ubicación">
      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-3">
          <Field label="Tipo de documento">
            <SelectInput
              name="tipoDocumento"
              value={form.tipoDocumento}
              onChange={onFieldChange}
              options={TIPO_DOCUMENTO_OPTIONS}
              placeholder="Seleccione"
              className="h-10"
            />
          </Field>
        </div>

        <div className="md:col-span-4">
          <Field label="Número de documento">
            <div className="flex items-stretch rounded-md shadow-sm">
              <TextInput
                name="numeroDocumento"
                value={form.numeroDocumento}
                onChange={onFieldChange}
                onKeyDown={handleDocumentoKeyDown}
                className="h-10 min-w-0 flex-1 rounded-r-none border-r-0 focus:z-10"
              />
              <Button
                type="button"
                variant="outline"
                onClick={onBuscarDocente}
                disabled={searching}
                className="h-10 rounded-l-none border-gray-300 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {searching ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </Field>
        </div>

        <div className="md:col-span-3">
          <Field label="Fecha de nacimiento">
            <TextInput
              type="date"
              name="fechaNacimiento"
              value={form.fechaNacimiento}
              onChange={onFieldChange}
              className="h-10"
            />
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="Edad (años)">
            <TextInput
              name="edad"
              value={form.edad}
              onChange={onFieldChange}
              readOnly
              className="h-10 bg-gray-50 text-gray-700"
            />
          </Field>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Primer nombre">
          <TextInput name="primerNombre" value={form.primerNombre} onChange={onFieldChange} />
        </Field>
        <Field label="Segundo nombre">
          <TextInput name="segundoNombre" value={form.segundoNombre} onChange={onFieldChange} />
        </Field>
        <Field label="Primer apellido">
          <TextInput name="primerApellido" value={form.primerApellido} onChange={onFieldChange} />
        </Field>
        <Field label="Segundo apellido">
          <TextInput
            name="segundoApellido"
            value={form.segundoApellido}
            onChange={onFieldChange}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Sexo">
          <SelectInput
            name="sexo"
            value={form.sexo}
            onChange={onFieldChange}
            options={SEXO_OPTIONS}
            placeholder="Seleccione..."
          />
        </Field>

        <div className="md:col-span-2">
          <Field label="Dirección">
            <TextInput name="direccion" value={form.direccion} onChange={onFieldChange} />
          </Field>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Departamento / Estado">
          <SearchableSelect
            value={selectedDepartamento}
            options={departamentos.map((departamento) => ({
              value: departamento.codigo,
              label: departamento.nombre,
            }))}
            placeholder={ubicacionLoading ? 'Cargando departamentos...' : 'Seleccione departamento...'}
            onChange={onDepartamentoChange}
          />
        </Field>

        <Field label="Ciudad / Municipio">
          <SearchableSelect
            value={selectedMunicipio}
            options={municipios.map((municipio) => ({
              value: municipio.codigo,
              label: municipio.nombre,
            }))}
            placeholder="Seleccione municipio..."
            onChange={onMunicipioChange}
          />
        </Field>

        <Field label="Barrio / Vereda">
          <SearchableSelect
            value={form.barrio}
            options={barrios.map((barrio) => ({
              value: barrio.nombre,
              label: barrio.nombre,
            }))}
            placeholder="Seleccione barrio..."
            onChange={onBarrioChange}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Zona">
          <SelectInput
            name="zona"
            value={form.zona}
            onChange={onFieldChange}
            options={ZONA_OPTIONS}
            placeholder="Seleccione..."
          />
        </Field>

        <Field label="Teléfono de contacto">
          <TextInput name="telefono" value={form.telefono} onChange={onFieldChange} />
        </Field>

        <Field label="País">
          <SearchableSelect
            value={selectedPaisCodigo}
            options={paises.map((pais) => ({
              value: pais.codigo,
              label: pais.nombre,
            }))}
            placeholder="Seleccione país..."
            onChange={onPaisChange}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Field label="Aseguradora (EPS)">
            <SearchableSelect
              value={form.codigoEps}
              options={epsList.map((eps) => ({
                value: eps.codigo,
                label: eps.nombre,
              }))}
              onChange={onEpsChange}
              placeholder="Seleccione EPS..."
            />
          </Field>
        </div>

        <Field label="Categoría">
          <SelectInput
            name="categoria"
            value={form.categoria}
            onChange={onFieldChange}
            options={CATEGORIA_OPTIONS}
            placeholder="Seleccione..."
          />
        </Field>
      </div>
    </FormSection>
  );
}
