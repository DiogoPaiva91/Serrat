import { useState, useEffect, useRef, useCallback } from "react";
import {
  RefreshCw, CloudDownload, CheckCircle2, XCircle, Loader2,
  Database, ArrowDownToLine, Clock, Settings2, ArrowRight,
  Building2, Users, QrCode, Wrench, Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/ThemeProvider";
import {
  syncFromBubble,
  getSyncStats,
  getLastSyncedDate,
  getCompanies,
  getServiceTypes,
  getEmployees,
  getQrCodes,
  buildAutoMatchMaps,
  extractUniqueValues,
  BUBBLE_FIELDS,
  SUPABASE_COLUMNS,
  DEFAULT_MAPPING,
  type SyncProgress,
  type ColumnMapping,
  type SyncRelationships,
  type RelOption,
} from "@/lib/bubble-sync";

const LIGHT = {
  primary: "#eab308", primaryDark: "#ca8a04",
  azul: "#2563eb", verde: "#16a34a", laranja: "#f97316", vermelho: "#dc2626",
  cardBg: "#ffffff", cardBorder: "#e2e8f0",
  textTitle: "#171717", textBody: "#404040", textMuted: "#64748b",
  surfaceSoft: "#f8fafc",
};
const DARK = {
  primary: "#facc15", primaryDark: "#eab308",
  azul: "#60a5fa", verde: "#34d399", laranja: "#fb923c", vermelho: "#ef6b6b",
  cardBg: "#222222", cardBorder: "#2e2e2e",
  textTitle: "#fafafa", textBody: "#e2e2e8", textMuted: "#6b7280",
  surfaceSoft: "#1a1a1a",
};

function StatCard({ icon: Icon, label, value, color, c }: {
  icon: typeof Database; label: string; value: string | number; color: string; c: typeof LIGHT;
}) {
  return (
    <div className="rounded-xl p-5 flex items-center gap-4" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
      <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: c.textMuted }}>{label}</p>
        <p className="text-xl font-bold" style={{ color: c.textTitle }}>
          {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
        </p>
      </div>
    </div>
  );
}

function RelSelect({ icon: Icon, label, desc, color, value, onChange, options, c }: {
  icon: typeof Building2; label: string; desc: string; color: string;
  value: string; onChange: (v: string) => void; options: RelOption[]; c: typeof LIGHT;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg" style={{ background: c.surfaceSoft }}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm" style={{ color: c.textTitle }}>{label}</p>
          <p className="text-xs" style={{ color: c.textMuted }}>{desc}</p>
        </div>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg px-3 text-sm outline-none min-w-[220px]"
        style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}`, color: c.textBody }}
      >
        {options.length === 0 ? (
          <option value="">Nenhum cadastrado</option>
        ) : (
          <>
            <option value="">-- Nao vincular --</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </>
        )}
      </select>
    </div>
  );
}

/** Map multiple Bubble values to Supabase records */
function RelMultiMap({ icon: Icon, label, color, bubbleValues, supabaseOptions, mapping, onChange, c }: {
  icon: typeof Users; label: string; color: string;
  bubbleValues: string[]; supabaseOptions: RelOption[];
  mapping: Record<string, string>; onChange: (m: Record<string, string>) => void; c: typeof LIGHT;
}) {
  if (bubbleValues.length === 0) return null;

  const update = (bubbleVal: string, supaId: string) => {
    onChange({ ...mapping, [bubbleVal]: supaId });
  };

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: c.surfaceSoft }}>
      <div className="flex items-center gap-3 p-4 pb-2">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <p className="font-medium text-sm" style={{ color: c.textTitle }}>{label}</p>
          <p className="text-xs" style={{ color: c.textMuted }}>
            {bubbleValues.length} valores unicos encontrados no Bubble
          </p>
        </div>
      </div>
      <div className="px-4 pb-4 space-y-2">
        {bubbleValues.map((bv) => (
          <div key={bv} className="flex items-center gap-2">
            <span className="text-sm flex-1 truncate font-mono px-2 py-1 rounded" style={{ background: c.cardBg, color: c.textBody }}>
              {bv}
            </span>
            <ArrowRight size={14} style={{ color: c.textMuted, flexShrink: 0 }} />
            <select
              value={mapping[bv] || ""}
              onChange={(e) => update(bv, e.target.value)}
              className="h-8 rounded-lg px-2 text-sm outline-none flex-1"
              style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}`, color: c.textBody }}
            >
              {supabaseOptions.length === 0 ? (
                <option value="">Nenhum cadastrado</option>
              ) : (
                <>
                  <option value="">-- Nao vincular --</option>
                  {supabaseOptions.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </>
              )}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SincronizacaoPage() {
  const { theme } = useTheme();
  const c = theme === "dark" ? DARK : LIGHT;

  const [progress, setProgress] = useState<SyncProgress>({
    total: 0, fetched: 0, imported: 0, skipped: 0, errors: 0, status: "idle", message: "",
  });
  const [stats, setStats] = useState({ totalBubble: 0, totalImported: 0 });
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [maxRecords, setMaxRecords] = useState<number>(150);

  // Column mapping
  const [mapping, setMapping] = useState<ColumnMapping>({ ...DEFAULT_MAPPING });
  const [showMapping, setShowMapping] = useState(false);

  // Relationships
  const [showRels, setShowRels] = useState(true);
  const [companies, setCompanies] = useState<RelOption[]>([]);
  const [serviceTypesDb, setServiceTypesDb] = useState<RelOption[]>([]);
  const [employeesDb, setEmployeesDb] = useState<RelOption[]>([]);
  const [qrCodesDb, setQrCodesDb] = useState<(RelOption & { id_codigo: string })[]>([]);

  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [serviceTypeMap, setServiceTypeMap] = useState<Record<string, string>>({});
  const [employeeMap, setEmployeeMap] = useState<Record<string, string>>({});
  const [qrCodeMap, setQrCodeMap] = useState<Record<string, string>>({});

  // Unique Bubble values (populated after first fetch)
  const [bubbleUniqueServiceTypes, setBubbleUniqueServiceTypes] = useState<string[]>([]);
  const [bubbleUniqueEmployees, setBubbleUniqueEmployees] = useState<string[]>([]);
  const [bubbleUniqueQrCodes, setBubbleUniqueQrCodes] = useState<string[]>([]);
  const [previewLoaded, setPreviewLoaded] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [s, ls, comps, sts, emps, qrs] = await Promise.all([
        getSyncStats(), getLastSyncedDate(),
        getCompanies(), getServiceTypes(), getEmployees(), getQrCodes(),
      ]);
      setStats(s);
      setLastSync(ls);
      setCompanies(comps);
      setServiceTypesDb(sts);
      setEmployeesDb(emps);
      setQrCodesDb(qrs);
      if (comps.length === 1) setSelectedCompanyId(comps[0].id);
    } catch (e) {
      console.error("Error loading stats:", e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  // Auto-match when DB data + Bubble data are both available
  const handleAutoMatch = () => {
    const auto = buildAutoMatchMaps(serviceTypesDb, employeesDb, qrCodesDb);
    // Only set matches for values that exist in Bubble data
    const stMap: Record<string, string> = {};
    for (const st of bubbleUniqueServiceTypes) {
      if (auto.serviceTypeMap[st]) stMap[st] = auto.serviceTypeMap[st];
    }
    const empMap: Record<string, string> = {};
    for (const emp of bubbleUniqueEmployees) {
      if (auto.employeeMap[emp]) empMap[emp] = auto.employeeMap[emp];
    }
    const qrMap: Record<string, string> = {};
    for (const qr of bubbleUniqueQrCodes) {
      if (auto.qrCodeMap[qr]) qrMap[qr] = auto.qrCodeMap[qr];
    }
    setServiceTypeMap(stMap);
    setEmployeeMap(empMap);
    setQrCodeMap(qrMap);
  };

  // Quick preview fetch to get unique Bubble values
  const handlePreviewFetch = async () => {
    abortRef.current = new AbortController();
    const limit = maxRecords > 0 ? maxRecords : 150;
    await syncFromBubble(
      (p) => {
        setProgress(p);
        if (p.preview && p.preview.length > 0) {
          const unique = extractUniqueValues(p.preview);
          setBubbleUniqueServiceTypes(unique.serviceTypes);
          setBubbleUniqueEmployees(unique.employees);
          setBubbleUniqueQrCodes(unique.qrCodes);
        }
      },
      abortRef.current.signal,
      limit,
      mapping,
      { companyId: undefined, serviceTypeMap: {}, employeeMap: {}, qrCodeMap: {}, autoMatch: false },
    );
    setPreviewLoaded(true);
  };

  const handleSync = async () => {
    abortRef.current = new AbortController();
    const limit = maxRecords > 0 ? maxRecords : undefined;
    const rels: SyncRelationships = {
      companyId: selectedCompanyId || undefined,
      serviceTypeMap,
      employeeMap,
      qrCodeMap,
      autoMatch: true,
    };
    await syncFromBubble((p) => setProgress(p), abortRef.current.signal, limit, mapping, rels);
    loadStats();
  };

  const handleCancel = () => { abortRef.current?.abort(); };

  const isSyncing = progress.status === "fetching" || progress.status === "importing";
  const progressPercent = progress.total > 0 ? Math.round((progress.fetched / progress.total) * 100) : 0;
  const pending = stats.totalBubble - stats.totalImported;

  const selectStyle = { background: c.surfaceSoft, border: `1px solid ${c.cardBorder}`, color: c.textBody };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold" style={{ color: c.textTitle }}>Sincronizacao Bubble</h1>
        <p className="text-sm mt-1" style={{ color: c.textMuted }}>
          Importe ordens de servico do sistema antigo (Bubble) para o Supabase
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Database} label="Total no Bubble" value={loadingStats ? "..." : stats.totalBubble} color={c.azul} c={c} />
        <StatCard icon={ArrowDownToLine} label="Ja Importados" value={loadingStats ? "..." : stats.totalImported} color={c.verde} c={c} />
        <StatCard icon={CloudDownload} label="Pendentes" value={loadingStats ? "..." : pending} color={pending > 0 ? c.laranja : c.verde} c={c} />
        <StatCard icon={Clock} label="Ultima Sync"
          value={lastSync ? new Date(lastSync).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Nunca"}
          color={c.primary} c={c} />
      </div>

      {/* Step 1: Preview fetch */}
      {!previewLoaded && (
        <div className="rounded-xl p-6" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: c.textTitle }}>Passo 1: Buscar dados do Bubble</h2>
              <p className="text-sm" style={{ color: c.textMuted }}>
                Primeiro busque os dados para mapear os relacionamentos antes de importar
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select value={maxRecords} onChange={(e) => setMaxRecords(Number(e.target.value))}
                className="h-9 rounded-lg px-3 text-sm font-medium outline-none" style={selectStyle}>
                <option value={50}>Ultimos 50</option>
                <option value={150}>Ultimos 150</option>
                <option value={500}>Ultimos 500</option>
                <option value={1000}>Ultimos 1.000</option>
                <option value={0}>Todos</option>
              </select>
              {isSyncing ? (
                <Button onClick={handleCancel} variant="destructive" className="gap-2">
                  <XCircle size={16} /> Cancelar
                </Button>
              ) : (
                <Button onClick={handlePreviewFetch} disabled={loadingStats} className="gap-2"
                  style={{ background: c.azul, color: "#fff" }}>
                  <CloudDownload size={16} /> Buscar
                </Button>
              )}
            </div>
          </div>

          {/* Progress for preview */}
          {progress.status !== "idle" && (
            <div className="mt-4 space-y-3">
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: c.surfaceSoft }}>
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%`, background: progress.status === "error" ? c.vermelho : progress.status === "done" ? c.verde : c.primary }} />
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: c.textBody }}>
                {isSyncing && <Loader2 size={14} className="animate-spin" style={{ color: c.primary }} />}
                {progress.status === "done" && <CheckCircle2 size={14} style={{ color: c.verde }} />}
                {progress.status === "error" && <XCircle size={14} style={{ color: c.vermelho }} />}
                {progress.message}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Relationships (after preview loaded) */}
      {previewLoaded && (
        <>
          <div className="rounded-xl overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
            <button onClick={() => setShowRels(!showRels)}
              className="w-full flex items-center justify-between p-5 text-left" style={{ color: c.textTitle }}>
              <div className="flex items-center gap-3">
                <Link2 size={20} style={{ color: c.verde }} />
                <div>
                  <p className="font-semibold">Passo 2: Vincular Relacionamentos</p>
                  <p className="text-sm" style={{ color: c.textMuted }}>
                    Mapeie valores do Bubble para registros do Supabase
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={(e) => { e.stopPropagation(); handleAutoMatch(); }} variant="outline" size="sm" className="text-xs gap-1">
                  <Wrench size={12} /> Auto-match
                </Button>
                <ArrowRight size={18} style={{ color: c.textMuted, transform: showRels ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }} />
              </div>
            </button>

            {showRels && (
              <div className="px-5 pb-5 space-y-4">
                {/* Empresa — single select */}
                <RelSelect icon={Building2} label="Empresa" desc="Todas as OS serao vinculadas a esta empresa"
                  color={c.azul} value={selectedCompanyId} onChange={setSelectedCompanyId} options={companies} c={c} />

                {/* Tipo de Serviço — multi map */}
                <RelMultiMap icon={Wrench} label="Tipos de Servico" color={c.laranja}
                  bubbleValues={bubbleUniqueServiceTypes} supabaseOptions={serviceTypesDb}
                  mapping={serviceTypeMap} onChange={setServiceTypeMap} c={c} />

                {/* Funcionários — multi map */}
                <RelMultiMap icon={Users} label="Funcionarios" color={c.verde}
                  bubbleValues={bubbleUniqueEmployees} supabaseOptions={employeesDb}
                  mapping={employeeMap} onChange={setEmployeeMap} c={c} />

                {/* QR Codes — multi map */}
                <RelMultiMap icon={QrCode} label="QR Codes (Cabines)" color={c.primary}
                  bubbleValues={bubbleUniqueQrCodes} supabaseOptions={qrCodesDb}
                  mapping={qrCodeMap} onChange={setQrCodeMap} c={c} />
              </div>
            )}
          </div>

          {/* Step 3: Import */}
          <div className="rounded-xl p-6" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: c.textTitle }}>Passo 3: Importar</h2>
                <p className="text-sm" style={{ color: c.textMuted }}>
                  Confirme os mapeamentos acima e clique em Importar para gravar no Supabase
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select value={maxRecords} onChange={(e) => setMaxRecords(Number(e.target.value))}
                  className="h-9 rounded-lg px-3 text-sm font-medium outline-none" style={selectStyle}
                  disabled={isSyncing}>
                  <option value={50}>Ultimos 50</option>
                  <option value={150}>Ultimos 150</option>
                  <option value={500}>Ultimos 500</option>
                  <option value={1000}>Ultimos 1.000</option>
                  <option value={0}>Todos</option>
                </select>
                {isSyncing ? (
                  <Button onClick={handleCancel} variant="destructive" className="gap-2">
                    <XCircle size={16} /> Cancelar
                  </Button>
                ) : (
                  <Button onClick={handleSync} disabled={loadingStats} className="gap-2"
                    style={{ background: c.primary, color: "#000" }}>
                    <RefreshCw size={16} /> Importar
                  </Button>
                )}
              </div>
            </div>

            {progress.status !== "idle" && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: c.textBody }}>Progresso</span>
                    <span style={{ color: c.textMuted }}>{progressPercent}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: c.surfaceSoft }}>
                    <div className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%`, background: progress.status === "error" ? c.vermelho : progress.status === "done" ? c.verde : c.primary }} />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: c.surfaceSoft }}>
                  {isSyncing && <Loader2 size={18} className="animate-spin" style={{ color: c.primary }} />}
                  {progress.status === "done" && <CheckCircle2 size={18} style={{ color: c.verde }} />}
                  {progress.status === "error" && <XCircle size={18} style={{ color: c.vermelho }} />}
                  <span className="text-sm" style={{ color: c.textBody }}>{progress.message}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Buscados", value: progress.fetched, color: c.azul },
                    { label: "Importados", value: progress.imported, color: c.verde },
                    { label: "Ja existiam", value: progress.skipped, color: c.textMuted },
                    { label: "Erros", value: progress.errors, color: progress.errors > 0 ? c.vermelho : c.textMuted },
                  ].map((s) => (
                    <div key={s.label} className="text-center p-3 rounded-lg" style={{ background: c.surfaceSoft }}>
                      <p className="text-xs" style={{ color: c.textMuted }}>{s.label}</p>
                      <p className="text-lg font-bold" style={{ color: s.color }}>{s.value.toLocaleString("pt-BR")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Column Mapping (advanced) */}
      <div className="rounded-xl overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
        <button onClick={() => setShowMapping(!showMapping)}
          className="w-full flex items-center justify-between p-5 text-left" style={{ color: c.textTitle }}>
          <div className="flex items-center gap-3">
            <Settings2 size={20} style={{ color: c.textMuted }} />
            <div>
              <p className="font-semibold">Mapeamento de Colunas (avancado)</p>
              <p className="text-sm" style={{ color: c.textMuted }}>Ajuste quais campos texto do Bubble vao para quais colunas</p>
            </div>
          </div>
          <ArrowRight size={18} style={{ color: c.textMuted, transform: showMapping ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }} />
        </button>
        {showMapping && (
          <div className="px-5 pb-5">
            <div className="grid gap-3">
              {SUPABASE_COLUMNS.map((col) => (
                <div key={col.key} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: c.surfaceSoft }}>
                  <select value={mapping[col.key] || ""} onChange={(e) => setMapping((prev) => ({ ...prev, [col.key]: e.target.value }))}
                    className="flex-1 h-9 rounded-lg px-3 text-sm outline-none" style={selectStyle} disabled={col.required}>
                    <option value="">-- Nao mapear --</option>
                    {BUBBLE_FIELDS.map((bf) => (<option key={bf.key} value={bf.key}>{bf.label}</option>))}
                  </select>
                  <ArrowRight size={16} style={{ color: c.textMuted, flexShrink: 0 }} />
                  <div className="flex-1 h-9 rounded-lg px-3 text-sm flex items-center font-mono"
                    style={{ background: col.required ? `${c.primary}15` : c.surfaceSoft, border: `1px solid ${col.required ? c.primary + "40" : c.cardBorder}`, color: c.textBody }}>
                    {col.label}
                    {col.required && <span className="ml-2 text-xs font-sans" style={{ color: c.primary }}>obrigatório</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button onClick={() => setMapping({ ...DEFAULT_MAPPING })} variant="outline" size="sm" className="text-xs">Restaurar padrao</Button>
            </div>
          </div>
        )}
      </div>

      {/* Preview table */}
      {(progress.preview?.length ?? 0) > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
          <div className="p-4 border-b" style={{ borderColor: c.cardBorder }}>
            <h2 className="text-lg font-semibold" style={{ color: c.textTitle }}>
              Preview ({progress.preview!.length.toLocaleString("pt-BR")} registros)
            </h2>
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: c.surfaceSoft }}>
                  {["#", "Data", "Funcionário", "QR CODE", "Empresa Cliente", "Empresa", "Tipo Serviço", "Endereço"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium sticky top-0" style={{ color: c.textMuted, background: c.surfaceSoft }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {progress.preview!.map((row) => (
                  <tr key={row._id} className="border-t" style={{ borderColor: c.cardBorder }}>
                    <td className="px-4 py-2 whitespace-nowrap" style={{ color: c.textMuted }}>{row.id}</td>
                    <td className="px-4 py-2 whitespace-nowrap" style={{ color: c.textBody }}>
                      {row.Data ? new Date(row.Data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "-"}
                    </td>
                    <td className="px-4 py-2" style={{ color: c.textBody }}>{row["Funcionário"] || "-"}</td>
                    <td className="px-4 py-2" style={{ color: c.textBody }}>{row["QR CODE"] || "-"}</td>
                    <td className="px-4 py-2" style={{ color: c.textBody }}>{row.Empresa_Cliente || "-"}</td>
                    <td className="px-4 py-2" style={{ color: c.textBody }}>{row.Empresa || "-"}</td>
                    <td className="px-4 py-2" style={{ color: c.textBody }}>{row["Tipo_serviço"]?.join(", ") || "-"}</td>
                    <td className="px-4 py-2 max-w-[200px] truncate" style={{ color: c.textMuted }}>{row["Endereço"]?.address || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
