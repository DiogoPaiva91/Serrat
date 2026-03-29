import type { Company } from './company';
import type { Location } from './location';

export interface QrCode {
  id: string;
  company_id: string;
  location_id: string | null;
  id_codigo: string;
  id_nome: string;
  qr_value: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  company?: Company;
  location?: Location;
}
