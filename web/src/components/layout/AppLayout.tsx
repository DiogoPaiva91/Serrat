import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-66")}>
        <Header onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
