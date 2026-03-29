import { Building2, Plus, MapPin, Phone, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockCompanies = [
  {
    id: "1",
    name: "BRASIL TERMINAL PORTUARIO S/A",
    cnpj: "02.872.034/0001-69",
    address: "Av. Engenheiro Augusto Barata, s/n - Porto Alemoa",
    city: "Santos",
    state: "SP",
    phone: "(13) 3344-0000",
    email: "contato@btp.com.br",
    cabins: 19,
    active: true,
  },
];

export function CompaniesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Empresas</h2>
          <p className="text-muted-foreground text-sm mt-1">Gerencie as empresas clientes</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Empresa
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{company.name}</h3>
                    <p className="text-sm text-muted-foreground">CNPJ: {company.cnpj}</p>
                  </div>
                </div>
                <Badge variant={company.active ? "success" : "secondary"}>
                  {company.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{company.address}, {company.city} - {company.state}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{company.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>{company.email}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{company.cabins}</p>
                  <p className="text-xs text-muted-foreground">Cabines</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
