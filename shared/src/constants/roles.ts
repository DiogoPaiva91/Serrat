import type { UserRole } from '../types/auth';

export const ROLES: Record<UserRole, { label: string; color: string }> = {
  admin: { label: 'Administrador', color: 'purple' },
  gestor: { label: 'Gestor', color: 'blue' },
  operador: { label: 'Operador', color: 'green' },
};
