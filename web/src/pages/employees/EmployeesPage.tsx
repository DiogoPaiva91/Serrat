import { useState, useRef, useEffect } from "react";
import {
  Users, Plus, Search, Pencil, Filter, X, Calendar, ChevronDown,
  Inbox, ChevronLeft, ChevronRight, List, Grid3x3, Settings,
  Columns3, Rows3, LayoutGrid, GripVertical, Check, ChevronUp, ChevronsUpDown,
  FileSpreadsheet, FileText, Trash2, Power, KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeForm } from "@/components/forms/EmployeeForm";
import { useEmployees } from "@/hooks/useEmployees";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ═══ COLORS ═══ */
const LIGHT = {
  primary: "#eab308", primaryDark: "#ca8a04",
  azul: "#2563eb", verde: "#16a34a", laranja: "#f97316", vermelho: "#dc2626", roxo: "#7c3aed",
  cardBg: "#ffffff", cardBorder: "#e2e8f0",
  textTitle: "#171717", textBody: "#404040", textMuted: "#64748b", textLight: "#94a3b8",
  surfaceSoft: "#f8fafc",
};
const DARK = {
  primary: "#facc15", primaryDark: "#eab308",
  azul: "#60a5fa", verde: "#34d399", laranja: "#fb923c", vermelho: "#ef6b6b", roxo: "#a78bfa",
  cardBg: "#222222", cardBorder: "#2e2e2e",
  textTitle: "#fafafa", textBody: "#e2e2e8", textMuted: "#6b7280", textLight: "#4b5563",
  surfaceSoft: "#1e1e1e",
};

const cardRadius = "10px 10px 10px 18px";
const PAGE_SIZE = 20;

const roleColors: Record<string, { bg: string; text: string }> = {
  admin: { bg: "#7c3aed15", text: "#7c3aed" },
  consultor: { bg: "#2563eb15", text: "#2563eb" },
  // Legacy fallback
  gestor: { bg: "#2563eb15", text: "#2563eb" },
  operador: { bg: "#16a34a15", text: "#16a34a" },
};
const roleLabels: Record<string, string> = { admin: "Admin", consultor: "Consultor", gestor: "Consultor", operador: "Consultor" };

const Ic = {
  users: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="7" cy="6" r="3" stroke={c} strokeWidth="1.4"/><path d="M1 17c0-3 2.5-5 6-5s6 2 6 5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><circle cx="14" cy="7" r="2" stroke={c} strokeWidth="1.2"/><path d="M15 12c2 .5 4 2 4 4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
};

/* ═══ COLUMNS ═══ */
const ALL_COLUMNS = [
  { id: "nome", label: "Nome", fixed: true, width: "30%" },
  { id: "email", label: "Email", width: "25%" },
  { id: "telefone", label: "Telefone", width: "15%" },
  { id: "funcao", label: "Perfil", width: "15%" },
  { id: "status", label: "Status", width: "10%" },
  { id: "acoes", label: "Acoes", fixed: true, width: "160px", align: "center" as const },
];

type Density = "compact" | "normal" | "comfortable";
const DENSITY_SPEC: Record<Density, { padX: number; padY: number; fs: number }> = {
  compact: { padX: 8, padY: 6, fs: 11 },
  normal: { padX: 12, padY: 10, fs: 12 },
  comfortable: { padX: 16, padY: 14, fs: 13 },
};

export function EmployeesPage() {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const C = dark ? DARK : LIGHT;
  const { data: employees, isLoading, refetch } = useEmployees();
  useRealtimeTable("profiles", "employees");

  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [page, setPage] = useState(1);
  const [filterRole, setFilterRole] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showPeriodo, setShowPeriodo] = useState(false);
  const [periodo, setPeriodo] = useState("Todos");

  // Table config
  const [view, setView] = useState<"table" | "cards">("table");
  const [density, setDensity] = useState<Density>("normal");
  const [showConfig, setShowConfig] = useState(false);
  const [configTab, setConfigTab] = useState<"colunas" | "densidade" | "aparencia">("colunas");
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set(ALL_COLUMNS.map(c => c.id)));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [appearance, setAppearance] = useState({ zebra: true, verticalBorders: false });

  const configRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const periodoRef = useRef<HTMLDivElement>(null);
  const periodoOptions = ["Hoje", "Ultimos 7 dias", "Ultimos 30 dias", "Ultimos 90 dias", "Este ano", "Todos"];

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (configRef.current && !configRef.current.contains(e.target as Node)) setShowConfig(false);
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilters(false);
      if (periodoRef.current && !periodoRef.current.contains(e.target as Node)) setShowPeriodo(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showConfig, showFilters, showPeriodo]);

  const activeFilters = filterRole ? 1 : 0;

  const filtered = (employees || []).filter((emp: any) => {
    const q = search.toLowerCase();
    const matchSearch = !q || emp.full_name.toLowerCase().includes(q) || emp.email.toLowerCase().includes(q);
    const matchRole = !filterRole || emp.role === filterRole;
    return matchSearch && matchRole;
  });

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const D = DENSITY_SPEC[density];
  const cols = ALL_COLUMNS.filter(c => visibleCols.has(c.id));

  const toggleSel = (id: string) => { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n); };
  const toggleAll = () => { if (selected.size === paged.length) setSelected(new Set()); else setSelected(new Set(paged.map((e: any) => e.id))); };
  const handleSort = (colId: string) => { setSortCol(colId); setSortDir(s => sortCol === colId && s === "asc" ? "desc" : "asc"); };

  const handleCreate = async (data: any) => {
    if (!data.password || data.password.length < 6) { toast.error("Senha deve ter no minimo 6 caracteres"); return; }
    setCreating(true);
    try {
      // Salva sessao do admin antes do signUp (que loga o novo user)
      const { data: adminSession } = await supabase.auth.getSession();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.name } },
      });
      if (authError) throw authError;

      // Restaura sessao do admin
      if (adminSession?.session) {
        await supabase.auth.setSession({
          access_token: adminSession.session.access_token,
          refresh_token: adminSession.session.refresh_token,
        });
      }

      if (authData.user) {
        const { error: profErr } = await supabase.from("profiles").update({
          full_name: data.name,
          phone: data.phone || null,
          role: data.role,
          company_id: data.company_id || profile?.company_id,
          email: data.email,
          must_change_password: true,
        }).eq("id", authData.user.id);
        if (profErr) throw profErr;
      }
      toast.success(`${data.name} cadastrado com sucesso!`);
      setFormOpen(false);
      refetch();
    } catch (err: any) { toast.error(err.message || "Erro ao criar usuario"); }
    finally { setCreating(false); }
  };

  const handleEdit = async (data: any) => {
    if (!editingItem) return;
    try {
      const emailChanged = data.email && data.email !== editingItem.email;

      // Email so pode ser alterado pelo proprio usuario (em /perfil)
      if (emailChanged) {
        toast.warning("Email do login so pode ser alterado pelo proprio usuario em Meu Perfil");
        return;
      }

      const updates: any = { full_name: data.name, phone: data.phone || null, role: data.role, company_id: data.company_id || null };
      if (emailChanged) updates.email = data.email;
      const { error } = await supabase.from("profiles").update(updates).eq("id", editingItem.id);
      if (error) throw error;
      toast.success(emailChanged ? "Usuario atualizado (email alterado no login tambem)" : "Usuario atualizado!");
      setEditingItem(null);
      refetch();
    } catch (err: any) { toast.error(err.message || "Erro ao atualizar"); }
  };

  const handleToggleStatus = async (emp: any) => {
    try {
      const { error } = await supabase.from("profiles").update({ is_active: !emp.is_active }).eq("id", emp.id);
      if (error) throw error;
      toast.success(`Usuario ${!emp.is_active ? "ativado" : "desativado"}`);
      refetch();
    } catch (err: any) { toast.error(err.message || "Erro ao alterar status"); }
  };

  const handleResetPassword = async (emp: any) => {
    const newPwd = prompt(`Nova senha temporaria para ${emp.full_name}:\n(minimo 6 caracteres — usuario sera forcado a trocar no proximo login)`);
    if (!newPwd) return;
    if (newPwd.length < 6) { toast.error("Senha minima 6 caracteres"); return; }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { toast.error("Sessao expirada — faca login novamente"); return; }
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-update-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ user_id: emp.id, new_password: newPwd }),
      });
      console.log("[ResetPassword] status:", res.status);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao alterar senha");
      toast.success(`Senha de ${emp.full_name} alterada!`);
    } catch (err: any) { toast.error(err.message || "Erro"); }
  };

  const handleDelete = async (emp: any) => {
    if (!confirm(`Excluir usuario "${emp.full_name}"? Esta acao nao pode ser desfeita.`)) return;
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", emp.id);
      if (error) throw error;
      toast.success("Usuario excluido");
      refetch();
    } catch (err: any) { toast.error(err.message || "Erro ao excluir"); }
  };

  const btnBase = (active: boolean): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
    border: `1.5px solid ${active ? C.primary : (dark ? C.cardBorder : "#CBD5E1")}`,
    background: active ? `${C.primary}12` : "transparent",
    color: active ? C.primary : C.textBody, cursor: "pointer", transition: "all .15s",
  });

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: C.textBody }} className="space-y-5">
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* ═══ HERO ═══ */}
      <div style={{
        background: dark ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" : "linear-gradient(135deg, #1e3a5f 0%, #0f3460 40%, #1a1a2e 100%)",
        borderRadius: "16px 16px 16px 28px", padding: "24px 28px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, pointerEvents: "none" }}>
          <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none"><line x1="0" y1="20" x2="400" y2="100" stroke="white" strokeWidth="1" /><line x1="0" y1="60" x2="400" y2="30" stroke="white" strokeWidth="0.5" /></svg>
        </div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex shrink-0 items-center justify-center" style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${C.primary}20, ${C.primaryDark}10)`, border: `1px solid ${C.primary}30` }}>
              {Ic.users(24, C.primary)}
            </div>
            <div className="min-w-0">
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.2, margin: 0 }}>
                Usuarios e <span style={{ color: C.primary }}>Permissoes</span>
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>Gerencie o acesso ao sistema e perfis de usuarios</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.azul }} />
                  <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.45)" }}>Total</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: C.azul }}>{employees?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
          <Button onClick={() => setFormOpen(true)} className="shrink-0 border-white/20 text-white hover:bg-white/10 bg-white/[0.08]" variant="outline">
            <Plus className="h-4 w-4" /> Novo Usuario
          </Button>
        </div>
      </div>

      {/* ═══ TOOLBAR ═══ */}
      <div style={{ background: dark ? "rgba(255,255,255,0.08)" : C.cardBg, backdropFilter: dark ? "blur(8px)" : undefined, border: `1px solid ${dark ? "rgba(255,255,255,0.10)" : C.cardBorder}`, borderRadius: cardRadius, boxShadow: dark ? "none" : "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "12px 16px" }}>
          {/* Filtros */}
          <div ref={filterRef} style={{ position: "relative" }}>
            <button onClick={() => setShowFilters(!showFilters)} style={btnBase(activeFilters > 0)}>
              <Filter className="h-[13px] w-[13px]" /> Filtros
              {activeFilters > 0 && <span style={{ background: C.primary, color: "#1a1a1a", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4 }}>{activeFilters}</span>}
            </button>
            {showFilters && (
              <div style={{ position: "absolute", left: 0, top: "calc(100% + 6px)", zIndex: 50, width: 240, borderRadius: cardRadius, background: C.cardBg, border: `1px solid ${C.cardBorder}`, boxShadow: "0 12px 36px rgba(0,0,0,0.18)", padding: "12px 16px" }}>
                <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.textMuted, marginBottom: 8 }}>Perfil</p>
                {[{ v: "", l: "Todos" }, { v: "admin", l: "Admin" }, { v: "consultor", l: "Consultor" }].map(opt => (
                  <button key={opt.v || "all"} onClick={() => { setFilterRole(opt.v); setPage(1); }} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6, border: "none", width: "100%",
                    background: filterRole === opt.v ? `${C.primary}12` : "transparent", color: filterRole === opt.v ? C.primary : C.textBody,
                    fontSize: 11, fontWeight: filterRole === opt.v ? 700 : 400, cursor: "pointer", textAlign: "left",
                  }}>{opt.l}</button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div onClick={e => { e.currentTarget.querySelector("input")?.focus(); }} style={{
            display: "flex", alignItems: "center", gap: 8, height: 35, minWidth: 200, maxWidth: 320, flex: 1,
            padding: "0 12px", borderRadius: 8, cursor: "text",
            border: `1.5px solid ${searchFocused ? C.primary : (dark ? C.cardBorder : "#CBD5E1")}`,
            boxShadow: searchFocused ? `0 0 0 3px ${C.primary}20` : "none",
            background: dark ? "transparent" : C.cardBg, transition: "all .15s",
          }}>
            <Search className="h-[15px] w-[15px] shrink-0" style={{ color: C.textMuted, opacity: 0.8 }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              placeholder="Buscar por nome ou email..." style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, color: C.textBody, minWidth: 0 }} />
            {search && <span onClick={e => { e.stopPropagation(); setSearch(""); setPage(1); }} style={{ cursor: "pointer", opacity: 0.6, display: "flex" }}><X className="h-[14px] w-[14px]" style={{ color: C.textMuted }} /></span>}
          </div>

          {/* Periodo */}
          <div ref={periodoRef} style={{ position: "relative" }}>
            <button onClick={() => setShowPeriodo(!showPeriodo)} style={{ ...btnBase(showPeriodo), color: C.textBody }}>
              <Calendar className="h-[13px] w-[13px]" style={{ color: C.textMuted }} />
              <span style={{ color: C.textMuted }}>Periodo:</span>
              <span style={{ fontWeight: 700, color: C.textTitle }}>{periodo}</span>
              <ChevronDown className={cn("h-[10px] w-[10px] transition-transform", showPeriodo && "rotate-180")} style={{ color: showPeriodo ? C.primary : C.textMuted }} />
            </button>
            {showPeriodo && (
              <div style={{ position: "absolute", left: 0, top: "calc(100% + 6px)", zIndex: 50, minWidth: 240, borderRadius: "8px 8px 8px 14px", background: C.cardBg, border: `1px solid ${C.cardBorder}`, boxShadow: "0 12px 36px rgba(0,0,0,0.18)", padding: "6px 0" }}>
                {periodoOptions.map(opt => {
                  const isA = periodo === opt;
                  return (
                    <div key={opt} onClick={() => { setPeriodo(opt); setShowPeriodo(false); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", fontSize: 11, cursor: "pointer", fontWeight: isA ? 700 : 500, color: isA ? C.primary : C.textBody, background: isA ? `${C.primary}12` : "transparent" }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", border: `1.5px solid ${isA ? C.primary : C.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{isA && <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.primary }} />}</div>
                      {opt}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }} />

          <button title="Exportar Excel" style={{ width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.cardBorder}`, background: "transparent", color: "#1D6F42", cursor: "pointer" }}>
            <FileSpreadsheet className="h-4 w-4" />
          </button>
          <button title="Exportar PDF" style={{ width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.cardBorder}`, background: "transparent", color: C.vermelho, cursor: "pointer" }}>
            <FileText className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ═══ TABLE ═══ */}
      <div style={{ background: dark ? "rgba(255,255,255,0.08)" : C.cardBg, backdropFilter: dark ? "blur(8px)" : undefined, border: `1px solid ${dark ? "rgba(255,255,255,0.10)" : C.cardBorder}`, borderRadius: cardRadius, boxShadow: dark ? "none" : "0 1px 3px rgba(0,0,0,0.04)", overflow: "visible" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px 14px", borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.06)" : C.cardBorder}` }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: `${C.primary}08`, border: `1px solid ${C.primary}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users className="h-[22px] w-[22px]" style={{ color: C.primary }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.textTitle, margin: 0 }}>Usuarios</h3>
            <p style={{ fontSize: 11, color: C.textMuted, margin: "3px 0 0" }}>{totalCount} {totalCount === 1 ? "registro" : "registros"} {(search || filterRole) ? "filtrados" : "no total"} · Atualizado agora</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            {(search || filterRole) && <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", background: `${C.primary}12`, color: C.primary }}>Filtrado</span>}
            <div style={{ display: "flex", gap: 3, borderRadius: 8, padding: 3, background: dark ? "rgba(255,255,255,0.04)" : C.surfaceSoft, border: `1px solid ${C.cardBorder}` }}>
              <button onClick={() => setView("table")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, border: "none", background: view === "table" ? (dark ? C.cardBg : "#fff") : "transparent", color: view === "table" ? C.primary : C.textMuted, boxShadow: view === "table" ? "0 1px 2px rgba(0,0,0,0.08)" : "none", cursor: "pointer" }}><List className="h-3 w-3" /> Tabela</button>
              <button onClick={() => setView("cards")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, border: "none", background: view === "cards" ? (dark ? C.cardBg : "#fff") : "transparent", color: view === "cards" ? C.primary : C.textMuted, boxShadow: view === "cards" ? "0 1px 2px rgba(0,0,0,0.08)" : "none", cursor: "pointer" }}><Grid3x3 className="h-3 w-3" /> Cards</button>
            </div>
            <div ref={configRef} style={{ position: "relative" }}>
              <button onClick={() => setShowConfig(!showConfig)} style={btnBase(showConfig)}><Settings className="h-3.5 w-3.5" /> Configurar</button>
              {showConfig && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 50, width: 300, borderRadius: cardRadius, overflow: "hidden", background: C.cardBg, border: `1px solid ${C.cardBorder}`, boxShadow: "0 12px 36px rgba(0,0,0,0.18)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${C.cardBorder}` }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.textTitle }}>Configuracoes</span>
                    <button onClick={() => setShowConfig(false)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><X className="h-3 w-3" style={{ color: C.textMuted }} /></button>
                  </div>
                  <div style={{ display: "flex", borderBottom: `1px solid ${C.cardBorder}`, background: dark ? "rgba(255,255,255,0.02)" : C.surfaceSoft }}>
                    {([{ id: "colunas" as const, label: "Colunas", icon: Columns3 }, { id: "densidade" as const, label: "Densidade", icon: Rows3 }, { id: "aparencia" as const, label: "Aparencia", icon: LayoutGrid }]).map(t => (
                      <button key={t.id} onClick={() => setConfigTab(t.id)} style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 8px", fontSize: 11, fontWeight: 600, border: "none", background: "transparent", cursor: "pointer", color: configTab === t.id ? C.primary : C.textMuted, borderBottom: `2px solid ${configTab === t.id ? C.primary : "transparent"}` }}><t.icon className="h-3 w-3" /> {t.label}</button>
                    ))}
                  </div>
                  <div style={{ maxHeight: 320, overflowY: "auto", padding: "12px 16px" }}>
                    {configTab === "colunas" && ALL_COLUMNS.map(col => {
                      const vis = visibleCols.has(col.id);
                      return (<div key={col.id} onClick={() => { if (!col.fixed) { const n = new Set(visibleCols); vis ? n.delete(col.id) : n.add(col.id); setVisibleCols(n); } }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 6, cursor: col.fixed ? "not-allowed" : "pointer", opacity: col.fixed ? 0.6 : 1 }}>
                        <GripVertical className="h-2.5 w-2.5" style={{ color: C.textMuted }} />
                        <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${vis ? C.primary : C.textMuted}`, background: vis ? C.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{vis && <Check className="h-2.5 w-2.5" style={{ color: dark ? "#1a1a1a" : "#fff" }} />}</div>
                        <span style={{ flex: 1, fontSize: 11, fontWeight: 500, color: C.textBody }}>{col.label}</span>
                        {col.fixed && <span style={{ fontSize: 9, color: C.textMuted }}>fixa</span>}
                      </div>);
                    })}
                    {configTab === "densidade" && ([{ id: "compact" as const, label: "Compacta", desc: "30px" }, { id: "normal" as const, label: "Normal", desc: "42px" }, { id: "comfortable" as const, label: "Confortavel", desc: "56px" }]).map(opt => (
                      <div key={opt.id} onClick={() => setDensity(opt.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, marginBottom: 6, border: `1.5px solid ${density === opt.id ? C.primary : C.cardBorder}`, background: density === opt.id ? `${C.primary}08` : "transparent", cursor: "pointer" }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${density === opt.id ? C.primary : C.textMuted}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{density === opt.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.primary }} />}</div>
                        <div><div style={{ fontSize: 12, fontWeight: 600, color: density === opt.id ? C.primary : C.textBody }}>{opt.label}</div><div style={{ fontSize: 10, color: C.textMuted }}>{opt.desc}</div></div>
                      </div>
                    ))}
                    {configTab === "aparencia" && ([{ id: "zebra" as const, label: "Linhas zebradas", desc: "Alterna fundo" }, { id: "verticalBorders" as const, label: "Bordas verticais", desc: "Linhas entre colunas" }]).map(opt => (
                      <div key={opt.id} onClick={() => setAppearance(a => ({ ...a, [opt.id]: !a[opt.id] }))} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px", borderRadius: 6, cursor: "pointer" }}>
                        <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 600, color: C.textBody }}>{opt.label}</div><div style={{ fontSize: 10, color: C.textMuted }}>{opt.desc}</div></div>
                        <div style={{ width: 30, height: 18, borderRadius: 9, padding: 2, background: appearance[opt.id] ? C.primary : (dark ? C.cardBorder : "#CBD5E1"), transition: "background .2s" }}><div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.15)", transition: "transform .2s", transform: appearance[opt.id] ? "translateX(12px)" : "translateX(0)" }} /></div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 14px", borderTop: `1px solid ${C.cardBorder}`, background: dark ? "rgba(255,255,255,0.02)" : C.surfaceSoft }}>
                    <button onClick={() => setShowConfig(false)} style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: C.primary, color: "#1a1a1a", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Aplicar</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        {isLoading ? (
          <div style={{ padding: 24 }} className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : view === "table" ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <thead>
                <tr style={{ background: dark ? "rgba(255,255,255,0.03)" : C.surfaceSoft }}>
                  <th style={{ width: 36, padding: `4px ${D.padX}px`, borderBottom: `2px solid ${dark ? "rgba(255,255,255,0.06)" : C.cardBorder}`, textAlign: "left" }}>
                    <div onClick={toggleAll} style={{ width: 14, height: 14, borderRadius: 3, cursor: "pointer", border: `1.5px solid ${selected.size === paged.length && paged.length > 0 ? C.primary : C.textMuted}`, background: selected.size === paged.length && paged.length > 0 ? C.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {selected.size === paged.length && paged.length > 0 && <Check className="h-2.5 w-2.5" style={{ color: "#1a1a1a" }} />}
                    </div>
                  </th>
                  {cols.map(col => (
                    <th key={col.id} onClick={() => handleSort(col.id)} style={{
                      padding: `4px ${D.padX}px`, width: col.width, textAlign: (col.align as any) || "left",
                      borderBottom: `2px solid ${dark ? "rgba(255,255,255,0.06)" : C.cardBorder}`,
                      borderRight: appearance.verticalBorders ? `1px solid ${dark ? "rgba(255,255,255,0.04)" : "#f1f5f9"}` : "none",
                      fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: C.textMuted, whiteSpace: "nowrap", cursor: "pointer",
                    }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {col.label}
                        {sortCol === col.id ? <ChevronUp className="h-2.5 w-2.5" style={{ color: C.primary, transform: sortDir === "desc" ? "rotate(180deg)" : "none", transition: "transform .15s" }} /> : col.id !== "acoes" ? <ChevronsUpDown className="h-2.5 w-2.5" style={{ color: C.textLight }} /> : null}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((emp: any, idx: number) => {
                  const isSel = selected.has(emp.id);
                  const rc = roleColors[emp.role] || { bg: `${C.textMuted}15`, text: C.textMuted };
                  return (
                    <tr key={emp.id} style={{
                      borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.04)" : "#f1f5f9"}`,
                      background: isSel ? `${C.primary}08` : appearance.zebra && idx % 2 === 1 ? (dark ? "rgba(255,255,255,0.02)" : "#fafbfc") : "transparent",
                      transition: "background .1s",
                    }}
                      onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = dark ? "rgba(255,255,255,0.03)" : "#f8fafc"; }}
                      onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = appearance.zebra && idx % 2 === 1 ? (dark ? "rgba(255,255,255,0.02)" : "#fafbfc") : "transparent"; }}
                    >
                      <td style={{ width: 36, padding: `${D.padY}px ${D.padX}px` }}>
                        <div onClick={() => toggleSel(emp.id)} style={{ width: 14, height: 14, borderRadius: 3, cursor: "pointer", border: `1.5px solid ${isSel ? C.primary : C.textMuted}`, background: isSel ? C.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {isSel && <Check className="h-2.5 w-2.5" style={{ color: "#1a1a1a" }} />}
                        </div>
                      </td>
                      {visibleCols.has("nome") && (
                        <td style={{ padding: `${D.padY}px ${D.padX}px` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${C.primary}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: C.primary }}>{emp.full_name?.charAt(0)}</span>
                            </div>
                            <span style={{ fontSize: D.fs, fontWeight: 600, color: C.textTitle, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.full_name}</span>
                          </div>
                        </td>
                      )}
                      {visibleCols.has("email") && <td style={{ padding: `${D.padY}px ${D.padX}px`, fontSize: D.fs, color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.email}</td>}
                      {visibleCols.has("telefone") && <td style={{ padding: `${D.padY}px ${D.padX}px`, fontSize: D.fs, color: C.textMuted }}>{emp.phone || "—"}</td>}
                      {visibleCols.has("funcao") && (
                        <td style={{ padding: `${D.padY}px ${D.padX}px` }}>
                          <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 600, background: rc.bg, color: rc.text }}>
                            {roleLabels[emp.role] || emp.role}
                          </span>
                        </td>
                      )}
                      {visibleCols.has("status") && (
                        <td style={{ padding: `${D.padY}px ${D.padX}px` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: emp.is_active ? C.verde : C.textMuted }} />
                            <span style={{ fontSize: D.fs, color: emp.is_active ? C.verde : C.textMuted, fontWeight: 500 }}>{emp.is_active ? "Ativo" : "Inativo"}</span>
                          </div>
                        </td>
                      )}
                      {visibleCols.has("acoes") && (
                        <td style={{ padding: `${D.padY}px 6px`, textAlign: "center", whiteSpace: "nowrap" }}>
                          <div style={{ display: "inline-flex", gap: 4, justifyContent: "center" }}>
                            <button onClick={(e) => { e.stopPropagation(); setEditingItem(emp); }} style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.verde}30`, background: `${C.verde}08`, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: C.verde, flexShrink: 0 }} title="Editar">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleResetPassword(emp); }} style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.azul}30`, background: `${C.azul}08`, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: C.azul, flexShrink: 0 }} title="Redefinir senha (envia email)">
                              <KeyRound className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(emp); }} style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${(emp.is_active ? C.laranja : C.verde)}30`, background: `${(emp.is_active ? C.laranja : C.verde)}08`, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: emp.is_active ? C.laranja : C.verde, flexShrink: 0 }} title={emp.is_active ? "Desativar" : "Ativar"}>
                              <Power className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(emp); }} style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.vermelho}30`, background: `${C.vermelho}08`, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: C.vermelho, flexShrink: 0 }} title="Excluir">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {paged.length === 0 && (
                  <tr><td colSpan={cols.length + 1} style={{ padding: "48px 16px", textAlign: "center", color: C.textMuted }}>
                    <Inbox className="h-8 w-8 mx-auto mb-2" style={{ color: C.textLight }} />
                    <p style={{ fontSize: 13, fontWeight: 600 }}>Nenhum usuario encontrado</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards view */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, padding: 20 }}>
            {paged.map((emp: any) => {
              const rc = roleColors[emp.role] || { bg: `${C.textMuted}15`, text: C.textMuted };
              return (
                <div key={emp.id} onClick={() => setEditingItem(emp)} style={{ padding: 16, borderRadius: 10, border: `1px solid ${C.cardBorder}`, background: dark ? "rgba(255,255,255,0.03)" : "#fafbfc", cursor: "pointer", transition: "box-shadow .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${C.primary}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>{emp.full_name?.charAt(0)}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.textTitle, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.full_name}</p>
                      <p style={{ fontSize: 11, color: C.textMuted, margin: 0 }}>{emp.email}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 600, background: rc.bg, color: rc.text }}>{roleLabels[emp.role] || emp.role}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: emp.is_active ? C.verde : C.textMuted }} />
                      <span style={{ fontSize: 11, color: emp.is_active ? C.verde : C.textMuted }}>{emp.is_active ? "Ativo" : "Inativo"}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", paddingTop: 8, borderTop: `1px solid ${C.cardBorder}` }}>
                    <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(emp); }} style={{ padding: "4px 8px", borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, color: emp.is_active ? C.laranja : C.verde, fontSize: 11 }}>
                      <Power className="h-3 w-3" /> {emp.is_active ? "Desativar" : "Ativar"}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(emp); }} style={{ padding: "4px 8px", borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, color: C.vermelho, fontSize: 11 }}>
                      <Trash2 className="h-3 w-3" /> Excluir
                    </button>
                  </div>
                </div>
              );
            })}
            {paged.length === 0 && <div style={{ gridColumn: "1 / -1", padding: "48px 16px", textAlign: "center", color: C.textMuted }}><Inbox className="h-8 w-8 mx-auto mb-2" style={{ color: C.textLight }} /><p>Nenhum funcionario encontrado</p></div>}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : C.cardBorder}` }}>
            <span style={{ fontSize: 11, color: C.textMuted }}>Pagina {page} de {totalPages} ({totalCount} registros){selected.size > 0 && ` · ${selected.size} selecionados`}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ ...btnBase(false), opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? "not-allowed" : "pointer" }}><ChevronLeft className="h-3.5 w-3.5" /> Anterior</button>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.primary, padding: "0 8px" }}>{page}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{ ...btnBase(false), opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? "not-allowed" : "pointer" }}>Proximo <ChevronRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <EmployeeForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} loading={creating} />
      <EmployeeForm open={!!editingItem} onOpenChange={open => !open && setEditingItem(null)} initialData={editingItem ? { name: editingItem.full_name, email: editingItem.email, phone: editingItem.phone || "", role: editingItem.role, company_id: editingItem.company_id || "" } : null} onSubmit={handleEdit} />
    </div>
  );
}
