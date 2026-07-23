"use client";

import { ReactNode } from "react";

const BG_CONFIG: Record<string, {
  gradient: string;
  className: string;
}> = {
  // Original 8
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
  // Premium 12
  bg_purple_particles: {
    gradient: "linear-gradient(135deg, #08000d, #0d0018, #08000d)",
    className: "bg-purple-particles",
  },
  bg_futuristic_grid: {
    gradient: "linear-gradient(180deg, #050510, #0a0a20, #050510)",
    className: "bg-futuristic-grid",
  },
  bg_cs2_radar: {
    gradient: "linear-gradient(180deg, #000a08, #00100c, #000a08)",
    className: "bg-cs2-radar",
  },
  bg_cs_smoke: {
    gradient: "linear-gradient(135deg, #080808, #0d0d0d, #080808)",
    className: "bg-cs-smoke",
  },
  bg_topographic: {
    gradient: "linear-gradient(160deg, #050510, #0a0720, #050510)",
    className: "bg-topographic",
  },
  bg_wireframe: {
    gradient: "linear-gradient(180deg, #030308, #08081a, #030308)",
    className: "bg-wireframe",
  },
  bg_data_stream: {
    gradient: "linear-gradient(180deg, #05080a, #080d12, #05080a)",
    className: "bg-data-stream",
  },
  bg_constellation: {
    gradient: "linear-gradient(135deg, #03050a, #080818, #03050a)",
    className: "bg-constellation",
  },
  bg_hexagons: {
    gradient: "linear-gradient(135deg, #050510, #0a0820, #050510)",
    className: "bg-hexagons",
  },
  bg_aurora: {
    gradient: "linear-gradient(180deg, #050510, #080820, #050510)",
    className: "bg-aurora",
  },
  bg_crystals: {
    gradient: "linear-gradient(135deg, #03030a, #08081a, #03030a)",
    className: "bg-crystals",
  },
  bg_living_gradient: {
    gradient: "linear-gradient(135deg, #080008, #0a0015, #050015, #080008)",
    className: "bg-living-gradient",
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
