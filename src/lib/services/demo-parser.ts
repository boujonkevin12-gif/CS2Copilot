import { Readable } from "stream";

export interface TeamInfo {
  teamNumber: number;
  teamName: string;
  score: number;
  players: ParsedPlayerStats[];
}

export interface ParsedDemo {
  map: string;
  serverName: string;
  duration: number;
  rounds: ParsedRound[];
  playerStats: ParsedPlayerStats;
  allPlayers?: ParsedPlayerStats[];
  teams?: TeamInfo[];
  error?: string;
}

export interface ParsedRound {
  roundNum: number;
  winner: string;
  length: number;
}

export interface ParsedPlayerStats {
  name: string;
  steamId: string;
  kills: number;
  deaths: number;
  assists: number;
  headshotKills: number;
  totalDamage: number;
  weaponKills: Record<string, number>;
  clutchWins: Record<string, number>;
  aceRounds: number[];
  firstDeathRounds: number[];
  kd: number;
  hsPercent: number;
  adr: number;
  mvps: number;
  score: number;
  utilityDamage: number;
  enemiesFlashed: number;
  enemy3Ks: number;
  enemy4Ks: number;
  enemy5Ks: number;
}

function emptyStats(): ParsedPlayerStats {
  return {
    name: "", steamId: "", kills: 0, deaths: 0, assists: 0,
    headshotKills: 0, totalDamage: 0, weaponKills: {},
    clutchWins: {}, aceRounds: [], firstDeathRounds: [],
    kd: 0, hsPercent: 0, adr: 0,
    mvps: 0, score: 0, utilityDamage: 0, enemiesFlashed: 0,
    enemy3Ks: 0, enemy4Ks: 0, enemy5Ks: 0,
  };
}

export async function parseDemoFile(buffer: Buffer): Promise<ParsedDemo | null> {
  try {
    const cs2parser = await import("cs2parser");
    const DemoReader = cs2parser.DemoReader;
    const EntityMode = cs2parser.EntityMode;

    const parser = new DemoReader();
    let roundCount = 0;
    const weaponKillsMap: Record<string, Record<string, number>> = {};

    parser.gameEvents.on("round_end", () => {
      roundCount++;
    });

    parser.gameEvents.on("player_death", (event: any) => {
      try {
        const attacker = event.attackerPlayer;
        const weapon = String(event.weapon || "");
        if (attacker && attacker.steamId) {
          const sid = attacker.steamId;
          if (!weaponKillsMap[sid]) weaponKillsMap[sid] = {};
          weaponKillsMap[sid][weapon] = (weaponKillsMap[sid][weapon] || 0) + 1;
        }
      } catch {
        // ignore individual event errors
      }
    });

    const bufferStream = Readable.from(buffer);

    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        try { parser.cancel(); } catch { /* ignore */ }
        resolve();
      }, 25000);

      parser.on("end", () => {
        clearTimeout(timeout);
        resolve();
      });

      parser.on("error", (err: unknown) => {
        clearTimeout(timeout);
        console.error("[DemoParser] Parser error event:", err);
        resolve();
      });

      parser.parseDemo(bufferStream, { entities: EntityMode.ALL }).catch((err: unknown) => {
        clearTimeout(timeout);
        console.error("[DemoParser] parseDemo rejected:", err);
        resolve();
      });
    });

    const mapName = parser.header?.map_name || "unknown";
    const serverName = parser.header?.server_name || "desconocido";

    const allPlayers: ParsedPlayerStats[] = [];
    let firstPlayer: ParsedPlayerStats | null = null;

    const teams: TeamInfo[] = [];
    for (const team of parser.teams) {
      if (!team || team.teamNumber < 2) continue;
      const teamPlayers: ParsedPlayerStats[] = [];
      const teamPlayersMap = new Map<string, ParsedPlayerStats>();
      for (const member of team.members) {
        if (!member || !member.steamId || member.steamId === "0") continue;
        const stats: ParsedPlayerStats = {
          name: member.name,
          steamId: member.steamId,
          kills: member.kills,
          deaths: member.deaths,
          assists: member.assists,
          headshotKills: member.headshotKills,
          totalDamage: member.damage,
          weaponKills: weaponKillsMap[member.steamId] || {},
          clutchWins: {},
          aceRounds: [],
          firstDeathRounds: [],
          kd: member.deaths > 0 ? Math.round((member.kills / member.deaths) * 100) / 100 : member.kills,
          hsPercent: member.kills > 0 ? Math.round((member.headshotKills / member.kills) * 1000) / 10 : 0,
          adr: Math.max(roundCount, 1) > 0 ? Math.round((member.damage / Math.max(roundCount, 1)) * 10) / 10 : 0,
          mvps: member.mvps,
          score: member.score,
          utilityDamage: member.utilityDamage,
          enemiesFlashed: member.enemiesFlashed,
          enemy3Ks: member.enemy3Ks,
          enemy4Ks: member.enemy4Ks,
          enemy5Ks: member.enemy5Ks,
        };
        teamPlayers.push(stats);
        teamPlayersMap.set(member.steamId, stats);
      }
      if (teamPlayers.length > 0) {
        teams.push({
          teamNumber: team.teamNumber,
          teamName: team.teamName || (team.teamNumber === 2 ? "Terroristas" : "Contra-Terroristas"),
          score: team.score,
          players: teamPlayers,
        });
      }
    }

    for (const player of parser.playerControllers) {
      if (!player || !player.name || player.steamId === "0") continue;

      const totalRounds = Math.max(roundCount, 1);
      const kills = player.kills;
      const deaths = player.deaths;
      const hsKills = player.headshotKills;
      const totalDmg = player.damage;
      const kd = deaths > 0 ? Math.round((kills / deaths) * 100) / 100 : kills;
      const hsPercent = kills > 0 ? Math.round((hsKills / kills) * 1000) / 10 : 0;
      const adr = totalRounds > 0 ? Math.round((totalDmg / totalRounds) * 10) / 10 : 0;

      const stats: ParsedPlayerStats = {
        name: player.name,
        steamId: player.steamId,
        kills,
        deaths,
        assists: player.assists,
        headshotKills: hsKills,
        totalDamage: totalDmg,
        weaponKills: weaponKillsMap[player.steamId] || {},
        clutchWins: {},
        aceRounds: [],
        firstDeathRounds: [],
        kd,
        hsPercent,
        adr,
        mvps: player.mvps,
        score: player.score,
        utilityDamage: player.utilityDamage,
        enemiesFlashed: player.enemiesFlashed,
        enemy3Ks: player.enemy3Ks,
        enemy4Ks: player.enemy4Ks,
        enemy5Ks: player.enemy5Ks,
      };

      allPlayers.push(stats);

      if (!firstPlayer || kills > firstPlayer.kills) {
        firstPlayer = stats;
      }
    }

    if (!firstPlayer && allPlayers.length > 0) {
      firstPlayer = allPlayers[0];
    }

    if (!firstPlayer && allPlayers.length === 0) {
      return {
        map: mapName,
        serverName,
        duration: 0,
        rounds: [],
        playerStats: emptyStats(),
        error: "No se encontraron jugadores en la demo. Asegurate de que la partida haya comenzado.",
      };
    }

    return {
      map: mapName,
      serverName,
      duration: parser.currentTime || 0,
      rounds: Array.from({ length: roundCount }, (_, i) => ({
        roundNum: i + 1,
        winner: "",
        length: 0,
      })),
      playerStats: firstPlayer!,
      allPlayers,
      teams,
    };
  } catch (err) {
    console.error("[DemoParser] Fatal error:", err);
    return {
      map: "unknown",
      serverName: "desconocido",
      duration: 0,
      rounds: [],
      playerStats: emptyStats(),
      error: `Error al parsear la demo: ${err instanceof Error ? err.message : "error desconocido"}. La demo debe ser de CS2.`,
    };
  }
}
