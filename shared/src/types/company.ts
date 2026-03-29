export interface Company {
  id: string;
  name: string;
  cnpj: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  contract_info: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
