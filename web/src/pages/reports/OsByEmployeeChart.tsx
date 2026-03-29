import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { name: "LENI", higienizacao: 520, manutencao: 35, inspecao: 18 },
  { name: "CARLOS", higienizacao: 380, manutencao: 42, inspecao: 22 },
  { name: "ANA", higienizacao: 15, manutencao: 8, inspecao: 22 },
  { name: "MARCOS", higienizacao: 290, manutencao: 18, inspecao: 12 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3">
        <p className="text-xs font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-[11px]" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function OsByEmployeeChart() {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle>OS por Funcionario</CardTitle></CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
              <Bar dataKey="higienizacao" name="Higienizacao" fill="#22c55e" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="manutencao" name="Manutencao" fill="#2094f3" stackId="a" />
              <Bar dataKey="inspecao" name="Inspecao" fill="#8b5cf6" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
