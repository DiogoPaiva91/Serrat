import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmployeeForm } from "@/components/forms/EmployeeForm";
import { toast } from "sonner";

interface EmployeeItem {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  active: boolean;
  osCount: number;
}

const initialEmployees: EmployeeItem[] = [
  { id: "1", name: "Leni Silva", email: "leni@serrat.com", role: "operador", phone: "(13) 99999-1111", active: true, osCount: 1520 },
  { id: "2", name: "Carlos Santos", email: "carlos@serrat.com", role: "operador", phone: "(13) 99999-2222", active: true, osCount: 980 },
  { id: "3", name: "Ana Oliveira", email: "ana@serrat.com", role: "gestor", phone: "(13) 99999-3333", active: true, osCount: 45 },
  { id: "4", name: "Diogo Paiva", email: "diogo@serrat.com", role: "admin", phone: "(13) 99999-4444", active: true, osCount: 12 },
];

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800",
  gestor: "bg-blue-100 text-blue-800",
  operador: "bg-green-100 text-green-800",
};

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  gestor: "Gestor",
  operador: "Operador",
};

export function EmployeesPage() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EmployeeItem | null>(null);

  const filtered = employees.filter(
    (emp) => emp.name.toLowerCase().includes(search.toLowerCase()) || emp.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (data: any) => {
    const newEmp: EmployeeItem = {
      id: String(employees.length + 1),
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      active: true,
      osCount: 0,
    };
    setEmployees([...employees, newEmp]);
    toast.success("Funcionario criado com sucesso!");
  };

  const handleEdit = (data: any) => {
    setEmployees(employees.map((emp) => (emp.id === editingItem?.id ? { ...emp, ...data } : emp)));
    setEditingItem(null);
    toast.success("Funcionario atualizado!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Funcionarios</h2>
          <p className="text-muted-foreground text-sm mt-1">Gerencie a equipe</p>
        </div>
        <Button className="gap-2" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Funcionario
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar funcionario..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((emp) => (
          <Card
            key={emp.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setEditingItem(emp)}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-lg">{emp.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">{emp.name}</h3>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleColors[emp.role]}`}>
                      {roleLabels[emp.role]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{emp.email}</p>
                  <p className="text-sm text-muted-foreground">{emp.phone}</p>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">OS Realizadas</p>
                      <p className="text-lg font-bold text-foreground">{emp.osCount.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${emp.active ? "bg-green-500" : "bg-gray-400"}`} />
                      <span className="text-xs text-muted-foreground">{emp.active ? "Ativo" : "Inativo"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <EmployeeForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} />

      {/* Edit Modal */}
      <EmployeeForm
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        initialData={editingItem ? { name: editingItem.name, email: editingItem.email, phone: editingItem.phone, role: editingItem.role } : null}
        onSubmit={handleEdit}
      />
    </div>
  );
}
