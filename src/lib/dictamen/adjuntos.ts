export const ADJUNTO_MAX_BYTES = 10 * 1024 * 1024;
export const ADJUNTOS_MAX_POR_DICTAMEN = 20;

export const ADJUNTO_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;

export const ADJUNTO_ACCEPT = '.pdf,.jpg,.jpeg,.png';

export function validateAdjunto(file: { type: string; size: number }):
  | { ok: true }
  | { ok: false; error: string } {
  if (!(ADJUNTO_MIME_TYPES as readonly string[]).includes(file.type)) {
    return { ok: false, error: 'Solo se permiten archivos PDF, JPG o PNG.' };
  }
  if (file.size <= 0) {
    return { ok: false, error: 'El archivo está vacío.' };
  }
  if (file.size > ADJUNTO_MAX_BYTES) {
    return { ok: false, error: 'El archivo supera el máximo de 10 MB.' };
  }
  return { ok: true };
}

/** Nombre seguro para mostrar y para el header de descarga. */
export function sanitizeAdjuntoName(name: string) {
  const base = name.split(/[\\/]/).pop() ?? '';
  const cleaned = base.replace(/[\u0000-\u001f"]/g, '').trim().slice(0, 200);
  return cleaned || 'documento';
}

/** El MIME lo declara el cliente: se contrasta con la firma real del archivo. */
export function matchesAdjuntoSignature(bytes: Uint8Array, mimeType: string) {
  const startsWith = (sig: number[]) => sig.every((value, index) => bytes[index] === value);
  if (mimeType === 'application/pdf') return startsWith([0x25, 0x50, 0x44, 0x46]);
  if (mimeType === 'image/png') return startsWith([0x89, 0x50, 0x4e, 0x47]);
  if (mimeType === 'image/jpeg') return startsWith([0xff, 0xd8, 0xff]);
  return false;
}
