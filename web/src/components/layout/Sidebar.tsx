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
            <div className="w-11 h-11 rounded-full bg-primary/12 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-base">
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

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path}>
            {({ isActive }) => (
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl mb-1 transition-all duration-150 cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-primary")} />
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && (
                  <ChevronRight className="h-3.5 w-3.5 ml-auto text-primary/60" />
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="h-[18px] w-[18px]" />
          {!collapsed && "Sair da conta"}
        </button>
      </div>
    </aside>
  );
}
