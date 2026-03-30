import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}h`,
  os: i >= 6 && i <= 20 ? Math.floor(Math.random() * 15) + (i >= 8 && i <= 17 ? 10 : 2) : Math.floor(Math.random() * 3),
}));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm text-primary font-bold">{payload[0].value} OS</p>
      </div>
    );
  }
  return null;
};

export function OsByTimeChart() {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle>Distribuicao por Horario</CardTitle></CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="os" fill="#f59e0b" radius={[4, 4, 0, 0]} animationDuration={1200} fillOpacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
