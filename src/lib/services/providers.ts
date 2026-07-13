import { FaceitData, LeetifyData, CsstatsData, HltvData, ScopeggData } from "./types";

export class FaceitService {
  readonly name = "FACEIT";
  readonly isAvailable = false;
  readonly isConnected = false;

  async getPlayerData(_steamId: string): Promise<FaceitData> {
    return {
      name: this.name,
      isAvailable: false,
      isConnected: false,
      level: null,
      elo: null,
      stats: null,
    };
  }
}

export class LeetifyService {
  readonly name = "Leetify";
  readonly isAvailable = false;
  readonly isConnected = false;

  async getPlayerData(_steamId: string): Promise<LeetifyData> {
    return {
      name: this.name,
      isAvailable: false,
      isConnected: false,
      rating: null,
      stats: null,
    };
  }
}

export class CsstatsService {
  readonly name = "CSStats";
  readonly isAvailable = false;
  readonly isConnected = false;

  async getPlayerData(_steamId: string): Promise<CsstatsData> {
    return {
      name: this.name,
      isAvailable: false,
      isConnected: false,
      stats: null,
    };
  }
}

export class HltvService {
  readonly name = "HLTV";
  readonly isAvailable = false;
  readonly isConnected = false;

  async getPlayerData(_steamId: string): Promise<HltvData> {
    return {
      name: this.name,
      isAvailable: false,
      isConnected: false,
      stats: null,
    };
  }
}

export class ScopeggService {
  readonly name = "Scope.gg";
  readonly isAvailable = false;
  readonly isConnected = false;

  async getPlayerData(_steamId: string): Promise<ScopeggData> {
    return {
      name: this.name,
      isAvailable: false,
      isConnected: false,
      stats: null,
    };
  }
}
