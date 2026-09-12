/**
 * Traduz o erro cru do PostgREST para algo acionavel na tela.
 * Sem isso o usuario ve "Could not find the table 'public.x' in the schema cache",
 * que nao diz o que fazer e parece bug do app quando na verdade e migration faltando.
 */
export function mensagemDeErro(e: any): string {
  const code = e?.code as string | undefined;
  const msg = String(e?.message || "");

  // Tabela inexistente (ou schema cache desatualizado apos criar a tabela).
  if (code === "PGRST205" || /schema cache/i.test(msg)) {
    const tabela = msg.match(/'public\.([a-z_]+)'/i)?.[1];
    if (tabela && tabela.startsWith("checklist")) {
      return "As tabelas do checklist ainda nao existem no banco. Rode a migration 005_checklist.sql no SQL editor do Supabase.";
    }
    if (tabela && tabela.startsWith("work_order_")) {
      return "As tabelas de checklist e anormalidade ainda nao existem. Rode a migration 005_checklist.sql no SQL editor do Supabase.";
    }
    return `A tabela ${tabela || "usada por esta tela"} nao existe no banco. Falta aplicar a migration correspondente.`;
  }

  // Coluna inexistente.
  if (code === "42703") {
    const coluna = msg.match(/column ([a-z_.]+) does not exist/i)?.[1];
    if (coluna?.includes("status")) {
      return "A coluna status ainda nao existe em work_orders. Rode a migration 005_checklist.sql.";
    }
    if (coluna?.includes("logo_url")) {
      return "A coluna logo_url ainda nao existe em companies. Rode a migration 006_company_logo.sql.";
    }
    return `A coluna ${coluna || "usada por esta tela"} nao existe no banco. Falta aplicar a migration correspondente.`;
  }

  // Violacao de RLS.
  if (code === "42501" || /row-level security/i.test(msg)) {
    return "Seu usuario nao tem permissao para esta acao.";
  }

  // Unique.
  if (code === "23505") {
    return "Ja existe um registro com esse nome.";
  }

  return msg || "Erro desconhecido";
}
