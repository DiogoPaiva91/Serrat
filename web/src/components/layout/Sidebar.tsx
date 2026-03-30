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
    <div className={cn(
      "h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-50 transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className="py-5 border-b border-sidebar-border flex justify-center items-center">
        <img src="/serrat-logo.png" alt="Serrat" className={cn("h-auto transition-all", collapsed ? "w-12" : "w-36")} />
      </div>

      {/* User info */}
      {profile && !collapsed && (
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-sm">{profile.full_name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{profile.full_name}</p>
              <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto pt-6 pb-6">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path}>
            {({ isActive }) => (
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all cursor-pointer relative overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25"
                    : "text-sidebar-foreground hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 hover:text-white hover:shadow-md hover:shadow-amber-500/20"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                )}
                <item.icon className={cn("h-5 w-5 relative z-10 shrink-0", isActive ? "text-white" : "text-muted-foreground group-hover:text-white")} />
                {!collapsed && <span className="relative z-10">{item.label}</span>}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && "Sair do Sistema"}
        </button>
      </div>
    </div>
  );
}
