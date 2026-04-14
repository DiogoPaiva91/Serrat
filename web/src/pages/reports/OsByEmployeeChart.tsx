import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#404040", margin: 0 }}>{label}</p>
        <p style={{ fontSize: 13, fontWeight: 800, color: "#22c55e", margin: "2px 0 0" }}>{payload[0].value} OS</p>
      </div>
    );
  }
  return null;
};

export function OsByEmployeeChart({ data }: { data: { name: string; os: number }[] }) {
  if (!data || data.length === 0) return <p style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>Sem dados no periodo</p>;
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="os" radius={[4, 4, 0, 0]} animationDuration={1200}>
            {data.map((_, index) => (
              <Cell key={index} fill={index < 1 ? "#22c55e" : index < 3 ? "rgba(34,197,94,0.6)" : "rgba(34,197,94,0.3)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
