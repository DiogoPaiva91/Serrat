import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

// Helper: aplica filtro de empresa para consultor; admin vê tudo
function scopeQuery(query: any, profile: any) {
  if (profile?.role !== "admin" && profile?.company_id) {
    return query.eq("company_id", profile.company_id);
  }
  return query;
}

export function useDashboardStats() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", profile?.company_id, profile?.role],
    queryFn: async () => {
      if (!profile) return null;
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const todayQ = scopeQuery(supabase.from("work_orders").select("id", { count: "exact", head: true }).gte("completed_at", todayStart), profile);
      const monthQ = scopeQuery(supabase.from("work_orders").select("id", { count: "exact", head: true }).gte("completed_at", monthStart), profile);
      const cabQ = scopeQuery(supabase.from("qr_codes").select("id", { count: "exact", head: true }).eq("is_active", true), profile);
      const empQ = supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", true);

      const [t, m, c, e] = await Promise.all([todayQ, monthQ, cabQ, empQ]);
      return {
        os_today: t.count ?? 0,
        os_month: m.count ?? 0,
        active_cabins: c.count ?? 0,
        active_employees: e.count ?? 0,
      };
    },
    enabled: !!profile,
    refetchInterval: 30000,
  });
}

export function useOsPerDay() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["os-per-day", profile?.company_id, profile?.role],
    queryFn: async () => {
      if (!profile) return [];
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      let q = scopeQuery(supabase.from("work_orders").select("completed_at").gte("completed_at", since), profile);
      const { data, error } = await q;
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of data || []) {
        const d = new Date((row as any).completed_at).toISOString().slice(0, 10);
        counts[d] = (counts[d] || 0) + 1;
      }
      return Object.entries(counts).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
    },
    enabled: !!profile,
  });
}

export function useOsByCabin() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["os-by-cabin", profile?.company_id, profile?.role],
    queryFn: async () => {
      if (!profile) return [];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      let q = scopeQuery(supabase.from("work_orders").select("qr_code:qr_codes(id_codigo, id_nome)").gte("completed_at", monthStart), profile);
      const { data, error } = await q;
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of data || []) {
        const qr = (row as any).qr_code;
        const name = qr ? `${qr.id_codigo} · ${qr.id_nome}` : "Sem cabine";
        counts[name] = (counts[name] || 0) + 1;
      }
      return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    },
    enabled: !!profile,
  });
}

export function useOsYesterday() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["os-yesterday", profile?.company_id, profile?.role],
    queryFn: async () => {
      if (!profile) return { yesterday: 0, prevMonth: 0 };
      const now = new Date();
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

      const yQ = scopeQuery(supabase.from("work_orders").select("id", { count: "exact", head: true }).gte("completed_at", yesterday.toISOString()).lt("completed_at", yesterdayEnd.toISOString()), profile);
      const pmQ = scopeQuery(supabase.from("work_orders").select("id", { count: "exact", head: true }).gte("completed_at", prevMonthStart.toISOString()).lt("completed_at", prevMonthEnd.toISOString()), profile);
      const [yRes, pmRes] = await Promise.all([yQ, pmQ]);
      return { yesterday: yRes.count ?? 0, prevMonth: pmRes.count ?? 0 };
    },
    enabled: !!profile,
  });
}

export function useOsByOperator() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["os-by-operator", profile?.company_id, profile?.role],
    queryFn: async () => {
      if (!profile) return [];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      let q = scopeQuery(supabase.from("work_orders").select("responsible_name").gte("completed_at", monthStart), profile);
      const { data, error } = await q;
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of data || []) {
        const name = (row as any).responsible_name || "Sem nome";
        counts[name] = (counts[name] || 0) + 1;
      }
      return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    },
    enabled: !!profile,
  });
}

export function useOsByHour() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["os-by-hour", profile?.company_id, profile?.role],
    queryFn: async () => {
      if (!profile) return [];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      let q = scopeQuery(supabase.from("work_orders").select("completed_at").gte("completed_at", monthStart), profile);
      const { data, error } = await q;
      if (error) throw error;
      const hours = Array(24).fill(0);
      for (const row of data || []) {
        const h = new Date((row as any).completed_at).getHours();
        hours[h]++;
      }
      return hours.map((count, i) => ({ hour: `${String(i).padStart(2, "0")}h`, os: count }));
    },
    enabled: !!profile,
  });
}

export function useSlaAlerts() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["sla-alerts", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return [];
      const { data, error } = await supabase.rpc("get_sla_alerts", { p_company_id: profile.company_id, p_threshold_hours: 4 });
      if (error) throw error;
      return (data || []) as { qr_code_id: string; id_codigo: string; id_nome: string; last_cleaned: string | null; hours_since: number | null }[];
    },
    enabled: !!profile?.company_id,
    refetchInterval: 300000,
  });
}
