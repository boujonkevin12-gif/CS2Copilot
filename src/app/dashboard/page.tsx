"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useUser } from "@/lib/user-context";
import {
  BrainCircuit, Check, ChevronDown, Circle, Crosshair, Flame, Map,
  Medal, Shield, Sparkles, Swords, Target, TrendingDown, TrendingUp, Trophy,
} from "lucide-react";
import { calculateMetrics, type MetricResult } from "@/lib/services/stats-calculator";

const curves = {
  green: [25, 41, 35, 58, 42, 48, 36, 55, 43, 62, 51, 59, 52, 68],
  blue: [31, 46, 42, 57, 36, 61, 44, 64, 39, 58, 49, 67, 47, 55],
  yellow: [50, 64, 52, 40, 51, 38, 45, 40, 58, 48, 44, 59, 64, 57],
  red: [59, 46, 53, 42, 48, 37, 45, 34, 41, 30, 38, 34, 45, 41],
  purple: [63, 55, 59, 46, 56, 44, 51, 39, 47, 40, 52, 59, 55, 68],
};

function Sparkline({ color, values = curves.purple }: { color: string; values?: number[] }) {
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 200},${72 - value}`).join(" ");
  return <svg viewBox="0 0 200 72" preserveAspectRatio="none" className="h-10 w-full overflow-visible"><polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><polyline points={`0,72 ${points} 200,72`} fill={`${color}12`} stroke="none" /></svg>;
}

function Ring({ value, invalid }: { value: number | null; invalid?: boolean }) {
  const radius = 50, circumference = 2 * Math.PI * radius;
  const v = invalid ? 0 : (value ?? 0);
  return <div className="relative grid h-32 w-32 place-items-center"><svg className="absolute h-full w-full -rotate-90"><circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8"/><circle cx="64" cy="64" r={radius} fill="none" stroke="url(#ring)" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - v / 100 * circumference}/><defs><linearGradient id="ring"><stop stopColor="#25d366"/><stop offset=".65" stopColor="#8b5cf6"/><stop offset="1" stopColor="#a855f7"/></linearGradient></defs></svg><div className="text-center">{invalid ? <div className="text-[10px] text-zinc-400 leading-tight">Datos<br/>insuficientes</div> : <><div className="text-[40px] font-bold leading-none tracking-tight">{v}</div><div className="mt-1 text-[10px] text-zinc-400">Rendimiento<br/>general</div></>}</div></div>;
}

function Metric({ icon: Icon, title, metric, color }: { icon: typeof Target; title: string; metric: MetricResult | null; color: string }) {
  const score = metric?.score;
  const change = metric?.change;
  const details = metric?.details ?? [];
  const up = change && !change.startsWith("-");
  const curve = color === "#38d66b" ? curves.green : color === "#6679ff" ? curves.blue : color === "#e9bb2e" ? curves.yellow : color === "#f04452" ? curves.red : curves.purple;
  return <div className="panel p-5"><div className="mb-5 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: `${color}18`, color }}><Icon size={19}/></span><span className="text-xs font-bold tracking-wide text-zinc-200">{title}</span></div>{score !== null ? <><div className="flex items-end gap-1"><strong className="text-4xl leading-none">{score}</strong><span className="mb-0.5 text-sm text-zinc-400">/100</span></div>{change && <div className="mt-2 flex items-center gap-1 text-xs"><span className={up ? "text-emerald-400" : "text-red-400"}>{up ? <TrendingUp size={13}/> : <TrendingDown size={13}/>}</span><span style={{ color }}>{change}</span></div>}</> : <div className="flex items-center gap-1"><span className="text-sm text-zinc-500">Datos insuficientes</span></div>}<div className="mt-4"><Sparkline color={color} values={curve}/></div>{details.length > 0 && <div className="mt-3 space-y-1 border-t border-white/[.06] pt-3">{details.slice(0, 4).map((d, i) => <p key={i} className="text-[11px] text-zinc-400 leading-relaxed">{d}</p>)}</div>}</div>;
}

function Progress({ label, value, color, icon: Icon, invalid }: { label: string; value: number | null; color: string; icon: typeof Target; invalid?: boolean }) {
  const pct = value ?? 0;
  return <div className="flex items-center gap-3"><span style={{ color }}><Icon size={17}/></span><span className="w-24 text-xs font-medium">{label}</span><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[.06]"><div className="h-full rounded-full" style={{ width: `${invalid ? 0 : pct}%`, background: invalid ? "#555" : color }}/></div><span className="w-9 text-right text-[11px] font-bold">{invalid ? "—" : `${pct}%`}</span></div>;
}

export default function DashboardOverview() {
  const { user, loading, cs2Stats, faceitStats, faceitMatches } = useUser();
  const name = user?.name?.split(" ")[0] || "Jugador";

  const metrics = useMemo(() => calculateMetrics(cs2Stats, faceitStats, faceitMatches), [cs2Stats, faceitStats, faceitMatches]);

  const recent = useMemo(() => faceitMatches.slice(0, 5), [faceitMatches]);

  const kd: number | null = cs2Stats?.totalKD ?? (Number(faceitStats?.lifetime?.["Average K/D Ratio"]) || null);
  const hs: number | null = cs2Stats?.totalHSPct ?? (Number(faceitStats?.lifetime?.["Average Headshots %"]) || null);
  const adr: number | null = Number(faceitStats?.lifetime?.ADR) || null;
  const winrate: number | null = cs2Stats?.totalWinPct ?? (Number(faceitStats?.lifetime?.["Win Rate %"]) || null);
  const accuracy = cs2Stats?.accuracy ?? null;

  const hasData = metrics.general.score !== null || kd !== null || winrate !== null;

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" /></div>;

  return <div className="dashboard-shell mx-auto max-w-[1400px] space-y-5">
    <section className="flex flex-wrap items-end justify-between gap-4 pt-1">
      <div><h1 className="text-2xl font-bold tracking-tight">¡Buenos días, <span className="text-violet-400">{name} ↗</span>! <span className="inline-block animate-[wave_2s_ease-in-out_infinite]">👋</span></h1><p className="mt-1 text-sm text-zinc-400">Aquí tienes tu resumen de rendimiento y actividad.</p></div>
      <button className="panel flex items-center gap-8 px-4 py-2.5 text-xs font-medium text-zinc-300">Últimos 30 días <ChevronDown size={14}/></button>
    </section>

    <section className="hero-panel relative overflow-hidden rounded-2xl border border-violet-400/15 p-6 md:p-7">
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(139,92,246,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.06)_1px,transparent_1px)] [background-size:28px_28px]"/>
      <div className="relative grid gap-7 md:grid-cols-[145px_1fr_280px] md:items-center">
        <Ring value={metrics.general.score} invalid={!hasData}/>
        <div className="space-y-4"><h2 className="font-semibold">Estado del jugador</h2><div className="grid gap-3 text-sm sm:grid-cols-2">
          <p className="flex gap-2"><TrendingUp className="text-emerald-400" size={16}/><span><b>{metrics.aim.score !== null ? "Rendimiento activo" : "Sin datos"}</b><small className="mt-0.5 block text-xs text-zinc-400">Tendencia actual</small></span></p>
          <p className="flex gap-2"><Shield className="text-emerald-400" size={16}/><span><b>{metrics.consistency.score !== null ? `Consistencia: ${Math.round(metrics.consistency.score)}%` : "Confianza IA: —"}</b><small className="mt-0.5 block text-xs text-zinc-400">En tus análisis</small></span></p>
          <p className="flex gap-2"><Trophy className="text-lime-400" size={16}/><span><b>Objetivo: {faceitStats?.lifetime?.Matches ? `${faceitStats.lifetime.Matches} partidas` : "Conectá FACEIT"}</b><small className="mt-0.5 block text-xs text-zinc-400">Seguí jugando</small></span></p>
          <p className="flex gap-2"><Sparkles className="text-violet-400" size={16}/><span><b>{metrics.general.score !== null ? `Score: ${Math.round(metrics.general.score)}` : "Último análisis: —"}</b><small className="mt-0.5 block text-xs text-zinc-400">Rendimiento general</small></span></p>
        </div></div>
        <div className="relative hidden h-44 md:block"><div className="absolute right-0 top-3 h-36 w-36 rounded-full border border-violet-400/30 bg-[radial-gradient(circle_at_45%_30%,#5b21b6_0,rgba(42,13,76,.5)_38%,transparent_68%)] shadow-[0_0_70px_rgba(124,58,237,.45)]"/><div className="absolute bottom-4 left-0 right-0"><Sparkline color="#a855f7" values={curves.purple}/></div><Link href="/dashboard/analytics" className="gradient-btn absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 rounded-lg py-3 text-xs font-bold text-white"><Sparkles size={14}/>Analizar nueva demo</Link></div></div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={Crosshair} title="AIM" metric={metrics.aim} color="#38d66b"/>
      <Metric icon={Swords} title="DUELOS" metric={metrics.positioning} color="#6679ff"/>
      <Metric icon={BrainCircuit} title="GAME SENSE" metric={metrics.gameSense} color="#e9bb2e"/>
      <Metric icon={Flame} title="SPRAY" metric={metrics.spray} color="#f04452"/>
    </section>

    <section className="panel p-5"><h2 className="mb-4 text-sm font-semibold">Evolución en los últimos 30 días</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[["K/D", kd !== null ? kd.toFixed(2) : "—"],["HS%", hs !== null ? `${hs.toFixed(1)}%` : "—"],["ADR", adr !== null ? adr.toFixed(1) : "—"],["Winrate", winrate !== null ? `${winrate}%` : "—"]].map(([label, value]) => <div className="metric-soft p-4" key={label}><span className="text-xs font-bold text-violet-300">{label}</span><div className="mt-2 flex items-center gap-2"><b className="text-xl">{value}</b></div><div className="mt-2"><Sparkline color="#a855f7"/></div></div>)}
    </div></section>

    {metrics.aim.details.length > 0 && <section className="grid gap-4 xl:grid-cols-[1.3fr_.9fr]"><div className="panel p-6"><h2 className="mb-5 text-sm font-semibold">Informe de la IA</h2><div className="space-y-4 text-sm">
      {metrics.aim.score !== null && <Insight good={metrics.aim.score >= 70} text={`AIM: ${Math.round(metrics.aim.score)}/100`} note={metrics.aim.details.slice(0, 2).join(" · ")}/>}
      {metrics.headshotSkill.score !== null && <Insight good={(metrics.headshotSkill.score ?? 0) >= 60} text={`Headshot Skill: ${Math.round(metrics.headshotSkill.score ?? 0)}/100`} note={metrics.headshotSkill.details.slice(0, 2).join(" · ")}/>}
      {metrics.gameSense.score !== null && <Insight good={(metrics.gameSense.score ?? 0) >= 65} text={`Game Sense: ${Math.round(metrics.gameSense.score ?? 0)}/100`} note={metrics.gameSense.details.slice(0, 2).join(" · ")}/>}
      {metrics.positioning.score !== null && <Insight good={(metrics.positioning.score ?? 0) < 50} danger={(metrics.positioning.score ?? 0) < 40} text={`Posicionamiento: ${Math.round(metrics.positioning.score ?? 0)}/100`} note={metrics.positioning.details.slice(0, 2).join(" · ")}/>}
      {metrics.spray.score !== null && <Insight good={(metrics.spray.score ?? 0) >= 60} text={`Spray: ${Math.round(metrics.spray.score ?? 0)}/100`} note={metrics.spray.details.slice(0, 2).join(" · ")}/>}
      {metrics.consistency.score !== null && <Insight good={(metrics.consistency.score ?? 0) >= 70} text={`Consistencia: ${Math.round(metrics.consistency.score ?? 0)}/100`} note={metrics.consistency.details.slice(0, 2).join(" · ")}/>}
      {metrics.aim.score === null && metrics.headshotSkill.score === null && <p className="text-sm text-zinc-500 text-center py-4">Conectá Steam y FACEIT para obtener un informe detallado.</p>}
    </div></div><div className="panel relative overflow-hidden p-6"><div className="absolute -right-7 top-4 h-44 w-44 rounded-full bg-violet-700/20 blur-3xl"/><span className="text-xs text-zinc-400">Mapa destacado</span><h2 className="mt-1 text-lg font-bold">{faceitStats?.segments?.length ? "Datos disponibles" : "Sin datos"}</h2><div className="mt-6 grid h-28 place-items-center rounded-xl border border-violet-400/15 bg-[linear-gradient(135deg,rgba(139,92,246,.12),transparent)] text-violet-300"><Map size={58} strokeWidth={1}/></div><div className="mt-3 flex justify-between"><span className="text-xs text-zinc-400">K/D Global</span><b>{kd !== null ? kd.toFixed(2) : "—"}</b></div><Link href="/dashboard/analytics" className="mt-5 flex justify-center rounded-lg border border-violet-500/60 bg-violet-600/15 py-2.5 text-xs font-semibold text-violet-200">Ver análisis completo</Link></div></section>}

    <section className="grid gap-4 xl:grid-cols-2"><div className="panel p-5"><h2 className="mb-5 text-sm font-semibold">Objetivo semanal</h2><Goals metrics={metrics} kd={kd} hs={hs}/></div><div className="panel p-5"><div className="mb-3 flex justify-between"><h2 className="text-sm font-semibold">Progreso general</h2></div><div className="space-y-5">
      <Progress icon={Sparkles} label="Rendimiento" value={metrics.general.score} color="#8b5cf6" invalid={metrics.general.score === null}/>
      <Progress icon={Crosshair} label="AIM" value={metrics.aim.score} color="#6775f5" invalid={metrics.aim.score === null}/>
      <Progress icon={BrainCircuit} label="Game Sense" value={metrics.gameSense.score} color="#32cf69" invalid={metrics.gameSense.score === null}/>
      <Progress icon={Swords} label="Posicionamiento" value={metrics.positioning.score} color="#fb7c32" invalid={metrics.positioning.score === null}/>
      <Progress icon={Flame} label="Spray" value={metrics.spray.score} color="#e24659" invalid={metrics.spray.score === null}/>
    </div></div></section>

    <section className="grid gap-4 pb-2 xl:grid-cols-2"><div className="panel p-5"><h2 className="mb-4 text-sm font-semibold">Actividad reciente</h2>{recent.length ? recent.map((match, index) => <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-2 text-xs" key={match.matchId}><span className="flex items-center gap-2"><Medal className="text-violet-300" size={15}/>{match.map?.replace("de_", "").replace(/^./, c => c.toUpperCase()) || "Desconocido"}</span><span className={match.playerResult === "win" ? "text-emerald-400" : "text-red-400"}>{match.playerResult === "win" ? "Victoria" : "Derrota"}</span><span>{match.playerScore || "—"}</span></div>) : <p className="py-4 text-center text-xs text-zinc-500">Conecta FACEIT para mostrar tus últimas partidas.</p>}<Link href="/dashboard/matches" className="mt-4 block rounded-lg bg-violet-600/10 py-2 text-center text-xs text-violet-300">Ver historial completo</Link></div></section>
  </div>;
}

function Insight({ good, danger, text, note }: { good?: boolean; danger?: boolean; text: string; note: string }) {
  const color = good ? "bg-emerald-500" : danger ? "bg-red-500" : "bg-orange-500";
  return <div className="flex gap-3"><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${color}`}><Check size={12}/></span><p><b>{text}</b><small className="mt-1 block text-xs text-zinc-400">{note}</small></p></div>;
}

function Goals({ metrics, kd, hs }: { metrics: ReturnType<typeof calculateMetrics>; kd: number | null; hs: number | null }) {
  const goals: [string, string, number][] = [
    [`Conseguir ${hs !== null ? Math.min(hs + 5, 60).toFixed(0) : "45"}% de HS`, hs !== null ? `${hs.toFixed(1)}%` : "—", hs !== null ? Math.min(hs / 60 * 100, 100) : 0],
    ["Ganar 3 partidas seguidas", "—", 0],
    ["Mejorar K/D a >1.0", kd !== null ? kd.toFixed(2) : "—", kd !== null ? Math.min(kd / 1.5 * 100, 100) : 0],
  ];
  return <div className="space-y-4">{goals.map(([text, value, pct], i) => <div className="grid grid-cols-[18px_1fr_auto] items-center gap-2" key={text}><Circle size={14} className="text-zinc-500"/><span className="text-xs font-medium">{text}</span><span className="text-xs">{value}</span><div className="col-start-2 col-end-4 h-1.5 overflow-hidden rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-violet-500" style={{ width: `${pct}%` }}/></div></div>)}<div className="border-t border-white/[.06] pt-4 text-xs text-violet-300">☆ Mejora constante</div></div>;
}
