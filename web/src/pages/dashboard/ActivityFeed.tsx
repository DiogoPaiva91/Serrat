import { ClipboardCheck, Wrench, Search } from "lucide-react";

const activities = [
  { id: 1, cabin: "CABINE 14", employee: "LENI", type: "Higienizacao", time: "ha 3 min", icon: ClipboardCheck, color: "bg-green-100 text-green-600" },
  { id: 2, cabin: "CABINE 10", employee: "LENI", type: "Higienizacao", time: "ha 8 min", icon: ClipboardCheck, color: "bg-green-100 text-green-600" },
  { id: 3, cabin: "CABINE 12", employee: "CARLOS", type: "Higienizacao", time: "ha 15 min", icon: ClipboardCheck, color: "bg-green-100 text-green-600" },
  { id: 4, cabin: "CABINE 07", employee: "LENI", type: "Manutencao", time: "ha 22 min", icon: Wrench, color: "bg-amber-100 text-amber-600" },
  { id: 5, cabin: "CABINE 03", employee: "CARLOS", type: "Higienizacao", time: "ha 30 min", icon: ClipboardCheck, color: "bg-green-100 text-green-600" },
  { id: 6, cabin: "CABINE 19", employee: "LENI", type: "Inspecao", time: "ha 45 min", icon: Search, color: "bg-blue-100 text-blue-600" },
  { id: 7, cabin: "CABINE 05", employee: "LENI", type: "Higienizacao", time: "ha 52 min", icon: ClipboardCheck, color: "bg-green-100 text-green-600" },
];

export function ActivityFeed() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[13px] font-bold text-foreground block">Atividade Recente</span>
          <span className="text-[10px] text-muted-foreground">Ultimas acoes registradas</span>
        </div>
        <a href="/ordens-de-servico" className="text-xs text-primary hover:underline font-medium">Ver todas</a>
      </div>
      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activity.color}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-foreground">{activity.cabin}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{activity.type}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{activity.employee} · {activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
