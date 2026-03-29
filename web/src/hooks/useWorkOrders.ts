import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

interface WorkOrderFilters {
  dateFrom?: string;
  dateTo?: string;
  employeeId?: string;
  qrCodeId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export function useWorkOrders(filters: WorkOrderFilters = {}) {
  const { profile } = useAuth();
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;

  return useQuery({
    queryKey: ["work-orders", filters],
    queryFn: async () => {
      let query = supabase
        .from("work_orders")
        .select("*, qr_code:qr_codes(id_codigo, id_nome), employee:profiles(full_name), service_type:service_types(name), company:companies(name, address)", { count: "exact" })
        .order("completed_at", { ascending: false });

      if (filters.dateFrom) query = query.gte("completed_at", filters.dateFrom);
      if (filters.dateTo) query = query.lte("completed_at", filters.dateTo + "T23:59:59");
      if (filters.employeeId) query = query.eq("employee_id", filters.employeeId);
      if (filters.qrCodeId) query = query.eq("qr_code_id", filters.qrCodeId);

      const from = (page - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], count: count || 0, page, pageSize };
    },
    enabled: !!profile,
  });
}
