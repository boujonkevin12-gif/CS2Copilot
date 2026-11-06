import { NextRequest } from "next/server";
import { getSession, SessionProfile } from "@/lib/session";

/**
 * Devuelve el SteamID de la sesión firmada de la request, o null.
 * Rechaza cookies sin firma o manipuladas (antes se hacía JSON.parse ciego).
 */
export function getSteamId(request: NextRequest): string | null {
  return getSession(request)?.steamId ?? null;
}

/** Devuelve el perfil completo de la sesión verificada, o null. */
export function getSessionProfile(request: NextRequest): SessionProfile | null {
  return getSession(request);
}
