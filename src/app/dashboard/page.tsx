"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useUser } from "@/lib/user-context";
import {
  BrainCircuit, Check, ChevronDown, Circle, Crosshair, Flame, Map,
  Medal, Shield, Sparkles, Swords, Target, TrendingDown, TrendingUp, Trophy,
} from "lucide-react";

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

function Ring({ value }: { value: number }) {
  const radius = 50, circumference = 2 * Math.PI * radius;
  return <div className="relative grid h-32 w-32 place-items-center"><svg className="absolute h-full w-full -rotate-90"><circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8"/><circle cx="64" cy="64" r={radius} fill="none" stroke="url(#ring)" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - value / 100 * circumference}/><defs><linearGradient id="ring"><stop stopColor="#25d366"/><stop offset=".65" stopColor="#8b5cf6"/><stop offset="1" stopColor="#a855f7"/></linearGradient></defs></svg><div className="text-center"><div className="text-[40px] font-bold leading-none tracking-tight">{value}</div><div className="mt-1 text-[10px] text-zinc-400">Rendimiento<br/>general</div></div></div>;
}

function Metric({ icon: Icon, title, value, change, color, values }: { icon: typeof Target; title: string; value: string; change: string; color: string; values: number[] }) {
  const up = !change.startsWith("-");
  return <div className="panel p-5"><div className="mb-5 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: `${color}18`, color }}><Icon size={19}/></span><span className="text-xs font-bold tracking-wide text-zinc-200">{title}</span></div><div className="flex items-end gap-1"><strong className="text-4xl leading-none">{value}</strong><span className="mb-0.5 text-sm text-zinc-400">/100</span></div><div className="mt-2 flex items-center gap-1 text-xs"><span className={up ? "text-emerald-400" : "text-red-400"}>{up ? <TrendingUp size={13}/> : <TrendingDown size={13}/>}</span><span style={{ color }}>{change}</span><span className="text-zinc-400">esta semana</span></div><div className="mt-4"><Sparkline color={color} values={values}/></div></div>;
}

function Progress({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: typeof Target }) {
  return <div className="flex items-center gap-3"><span style={{ color }}><Icon size={17}/></span><span className="w-24 text-xs font-medium">{label}</span><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[.06]"><div className="h-full rounded-full" style={{ width: `${value}%`, background: color }}/></div><span className="w-7 text-right text-[11px] font-bold">{value}%</span></div>;
}

export default function DashboardOverview() {
  const { user, loading, cs2Stats, faceitMatches } = useUser();
  const name = user?.name?.split(" ")[0] || "Jugador";
  const kd = cs2Stats?.totalKD?.toFixed(2) || "1.35";
  const hs = cs2Stats?.totalHSPct?.toFixed(1) || "46.1";
  const winrate = cs2Stats?.totalWinPct || 54;
  const recent = useMemo(() => faceitMatches.slice(0, 5), [faceitMatches]);

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" /></div>;

  return <div className="dashboard-shell mx-auto max-w-[1400px] space-y-5">
    <section className="flex flex-wrap items-end justify-between gap-4 pt-1">
      <div><h1 className="text-2xl font-bold tracking-tight">¡Buenos días, <span className="text-violet-400">{name} ↗</span>! <span className="inline-block animate-[wave_2s_ease-in-out_infinite]">👋</span></h1><p className="mt-1 text-sm text-zinc-400">Aquí tienes tu resumen de rendimiento y actividad.</p></div>
      <button className="panel flex items-center gap-8 px-4 py-2.5 text-xs font-medium text-zinc-300">Últimos 30 días <ChevronDown size={14}/></button>
    </section>

    <section className="hero-panel relative overflow-hidden rounded-2xl border border-violet-400/15 p-6 md:p-7">
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(139,92,246,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,.06)_1px,transparent_1px)] [background-size:28px_28px]"/>
      <div className="relative grid gap-7 md:grid-cols-[145px_1fr_280px] md:items-center"><Ring value={cs2Stats?.accuracy ? Math.round(cs2Stats.accuracy) : 84}/><div className="space-y-4"><h2 className="font-semibold">Estado del jugador</h2><div className="grid gap-3 text-sm sm:grid-cols-2"><p className="flex gap-2"><TrendingUp className="text-emerald-400" size={16}/><span><b>Mejorando</b><small className="mt-0.5 block text-xs text-zinc-400">Tendencia actual</small></span></p><p className="flex gap-2"><Shield className="text-emerald-400" size={16}/><span><b>Confianza IA: 84%</b><small className="mt-0.5 block text-xs text-zinc-400">En tus análisis</small></span></p><p className="flex gap-2"><Trophy className="text-lime-400" size={16}/><span><b>Objetivo: FACEIT Lv3</b><small className="mt-0.5 block text-xs text-zinc-400">0.2 niveles restantes</small></span></p><p className="flex gap-2"><Sparkles className="text-violet-400" size={16}/><span><b>Último análisis: Hace 2h</b><small className="mt-0.5 block text-xs text-zinc-400">Mirage · 24/07/2026</small></span></p></div></div>
        <div className="relative hidden h-44 md:block"><div className="absolute right-0 top-3 h-36 w-36 rounded-full border border-violet-400/30 bg-[radial-gradient(circle_at_45%_30%,#5b21b6_0,rgba(42,13,76,.5)_38%,transparent_68%)] shadow-[0_0_70px_rgba(124,58,237,.45)]"/><div className="absolute bottom-4 left-0 right-0"><Sparkline color="#a855f7" values={[35,45,31,49,40,62,56,67,46,77,39,56,75]}/></div><Link href="/dashboard/analytics" className="gradient-btn absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 rounded-lg py-3 text-xs font-bold text-white"><Sparkles size={14}/>Analizar nueva demo</Link></div></div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={Crosshair} title="AIM" value="84" change="+6" color="#38d66b" values={curves.green}/><Metric icon={Swords} title="DUELOS" value="72" change="-2" color="#6679ff" values={curves.blue}/><Metric icon={BrainCircuit} title="GAME SENSE" value="91" change="+4" color="#e9bb2e" values={curves.yellow}/><Metric icon={Flame} title="SPRAY" value="58" change="-5" color="#f04452" values={curves.red}/></section>

    <section className="panel p-5"><h2 className="mb-4 text-sm font-semibold">Evolución en los últimos 30 días</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["K/D", kd, "▲ 8%"],["HS%", `${hs}%`, "▲ 5%"],["ADR", "89.7", "▼ -2%"],["Winrate", `${winrate}%`, "▲ 6%"]].map(([label,value,change]) => <div className="metric-soft p-4" key={label}><span className="text-xs font-bold text-violet-300">{label}</span><div className="mt-2 flex items-center gap-2"><b className="text-xl">{value}</b><small className={change.includes("▼") ? "text-red-400" : "text-emerald-400"}>{change}</small></div><div className="mt-2"><Sparkline color="#a855f7"/></div></div>)}</div></section>

    <section className="grid gap-4 xl:grid-cols-[1.3fr_.9fr]"><div className="panel p-6"><h2 className="mb-5 text-sm font-semibold">Informe de la IA</h2><div className="space-y-4 text-sm"><Insight good text="Tu precisión con AK mejoró un 11%" note="¡Buen trabajo! Estás impactando más tus tiros."/><Insight good text="En Mirage ganas el 63% de los duelos" note="Tu rendimiento en este mapa es superior."/><Insight text="En Inferno pierdes muchas rondas en B" note="Recomendamos revisar tus retakes en este sitio."/><Insight text="Disparas antes de frenar" note="Intenta frenar antes de disparar para más precisión." danger/></div></div><div className="panel relative overflow-hidden p-6"><div className="absolute -right-7 top-4 h-44 w-44 rounded-full bg-violet-700/20 blur-3xl"/><span className="text-xs text-zinc-400">Mapa destacado</span><h2 className="mt-1 text-lg font-bold">Mirage</h2><div className="mt-6 grid h-28 place-items-center rounded-xl border border-violet-400/15 bg-[linear-gradient(135deg,rgba(139,92,246,.12),transparent)] text-violet-300"><Map size={58} strokeWidth={1}/></div><div className="mt-3 flex justify-between"><span className="text-xs text-zinc-400">Winrate</span><b>63%</b></div><Link href="/dashboard/analytics" className="mt-5 flex justify-center rounded-lg border border-violet-500/60 bg-violet-600/15 py-2.5 text-xs font-semibold text-violet-200">Ver análisis completo</Link></div></section>

    <section className="grid gap-4 xl:grid-cols-2"><div className="panel p-5"><h2 className="mb-5 text-sm font-semibold">Objetivo semanal</h2><Goals/></div><div className="panel p-5"><div className="mb-3 flex justify-between"><h2 className="text-sm font-semibold">IA News</h2><span className="text-xs text-violet-400">Ver todas</span></div>{["DeepMind lanza un nuevo modelo de IA para juegos", "FACEIT actualizó el sistema de ranking", "CS2 cambió el recoil de algunas armas", "NVIDIA publicó nuevos drivers para CS2"].map((item,i)=><div className="flex items-center gap-3 border-b border-white/[.05] py-3 last:border-0" key={item}><span className="grid h-6 w-6 place-items-center rounded-full border border-violet-400/30 text-violet-300"><Sparkles size={12}/></span><p className="flex-1 text-xs">{item}</p><span className="text-[10px] text-zinc-500">hace {i ? `${i * 5} horas` : "2 horas"}</span></div>)}</div></section>

    <section className="grid gap-4 pb-2 xl:grid-cols-2"><div className="panel p-5"><h2 className="mb-4 text-sm font-semibold">Actividad reciente</h2>{recent.length ? recent.map((match, index) => <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-2 text-xs" key={match.matchId}><span className="flex items-center gap-2"><Medal className="text-violet-300" size={15}/>{match.map.replace("de_", "").replace(/^./, c => c.toUpperCase())}</span><span className={match.playerResult === "win" ? "text-emerald-400" : "text-red-400"}>{match.playerResult === "win" ? "Victoria" : "Derrota"}</span><span>{match.playerScore || "—"}</span></div>) : <p className="py-4 text-center text-xs text-zinc-500">Conecta FACEIT para mostrar tus últimas partidas.</p>}<Link href="/dashboard/matches" className="mt-4 block rounded-lg bg-violet-600/10 py-2 text-center text-xs text-violet-300">Ver historial completo</Link></div><div className="panel p-5"><h2 className="mb-5 text-sm font-semibold">Progreso general</h2><div className="space-y-5"><Progress icon={Sparkles} label="Nivel general" value={82} color="#8b5cf6"/><Progress icon={Crosshair} label="AIM" value={84} color="#6775f5"/><Progress icon={BrainCircuit} label="Game Sense" value={91} color="#32cf69"/><Progress icon={Swords} label="Duelos" value={72} color="#fb7c32"/><Progress icon={Flame} label="Spray" value={58} color="#e24659"/></div></div></section>
  </div>;
}

function Insight({ good, danger, text, note }: { good?: boolean; danger?: boolean; text: string; note: string }) { const color = good ? "bg-emerald-500" : danger ? "bg-red-500" : "bg-orange-500"; return <div className="flex gap-3"><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${color}`}><Check size={12}/></span><p><b>{text}</b><small className="mt-1 block text-xs text-zinc-400">{note}</small></p></div>; }
function Goals() { const goals = [["Conseguir 45% de HS", "46%"],["Ganar 3 partidas seguidas", "2 / 3"],["No morir primero más de 2 veces", "1 / 2"]]; return <div className="space-y-4">{goals.map(([text,value],i)=><div className="grid grid-cols-[18px_1fr_auto] items-center gap-2" key={text}><Circle size={14} className="text-zinc-500"/><span className="text-xs font-medium">{text}</span><span className="text-xs">{value}</span><div className="col-start-2 col-end-4 h-1.5 overflow-hidden rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-violet-500" style={{width: `${[46,66,50][i]}%`}}/></div></div>)}<div className="border-t border-white/[.06] pt-4 text-xs text-violet-300">☆ Recompensa: 500 XP</div></div>; }
