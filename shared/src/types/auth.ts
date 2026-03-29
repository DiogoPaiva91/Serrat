export type UserRole = 'admin' | 'gestor' | 'operador';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  company_id: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
