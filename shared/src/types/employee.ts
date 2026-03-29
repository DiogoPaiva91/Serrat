import type { UserProfile } from './auth';

export interface Employee extends UserProfile {
  os_count?: number;
  os_month_count?: number;
}
