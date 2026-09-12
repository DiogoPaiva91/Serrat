import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select-native";
import { Loader2, CheckSquare, Plus } from "lucide-react";

interface ChecklistItemFormData {
  name: string;
  category_id: string;
}

interface ChecklistItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ChecklistItemFormData | null;
  categories: { id: string; name: string }[];
  onSubmit: (data: ChecklistItemFormData) => void;
}

const emptyForm: ChecklistItemFormData = { name: "", category_id: "" };

export function ChecklistItemForm({ open, onOpenChange, initialData, categories, onSubmit }: ChecklistItemFormProps) {
  const isEditing = !!initialData?.name;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ChecklistItemFormData>(emptyForm);

  useEffect(() => {
    if (open) setForm(initialData || emptyForm);
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onSubmit(form);
    setLoading(false);
  };

  const categoryName = categories.find((c) => c.id === form.category_id)?.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden [&>button]:text-white [&>button]:hover:text-white/80">
        <div className="bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
              {isEditing ? <CheckSquare className="h-6 w-6 text-yellow-400" /> : <Plus className="h-6 w-6 text-yellow-400" />}
            </div>
            <div>
              <DialogHeader className="p-0 space-y-0">
                <DialogTitle className="text-white text-lg font-bold">
                  {isEditing ? "Editar Item" : "Novo Item"}
                </DialogTitle>
                <DialogDescription className="text-white/60 text-sm mt-0.5">
                  {categoryName || "Escolha a categoria do item"}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        <div className="px-6 pt-5 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item-category">Categoria</Label>
              <Select id="item-category" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
                <option value="" disabled>Selecione...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-name">Item</Label>
              <Input id="item-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Papel higiênico" required />
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
