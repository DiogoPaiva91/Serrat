import { BarChart3, Download, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/shared/StatsCard";

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Relatorios</h2>
          <p className="text-muted-foreground text-sm mt-1">Analise de desempenho e produtividade</p>
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
        <StatsCard title="Total OS Periodo" value="1.248" icon={BarChart3} iconBg="bg-blue-100" iconColor="text-blue-600" index={0} />
        <StatsCard title="Media por Dia" value="41.6" icon={Calendar} iconBg="bg-green-100" iconColor="text-green-600" index={1} />
        <StatsCard title="Cabine Mais Limpa" value="CABINE 07" icon={BarChart3} iconBg="bg-amber-100" iconColor="text-amber-600" index={2} />
        <StatsCard title="Funcionario Destaque" value="LENI" icon={BarChart3} iconBg="bg-purple-100" iconColor="text-purple-600" index={3} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">OS por Cabine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Grafico de barras horizontais
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">OS por Funcionario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Grafico de barras
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribuicao por Horario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Heatmap de horarios
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
