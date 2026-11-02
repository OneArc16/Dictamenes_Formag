/**
 * Edad del paciente. No se guarda: se calcula entre la fecha de nacimiento y una fecha de
 * referencia (la de la atención o el documento, o la de hoy en pantalla), así nunca queda
 * desactualizada ni cambia al reimprimir un documento viejo. Las fechas van como YYYY-MM-DD ya
 * resueltas: las columnas solo-fecha se leen en UTC (`fechaDb`) y los instantes en el calendario
 * de Colombia (`fechaBogota`), para no correr un día y restar un año el día del cumpleaños.
 */

const TIME_ZONE = 'America/Bogota';

/** Columna @db.Date (medianoche UTC) → YYYY-MM-DD. */
export function fechaDb(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : null;
}

/** Instante → fecha del calendario de Colombia, YYYY-MM-DD. */
export function fechaBogota(value: Date | string = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: TIME_ZONE })
    .format(new Date(value));
}

/** Años cumplidos a la fecha de referencia; null sin fecha de nacimiento o si es posterior. */
export function edadEn(fechaNacimiento: string | null | undefined, referencia: string) {
  if (!fechaNacimiento) return null;
  const [ny, nm, nd] = fechaNacimiento.slice(0, 10).split('-').map(Number);
  const [ry, rm, rd] = referencia.slice(0, 10).split('-').map(Number);
  if ([ny, nm, nd, ry, rm, rd].some(Number.isNaN)) return null;
  // Comparar mes y día como número: quien nació un 29 de febrero cumple el 1 de marzo en años no bisiestos.
  const edad = ry - ny - (rm * 100 + rd < nm * 100 + nd ? 1 : 0);
  return edad < 0 ? null : edad;
}

/** Con fecha de nacimiento se calcula; sin ella queda el valor guardado de registros antiguos. */
export function edadPaciente(
  paciente: { fechaNacimiento: string | null; edad: number | null },
  referencia: string,
) {
  return paciente.fechaNacimiento ? edadEn(paciente.fechaNacimiento, referencia) : paciente.edad;
}
