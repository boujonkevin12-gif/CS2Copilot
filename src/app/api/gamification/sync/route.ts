import { NextRequest, NextResponse } from "next/server";
import { logAction, syncProfileStats } from "@/lib/services/gamification.service";
import { getSteamId } from "@/lib/auth-helpers";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Acciones permitidas en el log de actividad. Cualquier otra se ignora:
 * antes cualquier cliente podía escribir acciones arbitrarias en la DB.
 */
const ALLOWED_ACTIONS = new Set([
  "demo_analyzed",
  "ai_consult",
  "daily_login",
  "level_up",
  "challenge_joined",
  "challenge_won",
  "tournament_joined",
  "shop_purchase",
  "chest_opened",
  "mission_completed",
]);

/** Mismo shape que acepta syncProfileStats (evita enviar campos arbitrarios). */
type ProfileStats = Parameters<typeof syncProfileStats>[1];

/** Límites por campo numérico para evitar valores absurdos. */
const NUMERIC_LIMITS: Record<string, { min: number; max: number }> = {
  wins: { min: 0, max: 1_000_000 },
  kills: { min: 0, max: 10_000_000 },
  headshots: { min: 0, max: 10_000_000 },
  mvps: { min: 0, max: 1_000_000 },
  hours: { min: 0, max: 1_000_000 },
  kd: { min: 0, max: 100 },
  hsPct: { min: 0, max: 100 },
  elo: { min: 0, max: 100_000 },
  faceitLevel: { min: 0, max: 10 },
  premier: { min: 0, max: 50_000 },
  clutches: { min: 0, max: 1_000_000 },
  aces: { min: 0, max: 1_000_000 },
  awpKills: { min: 0, max: 10_000_000 },
  faceitMatches: { min: 0, max: 1_000_000 },
  faceitWins: { min: 0, max: 1_000_000 },
};

function sanitizeStats(raw: unknown): ProfileStats | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const out: Record<string, unknown> = {};
  const src = raw as Record<string, unknown>;

  for (const [key, limit] of Object.entries(NUMERIC_LIMITS)) {
    const v = src[key];
    if (v === undefined) continue;
    if (typeof v !== "number" || !Number.isFinite(v)) continue;
    out[key] = Math.min(limit.max, Math.max(limit.min, Math.trunc(v)));
  }

  if (Array.isArray(src.maps)) {
    out.maps = src.maps
      .filter((m): m is string => typeof m === "string")
      .slice(0, 30);
  }

  return Object.keys(out).length > 0 ? (out as ProfileStats) : null;
}

export async function POST(request: NextRequest) {
  const steamId = getSteamId(request);
  if (!steamId) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // Límite por usuario + por IP para frenar spam de XP/log.
  const ip = getClientIp(request);
  if (!rateLimit(`gamification/sync:${steamId}`, 30, 60_000) || !rateLimit(`gamification/sync:ip:${ip}`, 60, 60_000)) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { action, value, stats } = body;

  if (action !== undefined) {
    if (typeof action !== "string" || !ALLOWED_ACTIONS.has(action)) {
      // Acción desconocida: se ignora en lugar de rechazar todo (compatibilidad).
      console.warn(`[gamification/sync] Acción no permitida ignorada: ${String(action).slice(0, 50)}`);
    } else {
      const safeValue =
        typeof value === "number" && Number.isFinite(value)
          ? Math.min(100, Math.max(1, Math.trunc(value)))
          : 1;
      await logAction(steamId, action, safeValue);
    }
  }

  let newAchievements: string[] = [];
  const safeStats = sanitizeStats(stats);
  if (safeStats) {
    newAchievements = await syncProfileStats(steamId, safeStats);
  }

  return NextResponse.json({ success: true, newAchievements });
}
