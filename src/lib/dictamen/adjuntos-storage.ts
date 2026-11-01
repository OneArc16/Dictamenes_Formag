import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

const EXTENSION_BY_MIME: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
};

/** Carpeta raíz de los adjuntos. Configurable con ADJUNTOS_DIR (ruta absoluta recomendada). */
export function getAdjuntosBaseDir() {
  return path.resolve(process.env.ADJUNTOS_DIR?.trim() || path.join(process.cwd(), 'storage', 'adjuntos'));
}

/** Resuelve una ruta relativa guardada en BD y garantiza que no salga de la carpeta raíz. */
function resolveInside(relativePath: string) {
  const base = getAdjuntosBaseDir();
  const full = path.resolve(base, relativePath);
  if (full !== base && !full.startsWith(base + path.sep)) {
    throw new Error('Ruta de adjunto inválida.');
  }
  return full;
}

/** Guarda el archivo y devuelve su ruta relativa (con nombre generado, nunca el del usuario). */
export async function saveAdjuntoFile(dictamenId: number, mimeType: string, bytes: Uint8Array) {
  const extension = EXTENSION_BY_MIME[mimeType] ?? '';
  const relativePath = path.posix.join(String(dictamenId), `${randomUUID()}${extension}`);
  const full = resolveInside(relativePath);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, bytes, { flag: 'wx' });
  return relativePath;
}

export async function readAdjuntoFile(relativePath: string) {
  return readFile(resolveInside(relativePath));
}

/** Elimina el archivo; si ya no existe no es un error. */
export async function deleteAdjuntoFile(relativePath: string) {
  try {
    await unlink(resolveInside(relativePath));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
}
