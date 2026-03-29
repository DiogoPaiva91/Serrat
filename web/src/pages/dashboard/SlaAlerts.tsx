import { AlertTriangle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const alerts = [
  { cabin: "CABINE 15", nome: "WC BTP", hours: 6.2, severity: "critical" as const },
  { cabin: "CABINE 03", nome: "WC BTP", hours: 5.1, severity: "critical" as const },
  { cabin: "CABINE 19", nome: "WC BTP", hours: 4.8, severity: "warning" as const },
  { cabin: "CABINE 11", nome: "WC BTP", hours: 4.2, severity: "warning" as const },
];

export function SlaAlerts() {
  if (alerts.length === 0) return null;

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;

  return (
    <Card className={cn(
      "border-l-4",
      criticalCount > 0 ? "border-l-red-500 bg-red-50/30" : "border-l-amber-500 bg-amber-50/30"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {alerts.map((alert) => (
            <div
              key={alert.cabin}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                alert.severity === "critical"
                  ? "bg-red-50 border-red-200"
                  : "bg-amber-50 border-amber-200"
              )}
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{alert.cabin}</p>
                <p className="text-xs text-muted-foreground">{alert.nome}</p>
              </div>
              <div className="flex items-center gap-1">
                <Clock className={cn(
                  "h-4 w-4",
                  alert.severity === "critical" ? "text-red-500" : "text-amber-500"
                )} />
                <span className={cn(
                  "text-sm font-bold",
                  alert.severity === "critical" ? "text-red-600" : "text-amber-600"
                )}>
                  {alert.hours.toFixed(1)}h
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
