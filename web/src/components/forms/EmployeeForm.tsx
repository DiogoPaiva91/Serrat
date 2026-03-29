import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select-native";
import { Loader2 } from "lucide-react";

interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  password?: string;
}

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: EmployeeFormData | null;
  onSubmit: (data: EmployeeFormData) => void;
  loading?: boolean;
}

const emptyForm: EmployeeFormData = { name: "", email: "", phone: "", role: "operador", password: "" };

export function EmployeeForm({ open, onOpenChange, initialData, onSubmit, loading: externalLoading }: EmployeeFormProps) {
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<EmployeeFormData>(emptyForm);

  useEffect(() => {
    if (open) {
      setForm(initialData || emptyForm);
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onSubmit(form);
    setLoading(false);
  };

  const isLoading = loading || externalLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Funcionario" : "Novo Funcionario"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize as informacoes do funcionario." : "Cadastre um novo funcionario no sistema."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="Minimo 6 caracteres" value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!isEditing} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" placeholder="(13) 99999-0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Funcao</Label>
              <Select id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="operador">Operador</option>
                <option value="gestor">Gestor</option>
                <option value="admin">Administrador</option>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isEditing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
