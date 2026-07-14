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
      const map = round.map;

      const processTeam = (team: typeof round.team1) => ({
        teamId: team.team_id,
        name: team.name,
        score: parseInt(team.team_stats.Score || "0", 10),
        roundsWon: parseInt(team.team_stats["Rounds won"] || "0", 10),
        roundsLost: parseInt(team.team_stats["Rounds lost"] || "0", 10),
        result: team.team_stats.Result,
        players: team.players.map((p) => ({
          playerId: p.player_id,
          nickname: p.nickname,
          avatar: p.avatar,
          kills: parseInt(p.player_stats.Kills || "0", 10),
          deaths: parseInt(p.player_stats.Deaths || "0", 10),
          assists: parseInt(p.player_stats.Assists || "0", 10),
          kd: parseFloat(p.player_stats["K/D Ratio"] || "0"),
          hsPercent: parseFloat(p.player_stats["HS%"] || "0"),
          headshots: parseInt(p.player_stats.Headshots || "0", 10),
          mvps: parseInt(p.player_stats.MVPs || "0", 10),
          quadroKills: parseInt(p.player_stats["Quadro Kills"] || "0", 10),
          aces: parseInt(p.player_stats.Aces || "0", 10),
          clutchWins: parseInt(p.player_stats["Clutch Wins"] || "0", 10),
          totalDamage: parseInt(p.player_stats["Total Damage"] || "0", 10),
          score: parseInt(p.player_stats.Score || "0", 10),
          result: p.player_stats.Result,
        })),
      });

      return {
        roundId: round.round_id,
        map,
        team1: processTeam(round.team1),
        team2: processTeam(round.team2),
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
