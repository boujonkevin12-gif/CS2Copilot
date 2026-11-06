/**
 * Validación de URLs de Vercel Blob para las rutas de demo.
 *
 * Protege contra SSRF: la única fuente permitida es el dominio de Vercel Blob
 * (nunca IPs, hosts internos ni dominios arbitrarios), y el pathname debe
 * pertenecer al namespace `demos/` — preferentemente al del usuario en sesión.
 */

const LEGACY_PREFIX = "/demos/";

export interface BlobUrlCheck {
  ok: boolean;
  reason?: string;
}

/**
 * Valida que `rawUrl` sea una URL blob pública de Vercel y que su pathname
 * esté dentro del namespace de demos, respetando la propiedad por usuario.
 *
 * - `expectedSteamId`: si se pasa, un pathname con segmento SteamID distinto
 *   se rechaza (propietario distinto).
 * - Los pathnames legados (`demos/archivo.dem`, sin segmento de usuario)
 *   se aceptan para no romper demos subidas antes del namespace por usuario.
 */
export function validateBlobUrl(rawUrl: unknown, expectedSteamId?: string): BlobUrlCheck {
  if (typeof rawUrl !== "string" || rawUrl.length === 0 || rawUrl.length > 2048) {
    return { ok: false, reason: "URL inválida" };
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { ok: false, reason: "URL no válida" };
  }

  if (url.protocol !== "https:") {
    return { ok: false, reason: "Solo se permiten URLs https" };
  }

  // Allowlist estricta de dominio: nada de IPs, localhost o dominios internos.
  // Formatos válidos de Vercel Blob:
  //   <storeId>.public.blob.vercel-storage.com
  //   <storeId>.blob.vercel-storage.com
  const host = url.hostname.toLowerCase();
  const hostPattern = /^[a-z0-9-]+(?:\.public)?\.blob\.vercel-storage\.com$/;
  if (!hostPattern.test(host)) {
    return { ok: false, reason: "Dominio de blob no permitido" };
  }

  const pathname = url.pathname;
  if (!pathname.startsWith(LEGACY_PREFIX)) {
    return { ok: false, reason: "La demo no está en el namespace permitido" };
  }

  // Propiedad: si el primer segmento después de "demos/" es un SteamID64,
  // debe coincidir con el usuario en sesión.
  const rest = pathname.slice(LEGACY_PREFIX.length);
  const firstSegment = rest.split("/")[0];
  if (/^\d{17}$/.test(firstSegment) && expectedSteamId && firstSegment !== expectedSteamId) {
    return { ok: false, reason: "La demo pertenece a otro usuario" };
  }

  return { ok: true };
}
