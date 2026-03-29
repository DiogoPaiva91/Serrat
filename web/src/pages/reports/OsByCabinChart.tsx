import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = Array.from({ length: 19 }, (_, i) => ({
  cabin: `CAB ${String(i + 1).padStart(2, "0")}`,
  os: Math.floor(Math.random() * 80) + 30,
})).sort((a, b) => b.os - a.os);

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

export function OsByCabinChart() {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle>OS por Cabine</CardTitle></CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.2)" }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="cabin" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} width={55} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="os" radius={[0, 4, 4, 0]} animationDuration={1200}>
                {data.map((_, index) => (
                  <Cell key={index} fill={index < 3 ? "#f59e0b" : index < 7 ? "rgba(245,158,11,0.5)" : "rgba(245,158,11,0.2)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
