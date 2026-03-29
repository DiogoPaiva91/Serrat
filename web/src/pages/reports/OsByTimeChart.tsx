import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}h`,
  os: i >= 6 && i <= 20 ? Math.floor(Math.random() * 15) + (i >= 8 && i <= 17 ? 10 : 2) : Math.floor(Math.random() * 3),
}));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-lg p-3 shadow-xl">
        <p className="text-xs text-white/60">{label}</p>
        <p className="text-sm text-amber-400 font-bold">{payload[0].value} OS</p>
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.2)" }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.2)" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="os" fill="#f59e0b" radius={[4, 4, 0, 0]} animationDuration={1200} fillOpacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
