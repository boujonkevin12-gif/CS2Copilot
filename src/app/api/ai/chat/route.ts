import { NextRequest, NextResponse } from "next/server";
import { getFaceitService } from "@/lib/services/faceit.service";
import { getSession } from "@/lib/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_MESSAGE_CHARS = 4000;
const MAX_HISTORY_ITEMS = 20;

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Modelos en orden de preferencia.
 *
 * Historial: `llama-3.3-70b-versatile` fue retirado por Groq el 16/08/2026
 * (HTTP 404 model_not_found), lo que dejó al Coach IA en 502 en producción.
 * El reemplazo oficial de Groq es `openai/gpt-oss-120b`. Se mantiene una
 * cadena de fallback porque Groq retira modelos cada pocos meses.
 */
const MODELS = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-20b",
];

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
  const userData = getSession(request);
  if (!userData) {
    return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  }

  // Límite de mensajes: protege la cuota de Groq y evita spam.
  const ip = getClientIp(request);
  if (
    !rateLimit(`ai/chat:${userData.steamId}`, 20, 60_000) ||
    !rateLimit(`ai/chat:ip:${ip}`, 40, 60_000)
  ) {
    return NextResponse.json(
      { error: "Demasiadas consultas. Espera un minuto antes de volver a preguntar." },
      { status: 429 }
    );
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

  if (body.message.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json(
      { error: `El mensaje no puede superar ${MAX_MESSAGE_CHARS} caracteres` },
      { status: 400 }
    );
  }

  if (Array.isArray(body.history)) {
    body.history = body.history.slice(-MAX_HISTORY_ITEMS);
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
      if (
        (h.role === "user" || h.role === "assistant") &&
        typeof h.content === "string" &&
        h.content.length <= MAX_MESSAGE_CHARS
      ) {
        messages.push({ role: h.role, content: h.content });
      }
    });
  }

  messages.push({ role: "user", content: body.message });

  // Intenta los modelos en orden hasta que uno responda (fallback ante
  // deprecaciones de Groq). Solo se salta al siguiente en 404/400.
  let lastError = "";
  for (const model of MODELS) {
    let response: Response;
    try {
      response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 800,
          temperature: 0.7,
          top_p: 0.9,
        }),
        signal: AbortSignal.timeout(60_000),
      });
    } catch (err) {
      lastError = err instanceof Error ? err.message : "timeout";
      console.error(`[AiChat] ${model}: red/timeout`, lastError);
      continue; // probar siguiente modelo
    }

    if (response.ok) {
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content;
      if (reply) return NextResponse.json({ reply });
      lastError = "respuesta vacía";
      continue;
    }

    const errText = await response.text();
    console.error(`[AiChat] ${model}: HTTP ${response.status}`, errText.slice(0, 500));

    // 404/400 = modelo no disponible → probar el siguiente.
    if (response.status === 404 || response.status === 400) {
      lastError = `modelo ${model} no disponible (${response.status})`;
      continue;
    }
    // 429 = rate limit de Groq → 503 para que el usuario reintente.
    if (response.status === 429) {
      return NextResponse.json(
        { error: "La IA está saturada. Reintentá en unos segundos." },
        { status: 503 }
      );
    }
    // Cualquier otro error del provider → 502 con detalle para diagnóstico.
    return NextResponse.json(
      { error: "Error al conectar con la IA. Intenta de nuevo.", detail: `HTTP ${response.status}` },
      { status: 502 }
    );
  }

  console.error("[AiChat] Todos los modelos fallaron:", lastError);
  return NextResponse.json(
    { error: "La IA no está disponible en este momento. Intenta de nuevo más tarde." },
    { status: 503 }
  );
}
