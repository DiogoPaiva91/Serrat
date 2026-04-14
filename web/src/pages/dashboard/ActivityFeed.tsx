import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { ClipboardCheck } from "lucide-react";

function timeAgo(date: string): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `ha ${min} min`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `ha ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `ha ${days}d`;
}

export function ActivityFeed() {
  const { profile } = useAuth();

  useRealtimeTable("work_orders", "activity-feed");

  const { data: activities } = useQuery({
    queryKey: ["activity-feed", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return [];
      const { data, error } = await supabase
        .from("work_orders")
        .select("id, completed_at, responsible_name, qr_code:qr_codes(id_codigo, id_nome), service_type_rel:service_types(name)")
        .eq("company_id", profile.company_id)
        .order("completed_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.company_id,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[13px] font-bold text-foreground block">Atividade Recente</span>
          <span className="text-[10px] text-muted-foreground">Ultimas OS registradas</span>
        </div>
        <a href="/ordens-de-servico" className="text-xs text-primary hover:underline font-medium">Ver todas</a>
      </div>
      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
        {(!activities || activities.length === 0) ? (
          <p className="text-[12px] text-muted-foreground text-center py-6">Nenhuma atividade recente</p>
        ) : (
          activities.map((a: any) => (
            <div key={a.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-green-100 text-green-600">
                <ClipboardCheck className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-foreground">
                    {a.qr_code ? `${a.qr_code.id_codigo} · ${a.qr_code.id_nome}` : "Sem cabine"}
                  </p>
                  {a.service_type_rel?.name && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{a.service_type_rel.name}</span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">{a.responsible_name || "—"} · {timeAgo(a.completed_at)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
