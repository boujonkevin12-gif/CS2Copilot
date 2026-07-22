import { NextRequest, NextResponse } from "next/server";
import { getFaceitService } from "@/lib/services/faceit.service";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function buildSystemPrompt(
  playerName: string,
  lifetimeStats: Record<string, unknown> | null,
  recentMatches: Array<{
    map_id?: string;
    results?: { winner?: string; score?: { faction1: number; faction2: number } };
    started_at?: number;
    match_id?: string;
  }> | null
): string {
  let context = `Eres CS2Pilot Coach, un entrenador profesional de CS2 con expertise en:
- Aim training y crosshair placement
- Posicionamiento y movement
- Utility usage (smokes, flashes, molotovs)
- Game sense y lectura del juego
- Economy management
- Team play y comunicacion
- Mentalidad y anti-tilt

Responde SIEMPRE en español. Sé directo, practico y accionable.
Usa formato markdown con **negrita** para títulos, listas con guiones, y secciones claras.
Máximo 300 palabras por respuesta para ser conciso y útil.
Si no tienes datos suficientes para una recomendación específica, pide más contexto al usuario.`;

  if (lifetimeStats) {
    const ls = lifetimeStats;
    context += `\n\n--- ESTADÍSTICAS DEL JUGADOR ---
Nombre: ${playerName}
K/D: ${String(ls["Average K/D Ratio"] || "N/A")}
Headshot %: ${String(ls["Average Headshots %"] || "N/A")}%
Win Rate: ${String(ls["Win Rate %"] || "N/A")}%
ADR: ${String(ls["ADR"] || "N/A")}
Matches: ${String(ls.Matches || "N/A")}
Mapas más jugados: ${String(ls["Map Win Rate % (Recent 9 Matches)"] || "N/A")}
`;

    if (recentMatches && recentMatches.length > 0) {
      context += `\n--- ÚLTIMAS PARTIDAS ---`;
      recentMatches.slice(0, 10).forEach((m, i) => {
        const map = m.map_id || "unknown";
        const result = m.results?.winner ? (m.results.winner === "Team1" ? "Victoria" : "Derrota") : "N/A";
        const score = m.results?.score ? `${m.results.score.faction1}-${m.results.score.faction2}` : "N/A";
        context += `\n${i + 1}. ${map} - ${result} (${score})`;
      });
    }
  } else {
    context += `\n\nEl jugador ${playerName} no tiene estadísticas de FACEIT disponibles. 
Si pregunta sobre sus stats, sugiérele conectar FACEIT en Configuración.
Puedes dar consejos generales de CS2 sin datos personalizados.`;
  }

  return context;
}

export async function POST(request: NextRequest) {
  const cookie = request.cookies.get("cs2pilot_user");
  if (!cookie) {
    return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  }

  let userData: Record<string, unknown>;
  try {
    userData = JSON.parse(cookie.value);
  } catch {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key no configurada" }, { status: 500 });
  }

  let body: { message: string; history?: Array<{ role: string; content: string }> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  if (!body.message?.trim()) {
    return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
  }

  const playerName = (userData.faceitNickname as string) || (userData.name as string) || "Jugador";
  const faceitPlayerId = userData.faceitPlayerId as string | undefined;

  let lifetimeStats: Record<string, unknown> | null = null;
  let recentMatches: Array<{
    map_id?: string;
    results?: { winner?: string; score?: { faction1: number; faction2: number } };
    started_at?: number;
    match_id?: string;
  }> | null = null;

  if (faceitPlayerId) {
    try {
      const faceit = getFaceitService();
      const stats = await faceit.getPlayerStats(faceitPlayerId);
      if (stats?.lifetime) {
        lifetimeStats = stats.lifetime as unknown as Record<string, unknown>;
      }
    } catch {
      // FACEIT stats unavailable
    }

    try {
      const faceit = getFaceitService();
      const matchHistory = await faceit.getMatchHistory(faceitPlayerId, 0, 10);
      if (matchHistory?.items && matchHistory.items.length > 0) {
        recentMatches = matchHistory.items.map((m) => ({
          results: m.results,
          started_at: m.started_at,
          match_id: m.match_id,
        }));
      }
    } catch {
      // Matches unavailable
    }
  }

  const systemPrompt = buildSystemPrompt(playerName, lifetimeStats, recentMatches);

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
  ];

  if (body.history && Array.isArray(body.history)) {
    body.history.slice(-10).forEach((h) => {
      if (h.role === "user" || h.role === "assistant") {
        messages.push({ role: h.role as "user" | "assistant", content: h.content });
      }
    });
  }

  messages.push({ role: "user", content: body.message });

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 800,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq error:", response.status, errText);
      return NextResponse.json(
        { error: "Error al conectar con la IA. Intenta de nuevo." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return NextResponse.json(
        { error: "La IA no devolvió una respuesta válida." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Error de conexión con la IA." },
      { status: 500 }
    );
  }
}
