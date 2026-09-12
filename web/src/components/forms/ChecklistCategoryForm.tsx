import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ListChecks, Plus } from "lucide-react";

interface ChecklistCategoryFormData {
  name: string;
  description: string;
}

interface ChecklistCategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ChecklistCategoryFormData | null;
  onSubmit: (data: ChecklistCategoryFormData) => void;
}

const emptyForm: ChecklistCategoryFormData = { name: "", description: "" };

export function ChecklistCategoryForm({ open, onOpenChange, initialData, onSubmit }: ChecklistCategoryFormProps) {
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ChecklistCategoryFormData>(emptyForm);

  useEffect(() => {
    if (open) setForm(initialData || emptyForm);
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onSubmit(form);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden [&>button]:text-white [&>button]:hover:text-white/80">
        <div className="bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
              {isEditing ? <ListChecks className="h-6 w-6 text-yellow-400" /> : <Plus className="h-6 w-6 text-yellow-400" />}
            </div>
            <div>
              <DialogHeader className="p-0 space-y-0">
                <DialogTitle className="text-white text-lg font-bold">
                  {isEditing ? "Editar Categoria" : "Nova Categoria"}
                </DialogTitle>
                <DialogDescription className="text-white/60 text-sm mt-0.5">
                  {isEditing ? form.name || "Atualize as informações" : "Agrupa os itens conferidos pelo operador"}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        <div className="px-6 pt-5 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nome</Label>
              <Input id="cat-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Itens de higiene" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-description">Descrição</Label>
              <Textarea id="cat-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Aparece apenas no painel, o operador não vê..." rows={3} />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isEditing ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
