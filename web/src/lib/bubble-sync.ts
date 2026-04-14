import { supabase, isSupabaseConfigured } from "./supabase";

const BUBBLE_API_URL =
  "https://operation.app.br/api/1.1/obj/work_orders";
const PAGE_SIZE = 100;

export interface BubbleWorkOrder {
  _id: string;
  id: string;
  "Funcionário": string;
  Empresa: string;
  Empresa_Cliente: string;
  "QR CODE": string;
  Data: string;
  "Created Date": string;
  "Modified Date": string;
  "Tipo_serviço": string[];
  "Endereço": {
    address: string;
    lat: number;
    lng: number;
  };
}

export interface SyncProgress {
  total: number;
  fetched: number;
  imported: number;
  skipped: number;
  errors: number;
  status: "idle" | "fetching" | "importing" | "done" | "error";
  message: string;
  preview?: BubbleWorkOrder[];
}

// ─── Relationship options ───

export interface RelOption { id: string; name: string }

export async function getCompanies(): Promise<RelOption[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data } = await supabase.from("companies").select("id, name").eq("is_active", true).order("name");
    return (data || []).map((r) => ({ id: r.id, name: r.name }));
  } catch { return []; }
}

export async function getServiceTypes(): Promise<RelOption[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data } = await supabase.from("service_types").select("id, name").eq("is_active", true).order("name");
    return (data || []).map((r) => ({ id: r.id, name: r.name }));
  } catch { return []; }
}

export async function getQrCodes(): Promise<(RelOption & { id_codigo: string })[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data } = await supabase.from("qr_codes").select("id, id_codigo, id_nome").eq("is_active", true).order("id_codigo");
    return (data || []).map((r) => ({ id: r.id, name: `${r.id_codigo} @ ${r.id_nome}`, id_codigo: r.id_codigo }));
  } catch { return []; }
}

// ─── Relationship config ───

export interface SyncRelationships {
  companyId?: string;
  serviceTypeMap: Record<string, string>;
  qrCodeMap: Record<string, string>;
}

export const DEFAULT_RELATIONSHIPS: SyncRelationships = {
  serviceTypeMap: {},
  qrCodeMap: {},
};

// ─── Auto-match ───

export function buildAutoMatchMaps(
  serviceTypes: RelOption[],
  qrCodes: (RelOption & { id_codigo: string })[],
): Pick<SyncRelationships, "serviceTypeMap" | "qrCodeMap"> {
  const serviceTypeMap: Record<string, string> = {};
  for (const st of serviceTypes) {
    serviceTypeMap[st.name] = st.id;
  }
  const qrCodeMap: Record<string, string> = {};
  for (const qr of qrCodes) {
    qrCodeMap[qr.id_codigo] = qr.id;
  }
  return { serviceTypeMap, qrCodeMap };
}

export function extractUniqueValues(records: BubbleWorkOrder[]) {
  const serviceTypes = new Set<string>();
  const employees = new Set<string>();
  const qrCodes = new Set<string>();

  for (const r of records) {
    if (r["Tipo_serviço"]?.[0]) serviceTypes.add(r["Tipo_serviço"][0]);
    if (r["Funcionário"]) employees.add(r["Funcionário"]);
    const cabine = (r["QR CODE"] || "").split("@")[0]?.trim();
    if (cabine) qrCodes.add(cabine);
  }

  return {
    serviceTypes: [...serviceTypes].sort(),
    employees: [...employees].sort(),
    qrCodes: [...qrCodes].sort(),
  };
}

// ─── Mapping ───

function mapBubbleToSupabase(item: BubbleWorkOrder, rels: SyncRelationships, orderNumber?: number) {
  const cabine = (item["QR CODE"] || "").split("@")[0]?.trim() || null;
  const tipoServico = item["Tipo_serviço"]?.[0] || null;

  const row: Record<string, unknown> = {
    bubble_id: item._id,
    responsible_name: item["Funcionário"] || null,
    latitude: item["Endereço"]?.lat || null,
    longitude: item["Endereço"]?.lng || null,
    completed_at: item.Data || item["Created Date"],
    created_at: item["Created Date"],
  };

  if (orderNumber !== undefined) row.order_number = orderNumber;
  if (rels.companyId) row.company_id = rels.companyId;
  if (tipoServico && rels.serviceTypeMap[tipoServico]) row.service_type_id = rels.serviceTypeMap[tipoServico];
  if (cabine && rels.qrCodeMap[cabine]) row.qr_code_id = rels.qrCodeMap[cabine];

  return row;
}

// ─── Fetch ───

async function fetchBubblePage(
  cursor: number,
  limit: number = PAGE_SIZE,
  descending: boolean = false,
  year?: number,
): Promise<{ results: BubbleWorkOrder[]; remaining: number }> {
  let url = `${BUBBLE_API_URL}?cursor=${cursor}&limit=${limit}&sort_field=${encodeURIComponent("Created Date")}&descending=${descending}`;

  if (year) {
    const constraints = [
      { key: "Created Date", constraint_type: "greater than", value: `${year}-01-01T00:00:00.000Z` },
      { key: "Created Date", constraint_type: "less than", value: `${year + 1}-01-01T00:00:00.000Z` },
    ];
    url += `&constraints=${encodeURIComponent(JSON.stringify(constraints))}`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Bubble API error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.response;
}

// ─── Stats ───

export async function getLastSyncedDate(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data } = await supabase
      .from("work_orders").select("completed_at")
      .not("bubble_id", "is", null)
      .order("completed_at", { ascending: false }).limit(1);
    return data?.[0]?.completed_at || null;
  } catch { return null; }
}

export async function deleteAllImported(): Promise<{ deleted: number; error?: string }> {
  if (!isSupabaseConfigured) return { deleted: 0, error: "Supabase não configurado" };
  try {
    const { count } = await supabase
      .from("work_orders").select("*", { count: "exact", head: true })
      .not("bubble_id", "is", null);
    const { error } = await supabase
      .from("work_orders").delete().not("bubble_id", "is", null);
    if (error) return { deleted: 0, error: error.message };
    return { deleted: count || 0 };
  } catch (e) {
    return { deleted: 0, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function getSyncStats(): Promise<{ totalBubble: number; totalImported: number }> {
  let totalImported = 0;
  if (isSupabaseConfigured) {
    try {
      const { count } = await supabase
        .from("work_orders").select("*", { count: "exact", head: true })
        .not("bubble_id", "is", null);
      totalImported = count || 0;
    } catch { /* ignore */ }
  }
  const res = await fetch(`${BUBBLE_API_URL}?limit=1`);
  const data = await res.json();
  const totalBubble = (data.response.remaining || 0) + (data.response.results?.length || 0);
  return { totalBubble, totalImported };
}

// ─── Main sync ───

export async function deleteAllAndResetSequence(): Promise<{ error?: string }> {
  if (!isSupabaseConfigured) return { error: "Supabase não configurado" };
  try {
    const { error } = await supabase.from("work_orders").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    if (error) return { error: error.message };
    // Reset order_number sequence so next insert starts at 1
    try { await supabase.rpc("reset_work_order_sequence"); } catch { /* ignore */ }
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

export async function syncFromBubble(
  onProgress: (progress: SyncProgress) => void,
  signal?: AbortSignal,
  maxRecords?: number,
  relationships: SyncRelationships = DEFAULT_RELATIONSHIPS,
  year?: number,
): Promise<SyncProgress> {
  const progress: SyncProgress = {
    total: 0, fetched: 0, imported: 0, skipped: 0, errors: 0,
    status: "fetching", message: "Buscando total de registros...", preview: [],
  };
  onProgress({ ...progress });

  const descending = !!maxRecords && !year;
  const supabaseReady = !!isSupabaseConfigured;

  try {
    const firstPage = await fetchBubblePage(0, 1, descending, year);
    const totalBubble = firstPage.remaining + firstPage.results.length;
    progress.total = maxRecords ? Math.min(maxRecords, totalBubble) : totalBubble;
    progress.message = year
      ? `Total: ${progress.total.toLocaleString("pt-BR")} OS de ${year} no Bubble`
      : maxRecords
        ? `Buscando os ${progress.total.toLocaleString("pt-BR")} mais recentes...`
        : `Total: ${progress.total.toLocaleString("pt-BR")} OS no Bubble`;
    onProgress({ ...progress });

    // Cache de proximo order_number por ano (pre-computa para evitar conflitos de batch)
    const yearMaxCache: Record<number, number> = {};
    async function getNextOrderForYear(y: number): Promise<number> {
      if (yearMaxCache[y] !== undefined) return ++yearMaxCache[y];
      try {
        const { data } = await supabase.rpc("get_max_order_number_for_year", { target_year: y });
        yearMaxCache[y] = (data as number || 0) + 1;
        return yearMaxCache[y];
      } catch {
        yearMaxCache[y] = 1;
        return 1;
      }
    }

    const importedSet = new Set<string>();
    if (supabaseReady) {
      try {
        const { data: existingIds } = await supabase
          .from("work_orders").select("bubble_id").not("bubble_id", "is", null);
        (existingIds || []).forEach((r) => importedSet.add(r.bubble_id));
      } catch { /* continue */ }
    }

    progress.message = supabaseReady
      ? `${importedSet.size.toLocaleString("pt-BR")} já importados. Buscando novos...`
      : "Supabase não configurado — preview apenas.";
    onProgress({ ...progress });

    let cursor = 0;
    let fetched = 0;
    const allRaw: BubbleWorkOrder[] = [];

    while (fetched < progress.total) {
      if (signal?.aborted) {
        progress.status = "error";
        progress.message = "Cancelado.";
        onProgress({ ...progress });
        return progress;
      }

      const batchSize = Math.min(PAGE_SIZE, progress.total - fetched);
      const page = await fetchBubblePage(cursor, batchSize, descending, year);
      const results = page.results || [];
      if (!results.length) break;

      cursor += results.length;
      fetched += results.length;
      progress.fetched = fetched;

      const newRecords = results.filter((r) => !importedSet.has(r._id));
      progress.skipped += results.length - newRecords.length;

      if (newRecords.length > 0) {
        allRaw.push(...newRecords);
        // Sempre ordenar ASC por data: o registo mais antigo entra primeiro -> recebe order_number menor
        const sorted = [...newRecords].sort((a, b) => new Date(a.Data || a["Created Date"]).getTime() - new Date(b.Data || b["Created Date"]).getTime());
        // Atribui order_number sequencial agrupado por ano (necessario porque batch insert quebra o trigger)
        const mapped: any[] = [];
        for (const r of sorted) {
          const recYear = new Date(r.Data || r["Created Date"]).getFullYear();
          const orderNum = supabaseReady ? await getNextOrderForYear(recYear) : undefined;
          mapped.push(mapBubbleToSupabase(r, relationships, orderNum));
        }

        if (supabaseReady) {
          progress.status = "importing";
          const { error } = await supabase
            .from("work_orders").upsert(mapped, { onConflict: "bubble_id" });

          if (error) {
            console.error("Supabase upsert error:", error);
            progress.errors += newRecords.length;
            progress.message = `Erro: ${error.message}`;
          } else {
            progress.imported += newRecords.length;
            newRecords.forEach((r) => importedSet.add(r._id));
          }
        } else {
          progress.imported += newRecords.length;
        }
      }

      progress.preview = allRaw;
      progress.message = `Processados ${progress.fetched.toLocaleString("pt-BR")} de ${progress.total.toLocaleString("pt-BR")} | Importados: ${progress.imported.toLocaleString("pt-BR")} | Já existiam: ${progress.skipped.toLocaleString("pt-BR")}`;
      onProgress({ ...progress });

      await new Promise((r) => setTimeout(r, 200));
    }

    progress.status = "done";
    progress.preview = allRaw;
    progress.message = `Concluído! ${progress.imported.toLocaleString("pt-BR")} importados, ${progress.skipped.toLocaleString("pt-BR")} já existiam.`;
    onProgress({ ...progress });
    return progress;
  } catch (err) {
    progress.status = "error";
    progress.message = `Erro: ${err instanceof Error ? err.message : String(err)}`;
    onProgress({ ...progress });
    return progress;
  }
}
