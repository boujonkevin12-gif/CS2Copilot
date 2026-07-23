"use client";

import { ReactNode } from "react";

const BG_CONFIG: Record<string, {
  gradient: string;
  className: string;
}> = {
  bg_mirage: {
    gradient: "linear-gradient(135deg, #1a0f00, #0d0800, #1a0f00)",
    className: "bg-mirage-anim",
  },
  bg_inferno: {
    gradient: "linear-gradient(180deg, #0a0000, #1a0505, #0a0000)",
    className: "bg-inferno-anim",
  },
  bg_dust2: {
    gradient: "linear-gradient(160deg, #1a1005, #0d0a03, #1a1005)",
    className: "bg-dust2-anim",
  },
  bg_anubis: {
    gradient: "linear-gradient(180deg, #001015, #050a10, #001015)",
    className: "bg-anubis-anim",
  },
  bg_galaxy: {
    gradient: "linear-gradient(135deg, #05000d, #0a0020, #05000d)",
    className: "bg-galaxy-anim",
  },
  bg_cyberpunk: {
    gradient: "linear-gradient(180deg, #05000a, #0a0015, #05000a)",
    className: "bg-cyberpunk-anim",
  },
  bg_matrix: {
    gradient: "linear-gradient(180deg, #000a00, #001200, #000a00)",
    className: "bg-matrix-anim",
  },
  bg_purple_smoke: {
    gradient: "linear-gradient(135deg, #0a0015, #100020, #0a0015)",
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
        className="absolute inset-0 rounded-2xl"
        style={{ background: config.gradient }}
      />
      <div className="bg-layer-1" />
      <div className="bg-layer-2" />
      <div className="bg-layer-3" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
