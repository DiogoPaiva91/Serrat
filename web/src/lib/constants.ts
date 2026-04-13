export const ROUTES = {
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: "/dashboard",
  WORK_ORDERS: "/ordens-de-servico",
  QR_CODES: "/qr-codes",
  EMPLOYEES: "/funcionarios",
  COMPANIES: "/empresas",
  SERVICE_TYPES: "/tipos-de-servico",
  REPORTS: "/relatorios",
  SYNC: "/sincronizacao",
} as const;

export const PAGE_SIZE = 20;

export const NAV_ITEMS = [
  { path: ROUTES.DASHBOARD, label: "Dashboard", icon: "LayoutDashboard" },
  { path: ROUTES.WORK_ORDERS, label: "Ordens de Serviço", icon: "ClipboardList" },
  { path: ROUTES.QR_CODES, label: "QR Codes", icon: "QrCode" },
  { path: ROUTES.EMPLOYEES, label: "Funcionarios", icon: "Users" },
  { path: ROUTES.COMPANIES, label: "Empresas", icon: "Building2" },
  { path: ROUTES.SERVICE_TYPES, label: "Tipos de Serviço", icon: "Wrench" },
  { path: ROUTES.REPORTS, label: "Relatorios", icon: "BarChart3" },
  { path: ROUTES.SYNC, label: "Sincronizacao", icon: "CloudDownload" },
] as const;
