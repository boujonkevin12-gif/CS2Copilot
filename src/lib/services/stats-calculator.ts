"use client";

export interface MetricResult {
  score: number | null;
  details: string[];
  change: string | null;
}

export interface DashboardMetrics {
  aim: MetricResult;
  spray: MetricResult;
  headshotSkill: MetricResult;
  gameSense: MetricResult;
  positioning: MetricResult;
  clutch: MetricResult;
  entryFrags: MetricResult;
  utility: MetricResult;
  consistency: MetricResult;
  general: MetricResult;
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

function round(v: number, d = 1): number {
  const m = Math.pow(10, d);
  return Math.round(v * m) / m;
}

interface Inputs {
  kd: number | null;
  hsPct: number | null;
  accuracy: number | null;
  winPct: number | null;
  totalKills: number | null;
  totalDeaths: number | null;
  totalMVPs: number | null;
  totalMatches: number | null;
  adr: number | null;
  killsPerRound: number | null;
  rifleKills: number | null;
  sniperKills: number | null;
  smgKills: number | null;
  pistolKills: number | null;
  shotgunKills: number | null;
  mgKills: number | null;
  knifeKills: number | null;
  grenadeKills: number | null;
  utilityDamage: number | null;
  enemiesFlashed: number | null;
  faceitKD: number | null;
  faceitHS: number | null;
  faceitWR: number | null;
  faceitADR: number | null;
  recentMatches: Array<{
    kd: number;
    kills: number;
    deaths: number;
    hsPct: number;
    result: string;
  }>;
}

function hasAny(...vals: (number | null)[]): boolean {
  return vals.some((v) => v !== null && v > 0);
}

function computeAIM(i: Inputs): MetricResult {
  const details: string[] = [];
  let score = 0;
  let count = 0;

  const hs = i.hsPct ?? i.faceitHS;
  if (hs !== null && hs > 0) {
    details.push(`• ${round(hs)}% Headshots`);
    score += clamp(hs * 1.2);
    count++;
  }

  const acc = i.accuracy;
  if (acc !== null && acc > 0) {
    details.push(`• ${round(acc)}% Accuracy`);
    score += clamp(acc * 1.1);
    count++;
  }

  const kd = i.kd ?? i.faceitKD;
  if (kd !== null && kd > 0) {
    details.push(`• K/D ${round(kd, 2)}`);
    score += clamp(kd * 50);
    count++;
  }

  const kpr = i.killsPerRound;
  if (kpr !== null && kpr > 0) {
    details.push(`• ${round(kpr, 2)} Kills por ronda`);
    score += clamp(kpr * 60);
    count++;
  }

  if (count === 0) return { score: null, details: [], change: null };
  return { score: round(score / count), details, change: computeChange(i, "aim") };
}

function computeSpray(i: Inputs): MetricResult {
  const details: string[] = [];
  let score = 0;
  let count = 0;

  const acc = i.accuracy;
  if (acc !== null && acc > 0) {
    details.push(`• ${round(acc)}% Accuracy`);
    score += clamp(acc * 1.1);
    count++;
  }

  const tot = (i.rifleKills ?? 0) + (i.smgKills ?? 0) + (i.pistolKills ?? 0) + (i.shotgunKills ?? 0) + (i.mgKills ?? 0) + (i.sniperKills ?? 0);
  if (tot > 0) {
    const riflePct = ((i.rifleKills ?? 0) / tot) * 100;
    if (riflePct > 0) {
      details.push(`• ${round(riflePct)}% kills con rifle (control de spray)`);
      if (riflePct > 40) score += 70;
      else if (riflePct > 25) score += 50;
      else score += 30;
      count++;
    }
  }

  if (count === 0) return { score: null, details: [], change: null };
  return { score: round(score / count), details, change: computeChange(i, "spray") };
}

function computeHS(i: Inputs): MetricResult {
  const hs = i.hsPct ?? i.faceitHS;
  if (hs === null || hs <= 0) return { score: null, details: [], change: null };
  const score = clamp(hs * 1.3);
  return {
    score: round(score),
    details: [`• ${round(hs)}% Headshots`, hs >= 50 ? "• Superior al promedio" : hs >= 40 ? "• Promedio competitivo" : "• Por debajo del promedio"],
    change: computeChange(i, "hs"),
  };
}

function computeGameSense(i: Inputs): MetricResult {
  const details: string[] = [];
  let score = 0;
  let count = 0;

  const wr = i.winPct ?? i.faceitWR;
  if (wr !== null && wr > 0) {
    details.push(`• ${round(wr)}% Win Rate`);
    score += clamp(wr * 1.2);
    count++;
  }

  const kd = i.kd ?? i.faceitKD;
  if (kd !== null && kd > 0) {
    details.push(`• K/D ${round(kd, 2)}`);
    score += clamp(kd * 40);
    count++;
  }

  const adr = i.adr ?? i.faceitADR;
  if (adr !== null && adr > 0) {
    details.push(`• ${round(adr)} ADR`);
    score += clamp(adr * 0.7);
    count++;
  }

  const mvp = i.totalMVPs;
  if (mvp !== null && mvp > 0 && i.totalMatches && i.totalMatches > 0) {
    const mvpPerMatch = mvp / i.totalMatches;
    details.push(`• ${round(mvpPerMatch, 2)} MVPs por partida`);
    score += clamp(mvpPerMatch * 40);
    count++;
  }

  if (count === 0) return { score: null, details: [], change: null };
  return { score: round(score / count), details, change: computeChange(i, "gamesense") };
}

function computePositioning(i: Inputs): MetricResult {
  const details: string[] = [];
  let score = 0;
  let count = 0;

  const kd = i.kd ?? i.faceitKD;
  if (kd !== null && kd > 0) {
    const posScore = kd >= 1.2 ? 85 : kd >= 1.0 ? 70 : kd >= 0.8 ? 50 : 30;
    details.push(`• K/D ${round(kd, 2)} → ${kd >= 1.0 ? "buen posicionamiento" : "morís mucho"}`);
    score += posScore;
    count++;
  }

  const dpr = i.totalDeaths !== null && i.totalMatches !== null && i.totalMatches > 0
    ? i.totalDeaths / i.totalMatches : null;
  if (dpr !== null && dpr > 0) {
    const dprScore = dpr <= 15 ? 80 : dpr <= 18 ? 60 : 40;
    details.push(`• ${round(dpr, 1)} muertes por partida`);
    score += dprScore;
    count++;
  }

  if (count === 0) return { score: null, details: [], change: null };
  return { score: round(score / count), details, change: computeChange(i, "positioning") };
}

function computeClutch(i: Inputs): MetricResult {
  if (i.totalMVPs === null || i.totalMVPs <= 0 || !i.totalMatches || i.totalMatches <= 0)
    return { score: null, details: [], change: null };

  const mvpPerMatch = i.totalMVPs / i.totalMatches;
  let score = clamp(mvpPerMatch * 30);
  if (i.faceitADR && i.faceitADR > 80) score += 10;
  const details = [
    `• ${round(mvpPerMatch, 2)} MVPs por partida`,
    i.faceitADR ? `• ${round(i.faceitADR)} ADR en clutcheo` : null,
  ].filter(Boolean) as string[];
  return { score: round(score), details, change: computeChange(i, "clutch") };
}

function computeEntry(i: Inputs): MetricResult {
  return { score: null, details: ["Datos insuficientes"], change: null };
}

function computeUtility(i: Inputs): MetricResult {
  const details: string[] = [];
  let score = 0;
  let count = 0;

  const ud = i.utilityDamage;
  if (ud !== null && ud > 0) {
    details.push(`• ${ud.toLocaleString()} daño con utilidad`);
    score += clamp(ud / 100);
    count++;
  }

  const ef = i.enemiesFlashed;
  if (ef !== null && ef > 0) {
    details.push(`• ${ef.toLocaleString()} enemigos cegados`);
    score += clamp(ef / 50);
    count++;
  }

  const gk = i.grenadeKills;
  if (gk !== null && gk > 0) {
    details.push(`• ${gk} kills con granadas`);
    score += clamp(gk * 10);
    count++;
  }

  if (count === 0) return { score: null, details: ["Datos insuficientes"], change: null };
  return { score: round(clamp(score / count)), details, change: computeChange(i, "utility") };
}

function computeConsistency(i: Inputs): MetricResult {
  const matches = i.recentMatches;
  if (matches.length < 3) {
    const kd = i.kd ?? i.faceitKD;
    if (kd === null || kd <= 0) return { score: null, details: ["Datos insuficientes"], change: null };
    return { score: round(clamp(kd * 50)), details: [`• K/D general ${round(kd, 2)} (pocas partidas)`], change: null };
  }

  const kds = matches.map((m) => m.kd);
  const avgKd = kds.reduce((a, b) => a + b, 0) / kds.length;
  const variance = kds.reduce((sum, k) => sum + Math.pow(k - avgKd, 2), 0) / kds.length;
  const stdDev = Math.sqrt(variance);
  const consistencyScore = clamp((1 - Math.min(stdDev, 1)) * 100);

  const wr = matches.filter((m) => m.result === "win").length / matches.length * 100;
  const details = [
    `• K/D promedio ${round(avgKd, 2)} en últimas ${matches.length} partidas`,
    `• Desviación estándar ${round(stdDev, 2)} (${stdDev < 0.3 ? "muy consistente" : stdDev < 0.5 ? "moderado" : "variable"})`,
    `• ${round(wr)}% Win Rate reciente`,
  ];
  return { score: round(consistencyScore), details, change: computeChange(i, "consistency") };
}

function computeGeneral(i: Inputs, metrics: DashboardMetrics): MetricResult {
  const scores = [
    metrics.aim.score, metrics.spray.score, metrics.headshotSkill.score,
    metrics.gameSense.score, metrics.positioning.score, metrics.clutch.score,
    metrics.utility.score, metrics.consistency.score,
  ].filter((s): s is number => s !== null);

  if (scores.length === 0) return { score: null, details: ["Conectá Steam/FACEIT para ver tu rendimiento"], change: null };

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const details = [
    `• Basado en ${scores.length} métricas disponibles`,
    ...(i.totalMatches && i.totalMatches > 0 ? [`• ${i.totalMatches} partidas analizadas`] : []),
    ...(metrics.aim.score !== null ? [`• AIM ${round(metrics.aim.score)}`] : []),
    ...(metrics.gameSense.score !== null ? [`• Game Sense ${round(metrics.gameSense.score)}`] : []),
  ];
  return { score: round(avg), details, change: null };
}

function computeChange(_i: Inputs, _metric: string): string | null {
  return null;
}

export function calculateMetrics(
  cs2Stats: Record<string, any> | null,
  faceitStats: Record<string, any> | null,
  recentMatches: Array<Record<string, any>>,
): DashboardMetrics {
  const i: Inputs = {
    kd: cs2Stats?.totalKD ?? null,
    hsPct: cs2Stats?.totalHSPct ?? null,
    accuracy: cs2Stats?.accuracy ?? null,
    winPct: cs2Stats?.totalWinPct ?? null,
    totalKills: cs2Stats?.totalKills ?? null,
    totalDeaths: cs2Stats?.totalDeaths ?? null,
    totalMVPs: cs2Stats?.totalMVPs ?? null,
    totalMatches: cs2Stats?.totalMatchesPlayed ?? (faceitStats?.lifetime?.Matches ? parseInt(faceitStats.lifetime.Matches) : null),
    adr: faceitStats?.lifetime?.ADR ? parseFloat(faceitStats.lifetime.ADR) : null,
    killsPerRound: cs2Stats?.totalKills && cs2Stats?.totalRounds ?
      cs2Stats.totalKills / cs2Stats.totalRounds : null,
    rifleKills: cs2Stats?.totalRifleKills ?? null,
    sniperKills: cs2Stats?.totalSniperKills ?? null,
    smgKills: cs2Stats?.totalSmgKills ?? null,
    pistolKills: cs2Stats?.totalPistolKills ?? null,
    shotgunKills: cs2Stats?.totalShotgunKills ?? null,
    mgKills: cs2Stats?.totalMachinegunKills ?? null,
    knifeKills: cs2Stats?.totalKnifeKills ?? null,
    grenadeKills: cs2Stats?.totalGrenadeKills ?? null,
    utilityDamage: cs2Stats?.totalUtilityDamage ?? null,
    enemiesFlashed: cs2Stats?.totalFlashbangEnemies ?? null,
    faceitKD: faceitStats?.lifetime?.["Average K/D Ratio"] ?
      parseFloat(faceitStats.lifetime["Average K/D Ratio"]) : null,
    faceitHS: faceitStats?.lifetime?.["Average Headshots %"] ?
      parseFloat(faceitStats.lifetime["Average Headshots %"]) : null,
    faceitWR: faceitStats?.lifetime?.["Win Rate %"] ?
      parseFloat(faceitStats.lifetime["Win Rate %"]) : null,
    faceitADR: faceitStats?.lifetime?.ADR ?
      parseFloat(faceitStats.lifetime.ADR) : null,
    recentMatches: recentMatches.map((m) => ({
      kd: parseFloat(m.kd) || (parseInt(m.playerStats?.Kills || "0") / Math.max(parseInt(m.playerStats?.Deaths || "1"), 1)) || 1,
      kills: parseInt(m.playerStats?.Kills || "0"),
      deaths: parseInt(m.playerStats?.Deaths || "0"),
      hsPct: parseInt(m.playerStats?.Headshots || "0") / Math.max(parseInt(m.playerStats?.Kills || "1"), 1) * 100,
      result: m.playerResult || "loss",
    })),
  };

  const aim = computeAIM(i);
  const spray = computeSpray(i);
  const headshotSkill = computeHS(i);
  const gameSense = computeGameSense(i);
  const positioning = computePositioning(i);
  const clutch = computeClutch(i);
  const entryFrags = computeEntry(i);
  const utility = computeUtility(i);
  const consistency = computeConsistency(i);
  const metrics: DashboardMetrics = { aim, spray, headshotSkill, gameSense, positioning, clutch, entryFrags, utility, consistency, general: { score: null, details: [], change: null } };
  metrics.general = computeGeneral(i, metrics);

  return metrics;
}
