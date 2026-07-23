export type CosmeticCategory = "frame" | "background" | "effect" | "emoji";

const FRAME_STYLES: Record<string, { border: string; glow: string; className: string }> = {
  frame_neon_blue: {
    border: "2px solid #3b82f6",
    glow: "0 0 12px rgba(59,130,246,0.6), 0 0 24px rgba(59,130,246,0.3)",
    className: "ring-2 ring-blue-500/60 shadow-[0_0_12px_rgba(59,130,246,0.5)]",
  },
  frame_neon_purple: {
    border: "2px solid #a855f7",
    glow: "0 0 12px rgba(168,85,247,0.6), 0 0 24px rgba(168,85,247,0.3)",
    className: "ring-2 ring-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.5)]",
  },
  frame_gold: {
    border: "2px solid #eab308",
    glow: "0 0 12px rgba(234,179,8,0.6), 0 0 24px rgba(234,179,8,0.3)",
    className: "ring-2 ring-yellow-500/60 shadow-[0_0_12px_rgba(234,179,8,0.5)]",
  },
  frame_diamond: {
    border: "2px solid #06b6d4",
    glow: "0 0 14px rgba(6,182,212,0.6), 0 0 28px rgba(6,182,212,0.3)",
    className: "ring-2 ring-cyan-400/60 shadow-[0_0_14px_rgba(6,182,212,0.5)]",
  },
  frame_crimson: {
    border: "2px solid #ef4444",
    glow: "0 0 12px rgba(239,68,68,0.6), 0 0 24px rgba(239,68,68,0.3)",
    className: "ring-2 ring-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.5)]",
  },
  frame_holographic: {
    border: "2px solid transparent",
    glow: "0 0 16px rgba(168,85,247,0.4), 0 0 32px rgba(59,130,246,0.3)",
    className: "ring-2 ring-transparent shadow-[0_0_16px_rgba(168,85,247,0.4)] animate-pulse",
  },
};

const EFFECT_CLASSES: Record<string, string> = {
  effect_glow: "drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]",
  effect_fire: "text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-yellow-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]",
  effect_electric: "text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)] animate-pulse",
  effect_holographic: "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-[length:200%_100%] animate-[holographic_3s_linear_infinite]",
};

const EMOJI_MAP: Record<string, string> = {
  emoji_fire: "🔥",
  emoji_skull: "💀",
  emoji_crown: "👑",
  emoji_lightning: "⚡",
  emoji_diamond: "💎",
  emoji_star: "⭐",
};

export function getEffectClass(effectId: string | null | undefined): string {
  if (!effectId) return "";
  return EFFECT_CLASSES[effectId] || "";
}

export function getEmoji(emojiId: string | null | undefined): string {
  if (!emojiId) return "";
  return EMOJI_MAP[emojiId] || "";
}

export function getFrameClasses(frameId: string | null | undefined): string {
  if (!frameId) return "";
  return FRAME_STYLES[frameId]?.className || "";
}
