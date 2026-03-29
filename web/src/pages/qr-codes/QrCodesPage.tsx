import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Eye, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { QrCodeForm } from "@/components/forms/QrCodeForm";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useQrCodes } from "@/hooks/useQrCodes";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";

export function QrCodesPage() {
  const { profile } = useAuth();
  const { data: qrCodes, isLoading, createMutation, updateMutation, deleteMutation } = useQrCodes();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const filtered = (qrCodes || []).filter(
    (qr: any) =>
      qr.id_codigo.toLowerCase().includes(search.toLowerCase()) ||
      qr.id_nome.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (data: any) => {
    createMutation.mutate(
      { id_codigo: data.idCodigo, id_nome: data.idNome, company_id: profile?.company_id || "" },
      { onSuccess: () => toast.success("QR Code criado com sucesso!"), onError: (e: any) => toast.error(e.message) }
    );
  };

  const handleEdit = (data: any) => {
    if (!editingItem) return;
    updateMutation.mutate(
      { id: editingItem.id, id_codigo: data.idCodigo, id_nome: data.idNome },
      { onSuccess: () => { toast.success("QR Code atualizado!"); setEditingItem(null); }, onError: (e: any) => toast.error(e.message) }
    );
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    deleteMutation.mutate(deleteItem.id, {
      onSuccess: () => { toast.success(`${deleteItem.id_codigo} removido!`); setDeleteItem(null); },
      onError: (e: any) => toast.error(e.message),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">QR Codes</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {qrCodes ? `${qrCodes.length} cabines cadastradas` : "Carregando..."}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por ID Codigo ou Nome..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">ID Codigo</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">ID Nome</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Empresa</th>
                    <th className="text-right p-4 font-medium text-muted-foreground w-36">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((qr: any) => (
                    <tr key={qr.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-semibold">{qr.id_codigo}</td>
                      <td className="p-4 text-muted-foreground">{qr.id_nome}</td>
                      <td className="p-4">{qr.company?.name || "-"}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={() => setEditingItem(qr)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => setDeleteItem(qr)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Nenhum QR Code encontrado</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <QrCodeForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} />
      <QrCodeForm
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        initialData={editingItem ? { company: editingItem.company?.name || "", address: "", idCodigo: editingItem.id_codigo, idNome: editingItem.id_nome } : null}
        onSubmit={handleEdit}
      />
      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        title="Excluir QR Code"
        description={`Tem certeza que deseja excluir ${deleteItem?.id_codigo}?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
