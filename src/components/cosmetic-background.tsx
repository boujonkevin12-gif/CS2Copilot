"use client";

import { ReactNode } from "react";

const BG_CONFIG: Record<string, {
  gradient: string;
  className: string;
  overlay?: string;
  pseudo?: string;
}> = {
  bg_mirage: {
    gradient: "linear-gradient(135deg, #92400e44, #f59e0b22, #b4530944, #78350f22)",
    className: "bg-mirage-anim",
  },
  bg_inferno: {
    gradient: "linear-gradient(180deg, #991b1b44, #ef444433, #f9731622, #991b1b44)",
    className: "bg-inferno-anim",
  },
  bg_dust2: {
    gradient: "linear-gradient(160deg, #78350f33, #d9770622, #92400e33)",
    className: "bg-dust2-anim",
  },
  bg_anubis: {
    gradient: "linear-gradient(135deg, #07598533, #0ea5e922, #06b6d433, #0369a122)",
    className: "bg-anubis-anim",
  },
  bg_galaxy: {
    gradient: "linear-gradient(135deg, #1e1b4b44, #4338ca33, #6366f122, #1e1b4b44)",
    className: "bg-galaxy-anim",
  },
  bg_cyberpunk: {
    gradient: "linear-gradient(180deg, #0a0a0a00, #ec489922, #0a0a0a00)",
    className: "bg-cyberpunk-anim",
  },
  bg_matrix: {
    gradient: "linear-gradient(180deg, #052e1633, #22c55e11, #052e1633)",
    className: "bg-matrix-anim",
  },
  bg_purple_smoke: {
    gradient: "linear-gradient(135deg, #2e106533, #8b5cf622, #a855f722, #2e106533)",
    className: "bg-purple-smoke-anim",
  },
};

export function getBackgroundConfig(bgId: string | null | undefined) {
  if (!bgId) return null;
  return BG_CONFIG[bgId] || null;
}

export function CosmeticBackground({ bgId, children }: { bgId: string | null | undefined; children: ReactNode }) {
  const config = bgId ? BG_CONFIG[bgId] : null;
  if (!config) return <>{children}</>;

  return (
    <div className={`relative overflow-hidden rounded-2xl ${config.className}`}>
      <div
        className="absolute inset-0 opacity-100 rounded-2xl"
        style={{ background: config.gradient }}
      />
      {config.overlay && (
        <div className={`absolute inset-0 rounded-2xl ${config.overlay}`} />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
