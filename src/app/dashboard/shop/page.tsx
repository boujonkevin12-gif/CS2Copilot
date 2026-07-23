"use client";

import { useGamification } from "@/lib/gamification-context";
import { ShoppingBag, CheckCircle, Crown, Sparkles, Palette, Award, Smile } from "lucide-react";
import { useState, useEffect } from "react";

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
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ShoppingBag className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Tienda del Piloto</h1>
          <p className="text-sm text-muted">Personalizá tu perfil con cosméticos</p>
        </div>
        <div className="ml-auto glass rounded-xl px-4 py-2 flex items-center gap-2">
          <span className="text-xs">🪙</span>
          <span className="text-sm font-bold text-accent">{profile?.pilot_coins.toLocaleString() || "0"}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
            selectedCategory === "all" ? "bg-primary text-white" : "bg-white/[0.04] text-muted hover:bg-white/[0.08]"
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
                selectedCategory === cat ? "bg-primary text-white" : "bg-white/[0.04] text-muted hover:bg-white/[0.08]"
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
          return (
            <div
              key={item.id}
              className={`glass-strong rounded-xl p-4 transition-all ${
                item.owned ? "border border-primary/30" : !canAfford || !levelOk ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{item.name}</h3>
                    <p className="text-[10px] text-muted">{categoryLabels[item.category] || item.category}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted mb-2">{item.desc}</p>

              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${rarityColors[item.rarity]}`}>
                  {item.rarity === "legendary" ? "Legendario" : item.rarity === "epic" ? "Épico" : item.rarity === "rare" ? "Raro" : "Común"}
                </span>
                <span className="text-[10px] text-muted">Nv. {item.levelReq} req.</span>
              </div>

              <div className="pt-3 border-t border-white/[0.06]">
                {item.owned ? (
                  <div className="flex items-center gap-2">
                    {item.equipped ? (
                      <span className="text-[10px] text-primary font-medium flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Equipado
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEquip(item.id)}
                        className="text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Equipar
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuy(item.id)}
                    disabled={buying === item.id || !canAfford || !levelOk}
                    className="w-full text-[10px] font-bold text-white bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-30 px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5"
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
          );
        })}
      </div>
    </div>
  );
}
