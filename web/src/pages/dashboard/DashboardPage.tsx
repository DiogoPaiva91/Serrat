import { ClipboardCheck, CalendarCheck, QrCode, Users } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const mockStats = {
  os_today: 47,
  os_month: 1248,
  active_cabins: 19,
  active_employees: 8,
};

export function DashboardPage() {
  const stats = mockStats;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total OS Hoje"
          value={stats.os_today}
          change="+12% vs ontem"
          changeType="positive"
          icon={ClipboardCheck}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          index={0}
        />
        <StatsCard
          title="OS no Mes"
          value={stats.os_month.toLocaleString("pt-BR")}
          change="+8% vs mes anterior"
          changeType="positive"
          icon={CalendarCheck}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          index={1}
        />
        <StatsCard
          title="Cabines Ativas"
          value={stats.active_cabins}
          icon={QrCode}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          index={2}
        />
        <StatsCard
          title="Funcionarios Ativos"
          value={stats.active_employees}
          icon={Users}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          index={3}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* OS Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">OS por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Grafico sera carregado com dados do Supabase</p>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <ClipboardCheck className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">CABINE {String(i).padStart(2, "0")} limpa</p>
                    <p className="text-xs text-muted-foreground">LENI - ha {i * 12} min</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Alerts */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Alertas de SLA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { cabin: "CABINE 15", hours: 6.2 },
              { cabin: "CABINE 03", hours: 5.1 },
              { cabin: "CABINE 19", hours: 4.8 },
            ].map((alert) => (
              <div
                key={alert.cabin}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200"
              >
                <span className="text-sm font-medium">{alert.cabin}</span>
                <span className="text-sm text-amber-700 font-semibold">
                  {alert.hours.toFixed(1)}h sem limpeza
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
