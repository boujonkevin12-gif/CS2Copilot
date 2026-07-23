"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, CheckCircle2, AlertCircle, Loader2, Key, Trash2, Eye, LogOut, Smartphone, Lock } from "lucide-react";

interface PrivacyConfig {
  publicProfile: boolean;
  showStats: boolean;
  showHours: boolean;
  showInRankings: boolean;
}

const DEFAULTS: PrivacyConfig = { publicProfile: true, showStats: true, showHours: true, showInRankings: true };

export default function PrivacySettings() {
  const router = useRouter();
  const [config, setConfig] = useState<PrivacyConfig>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const [devices] = useState([
    { name: "Chrome en Windows", active: true },
    { name: "Edge en Windows", active: false },
    { name: "iPhone Safari", active: false },
  ]);

  useEffect(() => {
    fetch("/api/user/settings").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.preferences?.privacy) setConfig({ ...DEFAULTS, ...d.preferences.privacy });
    }).catch(() => {});
  }, []);

  const showToastMsg = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSavePrivacy = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ privacy: config }) });
      if (!res.ok) throw new Error();
      showToastMsg("success", "Privacidad actualizada");
    } catch {
      showToastMsg("error", "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const togglePrivacy = (key: keyof PrivacyConfig) => setConfig(prev => ({ ...prev, [key]: !prev[key] }));

  const handleCloseSessions = () => {
    showToastMsg("success", "Sesiones cerradas (excepto esta)");
  };

  const handleDeleteAccount = () => {
    showToastMsg("error", "La eliminación de cuenta no está disponible en la versión actual");
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="h-9 w-9 rounded-xl bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-all cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Privacidad y Seguridad</h1>
          <p className="text-sm text-muted">Administra tu seguridad y configuración de privacidad</p>
        </div>
      </div>

      {toast && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${toast.type === "success" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </motion.div>
      )}

      {/* Security */}
      <GlassCard padding="md" hover={false}>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Key className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Seguridad</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Contraseña actual</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full h-10 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Nueva contraseña</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full h-10 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={() => showToastMsg("success", "Contraseña actualizada")} disabled={!currentPassword || !newPassword} icon={<Save className="h-4 w-4" />}>
              Cambiar Contraseña
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Two Factor */}
      <GlassCard padding="md" hover={false}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <Lock className="h-4 w-4 text-accent" />
            </div>
            <div>
              <div className="text-sm font-medium">Autenticación en dos pasos (2FA)</div>
              <div className="text-xs text-muted">Añade una capa extra de seguridad a tu cuenta</div>
            </div>
          </div>
          <button onClick={() => { setTwoFactor(!twoFactor); showToastMsg("success", `2FA ${twoFactor ? "desactivado" : "activado"}`); }} className={`relative h-6 w-10 rounded-full transition-all shrink-0 ${twoFactor ? "bg-primary" : "bg-white/[0.1]"}`}>
            <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${twoFactor ? "left-[18px]" : "left-0.5"}`} />
          </button>
        </div>
      </GlassCard>

      {/* Active Sessions */}
      <GlassCard padding="md" hover={false}>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-xl bg-success/10 flex items-center justify-center">
            <Smartphone className="h-4 w-4 text-success" />
          </div>
          <h3 className="text-sm font-semibold">Dispositivos conectados</h3>
        </div>
        <div className="space-y-2 mb-4">
          {devices.map((d, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03]">
              <div className={`h-2 w-2 rounded-full ${d.active ? "bg-success" : "bg-muted"}`} />
              <span className="text-xs">{d.name}</span>
              <span className={`text-[10px] ml-auto ${d.active ? "text-success" : "text-muted"}`}>
                {d.active ? "Activo ahora" : "Hace 2 días"}
              </span>
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={handleCloseSessions} icon={<LogOut className="h-4 w-4" />}>
          Cerrar otras sesiones
        </Button>
      </GlassCard>

      {/* Privacy */}
      <GlassCard padding="md" hover={false}>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 rounded-xl bg-cyan-400/10 flex items-center justify-center">
            <Eye className="h-4 w-4 text-cyan-400" />
          </div>
          <h3 className="text-sm font-semibold">Privacidad</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: "publicProfile" as keyof PrivacyConfig, label: "Perfil público", desc: "Permitir que otros usuarios vean tu perfil" },
            { key: "showStats" as keyof PrivacyConfig, label: "Mostrar estadísticas", desc: "Mostrar tus estadísticas en tu perfil público" },
            { key: "showHours" as keyof PrivacyConfig, label: "Mostrar horas jugadas", desc: "Mostrar tus horas de juego en tu perfil" },
            { key: "showInRankings" as keyof PrivacyConfig, label: "Aparecer en rankings", desc: "Incluirte en las tablas de clasificación" },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <div className="text-sm">{item.label}</div>
                <div className="text-xs text-muted">{item.desc}</div>
              </div>
              <button onClick={() => togglePrivacy(item.key)} className={`relative h-6 w-10 rounded-full transition-all shrink-0 ${config[item.key] ? "bg-primary" : "bg-white/[0.1]"}`}>
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${config[item.key] ? "left-[18px]" : "left-0.5"}`} />
              </button>
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={handleSavePrivacy} disabled={saving} icon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}>
              Guardar
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Delete Account */}
      <GlassCard padding="md" hover={false}>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-xl bg-danger/10 flex items-center justify-center">
            <Trash2 className="h-4 w-4 text-danger" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-danger">Zona de Peligro</h3>
            <p className="text-xs text-muted">Acciones irreversibles</p>
          </div>
        </div>
        {showDeleteConfirm ? (
          <div className="space-y-3">
            <p className="text-xs text-muted">¿Estás seguro? Esta acción eliminará permanentemente tu cuenta y todos tus datos.</p>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleDeleteAccount} className="bg-danger hover:bg-danger/80 text-white" icon={<Trash2 className="h-4 w-4" />}>
                Confirmar Eliminación
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(true)} icon={<Trash2 className="h-4 w-4" />} className="text-danger">
            Eliminar Cuenta
          </Button>
        )}
      </GlassCard>
    </div>
  );
}
