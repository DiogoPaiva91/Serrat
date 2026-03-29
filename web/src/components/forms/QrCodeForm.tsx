import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface QrCodeFormData {
  company: string;
  address: string;
  idCodigo: string;
  idNome: string;
}

interface QrCodeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: QrCodeFormData | null;
  onSubmit: (data: QrCodeFormData) => void;
}

const emptyForm: QrCodeFormData = {
  company: "BRASIL TERMINAL PORTUARIO S/A",
  address: "Brasil Terminal Portuario - Av. Engenheiro Augusto Barata, s/n - Porto Alemoa, Santos - SP",
  idCodigo: "",
  idNome: "WC BTP",
};

export function QrCodeForm({ open, onOpenChange, initialData, onSubmit }: QrCodeFormProps) {
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<QrCodeFormData>(emptyForm);

  useEffect(() => {
    if (open) {
      setForm(initialData || emptyForm);
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    onSubmit(form);
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar QR Code" : "Novo QR Code"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize as informacoes da cabine." : "Cadastre uma nova cabine com QR Code."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Endereco</Label>
            <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="idCodigo">ID Codigo</Label>
              <Input id="idCodigo" placeholder="CABINE 20" value={form.idCodigo} onChange={(e) => setForm({ ...form, idCodigo: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idNome">ID Nome</Label>
              <Input id="idNome" value={form.idNome} onChange={(e) => setForm({ ...form, idNome: e.target.value })} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isEditing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
