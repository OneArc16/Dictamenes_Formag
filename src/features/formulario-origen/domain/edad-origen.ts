import { edadPaciente, fechaDb } from '@/lib/edad';

/**
 * Edad del docente en la fecha del dictamen de origen (la del documento), no la guardada: así no
 * queda desactualizada ni cambia si se consulta después. Sin fecha de nacimiento, la guardada.
 */
export function edadAlDictamenOrigen(
  docente: { fechaNacimiento: Date | null; edad: number | null },
  fechaDictamenOrigen: Date,
) {
  return edadPaciente(
    { fechaNacimiento: fechaDb(docente.fechaNacimiento), edad: docente.edad },
    fechaDb(fechaDictamenOrigen)!,
  );
}
