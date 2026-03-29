import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

export function useCompanies() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!profile,
  });

  const createMutation = useMutation({
    mutationFn: async (values: { name: string; cnpj?: string; address?: string; city?: string; state?: string; phone?: string; email?: string; contract_info?: string }) => {
      const { data, error } = await supabase.from("companies").insert(values).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["companies"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...values }: { id: string; name: string; cnpj?: string; address?: string; city?: string; state?: string; phone?: string; email?: string; contract_info?: string }) => {
      const { data, error } = await supabase.from("companies").update(values).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["companies"] }),
  });

  return { ...query, createMutation, updateMutation };
}
