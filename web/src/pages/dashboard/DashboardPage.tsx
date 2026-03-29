import { ClipboardCheck, CalendarCheck, QrCode, Users } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { OsChart } from "./OsChart";
import { ActivityFeed } from "./ActivityFeed";
import { SlaAlerts } from "./SlaAlerts";

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
        <OsChart />
        <ActivityFeed />
      </div>

      {/* SLA Alerts */}
      <SlaAlerts />
    </div>
  );
}
