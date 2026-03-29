import { NavLink, useNavigate } from "react-router-dom";
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
        "bg-[#0d0d1a]/90 backdrop-blur-xl",
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

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-amber-400/10 text-amber-400 border border-amber-400/15 shadow-lg shadow-amber-400/5"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.03] border border-transparent"
              )
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/[0.06]">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-white/25 hover:text-red-400/70 hover:bg-red-400/5 rounded-xl h-10"
          onClick={handleLogout}
        >
          <LogOut className="h-[18px] w-[18px]" />
          {!collapsed && <span className="text-sm">Sair</span>}
        </Button>
      </div>
    </aside>
  );
}
