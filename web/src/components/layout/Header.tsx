import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/AuthProvider";

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Header({ title = "Dashboard", onMenuClick }: HeaderProps) {
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Buscar..." className="pl-10 w-64 bg-gray-50 border-gray-200" />
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {profile?.full_name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700 hidden lg:block">{profile?.full_name}</span>
        </div>
      </div>
    </header>
  );
}
