import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  QrCode,
  Users,
  Building2,
  BarChart3,
  LogOut,
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

export function Sidebar({ collapsed }: { collapsed?: boolean; onToggle?: () => void }) {
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
        collapsed ? "w-20" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="py-6 border-b border-border flex justify-center items-center">
        <img
          src="/serrat-logo.png"
          alt="Serrat"
          className={cn("h-auto transition-all", collapsed ? "w-10" : "w-36")}
        />
      </div>

      {/* User */}
      {profile && !collapsed && (
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(245, 158, 11, 0.12)" }}
            >
              <span className="font-bold text-base" style={{ color: "#f59e0b" }}>
                {profile.full_name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground truncate">
                {profile.full_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation - Nookpet style */}
      <nav className="flex-1 overflow-y-auto" style={{ padding: "16px 12px" }}>
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path}>
            {({ isActive }) => (
              <div
                className="flex items-center cursor-pointer transition-all duration-150"
                style={{
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 12,
                  marginBottom: 4,
                  fontWeight: 500,
                  fontSize: 14,
                  background: isActive ? "rgba(245, 158, 11, 0.08)" : "transparent",
                  color: isActive ? "#fbbf24" : "hsl(var(--muted-foreground))",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "hsl(var(--accent))";
                    e.currentTarget.style.color = "hsl(var(--foreground))";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "hsl(var(--muted-foreground))";
                  }
                }}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && (
                  <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.6 }} />
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid hsl(var(--border))" }}>
        <button
          onClick={handleLogout}
          className="flex items-center w-full cursor-pointer transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
          style={{
            gap: 12,
            padding: "10px 12px",
            borderRadius: 12,
            background: "none",
            border: "none",
            color: "#EF4444",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <LogOut size={18} />
          {!collapsed && "Sair da conta"}
        </button>
      </div>
    </aside>
  );
}
