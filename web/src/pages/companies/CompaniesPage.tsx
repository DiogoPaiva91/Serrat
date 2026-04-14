import { useState } from "react";
import { Building2, Plus, MapPin, Phone, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyForm } from "@/components/forms/CompanyForm";
import { useCompanies } from "@/hooks/useCompanies";
import { useQrCodes } from "@/hooks/useQrCodes";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { toast } from "sonner";

export function CompaniesPage() {
  const { data: companies, isLoading, createMutation, updateMutation } = useCompanies();
  const { data: qrCodes } = useQrCodes();
  useRealtimeTable("companies", "companies");
  useRealtimeTable("qr_codes", "qr-codes");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const getCabinCount = (companyId: string) =>
    (qrCodes || []).filter((qr: any) => qr.company_id === companyId).length;

  const handleCreate = (data: any) => {
    createMutation.mutate(
      { name: data.name, cnpj: data.cnpj, address: data.address, city: data.city, state: data.state, phone: data.phone, email: data.email, contract_info: data.contractInfo },
      { onSuccess: () => toast.success("Empresa criada!"), onError: (e: any) => toast.error(e.message) }
    );
  };

  const handleEdit = (data: any) => {
    if (!editingItem) return;
    updateMutation.mutate(
      { id: editingItem.id, name: data.name, cnpj: data.cnpj, address: data.address, city: data.city, state: data.state, phone: data.phone, email: data.email, contract_info: data.contractInfo },
      { onSuccess: () => { toast.success("Empresa atualizada!"); setEditingItem(null); }, onError: (e: any) => toast.error(e.message) }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Empresas</h2>
          <p className="text-muted-foreground text-sm mt-1">Gerencie as empresas clientes</p>
        </div>
        <Button className="gap-2" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova Empresa
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-52 w-full rounded-lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(companies || []).map((company: any) => (
            <Card key={company.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setEditingItem(company)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{company.name}</h3>
                      {company.cnpj && <p className="text-sm text-muted-foreground">CNPJ: {company.cnpj}</p>}
                    </div>
                  </div>
                  <Badge variant={company.is_active ? "success" : "secondary"}>
                    {company.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  {company.address && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{company.address}{company.city ? `, ${company.city}` : ""}{company.state ? ` - ${company.state}` : ""}</span>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                  {company.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span>{company.email}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-2xl font-bold text-primary">{getCabinCount(company.id)}</p>
                  <p className="text-xs text-muted-foreground">Cabines</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CompanyForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} />
      <CompanyForm
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        initialData={editingItem ? { name: editingItem.name, cnpj: editingItem.cnpj || "", address: editingItem.address || "", city: editingItem.city || "", state: editingItem.state || "", phone: editingItem.phone || "", email: editingItem.email || "", contractInfo: editingItem.contract_info || "" } : null}
        onSubmit={handleEdit}
      />
    </div>
  );
}
