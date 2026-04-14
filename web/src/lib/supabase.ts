import { createClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseUrl = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}.supabase.co`;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ⚠️ AVISO: client com service_role expoe a chave no browser.
// Use apenas para acoes admin (alterar email/senha de outros usuarios).
// Em producao, mover para Edge Function.
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        storageKey: "sb-admin-token",
      },
    })
  : null;

// Direct Admin API calls (bypass JS client for new sb_secret_* keys)
export const adminApi = {
  async createUser(payload: { email: string; password: string; user_metadata?: any }) {
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...payload, email_confirm: true }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || data.message || data.error_description || "Erro ao criar usuario");
    return data;
  },
  async updateUser(userId: string, payload: { email?: string; password?: string }) {
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: "PUT",
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...payload, email_confirm: true }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || data.message || data.error_description || "Erro ao atualizar usuario");
    return data;
  },
  async deleteUser(userId: string) {
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.msg || data.message || "Erro ao excluir usuario");
    }
  },
};

export const isSupabaseConfigured =
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasAdminAccess = !!supabaseServiceKey;
