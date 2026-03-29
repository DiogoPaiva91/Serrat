import type { QrCode } from './qr-code';
import type { UserProfile } from './auth';
import type { Company } from './company';

export interface ServiceType {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface WorkOrder {
  id: string;
  order_number: number;
  company_id: string;
  qr_code_id: string;
  employee_id: string;
  service_type_id: string | null;
  observation: string | null;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  completed_at: string;
  created_at: string;
  qr_code?: QrCode;
  employee?: UserProfile;
  service_type?: ServiceType;
  company?: Company;
}

export interface WorkOrderFilters {
  dateFrom?: string;
  dateTo?: string;
  employeeId?: string;
  qrCodeId?: string;
  serviceTypeId?: string;
  search?: string;
}

export interface DashboardStats {
  os_today: number;
  os_month: number;
  active_cabins: number;
  active_employees: number;
}

export interface SlaAlert {
  qr_code_id: string;
  id_codigo: string;
  id_nome: string;
  last_cleaned: string | null;
  hours_since: number | null;
}

export interface OsPerDay {
  date: string;
  count: number;
}
