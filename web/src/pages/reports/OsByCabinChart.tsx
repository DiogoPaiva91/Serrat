import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const data = Array.from({ length: 19 }, (_, i) => ({
  cabin: `CAB ${String(i + 1).padStart(2, "0")}`,
  os: Math.floor(Math.random() * 80) + 30,
})).sort((a, b) => b.os - a.os);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#404040", margin: 0 }}>{label}</p>
        <p style={{ fontSize: 13, fontWeight: 800, color: "#eab308", margin: "2px 0 0" }}>{payload[0].value} OS</p>
      </div>
    );
  }
  return null;
};

export function OsByCabinChart() {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
          <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="cabin" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={55} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="os" radius={[0, 4, 4, 0]} animationDuration={1200}>
            {data.map((_, index) => (
              <Cell key={index} fill={index < 3 ? "#eab308" : index < 7 ? "rgba(234,179,8,0.5)" : "rgba(234,179,8,0.2)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
