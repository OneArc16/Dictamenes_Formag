export type Paciente = {
  IdUsuario: number;
  Identificaci_n_usuario: string;
  Tipo_identificaci_n: string;
  Primer_nombre: string;
  Segundo_nombre: string | null;
  Primer_apellido: string;
  Segundo_apellido: string | null;
  Sexo: string;
  Edad: string;
  Celular: string | null;
  Tel_fono: string | null;
  Direcci_n: string | null;
  Codigo_eps: string;
};
