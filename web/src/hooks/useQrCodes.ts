import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

export function useQrCodes() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["qr-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("qr_codes")
        .select("*, company:companies(*), location:locations(*)")
        .order("id_codigo");
      if (error) throw error;
      return data;
    },
    enabled: !!profile,
  });

  const createMutation = useMutation({
    mutationFn: async (values: { id_codigo: string; id_nome: string; company_id: string; location_id?: string }) => {
      const { data, error } = await supabase
        .from("qr_codes")
        .insert({ ...values, qr_value: crypto.randomUUID() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["qr-codes"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...values }: { id: string; id_codigo: string; id_nome: string }) => {
      const { data, error } = await supabase
        .from("qr_codes")
        .update(values)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["qr-codes"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("qr_codes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["qr-codes"] }),
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
}
