"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";

const POSITIONS = [
  { value: "top-left", label: "Arriba izquierda" },
  { value: "top-right", label: "Arriba derecha" },
  { value: "bottom-left", label: "Abajo izquierda" },
  { value: "bottom-right", label: "Abajo derecha" },
];

interface OverlayConfig {
  enabled: boolean;
  position: string;
  opacity: number;
  scale: number;
  showKd: boolean;
  showWinRate: boolean;
  showRating: boolean;
  showHs: boolean;
  showUtility: boolean;
  showAdr: boolean;
}

const DEFAULTS: OverlayConfig = { enabled: false, position: "top-right", opacity: 0.8, scale: 1, showKd: true, showWinRate: true, showRating: false, showHs: true, showUtility: false, showAdr: false };

export default function OverlaySettings() {
  const router = useRouter();
  const [config, setConfig] = useState<OverlayConfig>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/user/settings").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.preferences?.overlay) setConfig({ ...DEFAULTS, ...d.preferences.overlay });
    }).catch(() => {});
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overlay: config }),
      });
      if (!res.ok) throw new Error();
      showToast("success", "Configuración del overlay guardada");
    } catch {
      showToast("error", "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: keyof OverlayConfig) => setConfig(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="h-9 w-9 rounded-xl bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-all cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Overlay</h1>
          <p className="text-sm text-muted">Configura el overlay dentro del juego</p>
        </div>
      </div>

      {toast && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${toast.type === "success" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </motion.div>
      )}

      {/* Live Preview */}
      <GlassCard padding="md" hover={false}>
        <div className="flex items-center gap-2 mb-4">
          {config.enabled ? <Eye className="h-4 w-4 text-success" /> : <EyeOff className="h-4 w-4 text-muted" />}
          <h3 className="text-sm font-semibold">Vista previa</h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${config.enabled ? "bg-success/10 text-success" : "bg-white/[0.06] text-muted"}`}>
            {config.enabled ? "Visible" : "Oculto"}
          </span>
        </div>
        <div className="relative h-40 rounded-xl bg-black/60 overflow-hidden">
          <div
            className="absolute bg-black/80 rounded-lg border border-white/[0.15] p-2 text-[10px] font-mono leading-tight space-y-0.5 transition-all duration-300"
            style={{
              [config.position.includes("top") ? "top" : "bottom"]: "8px",
              [config.position.includes("left") ? "left" : "right"]: "8px",
              opacity: config.opacity,
              transform: `scale(${config.scale})`,
            }}
          >
            {config.showKd && <div className="text-white">K/D <span className="text-green-400">1.32</span></div>}
            {config.showWinRate && <div className="text-white">WR <span className="text-blue-400">58%</span></div>}
            {config.showRating && <div className="text-white">RAT <span className="text-yellow-400">1.15</span></div>}
            {config.showHs && <div className="text-white">HS <span className="text-orange-400">47%</span></div>}
            {config.showUtility && <div className="text-white">UTIL <span className="text-purple-400">82.3</span></div>}
            {config.showAdr && <div className="text-white">ADR <span className="text-red-400">85.6</span></div>}
          </div>
        </div>
      </GlassCard>

      <GlassCard padding="lg" hover={false}>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Activar Overlay</div>
              <div className="text-xs text-muted">Muestra estadísticas en tiempo real dentro del juego</div>
            </div>
            <button onClick={() => toggle("enabled")} className={`relative h-6 w-10 rounded-full transition-all ${config.enabled ? "bg-primary" : "bg-white/[0.1]"}`}>
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${config.enabled ? "left-[18px]" : "left-0.5"}`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Posición</label>
            <div className="grid grid-cols-2 gap-2">
              {POSITIONS.map(p => (
                <button key={p.value} onClick={() => setConfig(prev => ({ ...prev, position: p.value }))} className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${config.position === p.value ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/[0.04] text-muted border border-white/[0.06] hover:bg-white/[0.08]"}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Opacidad: {Math.round(config.opacity * 100)}%</label>
            <input type="range" min="0.1" max="1" step="0.05" value={config.opacity} onChange={e => setConfig(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))} className="w-full h-1.5 rounded-full appearance-none bg-white/[0.1] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Escala: {config.scale.toFixed(1)}x</label>
            <input type="range" min="0.5" max="1.5" step="0.1" value={config.scale} onChange={e => setConfig(prev => ({ ...prev, scale: parseFloat(e.target.value) }))} className="w-full h-1.5 rounded-full appearance-none bg-white/[0.1] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mostrar</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "showKd" as keyof OverlayConfig, label: "K/D" },
                { key: "showWinRate" as keyof OverlayConfig, label: "Win Rate" },
                { key: "showRating" as keyof OverlayConfig, label: "Rating" },
                { key: "showHs" as keyof OverlayConfig, label: "Headshot %" },
                { key: "showUtility" as keyof OverlayConfig, label: "Utilidad" },
                { key: "showAdr" as keyof OverlayConfig, label: "ADR" },
              ].map(item => (
                <button key={item.key} onClick={() => toggle(item.key)} className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${config[item.key] ? "bg-primary/15 text-primary border border-primary/20" : "bg-white/[0.04] text-muted border border-white/[0.06] hover:bg-white/[0.08]"}`}>
                  {item.label}
                  <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${config[item.key] ? "border-primary bg-primary" : "border-white/[0.2]"}`}>
                    {config[item.key] && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={handleSave} disabled={saving} icon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}>
              {saving ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
