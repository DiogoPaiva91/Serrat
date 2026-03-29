import { ClipboardCheck, Wrench, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const activities = [
  { id: 1, cabin: "CABINE 14", employee: "LENI", type: "Higienizacao", time: "3 min", icon: ClipboardCheck, color: "bg-emerald-400/15 text-emerald-400" },
  { id: 2, cabin: "CABINE 10", employee: "LENI", type: "Higienizacao", time: "8 min", icon: ClipboardCheck, color: "bg-emerald-400/15 text-emerald-400" },
  { id: 3, cabin: "CABINE 12", employee: "CARLOS", type: "Higienizacao", time: "15 min", icon: ClipboardCheck, color: "bg-emerald-400/15 text-emerald-400" },
  { id: 4, cabin: "CABINE 07", employee: "LENI", type: "Manutencao", time: "22 min", icon: Wrench, color: "bg-amber-400/15 text-amber-400" },
  { id: 5, cabin: "CABINE 03", employee: "CARLOS", type: "Higienizacao", time: "30 min", icon: ClipboardCheck, color: "bg-emerald-400/15 text-emerald-400" },
  { id: 6, cabin: "CABINE 19", employee: "LENI", type: "Inspecao", time: "45 min", icon: Search, color: "bg-blue-400/15 text-blue-400" },
  { id: 7, cabin: "CABINE 05", employee: "LENI", type: "Higienizacao", time: "52 min", icon: ClipboardCheck, color: "bg-emerald-400/15 text-emerald-400" },
];

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Atividade Recente</CardTitle>
          <a href="/ordens-de-servico" className="text-xs text-amber-400/60 hover:text-amber-400 transition-colors">
            Ver todas
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activity.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white/70">{activity.cabin}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/30">{activity.type}</span>
                  </div>
                  <p className="text-[11px] text-white/25">{activity.employee} &bull; ha {activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
