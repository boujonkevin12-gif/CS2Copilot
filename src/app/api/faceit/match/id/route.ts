import { NextRequest, NextResponse } from "next/server";
import { getFaceitService } from "@/lib/services/faceit.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  const { id: matchId } = await params;

  if (!matchId) {
    return NextResponse.json({ error: "Se requiere el ID de la partida" }, { status: 400 });
  }

  try {
    const faceit = getFaceitService();
    const matchStats = await faceit.getMatchStats(matchId);

    if (!matchStats) {
      return NextResponse.json({ error: "Partida no encontrada" }, { status: 404 });
    }

    const rounds = matchStats.rounds.map((round) => {
      const map = round.round_stats?.Map || "";

      const processTeam = (team: (typeof round.teams)[0]) => ({
        teamId: team.team_id,
        name: team.team_stats?.Team || "",
        score: parseInt(team.team_stats?.["Final Score"] || team.team_stats?.Score || "0", 10),
        result: team.team_stats?.["Team Win"] === "1" ? "win" : "lose",
        players: team.players.map((p) => ({
          playerId: p.player_id,
          nickname: p.nickname,
          avatar: p.avatar,
          kills: parseInt(p.player_stats?.Kills || "0", 10),
          deaths: parseInt(p.player_stats?.Deaths || "0", 10),
          assists: parseInt(p.player_stats?.Assists || "0", 10),
          kd: parseFloat(p.player_stats?.["K/D Ratio"] || p.player_stats?.["K/D"] || "0"),
          hsPercent: parseFloat(p.player_stats?.["HS%"] || "0"),
          headshots: parseInt(p.player_stats?.Headshots || "0", 10),
          mvps: parseInt(p.player_stats?.MVPs || "0", 10),
          totalDamage: parseInt(p.player_stats?.["Total Damage"] || "0", 10),
          score: parseInt(p.player_stats?.Score || "0", 10),
        })),
      });

      const team1 = round.teams[0];
      const team2 = round.teams[1];

      return {
        roundId: round.match_round || "1",
        map,
        team1: team1 ? processTeam(team1) : null,
        team2: team2 ? processTeam(team2) : null,
      };
    });

    return NextResponse.json({
      matchId: matchStats.match_id,
      rounds,
    });
  } catch {
    return NextResponse.json({ error: "Error al obtener estadisticas de la partida" }, { status: 500 });
  }
}
