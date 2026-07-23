"use client";

import { useGamification } from "@/lib/gamification-context";
import { Trophy, Lock, CheckCircle, Zap, Flame, Star } from "lucide-react";
import Link from "next/link";

const rarityColors: Record<string, string> = {
  common: "from-gray-400 to-gray-500",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 to-amber-600",
};

const rarityBorders: Record<string, string> = {
  common: "border-gray-500/30",
  rare: "border-blue-500/30",
  epic: "border-purple-500/30",
  legendary: "border-yellow-500/30",
};

const rarityLabels: Record<string, string> = {
  common: "Común",
  rare: "Raro",
  epic: "Épico",
  legendary: "Legendario",
};

const categoryLabels: Record<string, string> = {
  combate: "Combate",
  "precisión": "Precisión",
  clutch: "Clutch",
  arma: "Arma",
  objetivo: "Objetivo",
  tiempo: "Tiempo",
  login: "Login",
  progreso: "Progreso",
  exploración: "Exploración",
  faceit: "FACEIT",
  premier: "Premier",
};

export default function AchievementsPage() {
  const { achievements, profile, loading } = useGamification();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);
  const categories = [...new Set(achievements.map((a) => a.category))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Trophy className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Vitrina de Logros</h1>
          <p className="text-sm text-muted">Completá objetivos para desbloquear recompensas</p>
        </div>
        <div className="ml-auto glass rounded-xl px-4 py-2 flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{unlocked.length}</div>
            <div className="text-[10px] text-muted">Desbloqueados</div>
          </div>
          <div className="w-px h-8 bg-white/[0.06]" />
          <div className="text-center">
            <div className="text-lg font-bold">{achievements.length}</div>
            <div className="text-[10px] text-muted">Total</div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {profile && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Kills", value: profile.total_kills.toLocaleString(), icon: "💀" },
            { label: "Wins", value: profile.total_wins.toLocaleString(), icon: "🏆" },
            { label: "Headshots", value: profile.total_headshots.toLocaleString(), icon: "🎯" },
            { label: "MVPs", value: profile.total_mvps.toLocaleString(), icon: "⭐" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-3 text-center">
              <div className="text-lg mb-1">{s.icon}</div>
              <div className="text-lg font-bold font-mono">{s.value}</div>
              <div className="text-[10px] text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Categories */}
      {categories.map((cat) => {
        const catAchievements = achievements.filter((a) => a.category === cat);
        const catUnlocked = catAchievements.filter((a) => a.unlocked).length;
        return (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold">{categoryLabels[cat] || cat}</h2>
              <span className="text-[10px] text-muted bg-white/[0.04] px-2 py-0.5 rounded-full">
                {catUnlocked}/{catAchievements.length}
              </span>
            </div>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {catAchievements.map((a) => {
                const pct = a.target > 0 ? Math.min(100, (a.progress / a.target) * 100) : 0;
                return (
                  <div
                    key={a.id}
                    className={`glass-strong rounded-xl p-4 transition-all ${
                      a.unlocked ? rarityBorders[a.rarity] + " border" : "opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${rarityColors[a.rarity]} flex items-center justify-center shrink-0 text-xl`}>
                        {a.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold truncate">{a.name}</h3>
                          {a.unlocked && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-muted mt-0.5">{a.desc}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${
                            a.rarity === "legendary" ? "bg-yellow-500/10 text-yellow-500" :
                            a.rarity === "epic" ? "bg-purple-500/10 text-purple-500" :
                            a.rarity === "rare" ? "bg-blue-500/10 text-blue-500" :
                            "bg-white/[0.04] text-muted"
                          }`}>
                            {rarityLabels[a.rarity]}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-muted">
                          {a.progress.toLocaleString()} / {a.target.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-primary">{Math.round(pct)}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${rarityColors[a.rarity]} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Rewards */}
                    <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                      <span className="text-[10px] text-primary font-medium">+{a.xp} XP</span>
                      <span className="text-[10px] text-accent font-medium">🪙 +{a.coins}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Navigation */}
      <div className="flex justify-center gap-3 pt-4">
        <Link href="/dashboard/challenges" className="glass rounded-xl px-4 py-2 text-sm font-medium hover:bg-white/[0.06] transition-all">
          Desafíos →
        </Link>
        <Link href="/dashboard/shop" className="glass rounded-xl px-4 py-2 text-sm font-medium hover:bg-white/[0.06] transition-all">
          Tienda →
        </Link>
      </div>
    </div>
  );
}
