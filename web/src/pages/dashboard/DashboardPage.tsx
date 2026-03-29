import { ClipboardCheck, CalendarCheck, QrCode, Users, Activity } from "lucide-react";
import { motion } from "framer-motion";
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
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-white/90">Dashboard</h2>
          <p className="text-sm text-white/30 mt-0.5">Visao geral das operacoes em tempo real</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Sistema Online</span>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="OS Hoje"
          value={s.os_today}
          change={s.os_today > 0 ? "+12%" : undefined}
          changeType="positive"
          icon={ClipboardCheck}
          iconBg="bg-blue-500/15 border border-blue-500/20"
          iconColor="text-blue-400"
          glowColor="hover:shadow-blue-500/5"
          index={0}
        />
        <StatsCard
          title="OS no Mes"
          value={s.os_month.toLocaleString("pt-BR")}
          change={s.os_month > 0 ? "+8%" : undefined}
          changeType="positive"
          icon={CalendarCheck}
          iconBg="bg-emerald-500/15 border border-emerald-500/20"
          iconColor="text-emerald-400"
          glowColor="hover:shadow-emerald-500/5"
          index={1}
        />
        <StatsCard
          title="Cabines Ativas"
          value={s.active_cabins}
          icon={QrCode}
          iconBg="bg-amber-500/15 border border-amber-500/20"
          iconColor="text-amber-400"
          glowColor="hover:shadow-amber-500/5"
          index={2}
        />
        <StatsCard
          title="Equipe Ativa"
          value={s.active_employees}
          icon={Users}
          iconBg="bg-purple-500/15 border border-purple-500/20"
          iconColor="text-purple-400"
          glowColor="hover:shadow-purple-500/5"
          index={3}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <OsChart />
        <ActivityFeed />
      </div>

      {/* SLA Alerts */}
      <SlaAlerts />
    </div>
  );
}
