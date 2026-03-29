import { QrCode, Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const mockQrCodes = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  company: "BRASIL TERMINAL PORTUARIO S/A",
  address: "Brasil Terminal Portuario - Av. Engenheiro Augusto Barata, s/n - Porto Alemoa, Santos - SP",
  idCodigo: `CABINE ${String(i + 1).padStart(2, "0")}`,
  idNome: "WC BTP",
}));

export function QrCodesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">QR Codes</h2>
          <p className="text-muted-foreground text-sm mt-1">Gerencie os QR Codes das cabines</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por ID Codigo..." className="pl-10" />
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por ID Material..." className="pl-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
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
                {mockQrCodes.map((qr) => (
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-800 hover:bg-green-50">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">Pagina 1 de 2</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>Anterior</Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">Proximo</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
