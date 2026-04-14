import { useState, useMemo, useRef, useEffect } from "react";
import {
  BarChart3, Calendar, Trophy, User, Search, X, ChevronDown,
  FileSpreadsheet, FileText, Download,
} from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { OsByCabinChart } from "./OsByCabinChart";
import { OsByEmployeeChart } from "./OsByEmployeeChart";
import { OsByTimeChart } from "./OsByTimeChart";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

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

const Ic = {
  chart: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="10" width="3" height="7" rx="1" stroke={c} strokeWidth="1.3"/><rect x="8.5" y="6" width="3" height="11" rx="1" stroke={c} strokeWidth="1.3"/><rect x="14" y="3" width="3" height="14" rx="1" stroke={c} strokeWidth="1.3"/></svg>,
};

function getDateRange(periodo: string): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString();
  let from: Date;
  switch (periodo) {
    case "Hoje": from = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
    case "Ultimos 7 dias": from = new Date(now.getTime() - 7 * 86400000); break;
    case "Ultimos 30 dias": from = new Date(now.getTime() - 30 * 86400000); break;
    case "Ultimos 90 dias": from = new Date(now.getTime() - 90 * 86400000); break;
    case "Este ano": from = new Date(now.getFullYear(), 0, 1); break;
    default: from = new Date(2020, 0, 1); break;
  }
  return { from: from.toISOString(), to };
}

export function ReportsPage() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const dark = theme === "dark";
  const C = dark ? DARK : LIGHT;

  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showPeriodo, setShowPeriodo] = useState(false);
  const [periodo, setPeriodo] = useState("Ultimos 30 dias");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const periodoRef = useRef<HTMLDivElement>(null);
  const periodoOptions = ["Hoje", "Ultimos 7 dias", "Ultimos 30 dias", "Ultimos 90 dias", "Este ano", "Todos"];

  useEffect(() => {
    const h = (e: MouseEvent) => { if (periodoRef.current && !periodoRef.current.contains(e.target as Node)) setShowPeriodo(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showPeriodo]);

  useRealtimeTable("work_orders", "report-data");

  const range = useMemo(() => {
    if (dateFrom || dateTo) {
      return {
        from: dateFrom ? new Date(dateFrom).toISOString() : new Date(2020, 0, 1).toISOString(),
        to: dateTo ? new Date(dateTo + "T23:59:59").toISOString() : new Date().toISOString(),
      };
    }
    return getDateRange(periodo);
  }, [periodo, dateFrom, dateTo]);

  const { data: reportData } = useQuery({
    queryKey: ["report-data", range, profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return null;
      const { data, error } = await supabase
        .from("work_orders")
        .select("completed_at, responsible_name, qr_code:qr_codes(id_codigo, id_nome), service_type_rel:service_types(name), company_rel:companies(name)")
        .eq("company_id", profile.company_id)
        .gte("completed_at", range.from)
        .lte("completed_at", range.to)
        .order("completed_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.company_id,
  });

  const filtered = useMemo(() => {
    if (!reportData) return [];
    if (!search) return reportData;
    const s = search.toLowerCase();
    return reportData.filter((r: any) =>
      (r.responsible_name || "").toLowerCase().includes(s) ||
      (r.qr_code?.id_codigo || "").toLowerCase().includes(s) ||
      (r.qr_code?.id_nome || "").toLowerCase().includes(s)
    );
  }, [reportData, search]);

  const totalOs = filtered.length;
  const days = useMemo(() => {
    if (filtered.length === 0) return 1;
    const dates = new Set(filtered.map((r: any) => new Date(r.completed_at).toDateString()));
    return Math.max(dates.size, 1);
  }, [filtered]);
  const avgPerDay = (totalOs / days).toFixed(1);

  const cabinData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of filtered as any[]) {
      const qr = r.qr_code;
      const name = qr ? `${qr.id_codigo} · ${qr.id_nome}` : "Sem cabine";
      counts[name] = (counts[name] || 0) + 1;
    }
    return Object.entries(counts).map(([cabin, os]) => ({ cabin, os })).sort((a, b) => b.os - a.os).slice(0, 15);
  }, [filtered]);

  const employeeData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of filtered as any[]) {
      const name = r.responsible_name || "Sem nome";
      counts[name] = (counts[name] || 0) + 1;
    }
    return Object.entries(counts).map(([name, os]) => ({ name, os })).sort((a, b) => b.os - a.os);
  }, [filtered]);

  const hourData = useMemo(() => {
    const hours = Array(24).fill(0);
    for (const r of filtered as any[]) {
      const h = new Date(r.completed_at).getHours();
      hours[h]++;
    }
    return hours.map((count, i) => ({ hour: `${String(i).padStart(2, "0")}h`, os: count }));
  }, [filtered]);

  const topCabin = cabinData[0]?.cabin || "—";
  const topEmployee = employeeData[0]?.name || "—";

  const handleExportCsv = () => {
    if (filtered.length === 0) return;
    const header = "Data,Empresa,Funcionario,Cabine,Tipo Servico";
    const rows = (filtered as any[]).map(r =>
      `${formatDate(r.completed_at)},${r.company_rel?.name || ""},${r.responsible_name || ""},${r.qr_code?.id_codigo || ""} ${r.qr_code?.id_nome || ""},${r.service_type_rel?.name || ""}`.trim()
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `relatorio_${periodo.replace(/ /g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const statCards = [
    { label: "Total OS Periodo", value: totalOs.toLocaleString("pt-BR"), subtitle: `${days} dia(s) com OS`, icon: BarChart3, color: C.azul },
    { label: "Media por Dia", value: avgPerDay, subtitle: "OS executadas/dia", icon: Calendar, color: C.verde },
    { label: "Cabine Mais Atendida", value: topCabin.length > 18 ? topCabin.slice(0, 18) + "…" : topCabin, subtitle: `${cabinData[0]?.os || 0} OS`, icon: Trophy, color: C.primary },
    { label: "Operador Destaque", value: topEmployee, subtitle: `${employeeData[0]?.os || 0} OS`, icon: User, color: C.roxo },
  ];

  const cardStyle = (d: boolean): React.CSSProperties => ({
    background: d ? "rgba(255,255,255,0.08)" : C.cardBg,
    backdropFilter: d ? "blur(8px)" : undefined,
    border: `1px solid ${d ? "rgba(255,255,255,0.10)" : C.cardBorder}`,
    borderRadius: cardRadius,
    boxShadow: d ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
  });

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
              {Ic.chart(24, C.primary)}
            </div>
            <div className="min-w-0">
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.2, margin: 0 }}>
                Relat<span style={{ color: C.primary }}>orios</span>
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>Analise de desempenho e produtividade</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                {[{ label: "Periodo", value: `${totalOs.toLocaleString("pt-BR")} OS`, color: C.azul }, { label: "Media/Dia", value: avgPerDay, color: C.verde }].map(s => (
                  <div key={s.label} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
                    <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.45)" }}>{s.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ STATS CARDS ═══ */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} style={{
              ...cardStyle(dark),
              borderLeft: `4px solid ${card.color}`,
              padding: "14px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              animation: `fadeUp .35s ease ${i * 0.06}s both`,
            }}>
              <div className="min-w-0">
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: C.textMuted, display: "block", marginBottom: 3 }}>{card.label}</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: card.color, lineHeight: 1, display: "block" }}>{card.value}</span>
                {card.subtitle && <span style={{ fontSize: 10, color: C.textMuted, display: "block", marginTop: 3 }}>{card.subtitle}</span>}
              </div>
              <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, background: `${card.color}0A`, border: `1px solid ${card.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon className="h-[18px] w-[18px]" style={{ color: card.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ TOOLBAR ═══ */}
      <div style={{ ...cardStyle(dark) }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "12px 16px" }}>
          {/* Search */}
          <div onClick={e => { e.currentTarget.querySelector("input")?.focus(); }} style={{
            display: "flex", alignItems: "center", gap: 8, height: 35, minWidth: 200, maxWidth: 320, flex: 1,
            padding: "0 12px", borderRadius: 8, cursor: "text",
            border: `1.5px solid ${searchFocused ? C.primary : (dark ? C.cardBorder : "#CBD5E1")}`,
            boxShadow: searchFocused ? `0 0 0 3px ${C.primary}20` : "none",
            background: dark ? "transparent" : C.cardBg, transition: "all .15s",
          }}>
            <Search className="h-[15px] w-[15px] shrink-0" style={{ color: C.textMuted, opacity: 0.8 }} />
            <input value={search} onChange={e => setSearch(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              placeholder="Buscar por cabine, funcionario..." style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, color: C.textBody, minWidth: 0 }} />
            {search && <span onClick={e => { e.stopPropagation(); setSearch(""); }} style={{ cursor: "pointer", opacity: 0.6, display: "flex" }}><X className="h-[14px] w-[14px]" style={{ color: C.textMuted }} /></span>}
          </div>

          {/* Periodo preset */}
          <div ref={periodoRef} style={{ position: "relative" }}>
            <button onClick={() => setShowPeriodo(!showPeriodo)} style={{ ...btnBase(showPeriodo), color: C.textBody }}>
              <Calendar className="h-[13px] w-[13px]" style={{ color: C.textMuted }} />
              <span style={{ color: C.textMuted }}>Periodo:</span>
              <span style={{ fontWeight: 700, color: C.textTitle }}>{dateFrom || dateTo ? "Personalizado" : periodo}</span>
              <ChevronDown className={cn("h-[10px] w-[10px] transition-transform", showPeriodo && "rotate-180")} style={{ color: showPeriodo ? C.primary : C.textMuted }} />
            </button>
            {showPeriodo && (
              <div style={{ position: "absolute", left: 0, top: "calc(100% + 6px)", zIndex: 50, minWidth: 240, borderRadius: "8px 8px 8px 14px", background: C.cardBg, border: `1px solid ${C.cardBorder}`, boxShadow: "0 12px 36px rgba(0,0,0,0.18)", padding: "6px 0" }}>
                {periodoOptions.map(opt => {
                  const isA = periodo === opt && !dateFrom && !dateTo;
                  return (
                    <div key={opt} onClick={() => { setPeriodo(opt); setDateFrom(""); setDateTo(""); setShowPeriodo(false); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", fontSize: 11, cursor: "pointer", fontWeight: isA ? 700 : 500, color: isA ? C.primary : C.textBody, background: isA ? `${C.primary}12` : "transparent" }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", border: `1.5px solid ${isA ? C.primary : C.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{isA && <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.primary }} />}</div>
                      {opt}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Date range inputs */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{ height: 35, borderRadius: 8, border: `1.5px solid ${dark ? C.cardBorder : "#CBD5E1"}`, background: dark ? "transparent" : "#fff", color: C.textBody, padding: "0 10px", fontSize: 12, outline: "none" }} />
            <span style={{ fontSize: 10, color: C.textMuted }}>ate</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{ height: 35, borderRadius: 8, border: `1.5px solid ${dark ? C.cardBorder : "#CBD5E1"}`, background: dark ? "transparent" : "#fff", color: C.textBody, padding: "0 10px", fontSize: 12, outline: "none" }} />
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(""); setDateTo(""); }} style={{ fontSize: 11, fontWeight: 600, color: C.vermelho, background: "none", border: "none", cursor: "pointer" }}>Limpar</button>
            )}
          </div>

          <div style={{ flex: 1 }} />

          <button onClick={handleExportCsv} title="Exportar CSV" style={{ width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.cardBorder}`, background: "transparent", color: "#1D6F42", cursor: "pointer" }}>
            <FileSpreadsheet className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ═══ CHARTS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div style={{ ...cardStyle(dark), overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 0" }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.textTitle, display: "block" }}>OS por Cabine</span>
              <span style={{ fontSize: 10, color: C.textMuted }}>Ranking de utilizacao</span>
            </div>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.primary}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {Ic.chart(14, C.primary)}
            </div>
          </div>
          <div style={{ padding: "12px 12px 16px" }}>
            <OsByCabinChart data={cabinData} />
          </div>
        </div>

        <div style={{ ...cardStyle(dark), overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 0" }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.textTitle, display: "block" }}>OS por Funcionario</span>
              <span style={{ fontSize: 10, color: C.textMuted }}>Produtividade no periodo</span>
            </div>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.verde}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User className="h-[14px] w-[14px]" style={{ color: C.verde }} />
            </div>
          </div>
          <div style={{ padding: "12px 12px 16px" }}>
            <OsByEmployeeChart data={employeeData} />
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle(dark), overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 0" }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.textTitle, display: "block" }}>Distribuicao por Horario</span>
            <span style={{ fontSize: 10, color: C.textMuted }}>Pico de atividade ao longo do dia</span>
          </div>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.azul}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Calendar className="h-[14px] w-[14px]" style={{ color: C.azul }} />
          </div>
        </div>
        <div style={{ padding: "12px 12px 16px" }}>
          <OsByTimeChart data={hourData} />
        </div>
      </div>
    </div>
  );
}
