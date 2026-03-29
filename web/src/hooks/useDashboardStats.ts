import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

export function useDashboardStats() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return null;
      const { data, error } = await supabase.rpc("get_dashboard_stats", {
        p_company_id: profile.company_id,
      });
      if (error) throw error;
      return data as { os_today: number; os_month: number; active_cabins: number; active_employees: number };
    },
    enabled: !!profile?.company_id,
    refetchInterval: 30000,
  });
}

export function useOsPerDay() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["os-per-day", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return [];
      const { data, error } = await supabase.rpc("get_os_per_day", {
        p_company_id: profile.company_id,
        p_days: 30,
      });
      if (error) throw error;
      return (data || []) as { date: string; count: number }[];
    },
    enabled: !!profile?.company_id,
  });
}

export function useSlaAlerts() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["sla-alerts", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return [];
      const { data, error } = await supabase.rpc("get_sla_alerts", {
        p_company_id: profile.company_id,
        p_threshold_hours: 4,
      });
      if (error) throw error;
      return (data || []) as { qr_code_id: string; id_codigo: string; id_nome: string; last_cleaned: string | null; hours_since: number | null }[];
    },
    enabled: !!profile?.company_id,
    refetchInterval: 300000,
  });
}
