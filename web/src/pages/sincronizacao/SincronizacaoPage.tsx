import { useState, useEffect, useRef, useCallback } from "react";
import {
  RefreshCw, CloudDownload, CheckCircle2, XCircle, Loader2,
  Database, ArrowDownToLine, Clock, ArrowRight,
  Building2, QrCode, Wrench, Link2, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/ThemeProvider";
import {
  syncFromBubble,
  getSyncStats,
  getLastSyncedDate,
  getCompanies,
  getServiceTypes,
  getQrCodes,
  buildAutoMatchMaps,
  extractUniqueValues,
  deleteAllImported,
  type SyncProgress,
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

function RelMultiMap({ icon: Icon, label, color, bubbleValues, supabaseOptions, mapping, onChange, c }: {
  icon: typeof Wrench; label: string; color: string;
  bubbleValues: string[]; supabaseOptions: RelOption[];
  mapping: Record<string, string>; onChange: (m: Record<string, string>) => void; c: typeof LIGHT;
}) {
  if (bubbleValues.length === 0) return null;
  const update = (bv: string, id: string) => onChange({ ...mapping, [bv]: id });

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: c.surfaceSoft }}>
      <div className="flex items-center gap-3 p-4 pb-2">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <p className="font-medium text-sm" style={{ color: c.textTitle }}>{label}</p>
          <p className="text-xs" style={{ color: c.textMuted }}>{bubbleValues.length} valores no Bubble</p>
        </div>
      </div>
      <div className="px-4 pb-4 space-y-2">
        {bubbleValues.map((bv) => (
          <div key={bv} className="flex items-center gap-2">
            <span className="text-sm flex-1 truncate font-mono px-2 py-1 rounded" style={{ background: c.cardBg, color: c.textBody }}>{bv}</span>
            <ArrowRight size={14} style={{ color: c.textMuted, flexShrink: 0 }} />
            <select value={mapping[bv] || ""} onChange={(e) => update(bv, e.target.value)}
              className="h-8 rounded-lg px-2 text-sm outline-none flex-1"
              style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}`, color: c.textBody }}>
              {supabaseOptions.length === 0
                ? <option value="">Nenhum cadastrado</option>
                : <><option value="">-- Nao vincular --</option>{supabaseOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</>
              }
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

  const [companies, setCompanies] = useState<RelOption[]>([]);
  const [serviceTypesDb, setServiceTypesDb] = useState<RelOption[]>([]);
  const [qrCodesDb, setQrCodesDb] = useState<(RelOption & { id_codigo: string })[]>([]);

  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [serviceTypeMap, setServiceTypeMap] = useState<Record<string, string>>({});
  const [qrCodeMap, setQrCodeMap] = useState<Record<string, string>>({});

  const [bubbleServiceTypes, setBubbleServiceTypes] = useState<string[]>([]);
  const [bubbleQrCodes, setBubbleQrCodes] = useState<string[]>([]);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [showRels, setShowRels] = useState(true);

  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [s, ls, comps, sts, qrs] = await Promise.all([
        getSyncStats(), getLastSyncedDate(), getCompanies(), getServiceTypes(), getQrCodes(),
      ]);
      setStats(s); setLastSync(ls); setCompanies(comps); setServiceTypesDb(sts); setQrCodesDb(qrs);
      if (comps.length === 1) setSelectedCompanyId(comps[0].id);
    } catch (e) { console.error("Error:", e); }
    finally { setLoadingStats(false); }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleAutoMatch = () => {
    const auto = buildAutoMatchMaps(serviceTypesDb, qrCodesDb);
    const stMap: Record<string, string> = {};
    for (const st of bubbleServiceTypes) { if (auto.serviceTypeMap[st]) stMap[st] = auto.serviceTypeMap[st]; }
    const qrMap: Record<string, string> = {};
    for (const qr of bubbleQrCodes) { if (auto.qrCodeMap[qr]) qrMap[qr] = auto.qrCodeMap[qr]; }
    setServiceTypeMap(stMap);
    setQrCodeMap(qrMap);
  };

  const handlePreviewFetch = async () => {
    abortRef.current = new AbortController();
    const limit = maxRecords > 0 ? maxRecords : undefined;
    await syncFromBubble(
      (p) => {
        setProgress(p);
        if (p.preview && p.preview.length > 0) {
          const unique = extractUniqueValues(p.preview);
          setBubbleServiceTypes(unique.serviceTypes);
          setBubbleQrCodes(unique.qrCodes);
        }
      },
      abortRef.current.signal, limit,
      { serviceTypeMap: {}, qrCodeMap: {} },
      selectedYear,
    );
    setPreviewLoaded(true);
  };

  const handleSync = async () => {
    abortRef.current = new AbortController();
    const limit = maxRecords > 0 ? maxRecords : undefined;
    const rels: SyncRelationships = {
      companyId: selectedCompanyId || undefined,
      serviceTypeMap,
      qrCodeMap,
    };
    await syncFromBubble((p) => setProgress(p), abortRef.current.signal, limit, rels, selectedYear);
    loadStats();
  };

  const handleCancel = () => { abortRef.current?.abort(); };

  const handleDeleteAll = async () => {
    setDeleting(true);
    const result = await deleteAllImported();
    if (result.error) {
      alert("Erro ao deletar: " + result.error);
    }
    setConfirmDelete(false);
    setDeleting(false);
    setPreviewLoaded(false);
    setProgress({ total: 0, fetched: 0, imported: 0, skipped: 0, errors: 0, status: "idle", message: "" });
    loadStats();
  };

  const isSyncing = progress.status === "fetching" || progress.status === "importing";
  const progressPercent = progress.total > 0 ? Math.round((progress.fetched / progress.total) * 100) : 0;
  const pending = stats.totalBubble - stats.totalImported;
  const selectStyle = { background: c.surfaceSoft, border: `1px solid ${c.cardBorder}`, color: c.textBody };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: c.textTitle }}>Sincronizacao Bubble</h1>
        <p className="text-sm mt-1" style={{ color: c.textMuted }}>Importe OS do Bubble para o Supabase</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Database} label="Total no Bubble" value={loadingStats ? "..." : stats.totalBubble} color={c.azul} c={c} />
        <StatCard icon={ArrowDownToLine} label="Importados" value={loadingStats ? "..." : stats.totalImported} color={c.verde} c={c} />
        <StatCard icon={CloudDownload} label="Pendentes" value={loadingStats ? "..." : pending} color={pending > 0 ? c.laranja : c.verde} c={c} />
        <StatCard icon={Clock} label="Ultima Sync"
          value={lastSync ? new Date(lastSync).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Nunca"}
          color={c.primary} c={c} />
      </div>

      {/* Deletar tudo */}
      {stats.totalImported > 0 && (
        <div className="rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${c.vermelho}18` }}>
              <Trash2 size={18} style={{ color: c.vermelho }} />
            </div>
            <div>
              <p className="font-medium text-sm" style={{ color: c.textTitle }}>Limpar dados importados</p>
              <p className="text-xs" style={{ color: c.textMuted }}>Remove todas as {stats.totalImported.toLocaleString("pt-BR")} OS importadas do Bubble</p>
            </div>
          </div>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: c.vermelho }}>Tem certeza?</span>
              <Button onClick={handleDeleteAll} variant="destructive" size="sm" disabled={deleting} className="gap-1">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleting ? "Deletando..." : "Sim, deletar tudo"}
              </Button>
              <Button onClick={() => setConfirmDelete(false)} variant="outline" size="sm">Cancelar</Button>
            </div>
          ) : (
            <Button onClick={() => setConfirmDelete(true)} variant="outline" size="sm" className="gap-1 text-xs"
              style={{ borderColor: c.vermelho + "40", color: c.vermelho }}>
              <Trash2 size={14} /> Deletar tudo
            </Button>
          )}
        </div>
      )}

      {!previewLoaded && (
        <div className="rounded-xl p-6" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: c.textTitle }}>Passo 1: Buscar dados</h2>
              <p className="text-sm" style={{ color: c.textMuted }}>Busca os dados do Bubble para mapear relacionamentos</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <select value={selectedYear || ""} onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : undefined)}
                className="h-9 rounded-lg px-3 text-sm font-medium outline-none" style={selectStyle}>
                <option value="">Todos os anos</option>
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={maxRecords} onChange={(e) => setMaxRecords(Number(e.target.value))}
                className="h-9 rounded-lg px-3 text-sm font-medium outline-none" style={selectStyle}>
                <option value={50}>Ultimos 50</option>
                <option value={150}>Ultimos 150</option>
                <option value={500}>Ultimos 500</option>
                <option value={1000}>Ultimos 1.000</option>
                <option value={0}>Todos</option>
              </select>
              {isSyncing
                ? <Button onClick={handleCancel} variant="destructive" className="gap-2"><XCircle size={16} /> Cancelar</Button>
                : <Button onClick={handlePreviewFetch} disabled={loadingStats} className="gap-2" style={{ background: c.azul, color: "#fff" }}><CloudDownload size={16} /> Buscar</Button>
              }
            </div>
          </div>
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

      {previewLoaded && (
        <>
          <div className="rounded-xl overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
            <button onClick={() => setShowRels(!showRels)}
              className="w-full flex items-center justify-between p-5 text-left" style={{ color: c.textTitle }}>
              <div className="flex items-center gap-3">
                <Link2 size={20} style={{ color: c.verde }} />
                <div>
                  <p className="font-semibold">Passo 2: Vincular Relacionamentos</p>
                  <p className="text-sm" style={{ color: c.textMuted }}>Mapeie valores do Bubble para registros do Supabase</p>
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg" style={{ background: c.surfaceSoft }}>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${c.azul}18` }}>
                      <Building2 size={18} style={{ color: c.azul }} />
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: c.textTitle }}>Empresa</p>
                      <p className="text-xs" style={{ color: c.textMuted }}>Todas as OS vinculam a esta empresa</p>
                    </div>
                  </div>
                  <select value={selectedCompanyId} onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="h-9 rounded-lg px-3 text-sm outline-none min-w-[220px]"
                    style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}`, color: c.textBody }}>
                    {companies.length === 0
                      ? <option value="">Nenhuma cadastrada</option>
                      : <><option value="">-- Selecione --</option>{companies.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</>
                    }
                  </select>
                </div>
                <RelMultiMap icon={Wrench} label="Tipos de Servico" color={c.laranja}
                  bubbleValues={bubbleServiceTypes} supabaseOptions={serviceTypesDb}
                  mapping={serviceTypeMap} onChange={setServiceTypeMap} c={c} />
                <RelMultiMap icon={QrCode} label="QR Codes (Cabines)" color={c.primary}
                  bubbleValues={bubbleQrCodes} supabaseOptions={qrCodesDb}
                  mapping={qrCodeMap} onChange={setQrCodeMap} c={c} />
              </div>
            )}
          </div>

          <div className="rounded-xl p-6" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: c.textTitle }}>Passo 3: Importar</h2>
                <p className="text-sm" style={{ color: c.textMuted }}>Confirme os mapeamentos e clique Importar</p>
              </div>
              <div className="flex items-center gap-3">
                <select value={maxRecords} onChange={(e) => setMaxRecords(Number(e.target.value))}
                  className="h-9 rounded-lg px-3 text-sm font-medium outline-none" style={selectStyle} disabled={isSyncing}>
                  <option value={50}>Ultimos 50</option>
                  <option value={150}>Ultimos 150</option>
                  <option value={500}>Ultimos 500</option>
                  <option value={1000}>Ultimos 1.000</option>
                  <option value={0}>Todos</option>
                </select>
                {isSyncing
                  ? <Button onClick={handleCancel} variant="destructive" className="gap-2"><XCircle size={16} /> Cancelar</Button>
                  : <Button onClick={handleSync} disabled={loadingStats} className="gap-2" style={{ background: c.primary, color: "#000" }}><RefreshCw size={16} /> Importar</Button>
                }
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
                    { l: "Buscados", v: progress.fetched, co: c.azul },
                    { l: "Importados", v: progress.imported, co: c.verde },
                    { l: "Ja existiam", v: progress.skipped, co: c.textMuted },
                    { l: "Erros", v: progress.errors, co: progress.errors > 0 ? c.vermelho : c.textMuted },
                  ].map((s) => (
                    <div key={s.l} className="text-center p-3 rounded-lg" style={{ background: c.surfaceSoft }}>
                      <p className="text-xs" style={{ color: c.textMuted }}>{s.l}</p>
                      <p className="text-lg font-bold" style={{ color: s.co }}>{s.v.toLocaleString("pt-BR")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

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
                  {["#", "Data", "Funcionário", "QR CODE", "Tipo Serviço"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium sticky top-0" style={{ color: c.textMuted, background: c.surfaceSoft }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {progress.preview!.map((row) => (
                  <tr key={row._id} className="border-t" style={{ borderColor: c.cardBorder }}>
                    <td className="px-4 py-2" style={{ color: c.textMuted }}>{row.id}</td>
                    <td className="px-4 py-2 whitespace-nowrap" style={{ color: c.textBody }}>
                      {row.Data ? new Date(row.Data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "-"}
                    </td>
                    <td className="px-4 py-2" style={{ color: c.textBody }}>{row["Funcionário"] || "-"}</td>
                    <td className="px-4 py-2" style={{ color: c.textBody }}>{row["QR CODE"] || "-"}</td>
                    <td className="px-4 py-2" style={{ color: c.textBody }}>{row["Tipo_serviço"]?.join(", ") || "-"}</td>
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
