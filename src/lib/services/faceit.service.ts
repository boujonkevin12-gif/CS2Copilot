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

export interface FaceitMatchTeamPlayer {
  player_id: string;
  nickname: string;
  avatar: string;
  skill_level: number;
  game_player_id: string;
  game_player_name: string;
  faceit_url: string;
}

export interface FaceitMatchTeam {
  team_id: string;
  nickname: string;
  avatar: string;
  type: string;
  players: FaceitMatchTeamPlayer[];
}

export interface FaceitMatch {
  match_id: string;
  game_id: string;
  game_mode: string;
  status: string;
  region: string;
  max_players: number;
  teams_size: number;
  started_at: number;
  finished_at: number;
  results?: {
    winner: string;
    score: {
      faction1: number;
      faction2: number;
    };
  };
  teams: {
    [key: string]: FaceitMatchTeam;
  };
}

export interface FaceitMatchHistoryResponse {
  items: FaceitMatch[];
  start: number;
  end: number;
  total?: number;
}

export interface FaceitMatchPlayer {
  player_id: string;
  nickname: string;
  avatar: string;
  player_stats: {
    [key: string]: string;
  };
}

export interface FaceitMatchTeamInStats {
  team_id: string;
  premade: boolean;
  team_stats: {
    [key: string]: string;
  };
  players: FaceitMatchPlayer[];
}

export interface FaceitMatchStats {
  match_id: string;
  rounds: {
    best_of?: string;
    competition_id?: string;
    game_id?: string;
    game_mode?: string;
    match_id?: string;
    match_round?: string;
    played?: string;
    round_stats: {
      Map?: string;
      Rounds?: string;
      Winner?: string;
      Score?: string;
      Region?: string;
      [key: string]: string | undefined;
    };
    teams: FaceitMatchTeamInStats[];
  }[];
}

export interface FaceitPlayerStats {
  player_id: string;
  lifetime: {
    [key: string]: string | string[] | number;
  };
  segments: Array<{
    type: string;
    label: string;
    map_name: string;
    mode: string;
    wins: string;
    matches: string;
    [key: string]: string;
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

  async getPlayerBySteamId(steamId64: string): Promise<FaceitPlayer | null> {
    return this.request<FaceitPlayer>(
      `/players?game=cs2&game_player_id=${encodeURIComponent(steamId64)}`
    );
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
