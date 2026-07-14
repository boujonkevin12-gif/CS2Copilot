const FACEIT_API_KEY = process.env.FACEIT_API_KEY;
const FACEIT_BASE_URL = "https://open.faceit.com/data/v4";

export interface FaceitPlayer {
  player_id: string;
  nickname: string;
  avatar: string;
  country: string;
  steam_nickname: string;
  steam_id_64: string;
  games: {
    cs2?: {
      region: string;
      country: string;
      level: number;
      elo: number;
      skill_level_10: number;
      faceit_elo: number;
    };
  };
  friends: string[];
  new_steam_id: string;
}

export interface FaceitPlayerShort {
  player_id: string;
  nickname: string;
  avatar: string;
  country: string;
  game_id: string;
  level: number;
  elo: number;
}

export interface FaceitMatch {
  match_id: string;
  map: string;
  mode: string;
  status: string;
  round: number;
  teams: {
    [key: string]: {
      team_id: string;
      name: string;
      players: FaceitPlayerShort[];
    };
  };
  started_at: number;
  finished_at: number;
  regions: string[];
}

export interface FaceitMatchHistoryResponse {
  items: FaceitMatch[];
  start: number;
  end: number;
}

export interface FaceitMatchPlayer {
  player_id: string;
  nickname: string;
  avatar: string;
  player_stats: {
    "Match Score": string;
    "K/D Ratio": string;
    "K/D": string;
    "Kills": string;
    "Deaths": string;
    "Assists": string;
    "HS%": string;
    "Headshots": string;
    "MVPs": string;
    "Quadro Kills": string;
    "Aces": string;
    "Clutch Wins": string;
    "Total Damage": string;
    "Result": string;
    "Score": string;
    "Pistol Round Kills": string;
    "2+ Kills Round": string;
    "3+ Kills Round": string;
    "4+ Kills Round": string;
    "Ace Rounds": string;
    "TR Win": string;
    "CT Win": string;
    "Half Time Score": string;
  };
}

export interface FaceitMatchTeam {
  team_id: string;
  name: string;
  players: FaceitMatchPlayer[];
  team_stats: {
    Score: string;
    "Overtime score": string;
    "Rounds won": string;
    "Rounds lost": string;
    Result: string;
  };
}

export interface FaceitMatchStats {
  match_id: string;
  rounds: {
    round_id: string;
    map: string;
    team1: FaceitMatchTeam;
    team2: FaceitMatchTeam;
  }[];
}

export interface FaceitPlayerStats {
  player_id: string;
  lifetime: {
    Matches: string;
    "Win Rate %": string;
    "Average K/D Ratio": string;
    "Average Headshots %": string;
    "Average K/R Ratio": string;
    Kills: string;
    Deaths: string;
    Assists: string;
    Headshots: string;
    "Ace Rounds": string;
    "Penta Kills": string;
    "Quadro Kills": string;
    "Triple Kills": string;
    "Double Kills": string;
    MVPs: string;
    "Average Damage per Round": string;
    "Clutches Won": string;
    "Total Damage Dealt": string;
    "Average KAST": string;
    "Sniper Kills per Round": string;
    "In Matches Won": string;
    Rating: string;
  };
  segments: Array<{
    type: string;
    label: string;
    map_name: string;
    mode: string;
    wins: string;
    matches: string;
    "Win Rate %": string;
    "Average K/D Ratio": string;
    "Average Headshots %": string;
    "K/D Ratio": string;
    "K/R Ratio": string;
    Kills: string;
    Deaths: string;
    Assists: string;
    Headshots: string;
  }>;
}

class FaceitApiService {
  private apiKey: string;

  constructor() {
    if (!FACEIT_API_KEY) {
      throw new Error("FACEIT_API_KEY no esta configurada en las variables de entorno");
    }
    this.apiKey = FACEIT_API_KEY;
  }

  private async request<T>(path: string): Promise<T | null> {
    try {
      const res = await fetch(`${FACEIT_BASE_URL}${path}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    }
  }

  async getPlayerByNickname(nickname: string): Promise<FaceitPlayer | null> {
    return this.request<FaceitPlayer>(`/players?nickname=${encodeURIComponent(nickname)}`);
  }

  async getPlayerById(playerId: string): Promise<FaceitPlayer | null> {
    return this.request<FaceitPlayer>(`/players/${playerId}`);
  }

  async getMatchHistory(playerId: string, offset = 0, limit = 20): Promise<FaceitMatchHistoryResponse | null> {
    return this.request<FaceitMatchHistoryResponse>(
      `/players/${playerId}/history?game=cs2&offset=${offset}&limit=${limit}`
    );
  }

  async getMatchStats(matchId: string): Promise<FaceitMatchStats | null> {
    return this.request<FaceitMatchStats>(`/matches/${matchId}/stats`);
  }

  async getPlayerStats(playerId: string): Promise<FaceitPlayerStats | null> {
    return this.request<FaceitPlayerStats>(`/players/${playerId}/stats/cs2`);
  }
}

let faceitServiceInstance: FaceitApiService | null = null;

export function getFaceitService(): FaceitApiService {
  if (!faceitServiceInstance) {
    faceitServiceInstance = new FaceitApiService();
  }
  return faceitServiceInstance;
}
