import { AlertTriangle, XCircle, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSlaAlerts } from "@/hooks/useDashboardStats";

export function SlaAlerts() {
  const { data: alerts, isLoading } = useSlaAlerts();

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card className="border-l-4 border-l-green-500 bg-green-50/30">
        <CardContent className="p-6 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-800 font-medium">Todas as cabines estao em dia com a limpeza!</p>
        </CardContent>
      </Card>
    );
  }

  const criticalCount = alerts.filter((a: any) => (a.hours_since || 0) > 6).length;

  return (
    <Card className={cn(
      "border-l-4",
      criticalCount > 0 ? "border-l-red-500 bg-red-50/30" : "border-l-amber-500 bg-amber-50/30"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {criticalCount > 0 ? (
            <XCircle className="h-5 w-5 text-red-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          )}
          Alertas de SLA
          <span className="text-sm font-normal text-muted-foreground">
            ({alerts.length} cabines com atraso)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {alerts.map((alert: any) => {
            const hours = alert.hours_since || 999;
            const isCritical = hours > 6;
            return (
              <div
                key={alert.qr_code_id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  isCritical ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
                )}
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{alert.id_codigo}</p>
                  <p className="text-xs text-muted-foreground">{alert.id_nome}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className={cn("h-4 w-4", isCritical ? "text-red-500" : "text-amber-500")} />
                  <span className={cn("text-sm font-bold", isCritical ? "text-red-600" : "text-amber-600")}>
                    {alert.last_cleaned ? `${hours.toFixed(1)}h` : "Nunca"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
