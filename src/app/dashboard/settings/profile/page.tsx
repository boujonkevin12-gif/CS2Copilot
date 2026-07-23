"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/user-context";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const COUNTRIES = [
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "BR", name: "Brasil", flag: "🇧🇷" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "ES", name: "España", flag: "🇪🇸" },
  { code: "MX", name: "México", flag: "🇲🇽" },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
  { code: "PE", name: "Perú", flag: "🇵🇪" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
];

const LANGUAGES = [
  { code: "es", name: "Español" },
  { code: "en", name: "English" },
  { code: "pt", name: "Português" },
];

export default function ProfileSettings() {
  const { user } = useUser();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState(user?.country || "");
  const [language, setLanguage] = useState("es");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");

  useEffect(() => {
    fetch("/api/user/settings").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.preferences) {
        setBio(d.preferences.bio || "");
        setLanguage(d.preferences.language || "es");
      }
    }).catch(() => {});
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!name.trim()) { showToast("error", "El nombre no puede estar vacío"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, language }),
      });
      if (!res.ok) throw new Error();
      showToast("success", "Perfil actualizado correctamente");
    } catch {
      showToast("error", "Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="h-9 w-9 rounded-xl bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-all cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Perfil</h1>
          <p className="text-sm text-muted">Administra tu información pública</p>
        </div>
      </div>

      {toast && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${toast.type === "success" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </motion.div>
      )}

      <GlassCard padding="lg" hover={false}>
        <div className="space-y-5">
          <div className="flex items-center gap-5">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-16 w-16 rounded-2xl object-cover" />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-xl font-bold text-white">
                {(name || "U").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Avatar</label>
              <p className="text-xs text-muted mb-2">URL de la imagen de perfil</p>
              <input type="text" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." className="w-full h-9 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Nombre de usuario</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full h-10 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Biografía</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Cuéntanos sobre ti..." className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">País</label>
              <select value={country} onChange={e => setCountry(e.target.value)} className="w-full h-10 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Seleccionar país</option>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Idioma</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full h-10 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </div>
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
