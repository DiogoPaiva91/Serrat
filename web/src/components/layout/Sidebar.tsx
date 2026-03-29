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
        "fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300",
        collapsed ? "w-20" : "w-66"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src="/serrat-logo.png" alt="Serrat" className={cn("transition-all", collapsed ? "h-8" : "h-9")} />
          {!collapsed && (
            <span className="text-lg font-bold text-gray-900 tracking-tight">SERRAT</span>
          )}
        </div>
        {onToggle && !collapsed && (
          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 text-gray-400 hover:text-gray-600" onClick={onToggle}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* User */}
      {profile && !collapsed && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {profile.full_name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{profile.full_name}</p>
              <p className="text-xs text-gray-400 capitalize">{profile.role}</p>
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
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="text-sm">Sair</span>}
        </Button>
      </div>
    </aside>
  );
}
