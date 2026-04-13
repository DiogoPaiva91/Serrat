import { useState, useRef, useEffect } from "react";
import {
  ClipboardList, Plus, Download, Search, Filter, X, Calendar,
  ChevronDown, MapPin, FileSpreadsheet, FileText, Clock,
  CheckCircle2, Activity, Inbox, ChevronLeft, ChevronRight,
  List, Grid3x3, Settings, Columns3, Rows3, LayoutGrid,
  GripVertical, Check, ChevronUp, ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkOrders } from "@/hooks/useWorkOrders";
import { useTheme } from "@/providers/ThemeProvider";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

/* ═══ COLORS ═══ */
const LIGHT = {
  primary: "#eab308", primaryDark: "#ca8a04",
  azul: "#2563eb", verde: "#16a34a", laranja: "#f97316", vermelho: "#dc2626", roxo: "#7c3aed",
  bg: "#f5f5f5", cardBg: "#ffffff", cardBorder: "#e2e8f0",
  textTitle: "#171717", textBody: "#404040", textMuted: "#64748b", textLight: "#94a3b8",
  surfaceSoft: "#f8fafc",
};
const DARK = {
  primary: "#facc15", primaryDark: "#eab308",
  azul: "#60a5fa", verde: "#34d399", laranja: "#fb923c", vermelho: "#ef6b6b", roxo: "#a78bfa",
  bg: "#1A1A1A", cardBg: "#222222", cardBorder: "#2e2e2e",
  textTitle: "#fafafa", textBody: "#e2e2e8", textMuted: "#6b7280", textLight: "#4b5563",
  surfaceSoft: "#1e1e1e",
};

const cardRadius = "10px 10px 10px 18px";

/* ═══ ICONS ═══ */
const Ic = {
  clipboard: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="5" y="1" width="10" height="3" rx="1" stroke={c} strokeWidth="1.4"/><rect x="3" y="3" width="14" height="15" rx="2" stroke={c} strokeWidth="1.4"/><path d="M7 9h6M7 12h4" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
};

/* ═══ MAIN ═══ */
export function WorkOrdersPage() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const C = dark ? DARK : LIGHT;

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showPeriodo, setShowPeriodo] = useState(false);
  const [periodo, setPeriodo] = useState("Ultimos 30 dias");
  const filterRef = useRef<HTMLDivElement>(null);
  const periodoRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useWorkOrders({ dateFrom, dateTo, search, page, pageSize: 15 });
  const orders = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / 15);

  const activeFilters = (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);
  const hasSearch = !!search;

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilters(false);
      if (periodoRef.current && !periodoRef.current.contains(e.target as Node)) setShowPeriodo(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleExportCsv = () => {
    const headers = "No,Data,Empresa,Funcionario,Tipo Servico,QR Code\n";
    const rows = orders.map((o: any) =>
      `${o.order_number},${formatDate(o.completed_at)},${o.company_rel?.name || o.company_name || ""},${o.employee?.full_name || o.responsible_name || ""},${o.service_type_rel?.name || o.service_type || ""},${o.qr_code?.id_codigo || o.id_codigo || ""} ${o.qr_code?.id_nome || o.id_nome || ""}`.trim()
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ordens_servico_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  /* Stats */
  const heroStats = [
    { label: "Total", value: totalCount, color: C.azul },
  ];

  const periodoOptions = ["Hoje", "Ultimos 7 dias", "Ultimos 30 dias", "Ultimos 90 dias", "Este ano", "Todos"];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: C.textBody }} className="space-y-5">
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* ═══ HERO ═══ */}
      <div style={{
        background: dark
          ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
          : "linear-gradient(135deg, #1e3a5f 0%, #0f3460 40%, #1a1a2e 100%)",
        borderRadius: "16px 16px 16px 28px",
        padding: "24px 28px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, pointerEvents: "none" }}>
          <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none">
            <line x1="0" y1="20" x2="400" y2="100" stroke="white" strokeWidth="1" />
            <line x1="0" y1="60" x2="400" y2="30" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex shrink-0 items-center justify-center" style={{
              width: 52, height: 52, borderRadius: 14,
              background: `linear-gradient(135deg, ${C.primary}20, ${C.primaryDark}10)`,
              border: `1px solid ${C.primary}30`,
            }}>
              {Ic.clipboard(24, C.primary)}
            </div>
            <div className="min-w-0">
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.2, margin: 0 }}>
                Ordens de <span style={{ color: C.primary }}>Serviço</span>
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                Registro completo de todas as ordens de servico executadas
              </p>
              {/* Stats pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                {heroStats.map((s) => (
                  <div key={s.label} style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "3px 10px", borderRadius: 20,
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                  }}>
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


      {/* ═══ TOOLBAR ═══ */}
      <div style={{
        background: dark ? "rgba(255,255,255,0.08)" : C.cardBg,
        backdropFilter: dark ? "blur(8px)" : undefined,
        border: `1px solid ${dark ? "rgba(255,255,255,0.10)" : C.cardBorder}`,
        borderRadius: cardRadius,
        boxShadow: dark ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "12px 16px" }}>
          {/* Filters button */}
          <div ref={filterRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                border: `1.5px solid ${activeFilters > 0 ? C.primary : (dark ? C.cardBorder : "#CBD5E1")}`,
                background: activeFilters > 0 ? `${C.primary}12` : "transparent",
                color: activeFilters > 0 ? C.primary : C.textBody,
                cursor: "pointer", transition: "all .15s",
              }}
            >
              <Filter className="h-[13px] w-[13px]" />
              Filtros
              {activeFilters > 0 && (
                <span style={{ background: C.primary, color: "#1a1a1a", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4 }}>{activeFilters}</span>
              )}
            </button>
            {showFilters && (
              <div style={{
                position: "absolute", left: 0, top: "calc(100% + 6px)", zIndex: 50,
                width: 280, borderRadius: cardRadius,
                background: dark ? C.cardBg : C.cardBg,
                border: `1px solid ${dark ? C.cardBorder : C.cardBorder}`,
                boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
                padding: "12px 16px",
              }}>
                <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.textMuted, marginBottom: 8 }}>Filtrar por data</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: C.textBody, display: "block", marginBottom: 4 }}>De</label>
                    <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                      style={{ width: "100%", height: 35, borderRadius: 8, border: `1.5px solid ${dark ? C.cardBorder : "#CBD5E1"}`, background: dark ? C.bg : "#fff", color: C.textBody, padding: "0 10px", fontSize: 12, outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: C.textBody, display: "block", marginBottom: 4 }}>Ate</label>
                    <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                      style={{ width: "100%", height: 35, borderRadius: 8, border: `1.5px solid ${dark ? C.cardBorder : "#CBD5E1"}`, background: dark ? C.bg : "#fff", color: C.textBody, padding: "0 10px", fontSize: 12, outline: "none" }}
                    />
                  </div>
                  {(dateFrom || dateTo) && (
                    <button onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); }}
                      style={{ fontSize: 11, fontWeight: 600, color: C.vermelho, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: "4px 0" }}
                    >Limpar datas</button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Search pill */}
          <div
            onClick={(e) => { const input = e.currentTarget.querySelector("input"); input?.focus(); }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              height: 35, minWidth: 200, maxWidth: 320, flex: 1,
              padding: "0 12px", borderRadius: 8, cursor: "text",
              border: `1.5px solid ${searchFocused ? C.primary : (dark ? C.cardBorder : "#CBD5E1")}`,
              boxShadow: searchFocused ? `0 0 0 3px ${C.primary}20` : "none",
              background: dark ? "transparent" : C.cardBg,
              transition: "all .15s",
            }}
          >
            <Search className="h-[15px] w-[15px] shrink-0" style={{ color: C.textMuted, opacity: 0.8 }} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Buscar por funcionario, cabine, empresa..."
              style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, color: C.textBody, minWidth: 0 }}
            />
            {search && (
              <span onClick={(e) => { e.stopPropagation(); setSearch(""); setPage(1); }} style={{ cursor: "pointer", opacity: 0.6, display: "flex" }}>
                <X className="h-[14px] w-[14px]" style={{ color: C.textMuted }} />
              </span>
            )}
          </div>

          {/* Periodo */}
          <div ref={periodoRef} style={{ position: "relative" }}>
            <button
              onClick={() => setShowPeriodo(!showPeriodo)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                border: `1.5px solid ${showPeriodo ? C.primary : (dark ? C.cardBorder : "#CBD5E1")}`,
                background: "transparent", cursor: "pointer", transition: "all .15s",
                color: C.textBody,
              }}
            >
              <Calendar className="h-[13px] w-[13px]" style={{ color: C.textMuted }} />
              <span style={{ color: C.textMuted }}>Periodo:</span>
              <span style={{ fontWeight: 700, color: C.textTitle }}>{periodo}</span>
              <ChevronDown className={cn("h-[10px] w-[10px] transition-transform", showPeriodo && "rotate-180")} style={{ color: showPeriodo ? C.primary : C.textMuted }} />
            </button>
            {showPeriodo && (
              <div style={{
                position: "absolute", left: 0, top: "calc(100% + 6px)", zIndex: 50,
                minWidth: 240, borderRadius: "8px 8px 8px 14px",
                background: dark ? C.cardBg : C.cardBg,
                border: `1px solid ${C.cardBorder}`,
                boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
                padding: "6px 0",
              }}>
                {periodoOptions.map((opt) => {
                  const isActive = periodo === opt;
                  return (
                    <div key={opt} onClick={() => { setPeriodo(opt); setShowPeriodo(false); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 14px", fontSize: 11, cursor: "pointer",
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? C.primary : C.textBody,
                        background: isActive ? `${C.primary}12` : "transparent",
                        transition: "all .1s",
                      }}
                    >
                      <div style={{
                        width: 14, height: 14, borderRadius: "50%",
                        border: `1.5px solid ${isActive ? C.primary : C.cardBorder}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {isActive && <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.primary }} />}
                      </div>
                      {opt}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {/* Export buttons */}
          <button onClick={handleExportCsv} title="Exportar Excel" style={{
            width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${dark ? C.cardBorder : C.cardBorder}`, background: "transparent",
            color: "#1D6F42", cursor: "pointer", transition: "all .15s",
          }}>
            <FileSpreadsheet className="h-4 w-4" />
          </button>
          <button title="Exportar PDF" style={{
            width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${dark ? C.cardBorder : C.cardBorder}`, background: "transparent",
            color: C.vermelho, cursor: "pointer", transition: "all .15s",
          }}>
            <FileText className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ═══ TABLE ═══ */}
      <TableSection
        dark={dark}
        C={C}
        orders={orders}
        isLoading={isLoading}
        totalCount={totalCount}
        totalPages={totalPages}
        page={page}
        setPage={setPage}
        hasFilters={!!(search || dateFrom || dateTo)}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TABLE SECTION — with Configurar popover, view toggle, checkboxes, sort
   ═══════════════════════════════════════════════════════════════════════════ */

type Density = "compact" | "normal" | "comfortable";
const DENSITY_SPEC: Record<Density, { padX: number; padY: number; fs: number }> = {
  compact: { padX: 8, padY: 6, fs: 11 },
  normal: { padX: 12, padY: 10, fs: 12 },
  comfortable: { padX: 16, padY: 14, fs: 13 },
};

const ALL_COLUMNS = [
  { id: "numero", label: "No", fixed: true, width: "64px" },
  { id: "data", label: "Data/Hora", width: "150px" },
  { id: "empresa", label: "Empresa" },
  { id: "funcionario", label: "Funcionario" },
  { id: "tipo", label: "Tipo Servico", width: "130px" },
  { id: "qrcode", label: "QR Code", width: "160px" },
  { id: "observacao", label: "Observação" },
  { id: "local", label: "Local", fixed: true, width: "50px" },
];

function TableSection({ dark, C, orders, isLoading, totalCount, totalPages, page, setPage, hasFilters }: {
  dark: boolean; C: typeof LIGHT; orders: any[]; isLoading: boolean;
  totalCount: number; totalPages: number; page: number; setPage: (p: number) => void; hasFilters: boolean;
}) {
  const [view, setView] = useState<"table" | "cards">("table");
  const [density, setDensity] = useState<Density>("normal");
  const [showConfig, setShowConfig] = useState(false);
  const [configTab, setConfigTab] = useState<"colunas" | "densidade" | "aparencia">("colunas");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set(ALL_COLUMNS.map(c => c.id)));
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [appearance, setAppearance] = useState({ zebra: true, verticalBorders: false, stickyHeader: true, wrapText: false });
  const configRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showConfig) return;
    const h = (e: MouseEvent) => { if (configRef.current && !configRef.current.contains(e.target as Node)) setShowConfig(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showConfig]);

  const D = DENSITY_SPEC[density];
  const cols = ALL_COLUMNS.filter(c => visibleCols.has(c.id));

  const toggleSel = (id: string) => { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n); };
  const toggleAll = () => { if (selected.size === orders.length) setSelected(new Set()); else setSelected(new Set(orders.map((o: any) => o.id))); };
  const handleSort = (colId: string) => { setSortCol(colId); setSortDir(s => sortCol === colId && s === "asc" ? "desc" : "asc"); };

  const btnBase = (active: boolean): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
    border: `1.5px solid ${active ? C.primary : (dark ? C.cardBorder : "#CBD5E1")}`,
    background: active ? `${C.primary}12` : "transparent",
    color: active ? C.primary : C.textBody,
    cursor: "pointer", transition: "all .15s",
  });

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, border: "none",
    background: active ? (dark ? C.cardBg : "#fff") : "transparent",
    color: active ? C.primary : C.textMuted,
    boxShadow: active ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
    cursor: "pointer", transition: "all .15s",
  });

  return (
    <div style={{
      background: dark ? "rgba(255,255,255,0.08)" : C.cardBg,
      backdropFilter: dark ? "blur(8px)" : undefined,
      border: `1px solid ${dark ? "rgba(255,255,255,0.10)" : C.cardBorder}`,
      borderRadius: cardRadius,
      boxShadow: dark ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
      overflow: "visible",
    }}>
      {/* ── HEADER ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "18px 20px 14px", borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.06)" : C.cardBorder}`,
      }}>
        {/* Icon + Title */}
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: `${C.primary}08`, border: `1px solid ${C.primary}15`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Inbox className="h-[22px] w-[22px]" style={{ color: C.primary }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.textTitle, margin: 0 }}>Ordens de Serviço</h3>
          <p style={{ fontSize: 11, color: C.textMuted, margin: "3px 0 0" }}>
            {totalCount} {totalCount === 1 ? "registro" : "registros"} {hasFilters ? "filtrados" : "no total"} · Atualizado agora
          </p>
        </div>

        {/* Right side controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {hasFilters && (
            <span style={{
              padding: "4px 10px", borderRadius: 12, fontSize: 10, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.5px",
              background: `${C.primary}12`, color: C.primary,
            }}>Filtrado</span>
          )}

          {/* View toggle */}
          <div style={{
            display: "flex", gap: 3, borderRadius: 8, padding: 3,
            background: dark ? "rgba(255,255,255,0.04)" : C.surfaceSoft,
            border: `1px solid ${dark ? C.cardBorder : C.cardBorder}`,
          }}>
            <button onClick={() => setView("table")} style={toggleBtnStyle(view === "table")}>
              <List className="h-3 w-3" /> Tabela
            </button>
            <button onClick={() => setView("cards")} style={toggleBtnStyle(view === "cards")}>
              <Grid3x3 className="h-3 w-3" /> Cards
            </button>
          </div>

          {/* Configurar */}
          <div ref={configRef} style={{ position: "relative" }}>
            <button onClick={() => setShowConfig(!showConfig)} style={btnBase(showConfig)}>
              <Settings className="h-3.5 w-3.5" /> Configurar
            </button>

            {showConfig && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 50,
                width: 300, borderRadius: cardRadius, overflow: "hidden",
                background: dark ? C.cardBg : C.cardBg,
                border: `1px solid ${C.cardBorder}`,
                boxShadow: "0 12px 36px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.06)",
              }}>
                {/* Header */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px", borderBottom: `1px solid ${C.cardBorder}`,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.textTitle }}>Configuracoes</span>
                  <button onClick={() => setShowConfig(false)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                    <X className="h-3 w-3" style={{ color: C.textMuted }} />
                  </button>
                </div>

                {/* Tabs */}
                <div style={{
                  display: "flex", borderBottom: `1px solid ${C.cardBorder}`,
                  background: dark ? "rgba(255,255,255,0.02)" : C.surfaceSoft,
                }}>
                  {([
                    { id: "colunas" as const, label: "Colunas", icon: Columns3 },
                    { id: "densidade" as const, label: "Densidade", icon: Rows3 },
                    { id: "aparencia" as const, label: "Aparencia", icon: LayoutGrid },
                  ]).map(t => (
                    <button key={t.id} onClick={() => setConfigTab(t.id)} style={{
                      flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                      padding: "9px 8px", fontSize: 11, fontWeight: 600, border: "none",
                      background: "transparent", cursor: "pointer",
                      color: configTab === t.id ? C.primary : C.textMuted,
                      borderBottom: `2px solid ${configTab === t.id ? C.primary : "transparent"}`,
                    }}>
                      <t.icon className="h-3 w-3" /> {t.label}
                    </button>
                  ))}
                </div>

                {/* Body */}
                <div style={{ maxHeight: 320, overflowY: "auto", padding: "12px 16px" }}>
                  {configTab === "colunas" && (
                    <div>
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.textMuted, display: "block", marginBottom: 8 }}>
                        Visiveis ({visibleCols.size})
                      </span>
                      {ALL_COLUMNS.map(col => {
                        const vis = visibleCols.has(col.id);
                        return (
                          <div key={col.id}
                            onClick={() => { if (!col.fixed) { const n = new Set(visibleCols); vis ? n.delete(col.id) : n.add(col.id); setVisibleCols(n); } }}
                            style={{
                              display: "flex", alignItems: "center", gap: 8,
                              padding: "7px 8px", borderRadius: 6, cursor: col.fixed ? "not-allowed" : "pointer",
                              opacity: col.fixed ? 0.6 : 1, transition: "background .1s",
                            }}
                            onMouseEnter={e => { if (!col.fixed) e.currentTarget.style.background = dark ? "rgba(255,255,255,0.04)" : C.surfaceSoft; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                          >
                            <GripVertical className="h-2.5 w-2.5" style={{ color: C.textMuted }} />
                            <div style={{
                              width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                              border: `1.5px solid ${vis ? C.primary : C.textMuted}`,
                              background: vis ? C.primary : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              {vis && <Check className="h-2.5 w-2.5" style={{ color: dark ? "#1a1a1a" : "#fff" }} />}
                            </div>
                            <span style={{ flex: 1, fontSize: 11, fontWeight: 500, color: C.textBody }}>{col.label}</span>
                            {col.fixed && <span style={{ fontSize: 9, color: C.textMuted }}>fixa</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {configTab === "densidade" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.textMuted, marginBottom: 4 }}>Altura das linhas</span>
                      {([
                        { id: "compact" as const, label: "Compacta", desc: "30px · alta densidade" },
                        { id: "normal" as const, label: "Normal", desc: "42px · padrao" },
                        { id: "comfortable" as const, label: "Confortavel", desc: "56px · acessivel" },
                      ]).map(opt => {
                        const isA = density === opt.id;
                        return (
                          <div key={opt.id} onClick={() => setDensity(opt.id)} style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
                            border: `1.5px solid ${isA ? C.primary : C.cardBorder}`,
                            background: isA ? `${C.primary}08` : "transparent",
                            cursor: "pointer", transition: "all .15s",
                          }}>
                            <div style={{
                              width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                              border: `2px solid ${isA ? C.primary : C.textMuted}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              {isA && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.primary }} />}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: isA ? C.primary : C.textBody }}>{opt.label}</div>
                              <div style={{ fontSize: 10, color: C.textMuted }}>{opt.desc}</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                              {[1, 2, 3].map(i => (
                                <div key={i} style={{
                                  width: 24, borderRadius: 1, background: isA ? C.primary : C.textMuted, opacity: 0.6,
                                  height: opt.id === "compact" ? 2 : opt.id === "normal" ? 3 : 4,
                                }} />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {configTab === "aparencia" && (
                    <div>
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: C.textMuted, display: "block", marginBottom: 8 }}>Aparencia da tabela</span>
                      {([
                        { id: "zebra" as const, label: "Linhas zebradas", desc: "Alterna fundo das linhas" },
                        { id: "verticalBorders" as const, label: "Bordas verticais", desc: "Linhas entre colunas" },
                        { id: "stickyHeader" as const, label: "Header fixo", desc: "Cabecalho fica visivel ao rolar" },
                        { id: "wrapText" as const, label: "Quebra de linha", desc: "Texto longo quebra em varias linhas" },
                      ]).map(opt => (
                        <div key={opt.id}
                          onClick={() => setAppearance(a => ({ ...a, [opt.id]: !a[opt.id] }))}
                          style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "8px", borderRadius: 6,
                            cursor: "pointer", transition: "background .1s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = dark ? "rgba(255,255,255,0.04)" : C.surfaceSoft; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: C.textBody }}>{opt.label}</div>
                            <div style={{ fontSize: 10, color: C.textMuted }}>{opt.desc}</div>
                          </div>
                          {/* Toggle */}
                          <div style={{
                            width: 30, height: 18, borderRadius: 9, flexShrink: 0, padding: 2, cursor: "pointer",
                            background: appearance[opt.id] ? C.primary : (dark ? C.cardBorder : "#CBD5E1"),
                            transition: "background .2s",
                          }}>
                            <div style={{
                              width: 14, height: 14, borderRadius: "50%", background: "#fff",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.15)", transition: "transform .2s",
                              transform: appearance[opt.id] ? "translateX(12px)" : "translateX(0)",
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", borderTop: `1px solid ${C.cardBorder}`,
                  background: dark ? "rgba(255,255,255,0.02)" : C.surfaceSoft,
                }}>
                  <button onClick={() => { setVisibleCols(new Set(ALL_COLUMNS.map(c => c.id))); setDensity("normal"); setAppearance({ zebra: true, verticalBorders: false, stickyHeader: true, wrapText: false }); }}
                    style={{ background: "none", border: "none", fontSize: 10, fontWeight: 600, color: C.textMuted, cursor: "pointer" }}>
                    Restaurar padrao
                  </button>
                  <button onClick={() => setShowConfig(false)}
                    style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: C.primary, color: "#1a1a1a", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    Aplicar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── TABLE BODY ── */}
      {isLoading ? (
        <div style={{ padding: 24 }} className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : view === "table" ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: dark ? "rgba(255,255,255,0.03)" : C.surfaceSoft }}>
                {/* Checkbox header */}
                <th style={{ width: 36, padding: `4px ${D.padX}px`, borderBottom: `2px solid ${dark ? "rgba(255,255,255,0.06)" : C.cardBorder}`, textAlign: "left" }}>
                  <div onClick={toggleAll} style={{
                    width: 14, height: 14, borderRadius: 3, cursor: "pointer",
                    border: `1.5px solid ${selected.size === orders.length && orders.length > 0 ? C.primary : C.textMuted}`,
                    background: selected.size === orders.length && orders.length > 0 ? C.primary : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {selected.size === orders.length && orders.length > 0 && <Check className="h-2.5 w-2.5" style={{ color: "#1a1a1a" }} />}
                  </div>
                </th>
                {cols.map(col => (
                  <th key={col.id} onClick={() => handleSort(col.id)} style={{
                    padding: `4px ${D.padX}px`, width: col.width,
                    borderBottom: `2px solid ${dark ? "rgba(255,255,255,0.06)" : C.cardBorder}`,
                    borderRight: appearance.verticalBorders ? `1px solid ${dark ? "rgba(255,255,255,0.04)" : "#f1f5f9"}` : "none",
                    textAlign: "center", cursor: "pointer",
                    fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: C.textMuted,
                    whiteSpace: "nowrap",
                  }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {col.label}
                      {sortCol === col.id
                        ? <ChevronUp className="h-2.5 w-2.5" style={{ color: C.primary, transition: "transform .15s", transform: sortDir === "desc" ? "rotate(180deg)" : "none" }} />
                        : <ChevronsUpDown className="h-2.5 w-2.5" style={{ color: C.textLight }} />
                      }
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any, idx: number) => {
                const isSel = selected.has(order.id);
                return (
                  <tr key={order.id} style={{
                    borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.04)" : "#f1f5f9"}`,
                    background: isSel ? `${C.primary}08` : appearance.zebra && idx % 2 === 1 ? (dark ? "rgba(255,255,255,0.02)" : "#fafbfc") : "transparent",
                    transition: "background .1s",
                  }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = dark ? "rgba(255,255,255,0.03)" : "#f8fafc"; }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = appearance.zebra && idx % 2 === 1 ? (dark ? "rgba(255,255,255,0.02)" : "#fafbfc") : "transparent"; }}
                  >
                    <td style={{ width: 36, padding: `${D.padY}px ${D.padX}px` }}>
                      <div onClick={() => toggleSel(order.id)} style={{
                        width: 14, height: 14, borderRadius: 3, cursor: "pointer",
                        border: `1.5px solid ${isSel ? C.primary : C.textMuted}`,
                        background: isSel ? C.primary : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {isSel && <Check className="h-2.5 w-2.5" style={{ color: "#1a1a1a" }} />}
                      </div>
                    </td>
                    {visibleCols.has("numero") && <td style={{ padding: `${D.padY}px ${D.padX}px`, fontWeight: 700, color: C.primary, fontSize: D.fs, textAlign: "center" }}>#{order.order_number}</td>}
                    {visibleCols.has("data") && <td style={{ padding: `${D.padY}px ${D.padX}px`, fontSize: D.fs, color: C.textMuted, fontFamily: "monospace", textAlign: "center" }}>{formatDate(order.completed_at)}</td>}
                    {visibleCols.has("empresa") && <td style={{ padding: `${D.padY}px ${D.padX}px`, fontSize: D.fs, fontWeight: 600, color: C.textBody, textAlign: "center", wordBreak: "break-word" }}>{order.company_rel?.name || order.company_name || "—"}</td>}
                    {visibleCols.has("funcionario") && <td style={{ padding: `${D.padY}px ${D.padX}px`, fontSize: D.fs, color: C.textBody, textAlign: "center" }}>{order.employee?.full_name || order.responsible_name || "—"}</td>}
                    {visibleCols.has("tipo") && <td style={{ padding: `${D.padY}px ${D.padX}px`, textAlign: "center" }}><Badge variant="success">{order.service_type_rel?.name || order.service_type || "Servico"}</Badge></td>}
                    {visibleCols.has("qrcode") && <td style={{ padding: `${D.padY}px ${D.padX}px`, textAlign: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: D.fs, color: C.textTitle, display: "block" }}>{order.qr_code?.id_codigo || order.id_codigo || "—"}</span>
                      <span style={{ fontSize: D.fs - 1, color: C.textMuted }}>{order.qr_code?.id_nome || order.id_nome || ""}</span>
                    </td>}
                    {visibleCols.has("observacao") && <td style={{ padding: `${D.padY}px ${D.padX}px`, fontSize: D.fs, color: C.textMuted, textAlign: "center", wordBreak: "break-word" }}>{order.observation || "—"}</td>}
                    {visibleCols.has("local") && (
                      <td style={{ padding: `${D.padY}px ${D.padX}px`, textAlign: "center" }}>
                        {order.latitude && order.longitude ? (
                          <a href={`https://maps.google.com/?q=${order.latitude},${order.longitude}`} target="_blank" rel="noopener noreferrer" style={{ color: C.vermelho, display: "inline-flex" }}>
                            <MapPin className="h-4 w-4" />
                          </a>
                        ) : null}
                      </td>
                    )}
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={cols.length + 1} style={{ padding: "48px 16px", textAlign: "center", color: C.textMuted }}>
                    <Inbox className="h-8 w-8 mx-auto mb-2" style={{ color: C.textLight }} />
                    <p style={{ fontSize: 13, fontWeight: 600 }}>Nenhuma ordem de servico encontrada</p>
                    <p style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>Tente ajustar os filtros de busca</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Cards view */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, padding: 20 }}>
          {orders.map((order: any) => (
            <div key={order.id} style={{
              padding: 16, borderRadius: 10, border: `1px solid ${C.cardBorder}`,
              background: dark ? "rgba(255,255,255,0.03)" : "#fafbfc",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: C.primary, fontSize: 14 }}>#{order.order_number}</span>
                <Badge variant="success">{order.service_type_rel?.name || order.service_type || "Servico"}</Badge>
              </div>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.textBody }}>{order.company_rel?.name || order.company_name || "—"}</p>
              <p style={{ fontSize: 11, color: C.textMuted }}>{order.employee?.full_name || order.responsible_name || "—"}</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 11, color: C.textMuted, fontFamily: "monospace" }}>{formatDate(order.completed_at)}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.textTitle }}>{order.qr_code?.id_codigo || order.id_codigo || ""}{(order.qr_code?.id_nome || order.id_nome) ? ` · ${order.qr_code?.id_nome || order.id_nome}` : ""}</span>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div style={{ gridColumn: "1 / -1", padding: "48px 16px", textAlign: "center", color: C.textMuted }}>
              <Inbox className="h-8 w-8 mx-auto mb-2" style={{ color: C.textLight }} />
              <p style={{ fontSize: 13, fontWeight: 600 }}>Nenhuma ordem encontrada</p>
            </div>
          )}
        </div>
      )}

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 20px", borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : C.cardBorder}`,
        }}>
          <span style={{ fontSize: 11, color: C.textMuted }}>
            Pagina {page} de {totalPages} ({totalCount} resultados)
            {selected.size > 0 && ` · ${selected.size} selecionados`}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}
              style={{ ...btnBase(false), opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? "not-allowed" : "pointer" }}>
              <ChevronLeft className="h-3.5 w-3.5" /> Anterior
            </button>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.primary, padding: "0 8px" }}>{page}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
              style={{ ...btnBase(false), opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? "not-allowed" : "pointer" }}>
              Proximo <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
