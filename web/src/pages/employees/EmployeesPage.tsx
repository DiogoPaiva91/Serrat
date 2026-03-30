import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeForm } from "@/components/forms/EmployeeForm";
import { useEmployees } from "@/hooks/useEmployees";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
  const { profile } = useAuth();
  const { data: employees, isLoading, refetch } = useEmployees();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const filtered = (employees || []).filter(
    (emp: any) => emp.full_name.toLowerCase().includes(search.toLowerCase()) || emp.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: any) => {
    if (!data.password || data.password.length < 6) {
      toast.error("Senha deve ter no minimo 6 caracteres");
      return;
    }
    setCreating(true);
    try {
      // Sign up new user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.name } },
      });
      if (authError) throw authError;

      // Update profile with role and company
      if (authData.user) {
        await supabase.from("profiles").update({
          full_name: data.name,
          phone: data.phone || null,
          role: data.role,
          company_id: profile?.company_id,
        }).eq("id", authData.user.id);
      }

      toast.success(`${data.name} cadastrado com sucesso!`);
      setFormOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar funcionario");
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async (data: any) => {
    if (!editingItem) return;
    try {
      const { error } = await supabase.from("profiles").update({
        full_name: data.name,
        phone: data.phone || null,
        role: data.role,
      }).eq("id", editingItem.id);
      if (error) throw error;
      toast.success("Funcionario atualizado!");
      setEditingItem(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Funcionarios</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {employees ? `${employees.length} funcionarios` : "Carregando..."}
          </p>
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((emp: any) => (
            <Card key={emp.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setEditingItem(emp)}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-lg">{emp.full_name?.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">{emp.full_name}</h3>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleColors[emp.role] || ""}`}>
                        {roleLabels[emp.role] || emp.role}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{emp.email}</p>
                    {emp.phone && <p className="text-sm text-muted-foreground">{emp.phone}</p>}
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t">
                      <span className={`w-2 h-2 rounded-full ${emp.is_active ? "bg-green-500" : "bg-muted-foreground"}`} />
                      <span className="text-xs text-muted-foreground">{emp.is_active ? "Ativo" : "Inativo"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12">Nenhum funcionario encontrado</p>
          )}
        </div>
      )}

      <EmployeeForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} loading={creating} />
      <EmployeeForm
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        initialData={editingItem ? { name: editingItem.full_name, email: editingItem.email, phone: editingItem.phone || "", role: editingItem.role } : null}
        onSubmit={handleEdit}
      />
    </div>
  );
}
