import { NextRequest, NextResponse } from "next/server";
import { analyzePlayer } from "@/lib/services/ai-engine";
import { getFaceitService } from "@/lib/services/faceit.service";

export async function POST(request: NextRequest) {
  let body: { demoData?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const cookie = request.cookies.get("cs2pilot_user");
  if (!cookie) {
    return NextResponse.json({ error: "No hay sesion activa" }, { status: 401 });
  }

  let userData: Record<string, unknown>;
  try {
    userData = JSON.parse(cookie.value);
  } catch {
    return NextResponse.json({ error: "Sesion invalida" }, { status: 401 });
  }

  let lifetimeStats = null;

  const faceitPlayerId = userData.faceitPlayerId as string | undefined;
  if (faceitPlayerId) {
    try {
      const faceit = getFaceitService();
      const stats = await faceit.getPlayerStats(faceitPlayerId);
      if (stats?.lifetime) {
        lifetimeStats = {
          matches: String(stats.lifetime.Matches || "0"),
          winRate: String(stats.lifetime["Win Rate %"] || "0"),
          kd: String(stats.lifetime["Average K/D Ratio"] || "0"),
          hsPercent: String(stats.lifetime["Average Headshots %"] || "0"),
          adr: String(stats.lifetime["ADR"] || "0"),
          kast: "0",
          clutches: String((Number(stats.lifetime["Total 1v1 Wins"]) || 0) + (Number(stats.lifetime["Total 1v2 Wins"]) || 0)),
          rating: "0",
          kills: String(stats.lifetime["Total Kills with extended stats"] || "0"),
          deaths: "0",
          assists: "0",
        };
      }
    } catch {
      // FACEIT stats unavailable
    }
  }

  const demoData = body.demoData as { playerStats?: { kd?: number; hsPercent?: number; adr?: number; kills?: number; deaths?: number } } | undefined;
  let matchStats = undefined;

  if (demoData?.playerStats) {
    matchStats = [{
      kd: demoData.playerStats.kd || 0,
      hsPercent: demoData.playerStats.hsPercent || 0,
      kills: demoData.playerStats.kills || 0,
      deaths: demoData.playerStats.deaths || 0,
      result: "unknown",
      map: "unknown",
    }];
  }

  const analysis = analyzePlayer(lifetimeStats, matchStats);

  return NextResponse.json({
    hasFaceitData: !!lifetimeStats,
    faceitNickname: userData.faceitNickname || null,
    analysis,
  });
}
