import { ClipboardList, Download, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const mockOrders = Array.from({ length: 10 }, (_, i) => ({
  id: `${47829 - i}`,
  date: "29/03/26 14:05",
  company: "BRASIL TERMINAL PORTUARIO S/A",
  address: "Av. Engenheiro Augusto Barata - Alemoa, Santos - SP",
  employee: "LENI",
  serviceType: "Higienizacao",
  idCodigo: `CABINE ${String(19 - i).padStart(2, "0")}`,
  idNome: "WC BTP",
}));

export function WorkOrdersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Ordens de Servico</h2>
          <p className="text-muted-foreground text-sm mt-1">Gerencie todas as ordens de servico</p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por funcionario, cabine..." className="pl-10" />
            </div>
            <Input type="date" className="w-40" />
            <Input type="date" className="w-40" />
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
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
                  <th className="text-left p-4 font-medium text-muted-foreground">No</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Data/Hora</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Empresa</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Funcionario</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Tipo Servico</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">ID Codigo</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">ID Nome</th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="p-4 font-medium">{order.id}</td>
                    <td className="p-4 text-muted-foreground">{order.date}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{order.company}</p>
                        <p className="text-xs text-muted-foreground">{order.address}</p>
                      </div>
                    </td>
                    <td className="p-4">{order.employee}</td>
                    <td className="p-4">
                      <Badge variant="success">{order.serviceType}</Badge>
                    </td>
                    <td className="p-4 font-medium">{order.idCodigo}</td>
                    <td className="p-4 text-muted-foreground">{order.idNome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">Mostrando 1-10 de 1.920 resultados</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>Anterior</Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">Proximo</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
