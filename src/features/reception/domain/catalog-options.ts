export function uniqueByNormalizedName<T extends { nombre: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLocaleUpperCase('es-CO');

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
