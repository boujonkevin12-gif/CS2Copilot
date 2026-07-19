export interface AiRecommendation {
  id: string;
  category: "aim" | "positioning" | "economy" | "utility" | "teamplay" | "clutch" | "mental" | "training";
  priority: "alta" | "media" | "baja";
  title: string;
  description: string;
  actionable: string;
  impact: string;
}

export interface AiAnalysis {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: AiRecommendation[];
  trainingPlan: { focus: string; exercises: string[] }[];
}

interface PlayerStats {
  matches: string;
  winRate: string;
  kd: string;
  hsPercent: string;
  adr: string;
  kast: string;
  clutches: string;
  rating: string;
  kills: string;
  deaths: string;
  assists: string;
}

interface MatchData {
  kd: number;
  hsPercent: number;
  kills: number;
  deaths: number;
  result: string;
  map: string;
}

let recId = 0;
function rec(
  category: AiRecommendation["category"],
  priority: AiRecommendation["priority"],
  title: string,
  description: string,
  actionable: string,
  impact: string,
): AiRecommendation {
  return { id: `rec-${++recId}`, category, priority, title, description, actionable, impact };
}

export function analyzePlayer(
  lifetimeStats: PlayerStats | null,
  matchStats?: MatchData[],
): AiAnalysis {
  recId = 0;

  if (!lifetimeStats) {
    return {
      overallScore: 0,
      strengths: [],
      weaknesses: ["No hay datos suficientes para analizar"],
      recommendations: [
        rec("training", "alta", "Juega partidas en FACEIT",
          "Necesitamos al menos 20 partidas para hacer un analisis preciso.",
          "Juega 20+ partidas clasificatorias en FACEIT y vuelve a sincronizar.",
          "Permitira un analisis detallado de tu rendimiento"),
      ],
      trainingPlan: [{ focus: "Basico", exercises: ["Juega 20 partidas clasificatorias en FACEIT"] }],
    };
  }

  const kd = parseFloat(lifetimeStats.kd) || 0;
  const hs = parseFloat(lifetimeStats.hsPercent) || 0;
  const wr = parseFloat(lifetimeStats.winRate) || 0;
  const adr = parseFloat(lifetimeStats.adr) || 0;
  const kast = parseFloat(lifetimeStats.kast) || 0;
  const rating = parseFloat(lifetimeStats.rating) || 0;
  const clutches = parseInt(lifetimeStats.clutches) || 0;
  const matches = parseInt(lifetimeStats.matches) || 0;

  let score = 50;
  if (kd >= 1.2) score += 15;
  else if (kd >= 1.0) score += 5;
  else if (kd < 0.8) score -= 15;
  else if (kd < 0.9) score -= 5;

  if (hs >= 55) score += 10;
  else if (hs >= 45) score += 5;
  else if (hs < 35) score -= 10;

  if (wr >= 55) score += 10;
  else if (wr >= 50) score += 5;
  else if (wr < 45) score -= 10;

  if (adr >= 85) score += 10;
  else if (adr >= 65) score += 5;
  else if (adr < 55) score -= 10;

  if (kast >= 75) score += 5;
  else if (kast < 65) score -= 5;

  score = Math.max(10, Math.min(100, score));

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: AiRecommendation[] = [];

  if (kd >= 1.2) strengths.push(`K/D solido de ${kd.toFixed(2)} — buen balance entre agresion y supervivencia`);
  if (hs >= 50) strengths.push(`Headshot rate de ${hs.toFixed(0)}% — punteria por encima del promedio`);
  if (wr >= 55) strengths.push(`Win rate de ${wr.toFixed(0)}% — contribuyes a la victoria`);
  if (adr >= 80) strengths.push(`ADR de ${adr.toFixed(0)} — alto impacto por ronda`);
  if (kast >= 75) strengths.push(`KAST de ${kast.toFixed(0)}% — jugador consistente`);
  if (rating >= 1.1) strengths.push(`Rating ${(rating).toFixed(2)} — rendimiento destacado`);

  if (kd < 0.9) weaknesses.push(`K/D bajo de ${kd.toFixed(2)} — estas muriendo mas de lo que eliminas`);
  if (hs < 40) weaknesses.push(`Headshot rate de ${hs.toFixed(0)}% — mejora tu punteria a la cabeza`);
  if (wr < 48) weaknesses.push(`Win rate de ${wr.toFixed(0)}% — necesitas mejorar decisiones de juego`);
  if (adr < 60) weaknesses.push(`ADR de ${adr.toFixed(0)} bajo impacto por ronda`);
  if (kast < 68) weaknesses.push(`KAST de ${kast.toFixed(0)}% — demasiadas rondas sin impacto`);

  if (kd < 0.9) {
    recommendations.push(rec("aim", "alta", "Mejora tu punteria",
      `Con un K/D de ${kd.toFixed(2)}, estas muriendo frecuentemente antes de conseguir eliminationes. Esto indica problemas de punteria o posicionamiento.`,
      "Dedica 15-20 minutos diarios a Aim Botz o Workshop maps de aim. Enfoca en flicks y tracking.",
      "Mejorar tu K/D a 1.0+ incrementara tu confianza y impacto en el equipo"));
  }

  if (hs < 40) {
    recommendations.push(rec("aim", "alta", "Trabaja tu crosshair placement",
      `Tu headshot rate de ${hs.toFixed(0)}% indica que tu crosshair no esta posicionado a nivel de cabeza. La mayoria de tus kills son bodyshots.`,
      "Mantene el crosshair a la altura de la cabeza siempre. Practica pre-aim en mapas con bots. Evita disparar al suelo.",
      "Un HS% de 50%+ significa mas kills rapidos y menos tiempo de tiro"));
  }

  if (wr < 48) {
    recommendations.push(rec("teamplay", "alta", "Mejora tu toma de decisiones",
      `Con un win rate de ${wr.toFixed(0)}%, no estas convirtiendo tus habilidades en victorias. Puede ser un problema de decisiones o trabajo en equipo.`,
      "Juega con un stack fijo. Comunica info al team. No hagas pushes agresivos sin razon. Espera teammates para executes.",
      "Mejorar decisiones puede subir tu win rate 5-10% sin cambiar tu aim"));
  }

  if (adr < 60) {
    recommendations.push(rec("positioning", "media", "Aumenta tu daño por ronda",
      `Un ADR de ${adr.toFixed(0)} indica que no estas generando suficiente daño. Puede ser por posiciones pasivas o mala economia.`,
      "Practica entry fragging. Juega mas agresivo en el lado CT con picks tempranos. Usa grenades ofensivas.",
      "Subir tu ADR a 80+ te convierte en un jugador mucho mas valioso"));
  }

  if (kast < 68) {
    recommendations.push(rec("positioning", "media", "Reduce rondas sin impacto",
      `Tu KAST de ${kast.toFixed(0)}% significa que en muchas rondas no haces nada — no matas, no haces damage, y mueres rapido.`,
      "Juega mas seguro en el lado T. No hagas dry peeks. Trading kills es mejor que morir solo. En CT, retira si estas en desventaja.",
      "KAST de 75%+ indica un jugador que siempre contribuye"));
  }

  if (clutches > 0 && parseInt(lifetimeStats.matches) > 20) {
    const clutchPerMatch = clutches / matches;
    if (clutchPerMatch < 0.3) {
      recommendations.push(rec("clutch", "media", "Entrena situaciones 1vX",
        `Ganaste ${clutches} clutches en ${matches} partidas (${clutchPerMatch.toFixed(2)} por partida). Puedes mejorar tu juego bajo presion.`,
        "Practica clutch scenarios en aim maps. Estudia demos de como se mueven los pros en 1v2+. Manten la calma y juega el tiempo.",
        "Ganar 1-2 clutches extra por partido puede cambiar el resultado de muchas partidas"));
    }
  }

  const mapsToImprove = ["Dust II", "Mirage", "Inferno", "Anubis", "Nuke"];
  recommendations.push(rec("utility", "media", "Perfecciona tus grenades",
    "Las grenades bien ejecutadas pueden ganar rondas completas. Cada mapa tiene lineups criticos que debes dominar.",
    "Aprende 3-4 smokes y 2 flashes por mapa. Practica en modo entrenamiento. Las executes con grenades coordinadas ganan el 70% de rondas T.",
    "Las grenades son la herramienta mas subestimada en CS2"));

  if (matches < 50) {
    recommendations.push(rec("training", "baja", "Juega mas partidas",
      `Solo tienes ${matches} partidas. Necesitas mas data para un analisis preciso y mas experiencia para estabilizar tu nivel.`,
      "Apunta a 100+ partidas clasificatorias. La consistencia viene con la experiencia.",
      "Los jugadores mejoran significativamente entre 50-200 partidas"));
  }

  const trainingPlan = [
    {
      focus: "Aim y Punteria",
      exercises: [
        "Aim Botz: 15 min/día — flicks y tracking",
        "Workshop maps de HS-only — 10 min/día",
        "Deathmatch sin grenades — enfocate solo en el aim",
      ],
    },
    {
      focus: "Juego de Equipo",
      exercises: [
        "Juega con 2-3 amigos fijos para mejorar la quimica",
        "Comunica toda la info: posiciones, daño, economia",
        "Practica executes en 5-stack con grenades coordinadas",
      ],
    },
    {
      focus: "Grenades y Utility",
      exercises: [
        "Aprende 3 smokes por mapa en modo entrenamiento",
        "Practica flashes para teammates (pop flashes)",
        "Estudia lineup de molotov para retakes",
      ],
    },
    {
      focus: "Mentalidad",
      exercises: [
        "No tilt — toma 5 min de descanso si pierdes 3 seguidas",
        "Analiza tus muertes: que hiciste mal? que podrias hacer mejor?",
        "Mira demos de tus partidas perdidas para identificar patrones",
      ],
    },
  ];

  if (strengths.length === 0) strengths.push("Sigue jugando para identificar tus fortalezas");

  return {
    overallScore: score,
    strengths,
    weaknesses,
    recommendations: recommendations.slice(0, 8),
    trainingPlan,
  };
}
