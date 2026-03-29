import { useState } from "react";
import { Download, Search, Filter, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkOrders } from "@/hooks/useWorkOrders";
import { formatDate } from "@/lib/utils";

export function WorkOrdersPage() {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useWorkOrders({ dateFrom, dateTo, search, page, pageSize: 15 });

  const orders = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / 15);

  const handleExportExcel = () => {
    // Basic CSV export
    const headers = "No,Data,Empresa,Funcionario,Tipo Servico,ID Codigo,ID Nome\n";
    const rows = orders.map((o: any) =>
      `${o.order_number},${formatDate(o.completed_at)},${o.company?.name || ""},${o.employee?.full_name || ""},${o.service_type?.name || ""},${o.qr_code?.id_codigo || ""},${o.qr_code?.id_nome || ""}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ordens_servico_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Ordens de Servico</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {totalCount > 0 ? `${totalCount.toLocaleString()} registros` : "Nenhum registro"}
          </p>
        </div>
        <Button className="gap-2" onClick={handleExportExcel} disabled={orders.length === 0}>
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por funcionario, cabine..." className="pl-10" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <Input type="date" className="w-40" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
            <Input type="date" className="w-40" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
            {(search || dateFrom || dateTo) && (
              <Button variant="outline" size="sm" onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); setPage(1); }}>
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : (
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
                    <th className="text-left p-4 font-medium text-muted-foreground w-16">Local</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: any) => (
                    <tr key={order.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{order.order_number}</td>
                      <td className="p-4 text-muted-foreground">{formatDate(order.completed_at)}</td>
                      <td className="p-4">{order.company?.name || "-"}</td>
                      <td className="p-4">{order.employee?.full_name || "-"}</td>
                      <td className="p-4">
                        <Badge variant="success">{order.service_type?.name || "Servico"}</Badge>
                      </td>
                      <td className="p-4 font-semibold">{order.qr_code?.id_codigo || "-"}</td>
                      <td className="p-4 text-muted-foreground">{order.qr_code?.id_nome || "-"}</td>
                      <td className="p-4">
                        {order.latitude && order.longitude && (
                          <a
                            href={`https://maps.google.com/?q=${order.latitude},${order.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-500 hover:text-red-700"
                          >
                            <MapPin className="h-4 w-4" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan={8} className="p-12 text-center text-muted-foreground">Nenhuma ordem de servico encontrada</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Pagina {page} de {totalPages} ({totalCount} resultados)
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
                <span className="text-sm font-medium px-2">{page}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Proximo</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
