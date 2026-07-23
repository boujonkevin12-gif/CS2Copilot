"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, CheckCircle2, AlertCircle, Loader2, Sun, Moon, Monitor } from "lucide-react";

interface AppearanceConfig {
  theme: string;
  primaryColor: string;
  uiScale: number;
  animations: boolean;
  blur: boolean;
  density: string;
}

const DEFAULTS: AppearanceConfig = { theme: "dark", primaryColor: "#8b5cf6", uiScale: 100, animations: true, blur: true, density: "comfortable" };

const THEMES = [
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "light", label: "Claro", icon: Sun },
  { value: "system", label: "Sistema", icon: Monitor },
];

const DENSITIES = [
  { value: "compact", label: "Compacta" },
  { value: "comfortable", label: "Cómoda" },
  { value: "spacious", label: "Espaciosa" },
];

const COLORS = [
  { value: "#8b5cf6", label: "Violeta" },
  { value: "#6366f1", label: "Índigo" },
  { value: "#3b82f6", label: "Azul" },
  { value: "#06b6d4", label: "Cian" },
  { value: "#22c55e", label: "Verde" },
  { value: "#f97316", label: "Naranja" },
  { value: "#ef4444", label: "Rojo" },
  { value: "#ec4899", label: "Rosa" },
];

export default function AppearanceSettings() {
  const router = useRouter();
  const [config, setConfig] = useState<AppearanceConfig>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/user/settings").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.preferences?.appearance) setConfig({ ...DEFAULTS, ...d.preferences.appearance });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", config.primaryColor);
  }, [config.primaryColor]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appearance: config }) });
      if (!res.ok) throw new Error();
      showToast("success", "Apariencia guardada");
    } catch {
      showToast("error", "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="h-9 w-9 rounded-xl bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-all cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Apariencia</h1>
          <p className="text-sm text-muted">Personaliza el aspecto de tu panel</p>
        </div>
      </div>

      {toast && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${toast.type === "success" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </motion.div>
      )}

      <GlassCard padding="lg" hover={false}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">Tema</label>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.value} onClick={() => setConfig(prev => ({ ...prev, theme: t.value }))} className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${config.theme === t.value ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/[0.04] text-muted border border-white/[0.06] hover:bg-white/[0.08]"}`}>
                    <Icon className="h-5 w-5" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Color principal</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button key={c.value} onClick={() => setConfig(prev => ({ ...prev, primaryColor: c.value }))} className={`h-8 w-8 rounded-lg transition-all cursor-pointer ${config.primaryColor === c.value ? "ring-2 ring-white ring-offset-1 ring-offset-background scale-110" : ""}`} style={{ backgroundColor: c.value }} title={c.label} />
              ))}
              <input type="color" value={config.primaryColor} onChange={e => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))} className="h-8 w-8 rounded-lg cursor-pointer border-0 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Tamaño de interfaz: {config.uiScale}%</label>
            <input type="range" min="80" max="120" step="5" value={config.uiScale} onChange={e => setConfig(prev => ({ ...prev, uiScale: parseInt(e.target.value) }))} className="w-full h-1.5 rounded-full appearance-none bg-white/[0.1] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Densidad de interfaz</label>
            <div className="grid grid-cols-3 gap-2">
              {DENSITIES.map(d => (
                <button key={d.value} onClick={() => setConfig(prev => ({ ...prev, density: d.value }))} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${config.density === d.value ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/[0.04] text-muted border border-white/[0.06] hover:bg-white/[0.08]"}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Animaciones</div>
              <div className="text-xs text-muted">Transiciones y efectos visuales</div>
            </div>
            <button onClick={() => setConfig(prev => ({ ...prev, animations: !prev.animations }))} className={`relative h-6 w-10 rounded-full transition-all ${config.animations ? "bg-primary" : "bg-white/[0.1]"}`}>
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${config.animations ? "left-[18px]" : "left-0.5"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Fondo con blur</div>
              <div className="text-xs text-muted">Efecto de desenfoque en tarjetas</div>
            </div>
            <button onClick={() => setConfig(prev => ({ ...prev, blur: !prev.blur }))} className={`relative h-6 w-10 rounded-full transition-all ${config.blur ? "bg-primary" : "bg-white/[0.1]"}`}>
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${config.blur ? "left-[18px]" : "left-0.5"}`} />
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={handleSave} disabled={saving} icon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
