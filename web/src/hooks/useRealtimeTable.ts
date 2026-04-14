import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useRealtimeTable(table: string, queryKey: string) {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel(`${table}_realtime`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        qc.invalidateQueries({ queryKey: [queryKey] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc, table, queryKey]);
}
