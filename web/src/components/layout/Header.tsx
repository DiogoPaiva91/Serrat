import { useState, useRef, useEffect } from "react";
import { Bell, Search, Moon, Sun, PanelLeft, User, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useSidebarCollapse } from "@/hooks/useSidebarCollapse";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/* ─── Neumorphic tokens (aligned with sidebar) ─── */
const NEU_DARK = {
  border: "#3f3f46",
  bg: "linear-gradient(160deg, #303036 0%, #222226 55%, #1c1c20 100%)",
  shadow: "0 3px 10px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.08) inset, 0 -1px 0 rgba(0,0,0,0.45) inset",
  icon: "#a1a1aa",
};
const NEU_LIGHT = {
  border: "rgba(0,0,0,0.10)",
  bg: "linear-gradient(145deg, #ffffff 0%, #ebebeb 55%, #e0e0e0 100%)",
  shadow: "0 1px 2px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.85)",
  icon: "rgba(55,55,55,0.82)",
};
const NEU_ACCENT = {
  border: "rgba(234,179,8,0.4)",
  bg: "linear-gradient(135deg,#facc15,#eab308)",
  shadow: "0 6px 22px -4px rgba(234,179,8,0.5), 0 3px 10px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.12) inset, 0 -1px 0 rgba(0,0,0,0.35) inset",
  icon: "#1a1a1a",
};
const SHIMMER = "linear-gradient(135deg,transparent,rgba(255,255,255,0.25) 50%,transparent)";
const SHIMMER_ACCENT = "linear-gradient(135deg,transparent,rgba(255,255,255,0.38) 50%,transparent)";

/* ─── CSS (shimmer animation) ─── */
if (typeof document !== "undefined" && !document.getElementById("hdr-css")) {
  const s = document.createElement("style");
  s.id = "hdr-css";
  s.textContent = `@keyframes hdrShimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`;
  document.head.appendChild(s);
}

/* ─── NeuIconButton ─── */
function NeuIconButton({
  children, dark, ariaLabel, onClick,
}: {
  children: React.ReactNode; dark: boolean; ariaLabel: string; onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const idle = dark ? NEU_DARK : NEU_LIGHT;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="relative flex shrink-0 items-center justify-center overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
      style={{
        width: 36, height: 36, borderRadius: 10,
        border: `1px solid ${hovered ? NEU_ACCENT.border : idle.border}`,
        background: hovered ? NEU_ACCENT.bg : idle.bg,
        boxShadow: hovered ? NEU_ACCENT.shadow : idle.shadow,
        transform: hovered ? "translateY(-1px)" : "none",
        transition: hovered ? "all 0.3s ease" : "all 0.25s ease",
        color: hovered ? NEU_ACCENT.icon : idle.icon,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Gloss */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: 1, left: 2, right: 2, height: "44%", borderRadius: 8,
          background: hovered
            ? "linear-gradient(180deg, rgba(255,255,255,0.42), rgba(255,255,255,0.02))"
            : "none",
        }}
      />
      {/* Shimmer */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: hovered ? SHIMMER_ACCENT : SHIMMER,
          transform: hovered ? "translateX(0)" : "translateX(-100%)",
          animation: hovered ? "hdrShimmer 0.5s ease forwards" : "none",
        }}
      />
      <div className="relative z-[1] flex items-center justify-center">{children}</div>
    </button>
  );
}

/* ─── Header ─── */
export function Header() {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { collapsed, setCollapsed } = useSidebarCollapse();
  const location = useLocation();
  const navigate = useNavigate();
  const dark = theme === "dark";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const pageTitle = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path))?.label || "Dashboard";

  const initials = (() => {
    const parts = (profile?.full_name || "U").trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  })();

  return (
    <header
      className={cn(
        "sticky top-0 z-40",
        dark
          ? "border-b border-white/[0.08] bg-[#1A1A1A] shadow-[0_1px_0_rgba(0,0,0,0.35)]"
          : "border-b border-[#e5e5e5] bg-[#f5f5f5] shadow-[0_1px_0_rgba(0,0,0,0.06)]"
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        {/* Left — collapse + title */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <NeuIconButton
            dark={dark}
            ariaLabel={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            onClick={() => setCollapsed(!collapsed)}
          >
            <PanelLeft
              className={cn("h-[17px] w-[17px] transition-transform duration-200", collapsed && "rotate-180")}
              strokeWidth={1.9}
            />
          </NeuIconButton>

          <h1 className={cn(
            "min-w-0 truncate text-base font-semibold leading-snug tracking-tight sm:text-lg",
            dark ? "text-[#fafafa]" : "text-[#171717]"
          )}>
            {pageTitle}
          </h1>
        </div>

        {/* Center — search */}
        <div className="relative hidden md:block w-full max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2"
            style={{ color: dark ? "#9CA3AF" : "#737373" }}
            strokeWidth={1.75}
          />
          <input
            type="search"
            placeholder="Buscar..."
            aria-label="Buscar"
            className={cn(
              "h-[35px] w-full rounded-lg py-0 pl-9 pr-3 font-sans text-[13px] leading-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
              dark
                ? "border border-[#3F3F46] bg-[#141416] text-[#E2E2E8] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-[#71717A] focus-visible:border-primary/50 focus-visible:ring-primary/20"
                : "border border-black/[0.10] bg-white text-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] placeholder:text-neutral-500 focus-visible:border-[#a3a3a3] focus-visible:ring-[#2563EB]/20"
            )}
          />
        </div>

        {/* Right — icons + user */}
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <NeuIconButton dark={dark} ariaLabel={dark ? "Modo claro" : "Modo escuro"} onClick={toggleTheme}>
            {dark
              ? <Sun className="h-[17px] w-[17px]" strokeWidth={1.9} />
              : <Moon className="h-[17px] w-[17px]" strokeWidth={1.9} />
            }
          </NeuIconButton>

          <NeuIconButton dark={dark} ariaLabel="Notificacoes">
            <Bell className="h-[17px] w-[17px]" strokeWidth={1.9} />
          </NeuIconButton>

          {/* Divider */}
          <div className={cn("mx-0.5 hidden h-6 w-px shrink-0 sm:block", dark ? "bg-[#52525B]" : "bg-neutral-300")} />

          {/* User chip */}
          <div ref={menuRef} className="relative flex items-center gap-2.5 pl-1">
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2.5 cursor-pointer">
              <div className="text-right hidden md:block">
                <p className={cn("text-sm font-medium leading-none", dark ? "text-[#E2E2E8]" : "text-foreground")}>
                  {profile?.full_name}
                </p>
                <p className={cn("text-xs mt-0.5", dark ? "text-[#71717a]" : "text-muted-foreground")} style={{ textTransform: "capitalize" }}>
                  {profile?.role}
                </p>
              </div>
              <div
                className="h-9 w-9 rounded-[10px] flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, #facc15, #eab308)",
                  boxShadow: "0 2px 8px rgba(234,179,8,0.3)",
                }}
              >
                <span className="text-[#1a1a1a] font-bold text-sm">{initials}</span>
              </div>
            </button>
            {menuOpen && (
              <div className={cn(
                "absolute right-0 top-[calc(100%+8px)] z-50 w-56 rounded-xl border py-2 shadow-xl",
                dark ? "border-white/10 bg-[#1a1a1a]" : "border-neutral-200 bg-white"
              )}>
                <div className={cn("px-4 py-2 border-b", dark ? "border-white/10" : "border-neutral-100")}>
                  <p className={cn("text-sm font-semibold truncate", dark ? "text-white" : "text-neutral-900")}>{profile?.full_name}</p>
                  <p className={cn("text-xs truncate", dark ? "text-neutral-400" : "text-neutral-500")}>{profile?.email}</p>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); navigate("/perfil"); }}
                  className={cn("w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-opacity-50", dark ? "text-neutral-200 hover:bg-white/5" : "text-neutral-700 hover:bg-neutral-50")}
                >
                  <User className="h-4 w-4" /> Meu Perfil
                </button>
                <button
                  onClick={async () => { setMenuOpen(false); await signOut(); navigate("/login"); }}
                  className={cn("w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-opacity-50", dark ? "text-red-400 hover:bg-red-500/10" : "text-red-600 hover:bg-red-50")}
                >
                  <LogOut className="h-4 w-4" /> Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
