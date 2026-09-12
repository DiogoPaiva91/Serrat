import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

export interface ChecklistItem {
  id: string;
  category_id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface ChecklistCategory {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  items: ChecklistItem[];
}

/** Ordena categoria e item de uma vez. O embed precisa de referencedTable. */
function selectCatalog() {
  return supabase
    .from("checklist_categories")
    .select("id, name, description, sort_order, is_active, items:checklist_items(id, category_id, name, sort_order, is_active)")
    .order("sort_order")
    .order("sort_order", { referencedTable: "checklist_items", ascending: true });
}

/**
 * Catalogo completo para o painel, inclusive inativos.
 * Categoria e item vivem na mesma query porque a tela mostra os dois juntos.
 */
export function useChecklistCatalog() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["checklist-catalog"] });

  const query = useQuery({
    queryKey: ["checklist-catalog"],
    queryFn: async () => {
      const { data, error } = await selectCatalog();
      if (error) throw error;
      return (data || []) as ChecklistCategory[];
    },
    enabled: !!profile,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (values: { name: string; description: string; sort_order: number }) => {
      const { data, error } = await supabase.from("checklist_categories").insert(values).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...values }: { id: string; name?: string; description?: string; is_active?: boolean }) => {
      const { data, error } = await supabase.from("checklist_categories").update(values).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("checklist_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const createItemMutation = useMutation({
    mutationFn: async (values: { category_id: string; name: string; sort_order: number }) => {
      const { data, error } = await supabase.from("checklist_items").insert(values).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...values }: { id: string; name?: string; category_id?: string; is_active?: boolean }) => {
      const { data, error } = await supabase.from("checklist_items").update(values).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("checklist_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  /**
   * Troca o sort_order de dois vizinhos. Dois updates sequenciais, nunca upsert:
   * o upsert do PostgREST tentaria o caminho de INSERT e bateria em name NOT NULL.
   */
  const swapOrderMutation = useMutation({
    mutationFn: async ({ table, a, b }: {
      table: "checklist_categories" | "checklist_items";
      a: { id: string; sort_order: number };
      b: { id: string; sort_order: number };
    }) => {
      const first = await supabase.from(table).update({ sort_order: b.sort_order }).eq("id", a.id);
      if (first.error) throw first.error;
      const second = await supabase.from(table).update({ sort_order: a.sort_order }).eq("id", b.id);
      if (second.error) throw second.error;
    },
    onSuccess: invalidate,
  });

  return {
    ...query,
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
    createItemMutation,
    updateItemMutation,
    deleteItemMutation,
    swapOrderMutation,
  };
}

/**
 * Modelo que o operador responde: so o que esta ativo.
 * Sem enabled porque as rotas /operador rodam sem login e nao tem profile.
 * Categoria e item sao filtrados em JS para nao perder categoria vazia
 * (o filtro dentro do embed exigiria !inner e derrubaria a categoria inteira).
 */
export function useChecklistTemplate({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["checklist-template"],
    enabled,
    queryFn: async () => {
      const { data, error } = await selectCatalog().eq("is_active", true);
      if (error) throw error;
      return ((data || []) as ChecklistCategory[])
        .map((c) => ({ ...c, items: (c.items || []).filter((i) => i.is_active) }))
        .filter((c) => c.items.length > 0);
    },
  });
}
