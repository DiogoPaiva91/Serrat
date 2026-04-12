import { Outlet, NavLink } from "react-router-dom";
import { QrCode, ClipboardList, User } from "lucide-react";

export function OperadorLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-none">SERRAT</h1>
            <p className="text-[10px] text-slate-500">Operador</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-50 safe-area-bottom">
        <NavLink
          to="/operador/scanner"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
              isActive ? "text-amber-600" : "text-slate-400"
            }`
          }
        >
          <QrCode size={22} />
          <span className="text-[10px] font-medium">Scanner</span>
        </NavLink>
        <NavLink
          to="/operador/historico"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
              isActive ? "text-amber-600" : "text-slate-400"
            }`
          }
        >
          <ClipboardList size={22} />
          <span className="text-[10px] font-medium">Historico</span>
        </NavLink>
        <NavLink
          to="/operador/perfil"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
              isActive ? "text-amber-600" : "text-slate-400"
            }`
          }
        >
          <User size={22} />
          <span className="text-[10px] font-medium">Perfil</span>
        </NavLink>
      </nav>
    </div>
  );
}
