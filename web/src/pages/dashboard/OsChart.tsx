import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function generateMockData() {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({ date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), os: Math.floor(Math.random() * 40) + 20 });
  }
  return data;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm text-blue-600 font-bold">{payload[0].value} OS</p>
      </div>
    );
  }
  return null;
};

export function OsChart() {
  const data = useMemo(() => generateMockData(), []);
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>OS por Dia</CardTitle>
          <span className="text-xs text-gray-400">Ultimos 30 dias</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2094f3" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2094f3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="os" stroke="#2094f3" strokeWidth={2.5} fill="url(#colorOs)" animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
