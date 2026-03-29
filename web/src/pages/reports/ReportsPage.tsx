import { BarChart3, Download, Calendar, Trophy, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/shared/StatsCard";
import { OsByCabinChart } from "./OsByCabinChart";
import { OsByEmployeeChart } from "./OsByEmployeeChart";
import { OsByTimeChart } from "./OsByTimeChart";

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white/90">Relatorios</h2>
          <p className="text-white/30 text-sm mt-1">Analise de desempenho e produtividade</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Excel
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total OS Periodo" value="1.248" icon={BarChart3} iconBg="bg-blue-500/15 border border-blue-500/20" iconColor="text-blue-400" index={0} />
        <StatsCard title="Media por Dia" value="41.6" icon={Calendar} iconBg="bg-emerald-500/15 border border-emerald-500/20" iconColor="text-emerald-400" index={1} />
        <StatsCard title="Cabine Mais Limpa" value="CABINE 07" icon={Trophy} iconBg="bg-amber-500/15 border border-amber-500/20" iconColor="text-amber-400" index={2} />
        <StatsCard title="Funcionario Destaque" value="LENI" icon={User} iconBg="bg-purple-500/15 border border-purple-500/20" iconColor="text-purple-400" index={3} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OsByCabinChart />
        <OsByEmployeeChart />
      </div>

      <OsByTimeChart />
    </div>
  );
}
