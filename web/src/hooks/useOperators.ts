import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Operator {
  id: string;
  name: string;
  company_id: string | null;
  is_active: boolean;
}

export function useOperators() {
  return useQuery({
    queryKey: ["operators"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("operators")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as Operator[];
    },
  });
}

export function useAddOperator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      // Check if already exists (case insensitive)
      const { data: existing } = await supabase
        .from("operators")
        .select("*")
        .ilike("name", name.trim())
        .limit(1)
        .maybeSingle();
      if (existing) {
        if (!existing.is_active) {
          await supabase.from("operators").update({ is_active: true }).eq("id", existing.id);
        }
        return existing as Operator;
      }
      const { data, error } = await supabase
        .from("operators")
        .insert({ name: name.trim() })
        .select()
        .single();
      if (error) throw error;
      return data as Operator;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["operators"] }),
  });
}

export function useDeleteOperator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("operators")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["operators"] }),
  });
}
