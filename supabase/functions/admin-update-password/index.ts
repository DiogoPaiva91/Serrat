// @ts-nocheck
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Sem autorizacao" }), { status: 401, headers: corsHeaders });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey);
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    const { data: { user }, error: userErr } = await userClient.auth.getUser(jwt);
    if (userErr || !user) return new Response(JSON.stringify({ error: `Sessao invalida: ${userErr?.message || "no user"}` }), { status: 401, headers: corsHeaders });

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return new Response(JSON.stringify({ error: "Apenas admins" }), { status: 403, headers: corsHeaders });

    const body = await req.json();
    const { user_id, new_password } = body;

    if (!user_id || !new_password) return new Response(JSON.stringify({ error: "user_id e new_password obrigatorios" }), { status: 400, headers: corsHeaders });
    if (new_password.length < 6) return new Response(JSON.stringify({ error: "Senha minima 6 caracteres" }), { status: 400, headers: corsHeaders });

    const { error } = await admin.auth.admin.updateUserById(user_id, { password: new_password });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });

    // Marcar para trocar no proximo login (opcional)
    await admin.from("profiles").update({ must_change_password: true }).eq("id", user_id);

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
