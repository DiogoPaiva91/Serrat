import { ClipboardCheck, CalendarCheck, QrCode, Users } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { OsChart } from "./OsChart";
import { ActivityFeed } from "./ActivityFeed";
import { SlaAlerts } from "./SlaAlerts";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export function DashboardPage() {
  const { data: stats } = useDashboardStats();

  const s = stats || { os_today: 0, os_month: 0, active_cabins: 0, active_employees: 0 };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total OS Hoje"
          value={s.os_today}
          icon={ClipboardCheck}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          index={0}
        />
        <StatsCard
          title="OS no Mes"
          value={s.os_month.toLocaleString("pt-BR")}
          icon={CalendarCheck}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          index={1}
        />
        <StatsCard
          title="Cabines Ativas"
          value={s.active_cabins}
          icon={QrCode}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          index={2}
        />
        <StatsCard
          title="Funcionarios Ativos"
          value={s.active_employees}
          icon={Users}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OsChart />
        <ActivityFeed />
      </div>

      <SlaAlerts />
    </div>
  );
}
