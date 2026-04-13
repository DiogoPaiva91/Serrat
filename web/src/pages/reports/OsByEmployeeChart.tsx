import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { name: "LENI", higienizacao: 520, manutencao: 35, inspecao: 18 },
  { name: "CARLOS", higienizacao: 380, manutencao: 42, inspecao: 22 },
  { name: "ANA", higienizacao: 15, manutencao: 8, inspecao: 22 },
  { name: "MARCOS", higienizacao: 290, manutencao: 18, inspecao: 12 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#171717", margin: "0 0 4px" }}>{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ fontSize: 11, margin: "1px 0", color: entry.color }}>
            {entry.name}: <span style={{ fontWeight: 700 }}>{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function OsByEmployeeChart() {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }} />
          <Bar dataKey="higienizacao" name="Higienizacao" fill="#22c55e" radius={[4, 4, 0, 0]} stackId="a" />
          <Bar dataKey="manutencao" name="Manutencao" fill="#eab308" stackId="a" />
          <Bar dataKey="inspecao" name="Inspecao" fill="#8b5cf6" radius={[4, 4, 0, 0]} stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
