import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = Array.from({ length: 19 }, (_, i) => ({
  cabin: `CAB ${String(i + 1).padStart(2, "0")}`,
  os: Math.floor(Math.random() * 80) + 30,
})).sort((a, b) => b.os - a.os);

const COLORS = ["#2094f3", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-primary font-bold">{payload[0].value} OS</p>
      </div>
    );
  }
  return null;
};

export function OsByCabinChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">OS por Cabine</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="cabin" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={55} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="os" radius={[0, 4, 4, 0]} animationDuration={1200}>
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[Math.min(index, COLORS.length - 1)]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
