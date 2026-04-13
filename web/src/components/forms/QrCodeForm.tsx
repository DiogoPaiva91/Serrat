import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, QrCode, Plus } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

interface QrCodeFormData {
  company: string;
  idCodigo: string;
  idNome: string;
}

interface QrCodeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: (QrCodeFormData & { qrCodeId?: string }) | null;
  onSubmit: (data: QrCodeFormData) => void;
}

interface GeoRecord {
  latitude: number;
  longitude: number;
  completed_at: string;
}

const emptyForm: QrCodeFormData = {
  company: "BRASIL TERMINAL PORTUARIO S/A",
  idCodigo: "",
  idNome: "WC BTP",
};

export function QrCodeForm({ open, onOpenChange, initialData, onSubmit }: QrCodeFormProps) {
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<QrCodeFormData>(emptyForm);
  const [geoHistory, setGeoHistory] = useState<GeoRecord[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialData ? { company: initialData.company, idCodigo: initialData.idCodigo, idNome: initialData.idNome } : emptyForm);
      setGeoHistory([]);

      // Fetch last 3 geolocations for this QR code
      if (isEditing && initialData?.qrCodeId && isSupabaseConfigured) {
        setGeoLoading(true);
        supabase
          .from("work_orders")
          .select("latitude, longitude, completed_at")
          .eq("qr_code_id", initialData.qrCodeId)
          .not("latitude", "is", null)
          .not("longitude", "is", null)
          .order("completed_at", { ascending: false })
          .limit(3)
          .then(({ data }) => {
            if (data) setGeoHistory(data as GeoRecord[]);
            setGeoLoading(false);
          }, () => setGeoLoading(false));
      }
    }
  }, [open, initialData, isEditing]);

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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden [&>button]:text-white [&>button]:hover:text-white/80">
        {/* Header com ícone */}
        <div className="bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0">
              {isEditing ? <QrCode className="h-6 w-6 text-yellow-400" /> : <Plus className="h-6 w-6 text-yellow-400" />}
            </div>
            <div>
              <DialogHeader className="p-0 space-y-0">
                <DialogTitle className="text-white text-lg font-bold">
                  {isEditing ? "Editar QR Code" : "Novo QR Code"}
                </DialogTitle>
                <DialogDescription className="text-white/60 text-sm mt-0.5">
                  {isEditing ? `${form.idCodigo || "Cabine"} · ${form.idNome || ""}` : "Cadastre uma nova cabine com QR Code"}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        <div className="px-6 pt-5 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
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

          {/* Last 3 geolocations */}
          {isEditing && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Últimas Localizações
              </Label>
              {geoLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Carregando...
                </div>
              ) : geoHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground py-1">Nenhuma localização registrada</p>
              ) : (
                <div className="space-y-1.5">
                  {geoHistory.map((geo, i) => (
                    <a
                      key={i}
                      href={`https://maps.google.com/?q=${geo.latitude},${geo.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        <span className="text-muted-foreground font-mono text-xs">
                          {geo.latitude.toFixed(5)}, {geo.longitude.toFixed(5)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(geo.completed_at)}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

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
