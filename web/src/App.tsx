import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/query-client";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { WorkOrdersPage } from "@/pages/work-orders/WorkOrdersPage";
import { QrCodesPage } from "@/pages/qr-codes/QrCodesPage";
import { EmployeesPage } from "@/pages/employees/EmployeesPage";
import { CompaniesPage } from "@/pages/companies/CompaniesPage";
import { ReportsPage } from "@/pages/reports/ReportsPage";
import { ROUTES } from "@/lib/constants";
import { OperadorLayout } from "@/pages/operador/OperadorLayout";
import { OperadorLoginPage } from "@/pages/operador/OperadorLoginPage";
import { ScannerPage } from "@/pages/operador/ScannerPage";
import { HistoricoPage } from "@/pages/operador/HistoricoPage";
import { PerfilPage } from "@/pages/operador/PerfilPage";

function ProtectedRoute({ children, loginPath = ROUTES.LOGIN }: { children: React.ReactNode; loginPath?: string }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) return <Navigate to={loginPath} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="ordens-de-servico" element={<WorkOrdersPage />} />
        <Route path="qr-codes" element={<QrCodesPage />} />
        <Route path="funcionarios" element={<EmployeesPage />} />
        <Route path="empresas" element={<CompaniesPage />} />
        <Route path="relatorios" element={<ReportsPage />} />
      </Route>
      {/* Operador PWA - sem login */}
      <Route path="/operador" element={<OperadorLayout />}>
        <Route index element={<Navigate to="/operador/scanner" replace />} />
        <Route path="scanner" element={<ScannerPage />} />
        <Route path="historico" element={<HistoricoPage />} />
        <Route path="perfil" element={<PerfilPage />} />
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster richColors position="top-right" />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
