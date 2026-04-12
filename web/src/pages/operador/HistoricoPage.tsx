import { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, Calendar, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface WorkOrderRecord {
  id: string;
  qr_code_data: string;
  status: string;
  completed_at: string;
  latitude: number | null;
  longitude: number | null;
}

const DEMO_HISTORY: WorkOrderRecord[] = [
  { id: "1", qr_code_data: "CABINE 14 - WC BTP", status: "concluida", completed_at: new Date().toISOString(), latitude: -23.9618, longitude: -46.3322 },
  { id: "2", qr_code_data: "CABINE 10 - WC BTP", status: "concluida", completed_at: new Date(Date.now() - 3600000).toISOString(), latitude: -23.9618, longitude: -46.3322 },
  { id: "3", qr_code_data: "CABINE 12 - WC BTP", status: "concluida", completed_at: new Date(Date.now() - 7200000).toISOString(), latitude: -23.9618, longitude: -46.3322 },
  { id: "4", qr_code_data: "CABINE 13 - WC BTP", status: "concluida", completed_at: new Date(Date.now() - 10800000).toISOString(), latitude: -23.9618, longitude: -46.3322 },
  { id: "5", qr_code_data: "CABINE 08 - WC BTP", status: "concluida", completed_at: new Date(Date.now() - 86400000).toISOString(), latitude: -23.9618, longitude: -46.3322 },
  { id: "6", qr_code_data: "CABINE 07 - WC BTP", status: "concluida", completed_at: new Date(Date.now() - 90000000).toISOString(), latitude: null, longitude: null },
];

export function HistoricoPage() {
  const [filter, setFilter] = useState<"hoje" | "semana" | "mes">("hoje");

  const { data: orders = [], isLoading, refetch } = useQuery<WorkOrderRecord[]>({
    queryKey: ["operador-historico", filter],
    queryFn: async () => {
      if (!isSupabaseConfigured) return DEMO_HISTORY;

      const now = new Date();
      let dateFrom: Date;
      if (filter === "hoje") {
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (filter === "semana") {
        dateFrom = new Date(now.getTime() - 7 * 86400000);
      } else {
        dateFrom = new Date(now.getTime() - 30 * 86400000);
      }

      const { data, error } = await supabase
        .from("work_orders")
        .select("id, qr_code_data, status, completed_at, latitude, longitude")
        .gte("completed_at", dateFrom.toISOString())
        .order("completed_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
  });

  const todayCount = orders.filter((o) => {
    const d = new Date(o.completed_at);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
  }).length;

  return (
    <div className="p-4 space-y-4">
      {/* Stats */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-slate-900">{todayCount}</p>
            <p className="text-xs text-slate-500">OS realizadas hoje</p>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 text-slate-400 hover:text-slate-600"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["hoje", "semana", "mes"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
              filter === f
                ? "bg-amber-500 text-slate-900"
                : "bg-white text-slate-500 border border-slate-200"
            }`}
          >
            {f === "hoje" ? "Hoje" : f === "semana" ? "7 dias" : "30 dias"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Nenhuma OS neste periodo</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} className="text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {order.qr_code_data}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock size={10} className="text-slate-400" />
                  <span className="text-[11px] text-slate-400">
                    {formatDate(order.completed_at)}
                  </span>
                </div>
              </div>
              {order.latitude && (
                <div className="text-[10px] text-green-500 font-medium">GPS</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
