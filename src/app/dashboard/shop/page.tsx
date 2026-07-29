"use client";

import { useGamification } from "@/lib/gamification-context";
import { ShoppingBag, CheckCircle, Crown, Sparkles, Palette, Award, Smile, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { getEmoji, getFrameImageConfig } from "@/lib/cosmetics";
import { getBackgroundConfig } from "@/components/cosmetic-background";
import { PageHeader } from "@/components/ui/page-header";

const categoryIcons: Record<string, any> = {
  frame: Crown,
  background: Sparkles,
  title: Award,
  effect: Palette,
  emoji: Smile,
};

const categoryLabels: Record<string, string> = {
  frame: "Marcos",
  background: "Fondos",
  title: "Títulos",
  effect: "Efectos",
  emoji: "Emojis",
};

const rarityColors: Record<string, string> = {
  common: "bg-gray-500/10 text-gray-400",
  rare: "bg-blue-500/10 text-blue-400",
  epic: "bg-purple-500/10 text-purple-400",
  legendary: "bg-yellow-500/10 text-yellow-400",
};

const rarityGlow: Record<string, string> = {
  common: "",
  rare: "hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
  epic: "hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]",
  legendary: "hover:shadow-[0_0_25px_rgba(234,179,8,0.25)]",
};

const framePreviewClasses: Record<string, { ring: string; glow: string; frameClass: string; icon: string }> = {
  frame_1: { ring: "ring-emerald-500/50", glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]", frameClass: "", icon: "text-emerald-300" },
  frame_2: { ring: "ring-amber-500/50", glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]", frameClass: "", icon: "text-amber-300" },
  frame_3: { ring: "ring-rose-500/50", glow: "shadow-[0_0_20px_rgba(244,63,94,0.3)]", frameClass: "", icon: "text-rose-300" },
  frame_4: { ring: "ring-purple-500/50", glow: "shadow-[0_0_20px_rgba(168,85,247,0.3)]", frameClass: "", icon: "text-purple-300" },
  frame_5: { ring: "ring-blue-500/50", glow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]", frameClass: "", icon: "text-blue-300" },
  frame_6: { ring: "ring-violet-500/60", glow: "shadow-[0_0_24px_rgba(139,92,246,0.4)]", frameClass: "", icon: "text-violet-300" },
  frame_7: { ring: "ring-cyan-500/50", glow: "shadow-[0_0_20px_rgba(6,182,212,0.3)]", frameClass: "", icon: "text-cyan-300" },
  frame_8: { ring: "ring-yellow-500/50", glow: "shadow-[0_0_20px_rgba(234,179,8,0.3)]", frameClass: "", icon: "text-yellow-300" },
  frame_9: { ring: "ring-pink-500/50", glow: "shadow-[0_0_20px_rgba(236,72,153,0.3)]", frameClass: "", icon: "text-pink-300" },
};

const effectStyles: Record<string, { text: string; glow: string }> = {
  effect_glow: { text: "text-white", glow: "drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" },
  effect_fire: { text: "text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-yellow-400", glow: "drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]" },
  effect_electric: { text: "text-cyan-400", glow: "drop-shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse" },
  effect_holographic: { text: "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-[length:200%_100%] animate-[holographic_3s_linear_infinite]", glow: "" },
};

function AvatarPlaceholder({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className || "w-10 h-10 text-white/30"}>
      <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z" fill="currentColor" opacity="0.35" />
      <path d="M12 14c-5 0-8 2.5-8 5v1h16v-1c0-2.5-3-5-8-5z" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

function FramePreview({ itemId }: { itemId: string }) {
  const fc = framePreviewClasses[itemId];
  const imgConfig = getFrameImageConfig(itemId);
  if (imgConfig) {
    const isPng = imgConfig.src.endsWith(".png");
    if (isPng) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="relative">
            <div className="relative z-10 w-[72px] h-[72px] rounded-full overflow-hidden bg-gradient-to-br from-white/10 to-white/[0.03] flex items-center justify-center ring-2 ring-white/10 shadow-lg">
              <AvatarPlaceholder className={`w-9 h-9 ${fc?.icon || "text-white/30"}`} />
            </div>
            {imgConfig.type === "video" ? (
              <video className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-full" src={imgConfig.src} autoPlay loop muted playsInline />
            ) : (
              <img className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-full" src={imgConfig.src} alt="" />
            )}
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center h-full">
        <div className="relative">
          <div
            className="absolute rounded-full overflow-hidden"
            style={{ top: "-8%", left: "-8%", right: "-8%", bottom: "-8%" }}
          >
            {imgConfig.type === "video" ? (
              <video className="w-full h-full object-cover" src={imgConfig.src} autoPlay loop muted playsInline />
            ) : (
              <img className="w-full h-full object-cover" src={imgConfig.src} alt="" />
            )}
          </div>
          <div className="relative z-10 w-[72px] h-[72px] rounded-full overflow-hidden bg-gradient-to-br from-white/10 to-white/[0.03] flex items-center justify-center ring-2 ring-white/10 shadow-lg">
            <AvatarPlaceholder className={`w-9 h-9 ${fc?.icon || "text-white/30"}`} />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center h-full">
      <div className={`relative ${fc?.frameClass || ""}`}>
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-white/10 to-white/[0.03] ring-4 ${fc?.ring || ""} ${fc?.glow || ""} flex items-center justify-center transition-all duration-300`}>
          <AvatarPlaceholder className={`w-10 h-10 ${fc?.icon || "text-white/30"}`} />
        </div>
      </div>
    </div>
  );
}

function BackgroundPreview({ itemId }: { itemId: string }) {
  const config = getBackgroundConfig(itemId);
  if (!config) return <EmptyPreview />;
  if (config.video) {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <video className="absolute inset-0 w-full h-full object-cover" src={config.video} autoPlay loop muted playsInline />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Sparkles className="h-8 w-8 text-white/20" />
        </div>
      </div>
    );
  }
  if (config.image) {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${config.image})` }} />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Sparkles className="h-8 w-8 text-white/20" />
        </div>
      </div>
    );
  }
  return (
    <div className={`w-full h-full relative overflow-hidden ${config.className}`}>
      <div className="absolute inset-0" style={{ background: config.gradient }} />
      <div className="bg-layer-1" />
      <div className="bg-layer-2" />
      <div className="bg-layer-3" />
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Sparkles className="h-8 w-8 text-white/20" />
      </div>
    </div>
  );
}

function EmojiPreview({ itemId }: { itemId: string }) {
  const emoji = getEmoji(itemId);
  return (
    <div className="flex items-center justify-center h-full group/ep">
      <span className="text-6xl transition-all duration-300 group-hover/ep:scale-125 group-hover/ep:drop-shadow-[0_0_14px_rgba(168,85,247,0.6)]">
        {emoji}
      </span>
    </div>
  );
}

function EffectPreview({ itemId }: { itemId: string }) {
  const ec = effectStyles[itemId];
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <span className={`text-2xl font-black tracking-wide ${ec?.text || "text-white/40"} ${ec?.glow || ""}`}>
        PLAYER
      </span>
      <div className="flex items-center gap-1.5">
        <span className="h-px w-3 bg-white/15" />
        <span className="text-[9px] text-white/25 uppercase tracking-widest font-medium">Efecto</span>
        <span className="h-px w-3 bg-white/15" />
      </div>
    </div>
  );
}

function TitlePreview({ itemId }: { itemId: string }) {
  const titleName = itemId.replace("title_", "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white/10 to-white/[0.03] flex items-center justify-center">
        <AvatarPlaceholder className="w-7 h-7 text-white/30" />
      </div>
      <div className="text-center px-3">
        <span className="text-xs font-bold text-violet-400/80 border border-violet-400/20 rounded-full px-3 py-1 bg-violet-500/5">
          {titleName}
        </span>
      </div>
    </div>
  );
}

function EmptyPreview() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-white/20">
      <Eye className="h-6 w-6" />
      <span className="text-[10px] text-center leading-tight">Vista previa<br />próximamente</span>
    </div>
  );
}

function ShopPreview({ category, itemId }: { category: string; itemId: string }) {
  switch (category) {
    case "frame": return <FramePreview itemId={itemId} />;
    case "background": return <BackgroundPreview itemId={itemId} />;
    case "emoji": return <EmojiPreview itemId={itemId} />;
    case "effect": return <EffectPreview itemId={itemId} />;
    case "title": return <TitlePreview itemId={itemId} />;
    default: return <EmptyPreview />;
  }
}

export default function ShopPage() {
  const { profile, refreshProfile } = useGamification();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetch("/api/gamification/shop")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleBuy = async (itemId: string) => {
    setBuying(itemId);
    try {
      const res = await fetch("/api/gamification/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      if (res.ok) {
        await refreshProfile();
        setItems((prev) => prev.map((item) => item.id === itemId ? { ...item, owned: true } : item));
      }
    } finally {
      setBuying(null);
    }
  };

  const handleEquip = async (itemId: string) => {
    await fetch("/api/gamification/shop/equip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    await refreshProfile();
    const shopRes = await fetch("/api/gamification/shop");
    const shopData = await shopRes.json();
    setItems(shopData.items || []);
  };

  const categories = [...new Set(items.map((i) => i.category))];
  const filtered = selectedCategory === "all" ? items : items.filter((i) => i.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={<ShoppingBag className="h-5 w-5 text-violet-400" />}
        title="Tienda del Piloto"
        description="Personalizá tu perfil con cosméticos"
        actions={
          <div className="rounded-xl border border-[rgba(169,149,255,0.12)] bg-gradient-to-br from-[rgba(20,20,37,0.94)] to-[rgba(10,11,22,0.9)] shadow-[inset_0_1px_0_rgba(255,255,255,.025),0_12px_35px_rgba(0,0,0,.13)] px-4 py-2 flex items-center gap-2">
            <span className="text-xs">🪙</span>
            <span className="text-sm font-bold text-violet-400">{profile?.pilot_coins.toLocaleString() || "0"}</span>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
            selectedCategory === "all" ? "bg-violet-600 text-white" : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]"
          }`}
        >
          Todos ({items.length})
        </button>
        {categories.map((cat) => {
          const Icon = categoryIcons[cat] || ShoppingBag;
          const count = items.filter((i) => i.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                selectedCategory === cat ? "bg-violet-600 text-white" : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]"
              }`}
            >
              <Icon className="h-3 w-3" />
              {categoryLabels[cat] || cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item) => {
          const Icon = categoryIcons[item.category] || ShoppingBag;
          const canAfford = (profile?.pilot_coins || 0) >= item.price;
          const levelOk = (profile?.level || 0) >= item.levelReq;
          const isOwned = item.owned;
          const isEquipped = item.equipped;
          const glowClass = rarityGlow[item.rarity] || "";

          return (
            <div
              key={item.id}
              className={`rounded-xl overflow-hidden bg-gradient-to-br from-[rgba(20,20,37,0.94)] to-[rgba(10,11,22,0.9)] border border-white/[0.06] transition-all duration-300 hover:scale-[1.02] group/card ${glowClass} ${
                isOwned ? "border border-violet-500/30" : !canAfford || !levelOk ? "opacity-50" : ""
              }`}
            >
              {/* Preview Area */}
              <div className={`relative h-[170px] sm:h-[190px] bg-black/30 overflow-hidden ${
                item.category === "background" ? "" : "border-b border-white/[0.06]"
              }`}>
                <div className="absolute inset-0 transition-transform duration-300 group-hover/card:scale-105">
                  <ShopPreview category={item.category} itemId={item.id} />
                </div>
                <div className="absolute top-2 right-2 z-10">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full backdrop-blur-sm ${rarityColors[item.rarity]}`}>
                    {item.rarity === "legendary" ? "Legendario" : item.rarity === "epic" ? "Épico" : item.rarity === "rare" ? "Raro" : "Común"}
                  </span>
                </div>
                {isOwned && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 backdrop-blur-sm flex items-center gap-1">
                      <CheckCircle className="h-2.5 w-2.5" />
                      {isEquipped ? "Equipado" : "Comprado"}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-zinc-200 truncate">{item.name}</h3>
                    <p className="text-[10px] text-zinc-400 truncate">{item.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[10px] text-zinc-400">Nv. {item.levelReq} req.</span>
                </div>

                <div className="pt-2.5 border-t border-white/[0.06]">
                  {isOwned ? (
                    <div className="flex items-center gap-2">
                      {isEquipped ? (
                        <>
                          <span className="text-[10px] text-violet-400 font-medium flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Equipado
                          </span>
                          <button
                            onClick={() => handleEquip(`unequip_${item.category}`)}
                            className="text-[10px] text-zinc-400 hover:text-zinc-200 bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1.5 rounded-lg transition-all ml-auto"
                          >
                            Desequipar
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEquip(item.id)}
                          className="text-[10px] font-bold text-violet-400 bg-violet-500/20 hover:bg-violet-500/30 px-3 py-1.5 rounded-lg transition-all"
                        >
                          Equipar
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleBuy(item.id)}
                      disabled={buying === item.id || !canAfford || !levelOk}
                      className="w-full text-[10px] font-bold text-white bg-gradient-to-r from-violet-500 to-indigo-500 hover:opacity-90 disabled:opacity-30 px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      {buying === item.id ? (
                        <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>🪙</span> {item.price}
                          {!levelOk && ` · Nv. ${item.levelReq}`}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}