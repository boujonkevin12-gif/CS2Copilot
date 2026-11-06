import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import type { NextRequest, NextResponse } from "next/server";

/**
 * Sistema de sesiones firmadas criptográficamente.
 *
 * Decisión de arquitectura (FASE 1):
 * - Token estado-less: HMAC-SHA256 sobre un payload comprimido, guardado en la
 *   misma cookie `cs2pilot_user`. No se agregó una tabla de sesiones porque el
 *   proyecto no tiene store de sesiones y esto funciona en serverless (Vercel)
 *   sin migración de base de datos.
 * - Trade-off documentado: sin store server-side no hay revocación antes del
 *   vencimiento. El logout limpia la cookie del cliente y el token vence a los
 *   30 días. Si en el futuro se necesita revocación inmediata, agregar una
 *   columna de versión de sesión en `player_profile`.
 * - El payload va comprimido (deflate) + base64url para mantener el token
 *   mucho más chico que el JSON crudo (límite de ~4KB por cookie en navegadores).
 * - `SESSION_SECRET` es obligatorio en producción (fail closed). En desarrollo
 *   se genera un secreto temporal por proceso si no está definido.
 */

export const SESSION_COOKIE = "cs2pilot_user";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 días
const MAX_TOKEN_CHARS = 4000;
const TOKEN_VERSION = "v1";

export interface SessionProfile {
  steamId: string;
  [key: string]: unknown;
}

const STEAMID64_REGEX = /^\d{17}$/;

export function isValidSteamId(value: unknown): value is string {
  return typeof value === "string" && STEAMID64_REGEX.test(value);
}

let devSecretWarningShown = false;

function getSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  if (secret) {
    if (process.env.NODE_ENV === "production" && secret.length < 32) {
      console.error("[session] SESSION_SECRET debe tener al menos 32 caracteres en producción.");
      return null;
    }
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    // Fail closed: sin secreto no se crean ni se verifican sesiones.
    console.error(
      "[session] SESSION_SECRET no está configurado. Las sesiones están deshabilitadas. " +
        "Agregá la variable SESSION_SECRET en Vercel Dashboard > Settings > Environment Variables."
    );
    return null;
  }

  // Desarrollo: secreto temporal por proceso (se conserva entre hot-reloads
  // via globalThis). Las sesiones se invalidan al reiniciar el dev server.
  const g = globalThis as typeof globalThis & { __cs2pilot_dev_session_secret?: string };
  if (!g.__cs2pilot_dev_session_secret) {
    g.__cs2pilot_dev_session_secret = randomBytes(32).toString("hex");
    if (!devSecretWarningShown) {
      devSecretWarningShown = true;
      console.warn(
        "[session] SESSION_SECRET no está definido usando secreto temporal de desarrollo. " +
          "Definilo en .env.local para que las sesiones sobrevivan reinicios."
      );
    }
  }
  return g.__cs2pilot_dev_session_secret;
}

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

/**
 * Crea un token firmado a partir del perfil. Devuelve null si no hay secreto
 * (producción sin SESSION_SECRET) o si el token supera el límite de cookie.
 */
export function createSessionToken(profile: SessionProfile): string | null {
  const secret = getSecret();
  if (!secret) return null;
  if (!isValidSteamId(profile.steamId)) return null;

  const payload: Record<string, unknown> = {
    ...profile,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  let data: string;
  try {
    data = deflateRawSync(Buffer.from(JSON.stringify(payload), "utf8")).toString("base64url");
  } catch {
    return null;
  }

  const body = `${TOKEN_VERSION}.${data}`;
  const token = `${body}.${sign(body, secret)}`;

  if (token.length > MAX_TOKEN_CHARS) {
    console.error(`[session] Token de sesión demasiado grande (${token.length} chars).`);
    return null;
  }
  return token;
}

/**
 * Verifica firma, integridad, expiración y SteamID del token.
 * Devuelve el perfil (sin `exp`) o null si es inválido.
 */
export function verifySessionToken(token: string | undefined | null): SessionProfile | null {
  if (!token) return null;
  const secret = getSecret();
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [version, data, signature] = parts;
  if (version !== TOKEN_VERSION || !data || !signature) return null;

  const expected = sign(`${version}.${data}`, secret);
  const a = Buffer.from(signature, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const json = inflateRawSync(Buffer.from(data, "base64url")).toString("utf8");
    const payload = JSON.parse(json) as Record<string, unknown>;
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // expirado
    }
    if (!isValidSteamId(payload.steamId)) return null;
    delete payload.exp;
    return payload as SessionProfile;
  } catch {
    return null;
  }
}

/** Lee y verifica la sesión de la request. Única fuente de identidad. */
export function getSession(request: NextRequest): SessionProfile | null {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

function cookieOptions(request: NextRequest, maxAge: number) {
  const isSecure = process.env.NODE_ENV === "production" || request.url.startsWith("https://");
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}

/**
 * Escribe la cookie de sesión firmada. Devuelve false si no se pudo crear el
 * token (producción sin SESSION_SECRET o perfil inválido).
 */
export function setSessionCookie(
  response: NextResponse,
  profile: SessionProfile,
  request: NextRequest
): boolean {
  const token = createSessionToken(profile);
  if (!token) return false;
  response.cookies.set(SESSION_COOKIE, token, cookieOptions(request, SESSION_TTL_SECONDS));
  return true;
}

/** Elimina la cookie de sesión (logout). */
export function clearSessionCookie(response: NextResponse, request: NextRequest): void {
  response.cookies.set(SESSION_COOKIE, "", cookieOptions(request, 0));
}
