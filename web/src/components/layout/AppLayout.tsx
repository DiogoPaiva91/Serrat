import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { SidebarCollapseContext } from "@/hooks/useSidebarCollapse";
import { useAuth } from "@/providers/AuthProvider";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

export function AppLayout() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarHovering, setSidebarHovering] = useState(false);
  const [pwdDone, setPwdDone] = useState(false);
  const sidebarWidth = collapsed ? (sidebarHovering ? 230 : 72) : 230;

  const mustChangePwd = false; // disabled until column exists

  return (
    <SidebarCollapseContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen bg-muted/30 dark:bg-[#1A1A1A]">
        <Sidebar onHoveringChange={setSidebarHovering} />
        <div
          className="flex min-h-screen flex-col"
          style={{
            paddingLeft: sidebarWidth,
            transition: "padding-left .25s cubic-bezier(.4,0,.2,1)",
          }}
        >
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted/30 dark:bg-[#1A1A1A]">
            <div className="mx-auto w-full max-w-[1680px] px-4 py-5 sm:px-6 sm:py-7">
              <Outlet />
            </div>
          </main>
        </div>
        {profile && mustChangePwd && (
          <ChangePasswordDialog
            open={mustChangePwd}
            userId={profile.id}
            onDone={async () => {
              setPwdDone(true);
              await supabase.auth.refreshSession();
              qc.invalidateQueries();
            }}
          />
        )}
      </div>
    </SidebarCollapseContext.Provider>
  );
}
