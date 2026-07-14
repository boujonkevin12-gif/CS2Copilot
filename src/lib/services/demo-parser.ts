export interface ParsedDemo {
  map: string;
  serverName: string;
  duration: number;
  rounds: ParsedRound[];
  playerStats: ParsedPlayerStats;
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
}

function emptyStats(): ParsedPlayerStats {
  return {
    name: "", steamId: "", kills: 0, deaths: 0, assists: 0,
    headshotKills: 0, totalDamage: 0, weaponKills: {},
    clutchWins: {}, aceRounds: [], firstDeathRounds: [],
    kd: 0, hsPercent: 0, adr: 0,
  };
}

export async function parseDemoFile(buffer: Buffer): Promise<ParsedDemo | null> {
  try {
    const demofile = await import("demofile");
    const DemoFileClass = demofile.DemoFile;

    return new Promise((resolve) => {
      const demo = new DemoFileClass();
      const timeout = setTimeout(() => {
        resolve({
          map: "unknown", serverName: "desconocido", duration: 0, rounds: [],
          playerStats: emptyStats(),
          error: "Timeout: la demo tardo demasiado. Asegurate de que sea un archivo .dem valido.",
        });
        demo.cancel();
      }, 15000);

      demo.on("start", () => {
        clearTimeout(timeout);
        const map = demo.header.mapName || "unknown";
        const serverName = demo.header.serverName || "desconocido";
        resolve({
          map, serverName, duration: 0, rounds: [],
          playerStats: emptyStats(),
          error: "Demo detectada correctamente, pero el parseo detallado de CS2 aun no esta soportado. La libreria actual solo soporta CS:GO.",
        });
      });

      demo.on("error", () => {
        clearTimeout(timeout);
        resolve({
          map: "unknown", serverName: "desconocido", duration: 0, rounds: [],
          playerStats: emptyStats(),
          error: "No se pudo leer la demo. Verifica que el archivo no este corrupto y que sea de CS2.",
        });
      });

      try {
        demo.parse(buffer);
      } catch {
        clearTimeout(timeout);
        resolve({
          map: "unknown", serverName: "desconocido", duration: 0, rounds: [],
          playerStats: emptyStats(),
          error: "Error al procesar el archivo. El formato de la demo no es compatible con la libreria actual.",
        });
      }
    });
  } catch (err) {
    return {
      map: "unknown", serverName: "desconocido", duration: 0, rounds: [],
      playerStats: emptyStats(),
      error: `No se pudo cargar el parser: ${err instanceof Error ? err.message : "error desconocido"}.`,
    };
  }
}
