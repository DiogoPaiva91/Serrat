import { supabase, isSupabaseConfigured } from "./supabase";

const BUBBLE_API_URL =
  "https://operation.app.br/version-test/api/1.1/obj/work_orders";
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
  /** Map: Bubble "Tipo_serviço" value → Supabase service_type UUID */
  serviceTypeMap: Record<string, string>;
  /** Map: Bubble "QR CODE" cabine part → Supabase qr_code UUID */
  qrCodeMap: Record<string, string>;
  /** Whether to auto-match by name (best effort) */
  autoMatch: boolean;
}

export const DEFAULT_RELATIONSHIPS: SyncRelationships = {
  serviceTypeMap: {},
  qrCodeMap: {},
  autoMatch: true,
};

// ─── Column mapping ───

export const BUBBLE_FIELDS = [
  { key: "_id", label: "_id (ID único)" },
  { key: "id", label: "id (número)" },
  { key: "Data", label: "Data" },
  { key: "Created Date", label: "Created Date" },
  { key: "Modified Date", label: "Modified Date" },
  { key: "Funcionário", label: "Funcionário" },
  { key: "QR CODE", label: "QR CODE" },
  { key: "QR CODE > Cabine", label: "QR CODE > Cabine (antes do @)" },
  { key: "QR CODE > Local", label: "QR CODE > Local (depois do @)" },
  { key: "Empresa_Cliente", label: "Empresa_Cliente" },
  { key: "Empresa", label: "Empresa" },
  { key: "Tipo_serviço", label: "Tipo_serviço" },
  { key: "Endereço > address", label: "Endereço > address" },
  { key: "Endereço > lat", label: "Endereço > lat" },
  { key: "Endereço > lng", label: "Endereço > lng" },
] as const;

export const SUPABASE_COLUMNS: { key: string; label: string; required?: boolean }[] = [
  { key: "bubble_id", label: "bubble_id", required: true },
  { key: "responsible_name", label: "responsible_name" },
  { key: "company_name", label: "company_name" },
  { key: "company_address", label: "company_address" },
  { key: "service_type", label: "service_type" },
  { key: "qr_code_data", label: "qr_code_data" },
  { key: "id_codigo", label: "id_codigo" },
  { key: "id_nome", label: "id_nome" },
  { key: "latitude", label: "latitude" },
  { key: "longitude", label: "longitude" },
  { key: "completed_at", label: "completed_at" },
  { key: "created_at", label: "created_at" },
  { key: "observation", label: "observation" },
];

export type ColumnMapping = Record<string, string>;

export const DEFAULT_MAPPING: ColumnMapping = {
  bubble_id: "_id",
  responsible_name: "Funcionário",
  company_name: "Empresa_Cliente",
  company_address: "Endereço > address",
  service_type: "Tipo_serviço",
  qr_code_data: "QR CODE",
  id_codigo: "QR CODE > Cabine",
  id_nome: "QR CODE > Local",
  latitude: "Endereço > lat",
  longitude: "Endereço > lng",
  completed_at: "Data",
  created_at: "Created Date",
};

// ─── Helpers ───

function extractBubbleValue(item: BubbleWorkOrder, bubbleField: string): unknown {
  switch (bubbleField) {
    case "_id": return item._id;
    case "id": return item.id;
    case "Data": return item.Data;
    case "Created Date": return item["Created Date"];
    case "Modified Date": return item["Modified Date"];
    case "Funcionário": return item["Funcionário"];
    case "QR CODE": return item["QR CODE"];
    case "QR CODE > Cabine": return (item["QR CODE"] || "").split("@")[0]?.trim() || null;
    case "QR CODE > Local": return (item["QR CODE"] || "").split("@")[1]?.trim() || null;
    case "Empresa_Cliente": return item.Empresa_Cliente;
    case "Empresa": return item.Empresa;
    case "Tipo_serviço": return item["Tipo_serviço"]?.[0] || null;
    case "Endereço > address": return item["Endereço"]?.address || null;
    case "Endereço > lat": return item["Endereço"]?.lat || null;
    case "Endereço > lng": return item["Endereço"]?.lng || null;
    default: return null;
  }
}

function mapBubbleToSupabase(
  item: BubbleWorkOrder,
  mapping: ColumnMapping,
  rels: SyncRelationships,
) {
  const row: Record<string, unknown> = {};

  // Apply column mapping (text fields)
  for (const [supaCol, bubbleField] of Object.entries(mapping)) {
    if (bubbleField) {
      row[supaCol] = extractBubbleValue(item, bubbleField) ?? null;
    }
  }

  // Apply FK relationships
  if (rels.companyId) {
    row.company_id = rels.companyId;
  }

  // Service type FK
  const serviceTypeName = item["Tipo_serviço"]?.[0];
  if (serviceTypeName && rels.serviceTypeMap[serviceTypeName]) {
    row.service_type_id = rels.serviceTypeMap[serviceTypeName];
  }

  // QR Code FK - match by cabine part (before @)
  const qrCode = item["QR CODE"] || "";
  const cabinePart = qrCode.split("@")[0]?.trim();
  if (cabinePart && rels.qrCodeMap[cabinePart]) {
    row.qr_code_id = rels.qrCodeMap[cabinePart];
  }

  return row;
}

async function fetchBubblePage(
  cursor: number,
  limit: number = PAGE_SIZE,
  descending: boolean = false,
): Promise<{
  results: BubbleWorkOrder[];
  remaining: number;
  count: number;
}> {
  const url = `${BUBBLE_API_URL}?cursor=${cursor}&limit=${limit}&sort_field=${encodeURIComponent("Created Date")}&descending=${descending}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Bubble API error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.response;
}

/** Extract unique values from Bubble data for relationship matching */
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

// ─── Auto-match: build maps by name ───

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

// ─── Stats ───

export async function getLastSyncedDate(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data } = await supabase
      .from("work_orders")
      .select("completed_at")
      .not("bubble_id", "is", null)
      .order("completed_at", { ascending: false })
      .limit(1);
    return data?.[0]?.completed_at || null;
  } catch { return null; }
}

export async function getSyncStats(): Promise<{ totalBubble: number; totalImported: number }> {
  let totalImported = 0;
  if (isSupabaseConfigured) {
    try {
      const { count } = await supabase
        .from("work_orders")
        .select("*", { count: "exact", head: true })
        .not("bubble_id", "is", null);
      totalImported = count || 0;
    } catch { totalImported = 0; }
  }

  const res = await fetch(`${BUBBLE_API_URL}?limit=1`);
  const data = await res.json();
  const totalBubble = (data.response.remaining || 0) + (data.response.results?.length || 0);
  return { totalBubble, totalImported };
}

// ─── Main sync ───

export async function syncFromBubble(
  onProgress: (progress: SyncProgress) => void,
  signal?: AbortSignal,
  maxRecords?: number,
  mapping: ColumnMapping = DEFAULT_MAPPING,
  relationships: SyncRelationships = DEFAULT_RELATIONSHIPS,
): Promise<SyncProgress> {
  const progress: SyncProgress = {
    total: 0, fetched: 0, imported: 0, skipped: 0, errors: 0,
    status: "fetching", message: "Buscando total de registros...", preview: [],
  };
  onProgress({ ...progress });

  const descending = !!maxRecords;
  const supabaseReady = !!isSupabaseConfigured;

  try {
    const firstPage = await fetchBubblePage(0, 1, descending);
    const totalBubble = firstPage.remaining + firstPage.results.length;
    progress.total = maxRecords ? Math.min(maxRecords, totalBubble) : totalBubble;
    progress.message = maxRecords
      ? `Buscando os ${progress.total.toLocaleString("pt-BR")} registros mais recentes...`
      : `Total: ${progress.total.toLocaleString("pt-BR")} OS no Bubble`;
    onProgress({ ...progress });

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
      : "Supabase não configurado — buscando dados do Bubble para preview...";
    onProgress({ ...progress });

    let cursor = 0;
    let fetched = 0;
    const allRaw: BubbleWorkOrder[] = [];

    while (fetched < progress.total) {
      if (signal?.aborted) {
        progress.status = "error";
        progress.message = "Sincronização cancelada.";
        onProgress({ ...progress });
        return progress;
      }

      const batchSize = Math.min(PAGE_SIZE, progress.total - fetched);
      const page = await fetchBubblePage(cursor, batchSize, descending);
      const results = page.results || [];
      if (results.length === 0) break;

      cursor += results.length;
      fetched += results.length;
      progress.fetched = fetched;

      const newRecords = results.filter((r) => !importedSet.has(r._id));
      progress.skipped += results.length - newRecords.length;

      if (newRecords.length > 0) {
        const mapped = newRecords.map((r) => mapBubbleToSupabase(r, mapping, relationships));
        allRaw.push(...newRecords);

        if (supabaseReady) {
          progress.status = "importing";
          const { error } = await supabase
            .from("work_orders")
            .upsert(mapped, { onConflict: "bubble_id" });

          if (error) {
            console.error("Supabase upsert error:", error);
            progress.errors += newRecords.length;
            progress.message = `Erro Supabase: ${error.message}`;
          } else {
            progress.imported += newRecords.length;
            newRecords.forEach((r) => importedSet.add(r._id));
          }
        } else {
          progress.imported += newRecords.length;
        }
      }

      progress.preview = allRaw;
      progress.message = `Processados ${progress.fetched.toLocaleString("pt-BR")} de ${progress.total.toLocaleString("pt-BR")} | ${supabaseReady ? "Importados" : "Buscados"}: ${progress.imported.toLocaleString("pt-BR")} | Já existiam: ${progress.skipped.toLocaleString("pt-BR")}`;
      onProgress({ ...progress });

      await new Promise((r) => setTimeout(r, 200));
    }

    progress.status = "done";
    progress.preview = allRaw;
    progress.message = supabaseReady
      ? `Concluído! ${progress.imported.toLocaleString("pt-BR")} importados.`
      : `Busca concluída! ${progress.imported.toLocaleString("pt-BR")} registros encontrados.`;
    onProgress({ ...progress });
    return progress;
  } catch (err) {
    progress.status = "error";
    progress.message = `Erro: ${err instanceof Error ? err.message : String(err)}`;
    onProgress({ ...progress });
    return progress;
  }
}
