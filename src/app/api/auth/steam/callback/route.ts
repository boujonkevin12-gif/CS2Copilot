import { NextRequest, NextResponse } from "next/server";
import { getSteamService } from "@/lib/services";
import { getFaceitService } from "@/lib/services/faceit.service";
import { getOrCreateProfile, syncSteamData, logLogin } from "@/lib/services/gamification.service";
import { setSessionCookie, isValidSteamId, SessionProfile } from "@/lib/session";

const STEAM_OPENID_URL = "https://steamcommunity.com/openid/login";
const STEAM_OPENID_OP_ENDPOINT = "https://steamcommunity.com/openid/login";
const STEAMID64_REGEX = /^7656119\d{10}$/;

/**
 * Extrae el SteamID64 de un claimed_id de Steam OpenID.
 * Formado esperado: https://steamcommunity.com/openid/id/7656119XXXXXXXXXX
 */
function extractSteamId(claimedId: string): string | null {
  const match = claimedId?.match(/^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/);
  if (!match) return null;
  // SteamID64 individual siempre arranca con 7656119
  return STEAMID64_REGEX.test(match[1]) ? match[1] : null;
}

/**
 * Valida la respuesta OpenID contra Steam (check_authentication) y los
 * campos obligatorios de la respuesta.
 *
 * PROBLEMA CORREGIDO (seguridad): el callback anterior confiaba ciegamente en
 * los query params `openid.mode` / `openid.claimed_id` que llegan por GET, sin
 * verificarlos con Steam. Como esos params los arma el navegador del usuario
 * (o cualquiera), un atacante podía pegarle directamente al callback con el
 * SteamID de la víctima y quedar logueado como cualquier usuario.
 *
 * La spec de OpenID 2.0 exige devolverle a Steam los mismos parámetros con
 * `openid.mode=check_authentication`; Steam responde `is_valid: true` solo si
 * la firma es auténtica. Eso es lo que hace esta función.
 *
 * Además se valida:
 * - `openid.op_endpoint`: que la respuesta venga de Steam (provider).
 * - `openid.return_to`: que apunte a este mismo callback (evita replay desde
 *   otro contexto).
 * - `openid.response_nonce`: que la respuesta no sea un replay viejo.
 */
async function verifyOpenIdResponse(
  searchParams: URLSearchParams,
  request: NextRequest
): Promise<boolean> {
  const mode = searchParams.get("openid.mode");
  if (mode !== "id_res") return false;

  // Provider: la respuesta debe venir declaradamente de Steam.
  const opEndpoint = searchParams.get("openid.op_endpoint");
  if (opEndpoint !== STEAM_OPENID_OP_ENDPOINT) return false;

  // URL de retorno: debe ser exactamente este callback.
  const returnTo = searchParams.get("openid.return_to");
  if (!returnTo) return false;
  try {
    const expected = new URL("/api/auth/steam/callback", request.url);
    const received = new URL(returnTo);
    if (received.origin !== expected.origin || received.pathname !== expected.pathname) {
      console.warn("[SteamCallback] return_to mismatch:", returnTo);
      return false;
    }
  } catch {
    return false;
  }

  // Nonce: rechazar respuestas con marca de tiempo vieja (replay).
  const nonce = searchParams.get("openid.response_nonce");
  if (!nonce) return false;
  const nonceTs = Date.parse(nonce.slice(0, 19)); // "YYYY-MM-DDTHH:MM:SS"
  if (Number.isNaN(nonceTs)) return false;
  const MAX_NONCE_AGE_MS = 10 * 60 * 1000; // 10 minutos
  if (Math.abs(Date.now() - nonceTs) > MAX_NONCE_AGE_MS) {
    console.warn("[SteamCallback] OpenID nonce fuera de ventana de validez");
    return false;
  }

  // Verificación de firma con Steam (obligatoria).
  const verifyParams = new URLSearchParams();
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith("openid.")) {
      verifyParams.set(key, value);
    }
  }
  verifyParams.set("openid.mode", "check_authentication");

  try {
    const res = await fetch(STEAM_OPENID_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verifyParams.toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return false;
    const text = await res.text();
    return /is_valid\s*:\s*true/.test(text);
  } catch (err) {
    console.error("[SteamCallback] OpenID verification request failed:", err);
    return false;
  }
}

function buildFallbackProfile(steamId: string): SessionProfile {
  return {
    steamId,
    name: "Jugador",
    avatar: null,
    avatarMedium: null,
    avatarSmall: null,
    profileUrl: `https://steamcommunity.com/profiles/${steamId}`,
    country: null,
    visibility: 0,
    lastLogoff: 0,
    createdAt: 0,
    steamLevel: 0,
    steamXp: 0,
    steamXpNeeded: 0,
    bans: {
      communityBanned: false,
      vacBanned: false,
      numberOfVACBans: 0,
      numberOfGameBans: 0,
      daysSinceLastBan: 0,
    },
    cs2: null,
    totalGames: 0,
  };
}

/** Auto-vincula FACEIT si existe una cuenta ligada al SteamID. */
async function attachFaceit(profile: SessionProfile, steamId: string): Promise<void> {
  try {
    const faceit = getFaceitService();
    const faceitPlayer = await faceit.getPlayerBySteamId(steamId);
    if (faceitPlayer) {
      profile.faceitPlayerId = faceitPlayer.player_id;
      profile.faceitNickname = faceitPlayer.nickname;
      profile.faceitLevel = faceitPlayer.games?.cs2?.skill_level ?? null;
      profile.faceitElo = faceitPlayer.games?.cs2?.faceit_elo ?? null;
      profile.faceitLinkedAt = new Date().toISOString();
    }
  } catch {
    // FACEIT lookup failed — login continues without FACEIT
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const claimedId = searchParams.get("openid.claimed_id");
  const mode = searchParams.get("openid.mode");

  if (mode !== "id_res" || !claimedId) {
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }

  // 1) Verificar autenticidad de la respuesta OpenID con Steam.
  const isValid = await verifyOpenIdResponse(searchParams, request);
  if (!isValid) {
    console.warn("[SteamCallback] OpenID verification failed - rejecting login attempt");
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }

  // 2) Extraer y validar el SteamID del claimed_id ya verificado.
  const steamId = extractSteamId(claimedId);
  if (!steamId || !isValidSteamId(steamId)) {
    return NextResponse.redirect(new URL("/login?error=invalid_steam_id", request.url));
  }

  try {
    const steamService = getSteamService();
    const fullProfile = await steamService.getFullProfile(steamId);

    const minimalProfile: SessionProfile = {
      steamId: fullProfile.steamId,
      name: fullProfile.name,
      avatar: fullProfile.avatar,
      avatarMedium: fullProfile.avatarMedium,
      avatarSmall: fullProfile.avatarSmall,
      profileUrl: fullProfile.profileUrl,
      country: fullProfile.country,
      visibility: fullProfile.visibility,
      lastLogoff: fullProfile.lastLogoff,
      createdAt: fullProfile.createdAt,
      steamLevel: fullProfile.steamLevel,
      steamXp: fullProfile.steamXp,
      steamXpNeeded: fullProfile.steamXpNeeded,
      bans: fullProfile.bans,
      cs2: fullProfile.cs2,
      totalGames: fullProfile.totalGames,
    };

    // Auto-link FACEIT if a player is found by Steam ID
    await attachFaceit(minimalProfile, steamId);

    // Sync Steam data to DB for rankings
    try {
      await getOrCreateProfile(steamId);
      await syncSteamData(steamId, {
        name: fullProfile.name,
        avatar: fullProfile.avatar || undefined,
        profileUrl: fullProfile.profileUrl || undefined,
        country: fullProfile.country || undefined,
        steamLevel: fullProfile.steamLevel || 0,
        cs2Hours: fullProfile.cs2?.hoursPlayed ? Math.round(fullProfile.cs2.hoursPlayed) : 0,
      });
      await logLogin(steamId);
    } catch (e) {
      console.error("[SteamCallback] DB sync failed:", e);
    }

    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    if (!setSessionCookie(response, minimalProfile, request)) {
      console.error("[SteamCallback] No se pudo firmar la sesión (¿SESSION_SECRET ausente?)");
      return NextResponse.redirect(new URL("/login?error=session_config", request.url));
    }
    return response;
  } catch (err) {
    console.error("[SteamCallback] getFullProfile failed:", err);

    // Fallback: save minimal profile with just the steamId so login still works
    const fallbackProfile = buildFallbackProfile(steamId);
    await attachFaceit(fallbackProfile, steamId);

    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    if (!setSessionCookie(response, fallbackProfile, request)) {
      return NextResponse.redirect(new URL("/login?error=session_config", request.url));
    }
    return response;
  }
}
