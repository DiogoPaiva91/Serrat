import { Bell, Moon, Sun, Search, Menu, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Header({ title = "Dashboard", onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" onClick={onMenuClick}>
            <Menu className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Command className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
          <input
            placeholder="Buscar..."
            className="h-9 pl-9 pr-4 w-56 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-amber-500/30 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/15 font-mono bg-white/[0.04] px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9 text-white/30 hover:text-white/60">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
        </Button>

        {/* Theme */}
        <Button variant="ghost" size="icon" className="h-9 w-9 text-white/30 hover:text-white/60" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* User */}
        <div className="flex items-center gap-3 pl-3 ml-1 border-l border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/15 flex items-center justify-center">
            <span className="text-amber-400 text-xs font-bold">
              {profile?.full_name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-medium text-white/70">{profile?.full_name}</p>
            <p className="text-[10px] text-amber-400/40 uppercase tracking-wider">{profile?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
