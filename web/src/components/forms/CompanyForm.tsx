import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Building2, Plus, ImagePlus, Trash2 } from "lucide-react";
import { uploadCompanyLogo } from "@/lib/storage";

interface CompanyFormData {
  name: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  contractInfo: string;
  logoUrl: string;
}

interface CompanyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CompanyFormData | null;
  companyId?: string;
  onSubmit: (data: CompanyFormData) => void;
}

const emptyForm: CompanyFormData = { name: "", cnpj: "", address: "", city: "", state: "SP", phone: "", email: "", contractInfo: "", logoUrl: "" };

export function CompanyForm({ open, onOpenChange, initialData, companyId, onSubmit }: CompanyFormProps) {
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CompanyFormData>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [logoErro, setLogoErro] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setForm(initialData || emptyForm); setLogoErro(""); }
  }, [open, initialData]);

  /* O upload acontece na escolha do arquivo, nao no submit, para dar previa
     imediata. Se a pessoa desistir do cadastro sobra um arquivo orfao, que e
     barato: logo comprimido fica em torno de 30 KB. */
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLogoErro("");
    setUploading(true);
    try {
      const url = await uploadCompanyLogo(file, companyId || "novas");
      setForm((f) => ({ ...f, logoUrl: url }));
    } catch (err: any) {
      setLogoErro(err.message || "Nao foi possivel enviar o logo");
    } finally {
      setUploading(false);
    }
  };

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
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden [&>button]:text-white [&>button]:hover:text-white/80">
        <div className="bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
              {isEditing ? <Building2 className="h-6 w-6 text-yellow-400" /> : <Plus className="h-6 w-6 text-yellow-400" />}
            </div>
            <div>
              <DialogHeader className="p-0 space-y-0">
                <DialogTitle className="text-white text-lg font-bold">
                  {isEditing ? "Editar Empresa" : "Nova Empresa"}
                </DialogTitle>
                <DialogDescription className="text-white/60 text-sm mt-0.5">
                  {isEditing ? form.name || "Atualize as informações da empresa" : "Cadastre uma nova empresa cliente"}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        <div className="px-6 pt-5 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg border border-border bg-muted/40 flex items-center justify-center overflow-hidden shrink-0">
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                      {form.logoUrl ? "Trocar" : "Escolher arquivo"}
                    </Button>
                    {form.logoUrl && (
                      <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, logoUrl: "" })}>
                        <Trash2 className="h-4 w-4" /> Remover
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WEBP ou SVG. Reduzido para 512px ao enviar.</p>
                </div>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={handleLogoChange} />
              </div>
              {logoErro && <p className="text-xs text-destructive">{logoErro}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" placeholder="00.000.000/0001-00" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereco</Label>
              <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contractInfo">Informacoes do Contrato</Label>
              <Textarea id="contractInfo" placeholder="Detalhes do contrato..." value={form.contractInfo} onChange={(e) => setForm({ ...form, contractInfo: e.target.value })} />
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
