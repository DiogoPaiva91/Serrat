import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select-native";
import { Loader2, Users, Plus } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";

interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  password?: string;
  company_id?: string | null;
}

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: EmployeeFormData | null;
  onSubmit: (data: EmployeeFormData) => void;
  loading?: boolean;
}

const emptyForm: EmployeeFormData = { name: "", email: "", phone: "", role: "consultor", password: "", company_id: "" };

export function EmployeeForm({ open, onOpenChange, initialData, onSubmit, loading: externalLoading }: EmployeeFormProps) {
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<EmployeeFormData>(emptyForm);
  const { data: companies = [] } = useCompanies();

  useEffect(() => {
    if (open) setForm(initialData || emptyForm);
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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden [&>button]:text-white [&>button]:hover:text-white/80">
        <div className="bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
              {isEditing ? <Users className="h-6 w-6 text-yellow-400" /> : <Plus className="h-6 w-6 text-yellow-400" />}
            </div>
            <div>
              <DialogHeader className="p-0 space-y-0">
                <DialogTitle className="text-white text-lg font-bold">
                  {isEditing ? "Editar Usuario" : "Novo Usuario"}
                </DialogTitle>
                <DialogDescription className="text-white/60 text-sm mt-0.5">
                  {isEditing ? form.name || "Atualize as informações" : "Cadastre um novo usuario no sistema"}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        <div className="px-6 pt-5 pb-6">
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
                <Label htmlFor="role">Perfil</Label>
                <Select id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="consultor">Consultor</option>
                  <option value="admin">Admin</option>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {form.role === "consultor" ? "Apenas visualizacao — nao pode editar dados" : "Acesso total ao sistema"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Select id="company" value={form.company_id || ""} onChange={(e) => setForm({ ...form, company_id: e.target.value || null })}>
                <option value="">— Sem empresa —</option>
                {(companies as any[]).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isEditing ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
