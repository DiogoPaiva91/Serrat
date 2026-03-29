import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  QrCode,
  Users,
  Building2,
  BarChart3,
  LogOut,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

const navItems = [
  { path: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { path: ROUTES.WORK_ORDERS, label: "Ordens de Servico", icon: ClipboardList },
  { path: ROUTES.QR_CODES, label: "QR Codes", icon: QrCode },
  { path: ROUTES.EMPLOYEES, label: "Funcionarios", icon: Users },
  { path: ROUTES.COMPANIES, label: "Empresas", icon: Building2 },
  { path: ROUTES.REPORTS, label: "Relatorios", icon: BarChart3 },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate(ROUTES.LOGIN);
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/[0.06] transition-all duration-300",
        "bg-[#0d0d1a]/95 backdrop-blur-xl",
        collapsed ? "w-20" : "w-66"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <img src="/serrat-logo.png" alt="Serrat" className={cn("transition-all duration-300", collapsed ? "h-8" : "h-9")} />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white/90 tracking-wide">SERRAT</span>
              <span className="text-[9px] text-amber-400/50 tracking-[0.15em] uppercase">Operations</span>
            </div>
          )}
        </div>
        {onToggle && !collapsed && (
          <Button variant="ghost" size="icon" className="ml-auto h-7 w-7 text-white/20 hover:text-white/50" onClick={onToggle}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* User */}
      {profile && !collapsed && (
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/20 flex items-center justify-center">
              <span className="text-amber-400 font-bold text-sm">
                {profile.full_name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80 truncate">{profile.full_name}</p>
              <div className="flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-amber-400/60" />
                <p className="text-[10px] text-amber-400/50 uppercase tracking-wider">{profile.role}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation - Neumorphic Style */}
      <nav className={cn("flex-1 overflow-y-auto", collapsed ? "p-2" : "p-3")}>
        <div className={cn("space-y-2", collapsed && "space-y-3")}>
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path}>
              {({ isActive }) => (
                <motion.div
                  whileHover={{ scale: 0.97 }}
                  whileTap={{ scale: 0.93 }}
                  className={cn(
                    "relative flex items-center gap-3 rounded-2xl transition-all duration-300 group",
                    collapsed ? "w-14 h-14 mx-auto justify-center" : "px-3 py-3",
                    isActive
                      ? "border-2 border-amber-500/30"
                      : "border-2 border-transparent hover:border-amber-500/20"
                  )}
                  style={{
                    boxShadow: isActive
                      ? "inset 3px 3px 6px rgba(0,0,0,0.4), inset -3px -3px 6px rgba(40,40,60,0.3)"
                      : "4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(30,30,50,0.2)",
                    background: isActive
                      ? "rgba(245,158,11,0.06)"
                      : "rgba(20,20,35,0.5)",
                  }}
                >
                  {/* Icon with neumorphic feel */}
                  <motion.div
                    animate={{
                      scale: isActive ? 0.92 : 1,
                      rotateY: isActive ? 180 : 0,
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={cn(
                      "flex items-center justify-center shrink-0",
                      collapsed ? "" : "w-8 h-8 rounded-xl",
                      !collapsed && (isActive ? "bg-amber-500/10" : "bg-white/[0.02]")
                    )}
                  >
                    <Icon
                      className={cn(
                        "transition-colors duration-300",
                        collapsed ? "h-5 w-5" : "h-[18px] w-[18px]",
                        isActive
                          ? "text-amber-400"
                          : "text-zinc-500 group-hover:text-amber-400/70"
                      )}
                    />
                  </motion.div>

                  {!collapsed && (
                    <span className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      isActive ? "text-amber-400" : "text-white/40 group-hover:text-white/70"
                    )}>
                      {label}
                    </span>
                  )}

                  {/* Active glow overlay */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 rounded-2xl bg-amber-500/[0.04] pointer-events-none"
                    />
                  )}

                  {/* Hover glow */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 0.2, scale: 1.05 }}
                    className="absolute inset-0 rounded-2xl bg-amber-400/10 pointer-events-none blur-sm"
                  />
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/[0.06]">
        <motion.div whileHover={{ scale: 0.97 }} whileTap={{ scale: 0.93 }}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-white/25 hover:text-red-400/70 hover:bg-red-400/5 rounded-2xl h-12",
              collapsed && "justify-center px-0"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-[18px] w-[18px]" />
            {!collapsed && <span className="text-sm">Sair</span>}
          </Button>
        </motion.div>
      </div>
    </aside>
  );
}
