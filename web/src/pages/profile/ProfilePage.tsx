import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User, Mail, Phone, KeyRound, Loader2, Shield, Building2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LIGHT = {
  primary: "#eab308", primaryDark: "#ca8a04",
  azul: "#3b82f6", verde: "#10b981", roxo: "#8b5cf6", vermelho: "#ef4444",
  cardBg: "#ffffff", cardBorder: "#e5e7eb",
  textTitle: "#111827", textBody: "#374151", textMuted: "#6b7280",
  surfaceSoft: "#f9fafb",
};
const DARK = {
  primary: "#fbbf24", primaryDark: "#f59e0b",
  azul: "#60a5fa", verde: "#34d399", roxo: "#a78bfa", vermelho: "#f87171",
  cardBg: "#1a1a1a", cardBorder: "#2a2a2a",
  textTitle: "#f9fafb", textBody: "#d1d5db", textMuted: "#6b7280",
  surfaceSoft: "#222",
};

const cardRadius = "12px 12px 12px 24px";

export function ProfilePage() {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const qc = useQueryClient();
  const dark = theme === "dark";
  const C = dark ? DARK : LIGHT;

  const [name, setName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  const initials = (() => {
    const parts = (profile?.full_name || "U").trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  })();

  const cardStyle = (d: boolean): React.CSSProperties => ({
    background: d ? "rgba(255,255,255,0.06)" : C.cardBg,
    border: `1px solid ${d ? "rgba(255,255,255,0.10)" : C.cardBorder}`,
    borderRadius: cardRadius,
    boxShadow: d ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase.from("profiles").update({ full_name: name, phone: phone || null }).eq("id", profile.id);
      if (error) throw error;
      toast.success("Dados atualizados!");
      qc.invalidateQueries();
    } catch (err: any) { toast.error(err.message || "Erro ao salvar"); }
    finally { setSavingProfile(false); }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || email === profile.email) return;
    setSavingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      await supabase.from("profiles").update({ email }).eq("id", profile.id);
      toast.success("Email de confirmacao enviado para o novo endereco!");
    } catch (err: any) { toast.error(err.message || "Erro ao alterar email"); }
    finally { setSavingEmail(false); }
  };

  const handleChangePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd.length < 6) { toast.error("A senha deve ter no minimo 6 caracteres"); return; }
    if (newPwd !== confirmPwd) { toast.error("As senhas nao coincidem"); return; }
    setSavingPwd(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd });
      if (error) throw error;
      toast.success("Senha alterada!");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (err: any) { toast.error(err.message || "Erro ao alterar senha"); }
    finally { setSavingPwd(false); }
  };

  const roleLabel = profile?.role === "admin" ? "Admin" : "Consultor";
  const roleDesc = profile?.role === "admin" ? "Acesso total ao sistema" : "Apenas visualizacao";

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: C.textBody }} className="space-y-5">
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Hero */}
      <div style={{
        background: dark ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" : "linear-gradient(135deg, #1e3a5f 0%, #0f3460 40%, #1a1a2e 100%)",
        borderRadius: "16px 16px 16px 28px", padding: "24px 28px", position: "relative", overflow: "hidden",
      }}>
        <div className="flex items-center gap-5">
          <div style={{
            width: 72, height: 72, borderRadius: 18, flexShrink: 0,
            background: "linear-gradient(135deg, #facc15, #eab308)",
            boxShadow: "0 4px 20px rgba(234,179,8,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#1a1a1a", fontWeight: 800, fontSize: 24 }}>{initials}</span>
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0 }}>{profile?.full_name}</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{profile?.email}</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 20, background: `rgba(234,179,8,0.2)`, border: "1px solid rgba(234,179,8,0.5)", marginTop: 8 }}>
              <Shield size={11} style={{ color: C.primary }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: C.primary }}>{roleLabel}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>· {roleDesc}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Dados pessoais */}
        <div style={cardStyle(dark)}>
          <div style={{ padding: 20 }}>
            <div className="flex items-center gap-3 mb-4">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.azul}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={18} style={{ color: C.azul }} />
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.textTitle, margin: 0 }}>Dados Pessoais</h3>
                <p style={{ fontSize: 11, color: C.textMuted, margin: 0 }}>Nome e telefone</p>
              </div>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(13) 99999-0000" />
              </div>
              <Button type="submit" disabled={savingProfile} className="gap-2">
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar
              </Button>
            </form>
          </div>
        </div>

        {/* Email */}
        <div style={cardStyle(dark)}>
          <div style={{ padding: 20 }}>
            <div className="flex items-center gap-3 mb-4">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.verde}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Mail size={18} style={{ color: C.verde }} />
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.textTitle, margin: 0 }}>Email</h3>
                <p style={{ fontSize: 11, color: C.textMuted, margin: 0 }}>Alterar requer confirmacao</p>
              </div>
            </div>
            <form onSubmit={handleChangeEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Novo Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <p className="text-xs" style={{ color: C.textMuted }}>Voce recebera um link de confirmacao no novo endereco</p>
              </div>
              <Button type="submit" disabled={savingEmail || email === profile?.email} className="gap-2">
                {savingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Alterar Email
              </Button>
            </form>
          </div>
        </div>

        {/* Senha */}
        <div style={cardStyle(dark)} className="lg:col-span-2">
          <div style={{ padding: 20 }}>
            <div className="flex items-center gap-3 mb-4">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.roxo}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <KeyRound size={18} style={{ color: C.roxo }} />
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.textTitle, margin: 0 }}>Alterar Senha</h3>
                <p style={{ fontSize: 11, color: C.textMuted, margin: 0 }}>Use uma senha forte com pelo menos 6 caracteres</p>
              </div>
            </div>
            <form onSubmit={handleChangePwd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-pwd">Nova Senha</Label>
                <Input id="new-pwd" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="Minimo 6 caracteres" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pwd">Confirmar</Label>
                <Input id="confirm-pwd" type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} required />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={savingPwd} className="gap-2">
                  {savingPwd ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  Alterar Senha
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
