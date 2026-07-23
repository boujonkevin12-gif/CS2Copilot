"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, CheckCircle2, AlertCircle, Loader2, Bell, Mail, Smartphone, BellRing } from "lucide-react";

interface NotificationsConfig {
  emailAnalysis: boolean;
  emailRank: boolean;
  emailNews: boolean;
  pushAnalysisComplete: boolean;
  pushFriendsOnline: boolean;
  pushUpdates: boolean;
  inAppMessages: boolean;
  inAppAchievements: boolean;
  inAppRewards: boolean;
}

const DEFAULTS: NotificationsConfig = { emailAnalysis: true, emailRank: true, emailNews: false, pushAnalysisComplete: true, pushFriendsOnline: true, pushUpdates: false, inAppMessages: true, inAppAchievements: true, inAppRewards: true };

const GROUPS = [
  {
    title: "Email",
    icon: Mail,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    keys: [
      { key: "emailAnalysis" as keyof NotificationsConfig, label: "Nuevos análisis" },
      { key: "emailRank" as keyof NotificationsConfig, label: "Cambios de rango" },
      { key: "emailNews" as keyof NotificationsConfig, label: "Noticias" },
    ],
  },
  {
    title: "Push",
    icon: Smartphone,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    keys: [
      { key: "pushAnalysisComplete" as keyof NotificationsConfig, label: "Finalización de análisis" },
      { key: "pushFriendsOnline" as keyof NotificationsConfig, label: "Amigos conectados" },
      { key: "pushUpdates" as keyof NotificationsConfig, label: "Actualizaciones" },
    ],
  },
  {
    title: "In-App",
    icon: BellRing,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    keys: [
      { key: "inAppMessages" as keyof NotificationsConfig, label: "Mensajes" },
      { key: "inAppAchievements" as keyof NotificationsConfig, label: "Logros" },
      { key: "inAppRewards" as keyof NotificationsConfig, label: "Recompensas" },
    ],
  },
];

export default function NotificationsSettings() {
  const router = useRouter();
  const [config, setConfig] = useState<NotificationsConfig>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/user/settings").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.preferences?.notifications) setConfig({ ...DEFAULTS, ...d.preferences.notifications });
    }).catch(() => {});
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notifications: config }) });
      if (!res.ok) throw new Error();
      showToast("success", "Preferencias guardadas");
    } catch {
      showToast("error", "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: keyof NotificationsConfig) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    setTimeout(() => handleSave(), 100);
  };

  if (saving) setTimeout(() => {}, 0);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="h-9 w-9 rounded-xl bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-all cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Notificaciones</h1>
          <p className="text-sm text-muted">Controla tus preferencias de notificaciones</p>
        </div>
      </div>

      {toast && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${toast.type === "success" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </motion.div>
      )}

      <div className="space-y-3">
        {GROUPS.map((group) => (
          <motion.div key={group.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard padding="md" hover={false}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-9 w-9 rounded-xl ${group.bg} flex items-center justify-center`}>
                  <group.icon className={`h-4 w-4 ${group.color}`} />
                </div>
                <h3 className="text-sm font-semibold">{group.title}</h3>
              </div>
              <div className="space-y-3">
                {group.keys.map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm">{label}</div>
                      <div className="text-xs text-muted">Recibir notificaciones por {group.title.toLowerCase()}</div>
                    </div>
                    <button onClick={() => toggle(key)} className={`relative h-6 w-10 rounded-full transition-all shrink-0 ${config[key] ? "bg-primary" : "bg-white/[0.1]"}`}>
                      <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${config[key] ? "left-[18px]" : "left-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
