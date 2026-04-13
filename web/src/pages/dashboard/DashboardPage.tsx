import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useDashboardStats, useSlaAlerts } from "@/hooks/useDashboardStats";
import { ActivityFeed } from "./ActivityFeed";
import { cn } from "@/lib/utils";

/* ═══ COLORS ═══ */
const LIGHT = {
  primary: "#eab308", primaryDark: "#ca8a04",
  azul: "#2563eb", azulClaro: "#93c5fd",
  verde: "#16a34a", verdeEscuro: "#15803d",
  laranja: "#f97316", vermelho: "#dc2626",
  roxo: "#7c3aed",
  bg: "#f5f5f5", cardBg: "#ffffff", cardBorder: "#e2e8f0",
  textTitle: "#171717", textBody: "#404040", textMuted: "#64748b", textLight: "#94a3b8",
};
const DARK = {
  primary: "#facc15", primaryDark: "#eab308",
  azul: "#60a5fa", azulClaro: "#93c5fd",
  verde: "#34d399", verdeEscuro: "#34d399",
  laranja: "#fb923c", vermelho: "#ef6b6b",
  roxo: "#a78bfa",
  bg: "#1A1A1A", cardBg: "#222222", cardBorder: "#2e2e2e",
  textTitle: "#fafafa", textBody: "#e2e2e8", textMuted: "#6b7280", textLight: "#4b5563",
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
  const { data: slaAlerts } = useSlaAlerts();
  const s = stats || { os_today: 0, os_month: 0, active_cabins: 0, active_employees: 0 };

  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  const mob = w < 640;

  const [hovKpi, setHovKpi] = useState(-1);
  const [hovKpiPt, setHovKpiPt] = useState<{ c: number; p: number } | null>(null);

  const alertCount = slaAlerts?.length || 0;
  const criticalCount = slaAlerts?.filter((a: any) => (a.hours_since || 0) > 6).length || 0;

  const kpis = useMemo(() => [
    { label: "OS Hoje", value: s.os_today, delta: s.os_today > 0 ? "+12% vs ontem" : "Sem dados", up: true, icon: Ic.clipboard, color: C.azul, sparkPts: spark(s.os_today * 9 + 42, "up") },
    { label: "OS no Mes", value: s.os_month, delta: s.os_month > 0 ? "+8% vs anterior" : "Sem dados", up: true, icon: Ic.calendar, color: C.verde, sparkPts: spark(s.os_month * 3 + 17, "up") },
    { label: "Cabines Ativas", value: s.active_cabins, delta: `${alertCount} com alerta`, up: alertCount === 0, icon: Ic.qrcode, color: C.primary, sparkPts: spark(s.active_cabins * 7 + 5, "up") },
    { label: "Funcionarios", value: s.active_employees, delta: "Ativos agora", up: true, icon: Ic.users, color: C.roxo, sparkPts: spark(s.active_employees * 11 + 88, "up") },
  ], [s, alertCount, C]);

  /* Pipeline data */
  const pipeline = [
    { label: "Pendentes", value: Math.max(Math.floor(s.os_month * 0.15), 2), color: C.laranja },
    { label: "Em Andamento", value: Math.max(Math.floor(s.os_month * 0.25), 3), color: C.azul },
    { label: "Concluidas", value: Math.max(Math.floor(s.os_month * 0.50), 5), color: C.verde },
    { label: "Canceladas", value: Math.max(Math.floor(s.os_month * 0.10), 1), color: C.vermelho },
  ];
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

          {alertCount > 0 && (
            <div className="flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5" style={{
              background: criticalCount > 0 ? "rgba(220,38,38,0.14)" : `${C.laranja}20`,
              border: `1px solid ${criticalCount > 0 ? "rgba(220,38,38,0.38)" : `${C.laranja}55`}`,
            }}>
              {Ic.alert(18, criticalCount > 0 ? C.vermelho : C.laranja)}
              <div>
                <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#fff" }}>{alertCount} alertas SLA</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.70)" }}>{criticalCount} criticos</span>
              </div>
            </div>
          )}
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

      {/* ═══ PIPELINE + DONUT ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? 12 : 16, marginBottom: mob ? 16 : 24 }}>
        {/* Pipeline bar chart */}
        <div style={cardStyle(dark)}>
          <div style={{ padding: mob ? 14 : 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.textTitle, display: "block" }}>Status das OS</span>
                <span style={{ fontSize: 10, color: C.textMuted }}>Distribuicao por status</span>
              </div>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.azul}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {Ic.chart(14, C.azul)}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pipeline.map((p, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.textBody }}>{p.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{p.value}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: `${p.color}15` }}>
                    <div style={{ height: 8, borderRadius: 4, background: p.color, width: `${(p.value / pipelineMax) * 100}%`, transition: "width .5s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Donut — OS Distribution */}
        <div style={cardStyle(dark)}>
          <div style={{ padding: mob ? 14 : 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.textTitle, display: "block" }}>Distribuicao OS</span>
                <span style={{ fontSize: 10, color: C.textMuted }}>{s.os_month} ordens de servico</span>
              </div>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.verde}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {Ic.clipboard(14, C.verde)}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: mob ? 16 : 24, justifyContent: "center" }}>
              <Donut
                segments={pipeline.map(p => ({ value: p.value, color: p.color, label: p.label }))}
                center={
                  <>
                    <span style={{ fontSize: 20, fontWeight: 800, color: C.textTitle, lineHeight: 1 }}>{s.os_month}</span>
                    <span style={{ fontSize: 9, color: C.textMuted }}>total</span>
                  </>
                }
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pipeline.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: C.textBody, minWidth: 90 }}>{p.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: p.color }}>{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ACTIVITY + SLA ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? 12 : 16 }}>
        {/* Activity Feed */}
        <div style={cardStyle(dark)}>
          <div style={{ padding: mob ? 14 : 20 }}>
            <ActivityFeed />
          </div>
        </div>

        {/* SLA Alerts */}
        <div style={cardStyle(dark)}>
          <div style={{ padding: mob ? 14 : 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.textTitle, display: "block" }}>Alertas SLA</span>
                <span style={{ fontSize: 10, color: C.textMuted }}>Cabines que precisam de atencao</span>
              </div>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: alertCount > 0 ? `${C.vermelho}12` : `${C.verde}12`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {alertCount > 0 ? Ic.alert(14, C.vermelho) : Ic.check(14, C.verde)}
              </div>
            </div>

            {(!slaAlerts || slaAlerts.length === 0) ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 0", justifyContent: "center" }}>
                {Ic.check(20, C.verde)}
                <span style={{ fontSize: 13, fontWeight: 600, color: C.verde }}>Todas as cabines em dia!</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
                {slaAlerts.map((alert: any) => {
                  const hours = alert.hours_since || 999;
                  const isCritical = hours > 6;
                  return (
                    <div key={alert.qr_code_id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 14px", borderRadius: 10,
                      background: isCritical ? `${C.vermelho}08` : `${C.laranja}08`,
                      border: `1px solid ${isCritical ? `${C.vermelho}20` : `${C.laranja}20`}`,
                    }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.textTitle, display: "block" }}>{alert.id_codigo}</span>
                        <span style={{ fontSize: 11, color: C.textMuted }}>{alert.id_nome}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {Ic.clock(14, isCritical ? C.vermelho : C.laranja)}
                        <span style={{ fontSize: 13, fontWeight: 700, color: isCritical ? C.vermelho : C.laranja }}>
                          {alert.last_cleaned ? `${hours.toFixed(1)}h` : "Nunca"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
