import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCodeForm } from "@/components/forms/QrCodeForm";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "sonner";

interface QrCodeItem {
  id: string;
  company: string;
  address: string;
  idCodigo: string;
  idNome: string;
}

const initialQrCodes: QrCodeItem[] = Array.from({ length: 19 }, (_, i) => ({
  id: String(i + 1),
  company: "BRASIL TERMINAL PORTUARIO S/A",
  address: "Brasil Terminal Portuario - Av. Engenheiro Augusto Barata, s/n - Porto Alemoa, Santos - SP",
  idCodigo: `CABINE ${String(i + 1).padStart(2, "0")}`,
  idNome: "WC BTP",
}));

export function QrCodesPage() {
  const [qrCodes, setQrCodes] = useState(initialQrCodes);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QrCodeItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<QrCodeItem | null>(null);

  const filtered = qrCodes.filter(
    (qr) =>
      qr.idCodigo.toLowerCase().includes(search.toLowerCase()) ||
      qr.idNome.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (data: any) => {
    const newItem: QrCodeItem = {
      id: String(qrCodes.length + 1),
      ...data,
    };
    setQrCodes([...qrCodes, newItem]);
    toast.success("QR Code criado com sucesso!");
  };

  const handleEdit = (data: any) => {
    setQrCodes(qrCodes.map((qr) => (qr.id === editingItem?.id ? { ...qr, ...data } : qr)));
    setEditingItem(null);
    toast.success("QR Code atualizado!");
  };

  const handleDelete = () => {
    if (deleteItem) {
      setQrCodes(qrCodes.filter((qr) => qr.id !== deleteItem.id));
      toast.success(`${deleteItem.idCodigo} removido!`);
      setDeleteItem(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">QR Codes</h2>
          <p className="text-muted-foreground text-sm mt-1">Gerencie os QR Codes das cabines</p>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground w-16">No</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Empresa</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Endereco</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">ID Codigo</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">ID Nome</th>
                  <th className="text-right p-4 font-medium text-muted-foreground w-36">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((qr) => (
                  <tr key={qr.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">{qr.id}</td>
                    <td className="p-4 font-medium">{qr.company}</td>
                    <td className="p-4 text-muted-foreground text-xs">{qr.address}</td>
                    <td className="p-4 font-semibold">{qr.idCodigo}</td>
                    <td className="p-4 text-muted-foreground">{qr.idNome}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-800 hover:bg-green-50" onClick={() => { setEditingItem(qr); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50" onClick={() => setDeleteItem(qr)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t text-sm text-muted-foreground">
            {filtered.length} de {qrCodes.length} QR Codes
          </div>
        </CardContent>
      </Card>

      {/* Create Modal */}
      <QrCodeForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} />

      {/* Edit Modal */}
      <QrCodeForm
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        initialData={editingItem}
        onSubmit={handleEdit}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        title="Excluir QR Code"
        description={`Tem certeza que deseja excluir ${deleteItem?.idCodigo}?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
