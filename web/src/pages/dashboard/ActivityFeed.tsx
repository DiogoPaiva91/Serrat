import { ClipboardCheck, Wrench, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const activities = [
  { id: 1, cabin: "CABINE 14", employee: "LENI", type: "Higienizacao", time: "ha 3 min", icon: ClipboardCheck, color: "bg-green-100 text-green-600" },
  { id: 2, cabin: "CABINE 10", employee: "LENI", type: "Higienizacao", time: "ha 8 min", icon: ClipboardCheck, color: "bg-green-100 text-green-600" },
  { id: 3, cabin: "CABINE 12", employee: "CARLOS", type: "Higienizacao", time: "ha 15 min", icon: ClipboardCheck, color: "bg-green-100 text-green-600" },
  { id: 4, cabin: "CABINE 07", employee: "LENI", type: "Manutencao", time: "ha 22 min", icon: Wrench, color: "bg-amber-100 text-amber-600" },
  { id: 5, cabin: "CABINE 03", employee: "CARLOS", type: "Higienizacao", time: "ha 30 min", icon: ClipboardCheck, color: "bg-green-100 text-green-600" },
  { id: 6, cabin: "CABINE 19", employee: "LENI", type: "Inspecao", time: "ha 45 min", icon: Search, color: "bg-blue-100 text-blue-600" },
  { id: 7, cabin: "CABINE 05", employee: "LENI", type: "Higienizacao", time: "ha 52 min", icon: ClipboardCheck, color: "bg-green-100 text-green-600" },
  { id: 8, cabin: "CABINE 01", employee: "CARLOS", type: "Higienizacao", time: "ha 1h", icon: ClipboardCheck, color: "bg-green-100 text-green-600" },
];

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Atividade Recente</CardTitle>
          <a href="/ordens-de-servico" className="text-sm text-primary hover:underline">
            Ver todas
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${activity.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{activity.cabin}</p>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{activity.type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.employee} - {activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
