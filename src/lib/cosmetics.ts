export type CosmeticCategory = "frame" | "background" | "effect" | "emoji";

const FRAME_STYLES: Record<string, { border: string; glow: string; className: string }> = {
  frame_neon_blue: {
    border: "3px solid #3b82f6",
    glow: "0 0 20px rgba(59,130,246,0.6), 0 0 40px rgba(59,130,246,0.3)",
    className: "frame-neon-blue ring-[3px] ring-blue-500/70 shadow-[0_0_20px_rgba(59,130,246,0.5),0_0_40px_rgba(59,130,246,0.2)]",
  },
  frame_neon_purple: {
    border: "3px solid #a855f7",
    glow: "0 0 20px rgba(168,85,247,0.6), 0 0 40px rgba(168,85,247,0.3)",
    className: "frame-neon-purple ring-[3px] ring-purple-500/70 shadow-[0_0_20px_rgba(168,85,247,0.5),0_0_40px_rgba(168,85,247,0.2)]",
  },
  frame_gold: {
    border: "3px solid #eab308",
    glow: "0 0 20px rgba(234,179,8,0.6), 0 0 40px rgba(234,179,8,0.3)",
    className: "frame-gold ring-[3px] ring-yellow-500/70 shadow-[0_0_20px_rgba(234,179,8,0.5),0_0_40px_rgba(234,179,8,0.2)]",
  },
  frame_diamond: {
    border: "3px solid #06b6d4",
    glow: "0 0 24px rgba(6,182,212,0.6), 0 0 48px rgba(6,182,212,0.3)",
    className: "frame-diamond ring-[3px] ring-cyan-400/70 shadow-[0_0_24px_rgba(6,182,212,0.5),0_0_48px_rgba(6,182,212,0.2)]",
  },
  frame_crimson: {
    border: "3px solid #ef4444",
    glow: "0 0 20px rgba(239,68,68,0.6), 0 0 40px rgba(239,68,68,0.3)",
    className: "frame-crimson ring-[3px] ring-red-500/70 shadow-[0_0_20px_rgba(239,68,68,0.5),0_0_40px_rgba(239,68,68,0.2)]",
  },
  frame_holographic: {
    border: "3px solid transparent",
    glow: "0 0 28px rgba(168,85,247,0.4), 0 0 56px rgba(59,130,246,0.3)",
    className: "frame-holographic ring-[3px] ring-transparent shadow-[0_0_28px_rgba(168,85,247,0.4),0_0_56px_rgba(59,130,246,0.2)]",
  },
};

const EFFECT_CLASSES: Record<string, string> = {
  effect_glow: "drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]",
  effect_fire: "text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-yellow-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]",
  effect_electric: "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse",
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
