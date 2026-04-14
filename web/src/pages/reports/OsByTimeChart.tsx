import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

export function OsByTimeChart({ data }: { data: { hour: string; os: number }[] }) {
  if (!data || data.length === 0) return <p style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>Sem dados no periodo</p>;
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={2} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="os" fill="#eab308" radius={[4, 4, 0, 0]} animationDuration={1200} fillOpacity={0.7} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
