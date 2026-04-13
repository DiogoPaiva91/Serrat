import { useState } from "react";
import { Wrench, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { TipoDeServicoForm } from "@/components/forms/TipoDeServicoForm";
import { useTiposDeServico } from "@/hooks/useTiposDeServico";
import { toast } from "sonner";

export function TiposDeServicoPage() {
  const { data: tipos, isLoading, createMutation, updateMutation, deleteMutation } = useTiposDeServico();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const handleCreate = (data: any) => {
    createMutation.mutate(
      { name: data.name, description: data.description || undefined },
      {
        onSuccess: () => { toast.success("Tipo de Serviço criado!"); setFormOpen(false); },
        onError: (e: any) => toast.error(e.message),
      }
    );
  };

  const handleEdit = (data: any) => {
    if (!editingItem) return;
    updateMutation.mutate(
      { id: editingItem.id, name: data.name, description: data.description || undefined },
      {
        onSuccess: () => { toast.success("Tipo de Serviço atualizado!"); setEditingItem(null); },
        onError: (e: any) => toast.error(e.message),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    deleteMutation.mutate(deleteItem.id, {
      onSuccess: () => { toast.success("Tipo de Serviço removido!"); setDeleteItem(null); },
      onError: (e: any) => toast.error(e.message),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tipos de Serviço</h2>
          <p className="text-muted-foreground text-sm mt-1">Gerencie os tipos de serviço disponíveis</p>
        </div>
        <Button className="gap-2" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Tipo
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}
        </div>
      ) : !tipos?.length ? (
        <div className="text-center py-16">
          <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum tipo de serviço cadastrado</p>
          <Button className="mt-4 gap-2" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> Cadastrar Primeiro Tipo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tipos.map((tipo: any) => (
            <Card key={tipo.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground">{tipo.name}</h3>
                  </div>
                  <Badge variant={tipo.is_active ? "success" : "secondary"}>
                    {tipo.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                {tipo.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{tipo.description}</p>
                )}
                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => setEditingItem(tipo)}>
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => setDeleteItem(tipo)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TipoDeServicoForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} />
      <TipoDeServicoForm
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        initialData={editingItem ? { name: editingItem.name, description: editingItem.description || "" } : null}
        onSubmit={handleEdit}
      />
      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        title="Remover Tipo de Serviço"
        description={`Tem certeza que deseja remover "${deleteItem?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        variant="danger"
      />
    </div>
  );
}
