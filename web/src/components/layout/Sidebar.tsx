import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  QrCode,
  Users,
  Building2,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { ROUTES } from "@/lib/constants";

const navItems = [
  { path: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { path: ROUTES.WORK_ORDERS, label: "Ordens de Servico", icon: ClipboardList },
  { path: ROUTES.QR_CODES, label: "QR Codes", icon: QrCode },
  { path: ROUTES.EMPLOYEES, label: "Funcionarios", icon: Users },
  { path: ROUTES.COMPANIES, label: "Empresas", icon: Building2 },
  { path: ROUTES.REPORTS, label: "Relatorios", icon: BarChart3 },
];

export function Sidebar({ collapsed, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate(ROUTES.LOGIN);
  };

  return (
    <aside
      className={cn(
        "h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0 z-50 transition-all duration-300",
        collapsed ? "w-[80px]" : "w-[260px]"
      )}
    >
      {/* Logo + Collapse */}
      <div className="py-5 px-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <img
            src="/serrat-logo.png"
            alt="Serrat"
            className={cn("h-auto transition-all duration-300", collapsed ? "w-10" : "w-32")}
          />
        </div>
        {onToggle && (
          <motion.button
            whileHover={{ scale: 0.9 }}
            whileTap={{ scale: 0.8 }}
            onClick={onToggle}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", collapsed && "rotate-180")} />
          </motion.button>
        )}
      </div>

      {/* User */}
      {profile && !collapsed && (
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(245, 158, 11, 0.12)" }}
            >
              <span className="font-bold text-sm" style={{ color: "#f59e0b" }}>
                {profile.full_name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground truncate">{profile.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation - Neumorphic icons */}
      <nav className={cn("flex-1 overflow-y-auto", collapsed ? "px-3 py-4" : "px-3 py-4")}>
        <div className={cn("space-y-2", collapsed && "flex flex-col items-center space-y-3")}>
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path}>
              {({ isActive }) => (
                <motion.div
                  whileHover={{ scale: 0.95 }}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "relative flex items-center cursor-pointer transition-all duration-300 ease-out border-2 group",
                    collapsed
                      ? "w-14 h-14 rounded-2xl justify-center"
                      : "gap-3 px-3 py-2.5 rounded-2xl",
                    isActive
                      ? "border-amber-500/60"
                      : "border-transparent hover:border-amber-500/40"
                  )}
                  style={{
                    boxShadow: isActive
                      ? "inset 3px 3px 6px hsl(var(--border)), inset -3px -3px 6px hsl(var(--card))"
                      : "3px 3px 6px hsl(var(--border)), -3px -3px 6px hsl(var(--card))",
                    background: isActive ? "hsl(var(--accent))" : "hsl(var(--card))",
                  }}
                >
                  {/* Icon with rotateY effect */}
                  <motion.div
                    animate={{
                      scale: isActive ? 0.9 : 1,
                      rotateY: isActive ? 180 : 0,
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="relative z-10"
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 transition-colors duration-300",
                        isActive
                          ? "text-amber-500"
                          : "text-muted-foreground group-hover:text-amber-500"
                      )}
                    />
                  </motion.div>

                  {/* Label */}
                  {!collapsed && (
                    <span
                      className={cn(
                        "text-sm font-medium relative z-10 transition-colors duration-300",
                        isActive
                          ? "text-amber-500"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </span>
                  )}

                  {/* ChevronRight for active */}
                  {isActive && !collapsed && (
                    <ChevronRight size={14} className="ml-auto text-amber-500/60 relative z-10" />
                  )}

                  {/* Active glow overlay */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{ background: "rgba(245, 158, 11, 0.06)" }}
                    />
                  )}

                  {/* Hover glow */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 0.2, scale: 1.05 }}
                    className="absolute inset-0 rounded-2xl pointer-events-none blur-sm"
                    style={{ background: "rgba(245, 158, 11, 0.15)" }}
                  />
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border">
        <motion.button
          whileHover={{ scale: 0.95 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLogout}
          className={cn(
            "flex items-center cursor-pointer transition-all duration-300 border-2 border-transparent hover:border-red-400/30 group",
            collapsed
              ? "w-14 h-14 rounded-2xl justify-center mx-auto"
              : "w-full gap-3 px-3 py-2.5 rounded-2xl"
          )}
          style={{
            boxShadow: "3px 3px 6px hsl(var(--border)), -3px -3px 6px hsl(var(--card))",
            background: "hsl(var(--card))",
            border: "none",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-500 transition-colors" />
          {!collapsed && <span className="text-red-400 group-hover:text-red-500 transition-colors">Sair da conta</span>}
        </motion.button>
      </div>
    </aside>
  );
}
