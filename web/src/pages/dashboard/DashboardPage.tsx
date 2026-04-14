import { useState, useMemo, useEffect, useRef } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useDashboardStats, useOsPerDay, useOsYesterday } from "@/hooks/useDashboardStats";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ActivityFeed } from "./ActivityFeed";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { Calendar, Search, X, ChevronDown, FileSpreadsheet, FileText } from "lucide-react";

/* ═══ COLORS ═══ */
const LIGHT = {
  primary: "#eab308", primaryDark: "#ca8a04",
  azul: "#3b82f6", azulClaro: "#93c5fd",
  verde: "#10b981", verdeEscuro: "#059669",
  laranja: "#f59e0b", vermelho: "#ef4444",
  roxo: "#8b5cf6", cyan: "#06b6d4",
  bg: "#f5f5f5", cardBg: "#ffffff", cardBorder: "#e5e7eb",
  textTitle: "#111827", textBody: "#374151", textMuted: "#6b7280", textLight: "#9ca3af",
};
const DARK = {
  primary: "#fbbf24", primaryDark: "#f59e0b",
  azul: "#60a5fa", azulClaro: "#93c5fd",
  verde: "#34d399", verdeEscuro: "#10b981",
  laranja: "#fbbf24", vermelho: "#f87171",
  roxo: "#a78bfa", cyan: "#22d3ee",
  bg: "#111111", cardBg: "#1a1a1a", cardBorder: "#2a2a2a",
  textTitle: "#f9fafb", textBody: "#d1d5db", textMuted: "#6b7280", textLight: "#4b5563",
};

/* ═══ ICONS (inline SVG) ═══ */
const Ic = {
  clipboard: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="5" y="1" width="10" height="3" rx="1" stroke={c} strokeWidth="1.4"/><rect x="3" y="3" width="14" height="15" rx="2" stroke={c} strokeWidth="1.4"/><path d="M7 9h6M7 12h4" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  calendar: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="14" rx="2" stroke={c} strokeWidth="1.4"/><path d="M2 8h16M6 2v4M14 2v4" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><circle cx="10" cy="13" r="1.5" fill={c}/></svg>,
  qrcode: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1" stroke={c} strokeWidth="1.4"/><rect x="11" y="2" width="7" height="7" rx="1" stroke={c} strokeWidth="1.4"/><rect x="2" y="11" width="7" height="7" rx="1" stroke={c} strokeWidth="1.4"/><rect x="13" y="13" width="3" height="3" rx=".5" fill={c}/></svg>,
  users: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="7" cy="6" r="3" stroke={c} strokeWidth="1.4"/><path d="M1 17c0-3 2.5-5 6-5s6 2 6 5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><circle cx="14" cy="7" r="2" stroke={c} strokeWidth="1.2"/><path d="M15 12c2 .5 4 2 4 4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  arrowUp: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 12V4M5 7l3-3 3 3" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  arrowDown: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 4v8M5 9l3 3 3-3" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  alert: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2L1.5 17h17L10 2z" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 8v4M10 14v.5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  check: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke={c} strokeWidth="1.5"/><path d="M7 10l2 2 4-4" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  clock: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke={c} strokeWidth="1.5"/><path d="M10 5.5V10l3 2" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  chart: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="10" width="3" height="7" rx="1" stroke={c} strokeWidth="1.3"/><rect x="8.5" y="6" width="3" height="11" rx="1" stroke={c} strokeWidth="1.3"/><rect x="14" y="3" width="3" height="14" rx="1" stroke={c} strokeWidth="1.3"/></svg>,
};

function spark(seed: number, trend: "up" | "down") {
  const pts: number[] = []; let v = 40 + (seed % 30);
  for (let i = 0; i < 12; i++) { const d = trend === "up" ? 1.4 : -1.2; const n = Math.sin(seed * 0.31 + i * 0.7) * 8; v = Math.min(92, Math.max(8, v + d + n * 0.15)); pts.push(Math.round(v)); }
  return pts;
}
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/* ═══ DONUT ═══ */
function Donut({ segments, size = 130, strokeW = 14, center }: { segments: { value: number; color: string; label: string }[]; size?: number; strokeW?: number; center?: React.ReactNode }) {
  const cx = size / 2, cy = size / 2, r = (size - strokeW - 8) / 2;
  const circ = 2 * Math.PI * r;
  const total = Math.max(segments.reduce((a, s) => a + s.value, 0), 1);
  let acc = 0;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth={strokeW} className="text-border" opacity={0.3} />
        {segments.map((s, i) => {
          const pct = s.value / total;
          const dash = pct * circ;
          const off = acc * circ;
          acc += pct;
          return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={strokeW} strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-off} strokeLinecap="round" style={{ transition: "all .3s" }} />;
        })}
      </svg>
      {center && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          {center}
        </div>
      )}
    </div>
  );
}

/* ═══ MAIN ═══ */
export function DashboardPage() {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const C = dark ? DARK : LIGHT;
  const { data: stats } = useDashboardStats();
  const { data: osPerDay } = useOsPerDay();
  const { data: comparison } = useOsYesterday();
  useRealtimeTable("work_orders", "dashboard-stats");
  useRealtimeTable("work_orders", "os-per-day");
  useRealtimeTable("work_orders", "os-yesterday");
  useRealtimeTable("work_orders", "dashboard-filtered");
  const s = stats || { os_today: 0, os_month: 0, active_cabins: 0, active_employees: 0 };
  const cmp = comparison || { yesterday: 0, prevMonth: 0 };

  // ── Filters ──
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showPeriodo, setShowPeriodo] = useState(false);
  const [periodo, setPeriodo] = useState("Este mes");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const periodoRef = useRef<HTMLDivElement>(null);
  const periodoOptions = ["Hoje", "Ultimos 7 dias", "Este mes", "Ultimos 90 dias", "Este ano", "Todos"];

  useEffect(() => {
    const h = (e: MouseEvent) => { if (periodoRef.current && !periodoRef.current.contains(e.target as Node)) setShowPeriodo(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showPeriodo]);

  const filterRange = useMemo(() => {
    if (dateFrom || dateTo) {
      return {
        from: dateFrom ? new Date(dateFrom).toISOString() : new Date(2020, 0, 1).toISOString(),
        to: dateTo ? new Date(dateTo + "T23:59:59").toISOString() : new Date().toISOString(),
      };
    }
    const now = new Date();
    let from: Date;
    switch (periodo) {
      case "Hoje": from = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
      case "Ultimos 7 dias": from = new Date(now.getTime() - 7 * 86400000); break;
      case "Este mes": from = new Date(now.getFullYear(), now.getMonth(), 1); break;
      case "Ultimos 90 dias": from = new Date(now.getTime() - 90 * 86400000); break;
      case "Este ano": from = new Date(now.getFullYear(), 0, 1); break;
      default: from = new Date(2020, 0, 1); break;
    }
    return { from: from.toISOString(), to: now.toISOString() };
  }, [periodo, dateFrom, dateTo]);

  const { data: rawFiltered } = useQuery({
    queryKey: ["dashboard-filtered", filterRange, profile?.company_id, profile?.role],
    queryFn: async () => {
      if (!profile) return [];
      let q = supabase
        .from("work_orders")
        .select("completed_at, responsible_name, qr_code:qr_codes(id_codigo, id_nome), service_type_rel:service_types(name), company_rel:companies(name)")
        .gte("completed_at", filterRange.from)
        .lte("completed_at", filterRange.to)
        .order("completed_at", { ascending: true });
      // Consultor: filtra por empresa; Admin: vê tudo
      if (profile.role !== "admin" && profile.company_id) q = q.eq("company_id", profile.company_id);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.company_id,
  });

  const filtered = useMemo(() => {
    if (!rawFiltered) return [];
    if (!search) return rawFiltered;
    const q = search.toLowerCase();
    return rawFiltered.filter((r: any) =>
      (r.responsible_name || "").toLowerCase().includes(q) ||
      (r.qr_code?.id_codigo || "").toLowerCase().includes(q) ||
      (r.qr_code?.id_nome || "").toLowerCase().includes(q)
    );
  }, [rawFiltered, search]);

  // ── Cross-filter (Power BI style) ──
  const [crossFilter, setCrossFilter] = useState<{ type: string; value: string } | null>(null);

  const toggleFilter = (type: string, value: string) => {
    setCrossFilter(prev => prev?.type === type && prev?.value === value ? null : { type, value });
  };

  const crossFiltered = useMemo(() => {
    if (!crossFilter) return filtered;
    return (filtered as any[]).filter((r: any) => {
      switch (crossFilter.type) {
        case "cabin": {
          const qr = r.qr_code;
          const name = qr ? `${qr.id_codigo} · ${qr.id_nome}` : "Sem cabine";
          return name === crossFilter.value;
        }
        case "operator": return (r.responsible_name || "Sem nome") === crossFilter.value;
        case "day": {
          const d = new Date(r.completed_at);
          return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) === crossFilter.value;
        }
        case "hour": return new Date(r.completed_at).getHours() === parseInt(crossFilter.value);
        default: return true;
      }
    });
  }, [filtered, crossFilter]);

  // Charts computed from crossFiltered — except the chart that IS the active filter uses full data
  const osByCabin = useMemo(() => {
    const source = crossFilter?.type === "cabin" ? filtered : crossFiltered;
    const counts: Record<string, number> = {};
    for (const r of source as any[]) {
      const qr = (r as any).qr_code;
      const name = qr ? `${qr.id_codigo} · ${qr.id_nome}` : "Sem cabine";
      counts[name] = (counts[name] || 0) + 1;
    }
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [filtered, crossFiltered, crossFilter]);

  const osByOperator = useMemo(() => {
    const source = crossFilter?.type === "operator" ? filtered : crossFiltered;
    const counts: Record<string, number> = {};
    for (const r of source as any[]) {
      const name = (r as any).responsible_name || "Sem nome";
      counts[name] = (counts[name] || 0) + 1;
    }
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [filtered, crossFiltered, crossFilter]);

  const osByDay = useMemo(() => {
    const source = crossFilter?.type === "day" ? filtered : crossFiltered;
    const counts: Record<string, number> = {};
    for (const r of source as any[]) {
      const d = new Date((r as any).completed_at);
      const key = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([day, os]) => ({ day, os }))
      .sort((a, b) => {
        const [da, ma] = a.day.split("/").map(Number);
        const [db, mb] = b.day.split("/").map(Number);
        return ma !== mb ? ma - mb : da - db;
      });
  }, [filtered, crossFiltered, crossFilter]);

  const osByHour = useMemo(() => {
    const source = crossFilter?.type === "hour" ? filtered : crossFiltered;
    const hours = Array(24).fill(0);
    for (const r of source as any[]) {
      const h = new Date((r as any).completed_at).getHours();
      hours[h]++;
    }
    return hours.map((count, i) => ({ hour: `${String(i).padStart(2, "0")}h`, os: count }));
  }, [filtered, crossFiltered, crossFilter]);

  const handleExportPdf = () => {
    if (filtered.length === 0) return;
    const topCabines = osByCabin.slice(0, 10);
    const topOperadores = osByOperator.slice(0, 10);
    const peakHour = osByHour.reduce((max, h) => h.os > max.os ? h : max, { hour: "—", os: 0 });
    const totalFiltered = filtered.length;
    const activeDays = new Set((filtered as any[]).map((r: any) => new Date(r.completed_at).toDateString())).size || 1;
    const avg = (totalFiltered / activeDays).toFixed(1);
    const periodoLabel = dateFrom || dateTo ? `${dateFrom || "inicio"} a ${dateTo || "hoje"}` : periodo;

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Relatorio Serrat</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #1e3a5f, #0f3460); color: #fff; padding: 28px 32px; border-radius: 12px; margin-bottom: 28px; }
  .header h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
  .header p { font-size: 12px; opacity: 0.6; }
  .header .badge { display: inline-block; background: rgba(234,179,8,0.2); border: 1px solid rgba(234,179,8,0.5); color: #eab308; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-top: 12px; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
  .kpi { border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; text-align: center; }
  .kpi .label { font-size: 10px; font-weight: 600; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; }
  .kpi .value { font-size: 28px; font-weight: 800; margin: 4px 0; }
  .kpi .sub { font-size: 10px; color: #9ca3af; }
  .section { margin-bottom: 24px; }
  .section h3 { font-size: 14px; font-weight: 700; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #eab308; display: inline-block; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #f9fafb; text-align: left; padding: 8px 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
  td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; }
  tr:nth-child(even) { background: #fafafa; }
  .bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
  .bar-label { width: 140px; font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bar-track { flex: 1; height: 10px; background: #f3f4f6; border-radius: 5px; }
  .bar-fill { height: 10px; border-radius: 5px; }
  .bar-value { width: 40px; font-size: 12px; font-weight: 700; text-align: right; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; text-align: center; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  @media print { body { padding: 20px; } }
</style></head><body>
<div class="header">
  <h1>Relatorio Operacional — Serrat</h1>
  <p>Periodo: ${periodoLabel} · Gerado em ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
  <span class="badge">${totalFiltered} Ordens de Servico</span>
</div>

<div class="kpis">
  <div class="kpi"><div class="label">Total OS</div><div class="value" style="color:#3b82f6">${totalFiltered}</div><div class="sub">${activeDays} dia(s) com OS</div></div>
  <div class="kpi"><div class="label">Media/Dia</div><div class="value" style="color:#10b981">${avg}</div><div class="sub">OS por dia ativo</div></div>
  <div class="kpi"><div class="label">Cobertura</div><div class="value" style="color:${coverage >= 80 ? '#10b981' : '#f59e0b'}">${coverage}%</div><div class="sub">${osByCabin.filter(c => c.name !== "Sem cabine").length} de ${s.active_cabins} cabines</div></div>
  <div class="kpi"><div class="label">Pico Horario</div><div class="value" style="color:#eab308">${peakHour.hour}</div><div class="sub">${peakHour.os} OS nesse horario</div></div>
</div>

<div class="section">
  <h3>Top Cabines</h3>
  ${topCabines.map((c, i) => `<div class="bar-row"><span class="bar-label">${i + 1}. ${c.name}</span><div class="bar-track"><div class="bar-fill" style="width:${(c.count / (topCabines[0]?.count || 1)) * 100}%;background:#eab308"></div></div><span class="bar-value">${c.count}</span></div>`).join("")}
</div>

<div class="section">
  <h3>Distribuicao por Horario</h3>
  ${(() => {
    const maxH = Math.max(...osByHour.map(h => h.os), 1);
    const bw = 28;
    const gap = 3;
    const chartW = 24 * (bw + gap);
    const chartH = 120;
    const bars = osByHour.map((h, i) => {
      const barH = Math.max((h.os / maxH) * (chartH - 30), h.os > 0 ? 3 : 0);
      const x = i * (bw + gap);
      const y = chartH - 18 - barH;
      return `<rect x="${x}" y="${y}" width="${bw}" height="${barH}" rx="3" fill="${h.os === maxH ? '#eab308' : h.os > 0 ? 'rgba(234,179,8,0.5)' : '#f3f4f6'}"/>
        <text x="${x + bw/2}" y="${chartH - 4}" text-anchor="middle" font-size="8" fill="#6b7280">${h.hour.replace('h','')}</text>
        ${h.os > 0 ? `<text x="${x + bw/2}" y="${y - 4}" text-anchor="middle" font-size="9" font-weight="700" fill="#1a1a1a">${h.os}</text>` : ''}`;
    }).join("");
    return `<svg width="100%" viewBox="0 0 ${chartW} ${chartH}" style="display:block">${bars}</svg>`;
  })()}
</div>

<div class="section">
  <h3>Ordens de Servico Realizadas</h3>
  <table>
    <thead><tr><th>#</th><th>Data</th><th>Funcionario</th><th>Cabine</th><th>Tipo Servico</th></tr></thead>
    <tbody>
      ${(filtered as any[]).map((r: any, i: number) => `<tr>
        <td style="font-weight:700;color:#eab308">${i + 1}</td>
        <td style="font-family:monospace;font-size:11px">${new Date(r.completed_at).toLocaleDateString("pt-BR", { day:"2-digit", month:"2-digit", year:"2-digit", hour:"2-digit", minute:"2-digit" })}</td>
        <td>${r.responsible_name || "—"}</td>
        <td style="font-weight:600">${r.qr_code ? r.qr_code.id_codigo + " · " + r.qr_code.id_nome : "—"}</td>
        <td>${r.service_type_rel?.name || "—"}</td>
      </tr>`).join("")}
    </tbody>
  </table>
</div>

<div class="footer">Serrat · Sistema de Gestao de Ordens de Servico · ${new Date().getFullYear()}</div>
</body></html>`;

    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 300); }
  };

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
    a.href = url; a.download = `relatorio_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  const mob = w < 640;

  const [hovKpi, setHovKpi] = useState(-1);
  const [hovKpiPt, setHovKpiPt] = useState<{ c: number; p: number } | null>(null);


  // Build sparkline from real os_per_day data (last 12 days)
  const realSparkPts = useMemo(() => {
    if (!osPerDay || osPerDay.length === 0) return Array(12).fill(0);
    const last12 = osPerDay.slice(-12);
    while (last12.length < 12) last12.unshift({ date: "", count: 0 });
    return last12.map(d => d.count);
  }, [osPerDay]);

  const todayDelta = useMemo(() => {
    if (cmp.yesterday === 0) return { text: s.os_today > 0 ? `+${s.os_today} hoje` : "Sem OS hoje", up: s.os_today > 0 };
    const diff = s.os_today - cmp.yesterday;
    const pct = Math.round((diff / cmp.yesterday) * 100);
    return { text: `${pct >= 0 ? "+" : ""}${pct}% vs ontem (${cmp.yesterday})`, up: diff >= 0 };
  }, [s.os_today, cmp.yesterday]);

  const monthDelta = useMemo(() => {
    if (cmp.prevMonth === 0) return { text: s.os_month > 0 ? `${s.os_month} este mes` : "Sem dados", up: s.os_month > 0 };
    const diff = s.os_month - cmp.prevMonth;
    const pct = Math.round((diff / cmp.prevMonth) * 100);
    return { text: `${pct >= 0 ? "+" : ""}${pct}% vs mes anterior (${cmp.prevMonth})`, up: diff >= 0 };
  }, [s.os_month, cmp.prevMonth]);

  const coverage = useMemo(() => {
    if (s.active_cabins === 0) return 0;
    const cabinesAtendidas = osByCabin.filter(c => c.name !== "Sem cabine").length;
    return Math.round((cabinesAtendidas / s.active_cabins) * 100);
  }, [osByCabin, s.active_cabins]);

  const kpis = useMemo(() => [
    { label: "OS Hoje", value: s.os_today, delta: todayDelta.text, up: todayDelta.up, icon: Ic.clipboard, color: C.azul, sparkPts: realSparkPts },
    { label: "OS no Mes", value: s.os_month, delta: monthDelta.text, up: monthDelta.up, icon: Ic.calendar, color: C.verde, sparkPts: realSparkPts },
    { label: "Cabines", value: s.active_cabins, delta: `${osByCabin.filter(c => c.name !== "Sem cabine").length} atendidas`, up: true, icon: Ic.qrcode, color: C.primary, sparkPts: realSparkPts },
    { label: "Cobertura", value: `${coverage}%`, delta: `${osByCabin.filter(c => c.name !== "Sem cabine").length} de ${s.active_cabins} cabines`, up: coverage >= 80, icon: Ic.chart, color: coverage >= 80 ? C.verde : C.laranja, sparkPts: realSparkPts },
  ], [s, coverage, C, todayDelta, monthDelta, realSparkPts, osByCabin]);

  /* Cabin distribution from real data */
  const cabinColors = [C.primary, C.primary + "CC", C.primary + "AA", C.primary + "88", C.primary + "66", C.primary + "55", C.primary + "44", C.primary + "33"];
  const pipeline = useMemo(() => {
    if (!osByCabin || osByCabin.length === 0) return [{ label: "Sem dados", value: 0, color: C.textMuted }];
    return osByCabin.slice(0, 8).map((cab, i) => ({
      label: cab.name,
      value: cab.count,
      color: cabinColors[i % cabinColors.length],
    }));
  }, [osByCabin, C]);
  const pipelineMax = Math.max(...pipeline.map(p => p.value), 1);

  /* Card style */
  const cardStyle = (dark: boolean): React.CSSProperties => ({
    background: dark ? "rgba(255,255,255,0.08)" : C.cardBg,
    backdropFilter: dark ? "blur(8px)" : undefined,
    border: `1px solid ${dark ? "rgba(255,255,255,0.10)" : C.cardBorder}`,
    borderRadius: "12px 12px 12px 24px",
    boxShadow: dark ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
  });

  const userName = profile?.full_name?.split(" ")[0] || "Admin";

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: C.textBody }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* ═══ HERO ═══ */}
      <div style={{
        background: dark
          ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
          : "linear-gradient(135deg, #1e3a5f 0%, #0f3460 40%, #1a1a2e 100%)",
        borderRadius: "16px 16px 16px 28px",
        padding: mob ? "20px 16px" : "28px 32px",
        marginBottom: mob ? 16 : 24,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative lines */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, pointerEvents: "none" }}>
          <svg width="100%" height="100%" viewBox="0 0 400 150" preserveAspectRatio="none">
            <line x1="0" y1="30" x2="400" y2="120" stroke="white" strokeWidth="1" />
            <line x1="0" y1="80" x2="400" y2="40" stroke="white" strokeWidth="0.5" />
            <line x1="200" y1="0" x2="200" y2="150" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex shrink-0 items-center justify-center" style={{
              width: 52, height: 52, borderRadius: 14,
              background: `linear-gradient(135deg, ${C.primary}20, ${C.primaryDark}10)`,
              border: `1px solid ${C.primary}30`,
            }}>
              {Ic.chart(24, C.primary)}
            </div>
            <div className="min-w-0">
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: `${C.primary}20`, border: `1px solid ${C.primary}55`,
                borderRadius: 20, padding: "4px 12px",
                fontSize: 10, fontWeight: 600, color: C.primary, marginBottom: 8,
              }}>
                Bem-vindo, {userName}
              </div>
              <h2 style={{ fontSize: mob ? 20 : 22, fontWeight: 800, color: "#fff", lineHeight: 1.2, margin: 0 }}>
                Painel <span style={{ color: C.primary }}>Operacional</span>
              </h2>
              <p style={{ fontSize: mob ? 12 : 13, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                Serrat · Gestao de Ordens de Servico · {s.os_month} OS este mes
              </p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.30)", marginTop: 4 }}>
                {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ═══ TOOLBAR ═══ */}
      <div style={{ ...cardStyle(dark), marginBottom: mob ? 16 : 24, overflow: "visible" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "10px 16px" }}>
          <div onClick={e => { (e.currentTarget.querySelector("input") as HTMLInputElement)?.focus(); }} style={{
            display: "flex", alignItems: "center", gap: 8, height: 35, minWidth: 180, maxWidth: 280, flex: 1,
            padding: "0 12px", borderRadius: 8, cursor: "text",
            border: `1.5px solid ${searchFocused ? C.primary : (dark ? "rgba(255,255,255,0.10)" : "#CBD5E1")}`,
            boxShadow: searchFocused ? `0 0 0 3px ${C.primary}20` : "none",
            background: "transparent", transition: "all .15s",
          }}>
            <Search className="h-[14px] w-[14px] shrink-0" style={{ color: C.textMuted }} />
            <input value={search} onChange={e => setSearch(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              placeholder="Buscar cabine, funcionario..." style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 12, color: C.textBody, minWidth: 0 }} />
            {search && <span onClick={e => { e.stopPropagation(); setSearch(""); }} style={{ cursor: "pointer", display: "flex" }}><X className="h-[13px] w-[13px]" style={{ color: C.textMuted }} /></span>}
          </div>

          <div ref={periodoRef} style={{ position: "relative" }}>
            <button onClick={() => setShowPeriodo(!showPeriodo)} style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
              border: `1.5px solid ${showPeriodo ? C.primary : (dark ? "rgba(255,255,255,0.10)" : "#CBD5E1")}`,
              background: showPeriodo ? `${C.primary}12` : "transparent", color: C.textBody, cursor: "pointer",
            }}>
              <Calendar className="h-[13px] w-[13px]" style={{ color: C.textMuted }} />
              <span style={{ fontWeight: 700, color: C.textTitle }}>{dateFrom || dateTo ? "Personalizado" : periodo}</span>
              <ChevronDown className={cn("h-[10px] w-[10px] transition-transform", showPeriodo && "rotate-180")} style={{ color: C.textMuted }} />
            </button>
            {showPeriodo && (
              <div style={{ position: "absolute", left: 0, bottom: "calc(100% + 6px)", zIndex: 50, minWidth: 200, borderRadius: 10, background: dark ? C.cardBg : "#fff", border: `1px solid ${C.cardBorder}`, boxShadow: "0 12px 36px rgba(0,0,0,0.18)", padding: "6px 0" }}>
                {periodoOptions.map(opt => {
                  const isA = periodo === opt && !dateFrom && !dateTo;
                  return (
                    <div key={opt} onClick={() => { setPeriodo(opt); setDateFrom(""); setDateTo(""); setShowPeriodo(false); }}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", fontSize: 11, cursor: "pointer", fontWeight: isA ? 700 : 500, color: isA ? C.primary : C.textBody, background: isA ? `${C.primary}12` : "transparent" }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", border: `1.5px solid ${isA ? C.primary : C.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{isA && <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.primary }} />}</div>
                      {opt}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{ height: 35, borderRadius: 8, border: `1.5px solid ${dark ? "rgba(255,255,255,0.10)" : "#CBD5E1"}`, background: "transparent", color: C.textBody, padding: "0 8px", fontSize: 11, outline: "none" }} />
            <span style={{ fontSize: 10, color: C.textMuted }}>ate</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{ height: 35, borderRadius: 8, border: `1.5px solid ${dark ? "rgba(255,255,255,0.10)" : "#CBD5E1"}`, background: "transparent", color: C.textBody, padding: "0 8px", fontSize: 11, outline: "none" }} />
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(""); setDateTo(""); }} style={{ fontSize: 10, fontWeight: 600, color: C.vermelho, background: "none", border: "none", cursor: "pointer" }}>Limpar</button>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {crossFilter && (
            <button onClick={() => setCrossFilter(null)} style={{
              display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 20,
              background: `${C.primary}18`, border: `1px solid ${C.primary}40`, fontSize: 11, fontWeight: 700,
              color: C.primary, cursor: "pointer",
            }}>
              {crossFilter.type === "cabin" ? "Cabine" : crossFilter.type === "operator" ? "Funcionario" : crossFilter.type === "day" ? "Dia" : "Horario"}: {crossFilter.value}{crossFilter.type === "hour" ? "h" : ""}
              <X className="h-3 w-3" />
            </button>
          )}
          <span style={{ fontSize: 11, fontWeight: 600, color: C.textMuted }}>{crossFiltered.length} OS</span>
          <button onClick={handleExportCsv} title="Exportar CSV" style={{
            width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${dark ? "rgba(255,255,255,0.10)" : C.cardBorder}`, background: "transparent", color: "#1D6F42", cursor: "pointer",
          }}>
            <FileSpreadsheet className="h-4 w-4" />
          </button>
          <button onClick={handleExportPdf} title="Gerar PDF / Imprimir" style={{
            width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${dark ? "rgba(255,255,255,0.10)" : C.cardBorder}`, background: "transparent", color: C.vermelho, cursor: "pointer",
          }}>
            <FileText className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ═══ KPIs ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: mob ? 10 : 16, marginBottom: mob ? 16 : 24 }}>
        {kpis.map((k, i) => {
          const max = Math.max(...k.sparkPts), min = Math.min(...k.sparkPts);
          const sw2 = 200, sh = 40;
          const pts = k.sparkPts.map((v, j) => ({ x: (j / (k.sparkPts.length - 1)) * sw2, y: sh - ((v - min) / (max - min || 1)) * (sh - 8) + 4 }));
          const line = pts.map(p => `${p.x},${p.y}`).join(" ");
          const uid = `kpi${i}`;
          const hovPt = hovKpiPt && hovKpiPt.c === i ? hovKpiPt.p : -1;

          return (
            <div
              key={i}
              style={{ ...cardStyle(dark), animation: `fadeUp .35s ease ${i * 0.06}s both`, position: "relative" }}
              onMouseEnter={() => setHovKpi(i)}
              onMouseLeave={() => { setHovKpi(-1); setHovKpiPt(null); }}
            >
              <div style={{ padding: mob ? "14px 12px 6px" : "18px 20px 6px", position: "relative", zIndex: 2 }}>
                <div style={{
                  position: "absolute", top: mob ? 12 : 16, right: mob ? 10 : 16,
                  width: mob ? 34 : 40, height: mob ? 34 : 40, borderRadius: mob ? 9 : 12,
                  background: `${k.color}12`, border: `1px solid ${k.color}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {k.icon(mob ? 16 : 20, k.color)}
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.textMuted, display: "block", marginBottom: mob ? 6 : 8 }}>
                  {k.label}
                </span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, paddingRight: mob ? 40 : 48 }}>
                  <span style={{ fontSize: mob ? 22 : 26, fontWeight: 800, color: C.textTitle, lineHeight: 1, letterSpacing: "-0.02em" }}>
                    {typeof k.value === "number" ? k.value.toLocaleString("pt-BR") : k.value}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, lineHeight: 1.35 }}>
                    <span style={{ color: k.up ? C.verde : C.laranja, fontWeight: 700 }}>{k.up ? "▲ " : "▼ "}</span>
                    {k.delta}
                  </span>
                </div>
              </div>
              {/* Sparkline */}
              <div style={{ overflow: "hidden", borderRadius: "0 0 12px 24px", marginLeft: -1, marginRight: -1, marginBottom: -1 }}>
                <svg width="100%" height={sh + 16} viewBox={`-2 -12 ${sw2 + 4} ${sh + 28}`} preserveAspectRatio="none" style={{ display: "block" }} onMouseLeave={() => setHovKpiPt(null)}>
                  <defs><linearGradient id={`ga${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={k.color} stopOpacity=".18" /><stop offset="100%" stopColor={k.color} stopOpacity="0" /></linearGradient></defs>
                  <polygon points={`0,${sh} ${line} ${sw2},${sh}`} fill={`url(#ga${uid})`} />
                  <polyline points={line} fill="none" stroke={k.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  {pts.map((p, j) => (
                    <g key={j} onMouseEnter={() => setHovKpiPt({ c: i, p: j })} style={{ cursor: "pointer" }}>
                      <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
                      <circle cx={p.x} cy={p.y} r={hovPt === j ? 4 : 0} fill={k.color} style={{ transition: "r .15s" }} />
                      {hovPt === j && (
                        <>
                          <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="9" fontWeight="700" fill={k.color}>{k.sparkPts[j]}</text>
                          <text x={p.x} y={sh + 10} textAnchor="middle" fontSize="7" fill={C.textMuted}>{MONTHS[j]}</text>
                        </>
                      )}
                    </g>
                  ))}
                  {pts.map((p, j) => j % 2 === 0 && hovPt === -1 ? <text key={`m${j}`} x={p.x} y={sh + 10} textAnchor="middle" fontSize="7" fill={C.textLight}>{MONTHS[j]}</text> : null)}
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ DISTRIBUIÇÃO POR HORÁRIO ═══ */}
      <div style={{ ...cardStyle(dark), marginBottom: mob ? 16 : 24 }}>
        <div style={{ padding: mob ? 14 : 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.textTitle, display: "block" }}>Distribuicao por Horario</span>
              <span style={{ fontSize: 10, color: C.textMuted }}>OS por hora do dia — este mes</span>
            </div>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.verde}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {Ic.clock(14, C.verde)}
            </div>
          </div>
          {(() => {
            const hours = osByHour || Array(24).fill(null).map((_, i) => ({ hour: `${String(i).padStart(2, "0")}h`, os: 0 }));
            const maxOs = Math.max(...hours.map(h => h.os), 1);
            const barW = 100 / 24;
            return (
              <div style={{ position: "relative", height: 120 }}>
                <div style={{ display: "flex", alignItems: "flex-end", height: "100%", gap: 2 }}>
                  {hours.map((h, i) => {
                    const pct = (h.os / maxOs) * 100;
                    const isActive = h.os > 0;
                    const isSel = crossFilter?.type === "hour" && crossFilter.value === String(i);
                    const isDimmed = crossFilter?.type === "hour" && !isSel;
                    return (
                      <div key={i} onClick={() => isActive && toggleFilter("hour", String(i))} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height: "100%", justifyContent: "flex-end", cursor: isActive ? "pointer" : "default", opacity: isDimmed ? 0.3 : 1, transition: "opacity .2s" }} title={`${h.hour}: ${h.os} OS`}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: isActive ? C.verde : "transparent" }}>{h.os}</span>
                        <div style={{
                          width: "100%", minHeight: 2, height: `${Math.max(pct, 2)}%`,
                          borderRadius: "3px 3px 0 0",
                          background: isActive
                            ? (isSel ? `linear-gradient(180deg, ${C.verde}, ${C.verdeEscuro})` : h.os === maxOs ? `linear-gradient(180deg, ${C.verde}, ${C.verdeEscuro})` : `${C.verde}80`)
                            : (dark ? "rgba(255,255,255,0.06)" : "#f1f5f9"),
                          transition: "all .2s ease",
                          boxShadow: isSel ? `0 0 8px ${C.verde}60` : "none",
                        }} />
                        {i % 3 === 0 && (
                          <span style={{ fontSize: 8, color: C.textMuted, marginTop: 2 }}>{h.hour}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ═══ OS POR DIA ═══ */}
      <div style={{ ...cardStyle(dark), marginBottom: mob ? 16 : 24 }}>
        <div style={{ padding: mob ? 14 : 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.textTitle, display: "block" }}>OS por Dia</span>
              <span style={{ fontSize: 10, color: C.textMuted }}>Ordens realizadas por dia no periodo</span>
            </div>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.verde}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {Ic.calendar(14, C.verde)}
            </div>
          </div>
          {(() => {
            if (osByDay.length === 0) return <p style={{ textAlign: "center", color: C.textMuted, padding: 20, fontSize: 13 }}>Sem dados no periodo</p>;
            const maxDay = Math.max(...osByDay.map(d => d.os), 1);
            const barW = Math.max(Math.floor(700 / osByDay.length) - 3, 8);
            return (
              <div style={{ position: "relative", height: 140 }}>
                <div style={{ display: "flex", alignItems: "flex-end", height: "100%", gap: 2, overflowX: osByDay.length > 30 ? "auto" : "visible" }}>
                  {osByDay.map((d, i) => {
                    const pct = (d.os / maxDay) * 100;
                    const isSel = crossFilter?.type === "day" && crossFilter.value === d.day;
                    const isDimmed = crossFilter?.type === "day" && !isSel;
                    return (
                      <div key={i} onClick={() => toggleFilter("day", d.day)} style={{ flex: osByDay.length <= 30 ? 1 : "none", width: osByDay.length > 30 ? barW : undefined, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height: "100%", justifyContent: "flex-end", minWidth: 0, cursor: "pointer", opacity: isDimmed ? 0.3 : 1, transition: "opacity .2s" }} title={`${d.day}: ${d.os} OS`}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: isSel ? C.verde : d.os === maxDay ? C.verde : C.textMuted }}>{d.os}</span>
                        <div style={{
                          width: "100%", minHeight: 2, height: `${Math.max(pct, 3)}%`,
                          borderRadius: "3px 3px 0 0",
                          background: isSel ? `linear-gradient(180deg, ${C.verde}, ${C.verdeEscuro})` : d.os === maxDay ? `linear-gradient(180deg, ${C.verde}, ${C.verdeEscuro})` : `${C.verde}60`,
                          transition: "all .2s ease",
                          boxShadow: isSel ? `0 0 8px ${C.verde}60` : "none",
                        }} />
                        {(osByDay.length <= 15 || i % Math.ceil(osByDay.length / 15) === 0) && (
                          <span style={{ fontSize: 7, color: C.textMuted, marginTop: 2, whiteSpace: "nowrap" }}>{d.day}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ═══ PIPELINE + DONUT ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? 12 : 16, marginBottom: mob ? 16 : 24 }}>
        {/* Pipeline bar chart */}
        <div style={cardStyle(dark)}>
          <div style={{ padding: mob ? 14 : 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.textTitle, display: "block" }}>OS por Cabine</span>
                <span style={{ fontSize: 10, color: C.textMuted }}>Top cabines este mes</span>
              </div>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.primary}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {Ic.chart(14, C.primary)}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pipeline.map((p, i) => {
                const isSel = crossFilter?.type === "cabin" && crossFilter.value === p.label;
                const isDimmed = crossFilter?.type === "cabin" && !isSel;
                return (
                  <div key={i} onClick={() => toggleFilter("cabin", p.label)} style={{ cursor: "pointer", opacity: isDimmed ? 0.3 : 1, transition: "opacity .2s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: isSel ? 700 : 500, color: isSel ? C.primary : C.textBody }}>{p.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{p.value}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: `${p.color}15` }}>
                      <div style={{ height: 8, borderRadius: 4, background: p.color, width: `${(p.value / pipelineMax) * 100}%`, transition: "all .3s ease", boxShadow: isSel ? `0 0 8px ${p.color}60` : "none" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bar chart — OS por Funcionario */}
        <div style={cardStyle(dark)}>
          <div style={{ padding: mob ? 14 : 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.textTitle, display: "block" }}>OS por Funcionario</span>
                <span style={{ fontSize: 10, color: C.textMuted }}>Produtividade este mes</span>
              </div>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.roxo}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {Ic.users(14, C.roxo)}
              </div>
            </div>
            {(() => {
              const ops = (osByOperator || []).slice(0, 8);
              const maxOps = Math.max(...ops.map(o => o.count), 1);
              const barColors = [C.roxo, C.roxo + "CC", C.roxo + "99", C.roxo + "77", C.roxo + "55", C.roxo + "44", C.roxo + "33", C.roxo + "22"];
              return ops.length === 0 ? (
                <p style={{ textAlign: "center", color: C.textMuted, padding: 20, fontSize: 13 }}>Sem dados este mes</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {ops.map((o, i) => {
                    const isSel = crossFilter?.type === "operator" && crossFilter.value === o.name;
                    const isDimmed = crossFilter?.type === "operator" && !isSel;
                    return (
                      <div key={i} onClick={() => toggleFilter("operator", o.name)} style={{ cursor: "pointer", opacity: isDimmed ? 0.3 : 1, transition: "opacity .2s" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: isSel ? 800 : 600, color: isSel ? C.roxo : C.textBody }}>{o.name}</span>
                          <span style={{ fontSize: 12, fontWeight: 800, color: isSel ? C.roxo : i === 0 ? C.roxo : C.textMuted }}>{o.count}</span>
                        </div>
                        <div style={{ height: 10, borderRadius: 5, background: dark ? "rgba(255,255,255,0.06)" : "#f1f5f9" }}>
                          <div style={{ height: 10, borderRadius: 5, background: barColors[i] || C.roxo + "30", width: `${(o.count / maxOps) * 100}%`, transition: "all .3s ease", boxShadow: isSel ? `0 0 8px ${C.roxo}60` : "none" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ═══ ACTIVITY + SLA ═══ */}
      {/* ═══ ACTIVITY ═══ */}
      <div style={cardStyle(dark)}>
        <div style={{ padding: mob ? 14 : 20 }}>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
