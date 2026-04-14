import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X, Zap, ChevronRight, Timer } from "lucide-react";
import {
  LayoutDashboard,
  ClipboardList,
  QrCode,
  Users,
  Building2,
  Wrench,
  BarChart3,
  Smartphone,
  CloudDownload,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef, type ElementType } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useSidebarCollapse } from "@/hooks/useSidebarCollapse";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/* ─── Menu ─── */
interface MenuItem {
  icon: ElementType;
  label: string;
  href?: string;
  action?: string;
  external?: boolean;
  adminOnly?: boolean;
}

const NAV_ITEMS: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: ROUTES.DASHBOARD },
  { icon: ClipboardList, label: "Ordens de Serviço", href: ROUTES.WORK_ORDERS },
  { icon: QrCode, label: "QR Codes", href: ROUTES.QR_CODES, adminOnly: true },
  { icon: Users, label: "Usuarios", href: ROUTES.EMPLOYEES, adminOnly: true },
  { icon: Building2, label: "Empresas", href: ROUTES.COMPANIES, adminOnly: true },
  { icon: Wrench, label: "Tipos de Serviço", href: ROUTES.SERVICE_TYPES },
  { icon: CloudDownload, label: "Sincronizacao", href: ROUTES.SYNC, adminOnly: true },
  { icon: Smartphone, label: "Operador", href: "/operador/scanner", external: true, adminOnly: true },
];

/* ─── Neumorphic tokens ─── */
const W_FULL = 230;
const W_MINI = 72;

const TILE_DARK = {
  borderIdle: "#3f3f46",
  borderHover: "rgba(234,179,8,0.4)",
  borderActive: "rgba(234,179,8,0.5)",
  bgIdle: "linear-gradient(160deg, #303036 0%, #222226 55%, #1c1c20 100%)",
  bgHover: "linear-gradient(135deg,#facc15,#eab308)",
  shadowIdle:
    "0 3px 10px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.08) inset, 0 -1px 0 rgba(0,0,0,0.45) inset",
  shadowHover:
    "0 6px 22px -4px rgba(234,179,8,0.5), 0 3px 10px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.12) inset, 0 -1px 0 rgba(0,0,0,0.35) inset",
  shadowActive:
    "0 4px 18px -2px rgba(234,179,8,0.42), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -2px 6px rgba(0,0,0,0.45)",
  iconIdle: "#a1a1aa",
  iconOnAccent: "#1a1a1a",
} as const;

const TILE_LIGHT = {
  borderIdle: "rgba(0,0,0,0.10)",
  bgIdle: "linear-gradient(145deg, #ffffff 0%, #ebebeb 55%, #e0e0e0 100%)",
  shadowIdle: "0 1px 2px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.85)",
  iconIdle: "rgba(55,55,55,0.82)",
} as const;

const SHIMMER_ACCENT =
  "linear-gradient(135deg,transparent,rgba(255,255,255,0.25) 50%,transparent)";
const SHIMMER_ON_PRIMARY =
  "linear-gradient(135deg,transparent,rgba(255,255,255,0.38) 50%,transparent)";

/* ─── CSS injection ─── */
const CSS = `
@keyframes shimmerSweep {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.sb-nav::-webkit-scrollbar { display: none; }
.sb-range {
  -webkit-appearance: none; appearance: none;
  width: 100%; height: 6px; border-radius: 3px; outline: none;
}
.sb-range::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 18px; height: 18px; border-radius: 50%;
  background: #fff; border: 2px solid #eab308;
  box-shadow: 0 1px 4px rgba(0,0,0,.1); cursor: pointer;
}
`;
if (typeof document !== "undefined" && !document.getElementById("sb-css")) {
  const s = document.createElement("style");
  s.id = "sb-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════
   AutoModal — "Menu Automatico"
   ═══════════════════════════════════════════════ */
function AutoModal({
  open, onClose,
  autoCollapse, onAutoCollapseChange,
  seconds, onSecondsChange,
}: {
  open: boolean; onClose: () => void;
  autoCollapse: boolean; onAutoCollapseChange: (v: boolean) => void;
  seconds: number; onSecondsChange: (v: number) => void;
}) {
  const pct = ((seconds - 1) / 29) * 100;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="auto-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 9998,
            }}
          />
          <motion.div
            key="auto-dialog"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            style={{
              position: "fixed", top: "50%", left: 80,
              transform: "translateY(-50%)",
              zIndex: 9999,
              width: 400, maxWidth: "calc(100vw - 32px)",
              background: "linear-gradient(165deg, #232328 0%, #1a1a1e 50%, #151518 100%)",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.08)",
              padding: 0,
              boxShadow:
                "0 30px 60px -15px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.06) inset",
              overflow: "hidden",
            }}
          >
            {/* Grain texture */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: 20, pointerEvents: "none",
              opacity: 0.03, mixBlendMode: "overlay",
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E")`,
            }} />

            {/* Accent line */}
            <div style={{
              height: 3,
              background: "linear-gradient(90deg, #eab308, #ca8a04 50%, transparent)",
              borderRadius: "20px 20px 0 0",
            }} />

            <div style={{ padding: "24px 28px 28px", position: "relative" }}>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.25 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: TILE_DARK.bgIdle,
                    border: `1px solid ${TILE_DARK.borderIdle}`,
                    boxShadow: TILE_DARK.shadowIdle,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Zap size={16} style={{ color: TILE_DARK.iconIdle }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fafafa", margin: 0 }}>
                      Menu Automatico
                    </h3>
                    <p style={{ fontSize: 11, color: "#71717a", margin: "2px 0 0" }}>
                      Comportamento do menu lateral
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: "#71717a", transition: "all .15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(245,158,11,0.15)";
                    e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)";
                    e.currentTarget.style.color = "#eab308";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "#71717a";
                  }}
                >
                  <X size={14} />
                </button>
              </motion.div>

              {/* Toggle */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.25 }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                  padding: "14px 16px", borderRadius: 12,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#e4e4e7" }}>
                    Fechar automaticamente
                  </span>
                  <p style={{ fontSize: 11, color: "#71717a", margin: "3px 0 0" }}>
                    {autoCollapse ? "Menu recolhe apos inatividade" : "Menu permanece aberto"}
                  </p>
                </div>
                <button
                  type="button" role="switch" aria-checked={autoCollapse}
                  onClick={() => onAutoCollapseChange(!autoCollapse)}
                  style={{
                    width: 48, height: 26, borderRadius: 13,
                    border: `1px solid ${autoCollapse ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.12)"}`,
                    background: autoCollapse
                      ? "linear-gradient(135deg, #eab308, #ca8a04)"
                      : "rgba(255,255,255,0.06)",
                    padding: 3, cursor: "pointer", flexShrink: 0,
                    transition: "all .25s ease",
                    boxShadow: autoCollapse
                      ? "0 0 16px rgba(245,158,11,0.25), inset 0 1px 0 rgba(255,255,255,0.15)"
                      : "inset 0 1px 3px rgba(0,0,0,0.3)",
                  }}
                >
                  <motion.span
                    animate={{ x: autoCollapse ? 22 : 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    style={{
                      display: "block", width: 18, height: 18, borderRadius: "50%",
                      background: "#fff",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                    }}
                  />
                </button>
              </motion.div>

              {/* Slider */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: autoCollapse ? 1 : 0.35, y: 0 }}
                transition={{ delay: 0.2, duration: 0.25 }}
                style={{
                  marginTop: 12, padding: "16px 16px 14px", borderRadius: 12,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  transition: "opacity .25s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#a1a1aa" }}>Tempo para fechar</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <motion.span
                      key={seconds}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ fontSize: 22, fontWeight: 800, color: "#eab308", lineHeight: 1 }}
                    >
                      {seconds}
                    </motion.span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#71717a" }}>seg</span>
                  </div>
                </div>

                <div style={{ position: "relative", height: 6, borderRadius: 3, marginBottom: 10 }}>
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: 3,
                    background: "rgba(255,255,255,0.08)",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
                  }} />
                  <motion.div
                    animate={{ width: `${pct}%` }}
                    transition={{ type: "spring", damping: 20, stiffness: 200 }}
                    style={{
                      position: "absolute", top: 0, left: 0, height: "100%",
                      borderRadius: 3,
                      background: "linear-gradient(90deg, #eab308, #ca8a04)",
                      boxShadow: "0 0 10px rgba(245,158,11,0.3)",
                    }}
                  />
                  <input
                    type="range" className="sb-range"
                    min={1} max={30} step={1} value={seconds}
                    disabled={!autoCollapse}
                    onChange={(e) => onSecondsChange(Number(e.target.value))}
                    style={{
                      position: "absolute", inset: 0, width: "100%",
                      opacity: 0, cursor: autoCollapse ? "pointer" : "not-allowed",
                      margin: 0,
                    }}
                  />
                  <motion.div
                    animate={{ left: `${pct}%` }}
                    transition={{ type: "spring", damping: 20, stiffness: 200 }}
                    style={{
                      position: "absolute", top: "50%",
                      width: 18, height: 18, borderRadius: "50%",
                      background: "#fff",
                      border: "2px solid #eab308",
                      boxShadow: "0 2px 8px rgba(245,158,11,0.3), 0 1px 3px rgba(0,0,0,0.2)",
                      transform: "translate(-50%, -50%)",
                      pointerEvents: "none",
                    }}
                  />
                </div>

                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: 10, fontWeight: 600, color: "#52525b",
                  letterSpacing: "0.05em",
                }}>
                  <span>1s</span><span>15s</span><span>30s</span>
                </div>
              </motion.div>

              {/* Status */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}
              >
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: autoCollapse ? "#eab308" : "#52525b",
                  boxShadow: autoCollapse ? "0 0 8px rgba(245,158,11,0.5)" : "none",
                  transition: "all .3s",
                }} />
                <span style={{ fontSize: 11, color: "#71717a", fontWeight: 500 }}>
                  {autoCollapse ? `Ativo — recolhe em ${seconds}s de inatividade` : "Desativado"}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ═══════════════════════════════════════════════
   SidebarItem
   ═══════════════════════════════════════════════ */
function SidebarItem({
  item, mini, dark, onAction,
}: {
  item: MenuItem;
  mini: boolean;
  dark: boolean;
  onAction?: (a: string) => void;
}) {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);

  const isActive = Boolean(item.href && !item.external && location.pathname.startsWith(item.href));

  const D = TILE_DARK;
  const L = TILE_LIGHT;

  const tileBorder = isActive
    ? D.borderActive
    : hovered
      ? D.borderHover
      : dark ? D.borderIdle : L.borderIdle;

  const tileBackground =
    isActive || hovered ? D.bgHover : dark ? D.bgIdle : L.bgIdle;

  const tileShadow =
    !isActive && !hovered
      ? dark ? D.shadowIdle : L.shadowIdle
      : isActive ? D.shadowActive : D.shadowHover;

  const tileIconColor =
    isActive || hovered ? D.iconOnAccent : dark ? D.iconIdle : L.iconIdle;

  const inner = (
    <div
      className="flex items-center cursor-pointer"
      title={mini ? item.label : undefined}
      style={{
        gap: mini ? 0 : 12,
        padding: mini ? "8px 0" : "6px 12px",
        margin: mini ? "2px 8px" : "1px 8px",
        borderRadius: 8,
        justifyContent: mini ? "center" : "flex-start",
        transition: "background .15s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (item.action && onAction) onAction(item.action);
      }}
    >
      {/* Neumorphic icon tile */}
      <div
        className="relative flex flex-shrink-0 items-center justify-center overflow-hidden"
        style={{
          width: 36, height: 36, borderRadius: 10,
          border: `1px solid ${tileBorder}`,
          background: tileBackground,
          boxShadow: tileShadow,
          transform: hovered && !isActive ? "translateY(-1px)" : "none",
          transition: isActive || hovered ? "all .3s ease" : "all .25s ease",
        }}
      >
        {/* Shimmer sweep */}
        <div style={{
          position: "absolute", inset: 0,
          background: hovered || isActive ? SHIMMER_ON_PRIMARY : SHIMMER_ACCENT,
          transform: hovered || isActive ? "translateX(0)" : "translateX(-100%)",
          animation: hovered || isActive ? "shimmerSweep .5s ease forwards" : "none",
          pointerEvents: "none",
        }} />
        <item.icon
          size={17}
          style={{
            position: "relative", zIndex: 1,
            color: tileIconColor,
            transition: "color .2s",
          }}
        />
      </div>

      {/* Label */}
      {!mini && (
        <span style={{
          fontSize: 13, fontWeight: isActive ? 600 : 400,
          letterSpacing: ".01em", flex: 1,
          color: dark
            ? isActive ? "#fafafa" : hovered ? "#fafafa" : "#a1a1aa"
            : isActive ? "#854d0e" : hovered ? "#ca8a04" : "#404040",
          transition: "color .15s",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {item.label}
        </span>
      )}

      {/* Active chevron */}
      {!mini && isActive && (
        <ChevronRight size={14} style={{ color: dark ? "#a1a1aa" : "#854d0e", opacity: 0.6, flexShrink: 0 }} />
      )}
    </div>
  );

  if (item.href && !item.action) {
    if (item.external) {
      return <a href={item.href} target="_blank" rel="noopener noreferrer">{inner}</a>;
    }
    return <NavLink to={item.href}>{inner}</NavLink>;
  }
  return <div>{inner}</div>;
}

/* ═══════════════════════════════════════════════
   Sidebar
   ═══════════════════════════════════════════════ */
export function Sidebar({ onHoveringChange }: { onHoveringChange?: (hovering: boolean) => void }) {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const { collapsed, setCollapsed } = useSidebarCollapse();
  const [hovering, setHovering] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persisted auto-collapse settings
  const [autoCollapse, setAutoCollapse] = useState(() => {
    try {
      const stored = localStorage.getItem("sb_auto");
      if (stored === null) return true; // padrão: automático
      return stored === "1";
    } catch { return true; }
  });
  const [seconds, setSeconds] = useState(() => {
    try { return Number(localStorage.getItem("sb_sec")) || 5; } catch { return 5; }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sb_auto", autoCollapse ? "1" : "0");
      localStorage.setItem("sb_sec", String(seconds));
    } catch {}
  }, [autoCollapse, seconds]);

  // Timer logic
  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    if (!autoCollapse || modalOpen) return;
    timerRef.current = setTimeout(() => setCollapsed(true), seconds * 1000);
  }, [autoCollapse, seconds, modalOpen, clearTimer, setCollapsed]);

  useEffect(() => {
    if (autoCollapse) startTimer();
    else { clearTimer(); setCollapsed(false); }
    return clearTimer;
  }, [autoCollapse, seconds, startTimer, clearTimer, setCollapsed]);

  useEffect(() => {
    if (modalOpen) clearTimer();
    else if (autoCollapse && !hovering) startTimer();
  }, [modalOpen, autoCollapse, hovering, clearTimer, startTimer]);

  // Mouse
  const onEnter = useCallback(() => {
    setHovering(true);
    onHoveringChange?.(true);
    clearTimer();
  }, [clearTimer, onHoveringChange]);

  const onLeave = useCallback(() => {
    setHovering(false);
    onHoveringChange?.(false);
    if (autoCollapse && !modalOpen) startTimer();
  }, [autoCollapse, modalOpen, startTimer, onHoveringChange]);

  const onAction = useCallback((a: string) => {
    if (a === "autoCollapse") setModalOpen(true);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate(ROUTES.LOGIN);
  };

  const mini = collapsed && !hovering;

  return (
    <>
      <aside
        className={cn("bg-muted/30 dark:bg-[#1A1A1A]")}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        style={{
          position: "fixed", left: 0, top: 0,
          width: mini ? W_MINI : W_FULL,
          height: "100vh",
          display: "flex", flexDirection: "column",
          borderRight: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e5e5e5",
          transition: "width .25s cubic-bezier(.4,0,.2,1), background-color .25s ease, border-color .25s ease",
          zIndex: 30,
          boxShadow: "none",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: mini ? 52 : 66,
            flexShrink: 0,
            padding: mini ? 0 : "2px 4px",
            boxSizing: "border-box",
            overflow: "hidden",
            borderBottom: dark ? "none" : "1px solid #e5e5e5",
          }}
        >
          <img
            src="/serrat-logo.png"
            alt="Serrat"
            style={{
              display: "block",
              maxWidth: "100%",
              maxHeight: mini ? 36 : 58,
              width: mini ? 40 : "auto",
              height: "auto",
              objectFit: "contain",
              objectPosition: "center",
              borderRadius: mini ? 10 : 0,
            }}
          />
        </div>

        {/* Nav */}
        <nav className="sb-nav" style={{
          flex: 1, overflowY: "auto", overflowX: "hidden",
          padding: "12px 0",
          scrollbarWidth: "none",
        }}>
          {NAV_ITEMS.filter(i => !i.adminOnly || isAdmin).map((item) => (
            <SidebarItem
              key={item.href ?? item.label}
              item={item}
              mini={mini}
              dark={dark}
              onAction={onAction}
            />
          ))}
        </nav>

        {/* Bottom actions */}
        <div style={{
          borderTop: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e5e5e5",
          padding: "10px 12px 16px",
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          {/* Temporizador */}
          <button
            onClick={() => setModalOpen(true)}
            style={{
              display: "flex", alignItems: "center",
              gap: mini ? 0 : 12,
              justifyContent: mini ? "center" : "flex-start",
              width: "100%", padding: "8px", borderRadius: 8,
              background: "none", border: "none", cursor: "pointer",
              color: dark ? "#52525b" : "#737373", transition: "color .2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#eab308";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = dark ? "#52525b" : "#737373";
            }}
            title={mini ? "Temporizador" : undefined}
          >
            <Timer size={17} />
            {!mini && <span style={{ fontSize: 13, fontWeight: 500 }}>Temporizador</span>}
          </button>

          {/* Sair */}
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center",
              gap: mini ? 0 : 12,
              justifyContent: mini ? "center" : "flex-start",
              width: "100%", padding: "8px", borderRadius: 8,
              background: "none", border: "none", cursor: "pointer",
              color: dark ? "#52525b" : "#737373", transition: "color .2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#eab308";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = dark ? "#52525b" : "#737373";
            }}
            title={mini ? "Sair" : undefined}
          >
            <LogOut size={17} />
            {!mini && <span style={{ fontSize: 13, fontWeight: 500 }}>Sair</span>}
          </button>
        </div>
      </aside>

      <AutoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        autoCollapse={autoCollapse}
        onAutoCollapseChange={setAutoCollapse}
        seconds={seconds}
        onSecondsChange={setSeconds}
      />
    </>
  );
}
