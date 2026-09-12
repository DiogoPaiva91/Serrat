import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Camera, MapPin, CheckCircle2, XCircle, Loader2,
  RefreshCw, User, List, MessageSquare, Plus, ChevronDown, Trash2,
} from "lucide-react";
import { useOperators, useAddOperator, useDeleteOperator } from "@/hooks/useOperators";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useAuth } from "@/providers/AuthProvider";
import { useChecklistTemplate } from "@/hooks/useChecklistCatalog";
import { ChecklistOperador } from "./ChecklistOperador";
import { SimulacaoEnvio } from "./SimulacaoEnvio";
import { DevQrPicker } from "./DevQrPicker";
import { FotoInput } from "./FotoInput";
import {
  MAX_ANORMALIDADES_AVULSAS,
  type AnormalidadeAvulsa, type FinalizarPayload, type FotoLocal, type NotaReprovado, type RespostaStatus,
} from "./checklistTypes";

interface GeoPosition { latitude: number; longitude: number; accuracy: number; }
type ViewState = "idle" | "scanning" | "form" | "success";
interface QrRecord { id: string; company_id: string; id_codigo: string; id_nome: string; }
interface CompanyRecord { name: string; address: string; }

/* Colors aligned with DS */
const P = { yellow: "#eab308", yellowLight: "#facc15", dark: "#1a1a2e", darkAlt: "#0f3460" };

/* Chaves de compilacao:
   MODO_DEV: estamos no dev server. La tudo o que o operador faz simula, porque o dev server
   grava no banco de producao.
   CHECKLIST_NO_OPERADOR: checklist, sem acesso e anormalidades para o operador de verdade.
   Hoje so no dev porque a gravacao ainda nao existe; vira true em producao quando a Edge
   Function da Fase 3 estiver no ar.
   Em producao, admin logado tambem pode testar (modoTeste, dentro do componente): o seletor
   de cabine aparece para ele, e o que abre pelo seletor mostra o checklist e so simula.
   Assim o atalho nunca gera OS sem a leitura do QR na cabine; a camera segue normal. */
const MODO_DEV = import.meta.env.DEV;
const CHECKLIST_NO_OPERADOR = import.meta.env.DEV;

export function ScannerPage() {
  const [view, setView] = useState<ViewState>("idle");
  const [location, setLocation] = useState<GeoPosition | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [geoRequested, setGeoRequested] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-scanner-container";

  const [scannedIdCodigo, setScannedIdCodigo] = useState("");
  const [scannedIdNome, setScannedIdNome] = useState("");
  const [scannedCompany, setScannedCompany] = useState("");
  const [scannedAddress, setScannedAddress] = useState("");
  const [scannedDateTime, setScannedDateTime] = useState("");
  const [responsibleName, setResponsibleName] = useState("");
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [observation, setObservation] = useState("");
  const [qrRecord, setQrRecord] = useState<QrRecord | null>(null);
  const [companyRecord, setCompanyRecord] = useState<CompanyRecord | null>(null);

  const [scannedRaw, setScannedRaw] = useState("");
  const [respostas, setRespostas] = useState<Record<string, RespostaStatus>>({});
  const [notas, setNotas] = useState<Record<string, NotaReprovado>>({});
  const [avulsas, setAvulsas] = useState<AnormalidadeAvulsa[]>([]);
  const [semAcesso, setSemAcesso] = useState(false);
  const [fotoSemAcesso, setFotoSemAcesso] = useState<FotoLocal | null>(null);
  const [motivoSemAcesso, setMotivoSemAcesso] = useState("");
  const [mostrarFaltantes, setMostrarFaltantes] = useState(false);
  const [simulacao, setSimulacao] = useState<{ payload: FinalizarPayload; previews: (string | null)[] } | null>(null);
  const [devPickerOpen, setDevPickerOpen] = useState(false);
  const { profile } = useAuth();
  // Admin logado pode testar tambem em producao (ver o comentario das chaves no topo).
  const modoTeste = MODO_DEV || profile?.role === "admin";
  const [origemTeste, setOrigemTeste] = useState(false);
  // Checklist visivel: operador de verdade quando a Fase 3 ligar, ou qualquer teste pelo seletor.
  const checklistAtivo = CHECKLIST_NO_OPERADOR || origemTeste;
  // Nunca grava: no dev server tudo simula; em producao simula o que abriu pelo seletor.
  const simular = MODO_DEV || origemTeste;
  const {
    data: template = [], status: statusTemplate, fetchStatus: fetchTemplate, refetch: recarregarTemplate,
  } = useChecklistTemplate({ enabled: CHECKLIST_NO_OPERADOR || modoTeste });
  // So "success" prova que o catalogo chegou. Pendente, pausado (sem rede) ou com erro nao pode
  // virar lista vazia: com zero itens a regra do catalogo vazio liberaria FINALIZAR sem checklist.
  const templatePronto = statusTemplate === "success";

  const [todayCount, setTodayCount] = useState<number | null>(null);
  const [monthCount, setMonthCount] = useState<number | null>(null);
  const [showOperatorList, setShowOperatorList] = useState(false);
  const [operatorSearch, setOperatorSearch] = useState("");
  const operatorRef = useRef<HTMLDivElement>(null);

  const { data: operators = [] } = useOperators();
  const addOperator = useAddOperator();
  // Exclusao e desativacao (is_active = false): o responsavel das OS e texto livre, entao o
  // historico nao muda, e o "Adicionar" reativa o nome se alguem digitar de novo.
  const deleteOperator = useDeleteOperator();
  const [operadorParaExcluir, setOperadorParaExcluir] = useState<{ id: string; name: string } | null>(null);

  const fetchCounts = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [todayRes, monthRes] = await Promise.all([
        supabase.from("work_orders").select("id", { count: "exact", head: true }).gte("completed_at", todayStart),
        supabase.from("work_orders").select("id", { count: "exact", head: true }).gte("completed_at", monthStart),
      ]);
      setTodayCount(todayRes.count ?? 0);
      setMonthCount(monthRes.count ?? 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocationError("Geolocalização não suportada"); return; }
    setLoadingLocation(true); setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy }); setLoadingLocation(false); },
      (err) => { setLocationError(err.code === 1 ? "Permissão de localização negada." : "Erro ao obter localização."); setLoadingLocation(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => { if (!geoRequested) { setGeoRequested(true); getLocation(); } }, [getLocation, geoRequested]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (operatorRef.current && !operatorRef.current.contains(e.target as Node)) setShowOperatorList(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const startScanner = async () => {
    setCameraError(null); setView("scanning");
    await new Promise((r) => setTimeout(r, 150));
    try {
      // Request camera permission once upfront so the browser remembers
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      // Stop the preview stream — Html5Qrcode will open its own
      stream.getTracks().forEach((t) => t.stop());

      const scanner = new Html5Qrcode(scannerContainerId);
      scannerRef.current = scanner;
      await scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => { scanner.stop().catch(() => {}); handleQrScanned(decodedText); }, () => {});
    } catch (err: any) {
      setView("idle");
      const msg = err?.message || String(err);
      setCameraError(msg.includes("Permission") || msg.includes("NotAllowed") ? "Permissão de câmera negada." : msg.includes("NotFound") ? "Nenhuma câmera encontrada." : "Erro ao acessar câmera.");
    }
  };

  const stopScanner = () => { scannerRef.current?.stop().catch(() => {}); scannerRef.current = null; setView("idle"); };
  useEffect(() => () => { scannerRef.current?.stop().catch(() => {}); }, []);

  const handleQrScanned = async (data: string, { viaSeletor = false }: { viaSeletor?: boolean } = {}) => {
    // Suporta separador @ (novo padrao) e | (legacy)
    const sep = data.includes("@") ? "@" : "|";
    const parts = data.split(sep).map(p => p.trim());
    const idCodigo = parts[0] || data;
    const idNome = parts[1] || "";
    setScannedIdCodigo(idCodigo); setScannedIdNome(idNome);
    setScannedCompany(""); setScannedAddress("");
    setScannedDateTime(new Date().toLocaleString("pt-BR"));
    setResponsibleName(""); setServiceTypes([]); setObservation("");
    setQrRecord(null); setCompanyRecord(null);
    setScannedRaw(data);
    setRespostas({}); setNotas({}); setAvulsas([]);
    setSemAcesso(false); setFotoSemAcesso(null); setMotivoSemAcesso("");
    setMostrarFaltantes(false); setSimulacao(null);
    setOrigemTeste(viaSeletor);

    // Look up QR code by id_codigo + id_nome, then fetch company
    if (isSupabaseConfigured) {
      try {
        console.log("[SCAN] QR raw:", data, "| id_codigo:", idCodigo, "| id_nome:", idNome);
        const { data: qrData, error: qrErr } = await supabase
          .from("qr_codes")
          .select("id, company_id, id_codigo, id_nome")
          .eq("id_codigo", idCodigo)
          .eq("id_nome", idNome)
          .limit(1)
          .maybeSingle();
        console.log("[SCAN] qr_codes result:", qrData, "error:", qrErr);
        if (qrData) {
          setQrRecord(qrData);
          setScannedIdNome(qrData.id_nome || idNome);
          // Fetch company info
          console.log("[SCAN] fetching company for company_id:", qrData.company_id);
          const { data: compData } = await supabase
            .from("companies")
            .select("name, address")
            .eq("id", qrData.company_id)
            .maybeSingle();
          if (compData) {
            setCompanyRecord(compData);
            setScannedCompany(compData.name || "");
            setScannedAddress(compData.address || "");
          }
        }
      } catch (err) {
        console.error("[SCAN] lookup error:", err);
      }
    }

    setView("form");
  };

  /* ── Checklist: derivados ── */
  const itensTemplate = template.flatMap((c) => c.items);
  const totalItens = itensTemplate.length;
  const respondidos = itensTemplate.filter((i) => respostas[i.id]).length;
  // Catalogo vazio nao pode travar o operador para sempre, mas so vale se o catalogo de fato chegou.
  const checklistCompleto = templatePronto && (totalItens === 0 || respondidos === totalItens);
  const semAcessoCompleto = !!fotoSemAcesso && motivoSemAcesso.trim().length > 0;
  // A Edge Function vai recusar responsavel vazio (1 a 120 caracteres). Melhor barrar aqui do que
  // depois de o operador responder 12 itens. O formulario antigo deixava finalizar sem nome.
  const temResponsavel = responsibleName.trim().length > 0;
  const podeFinalizar = !checklistAtivo || (temResponsavel && (semAcesso ? semAcessoCompleto : checklistCompleto));

  /* Monta exatamente o que a Edge Function operador-finalizar-os vai receber.
     Item reprovado so vira anormalidade se o operador escreveu algo ou anexou foto:
     a reprovacao em si ja fica registrada na resposta. */
  const montarPayload = (): { payload: FinalizarPayload; previews: (string | null)[] } => {
    const issues: FinalizarPayload["issues"] = [];
    const previews: (string | null)[] = [];
    if (semAcesso) {
      issues.push({ kind: "sem_acesso", checklist_item_id: null, description: motivoSemAcesso.trim(), photo_base64: fotoSemAcesso?.base64 ?? null });
      previews.push(fotoSemAcesso?.previewUrl ?? null);
    } else {
      for (const item of itensTemplate) {
        if (respostas[item.id] !== "nao_ok") continue;
        const n = notas[item.id];
        if (!n || (!n.descricao.trim() && !n.foto)) continue;
        issues.push({ kind: "anormalidade", checklist_item_id: item.id, description: n.descricao.trim() || null, photo_base64: n.foto?.base64 ?? null });
        previews.push(n.foto?.previewUrl ?? null);
      }
      for (const a of avulsas) {
        if (!a.descricao.trim() && !a.foto) continue;
        issues.push({ kind: "anormalidade", checklist_item_id: null, description: a.descricao.trim() || null, photo_base64: a.foto?.base64 ?? null });
        previews.push(a.foto?.previewUrl ?? null);
      }
    }
    return {
      payload: {
        qr_code_id: qrRecord?.id ?? null,
        qr_code_data: scannedRaw,
        responsible_name: responsibleName.trim(),
        service_type_name: serviceTypes[0] ?? null,
        observation: observation.trim() || null,
        status: semAcesso ? "sem_acesso" : "concluida",
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        geo_accuracy: location?.accuracy ?? null,
        completed_at: new Date().toISOString(),
        answers: semAcesso ? [] : itensTemplate.filter((i) => respostas[i.id]).map((i) => ({ item_id: i.id, status: respostas[i.id] })),
        issues,
      },
      previews,
    };
  };

  const handleFinalize = async () => {
    if (checklistAtivo) {
      if (!podeFinalizar) {
        setMostrarFaltantes(true);
        toast.error(!temResponsavel ? "Informe o nome do responsável"
          : semAcesso ? "Anexe a foto e escreva o motivo da falta de acesso"
          : !templatePronto ? "O checklist ainda não carregou"
          : `Faltam ${totalItens - respondidos} itens do checklist`);
        // Leva o operador ate o primeiro item em branco, que ficou pintado.
        setTimeout(() => document.querySelector("[data-faltando]")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
        return;
      }
      // Dev server aponta para o banco de producao: nada de gravar OS de teste.
      if (simular) {
        setSimulacao(montarPayload());
        return;
      }
      // Producao com o checklist ligado: aqui entra o envio pela Edge Function da Fase 3.
      // Ate ela existir, erro explicito em vez de descartar as respostas em silencio.
      toast.error("Envio do checklist ainda não disponível");
      return;
    }
    setSubmitting(true);
    try {
      if (isSupabaseConfigured) {
        const payload = {
          qr_code_id: qrRecord?.id ?? null,
          company_id: qrRecord?.company_id ?? null,
          responsible_name: responsibleName,
          observation: observation || null,
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null,
          geo_accuracy: location?.accuracy ?? null,
          completed_at: new Date().toISOString(),
        };
        console.log("[FINALIZAR] payload:", payload);
        const { error } = await supabase.from("work_orders").insert(payload);
        console.log("[FINALIZAR] error:", error);
        if (error) throw error;
      }
      toast.success("Ordem de serviço finalizada!"); setView("success");
      fetchCounts();
      setTimeout(() => setView("idle"), 3000);
    } catch (err: any) { toast.error("Erro: " + (err.message || "Tente novamente")); }
    finally { setSubmitting(false); }
  };

  /* ── Shared styles ── */
  const card: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 16 };
  const labelStyle: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6, display: "block" };
  const inputWrap: React.CSSProperties = { display: "flex", alignItems: "center", border: "1.5px solid #e2e8f0", borderRadius: 12, overflow: "hidden", background: "#fff" };
  const inputIcon: React.CSSProperties = { background: "#f8fafc", padding: 12, display: "flex", alignItems: "center", justifyContent: "center" };
  const inputField: React.CSSProperties = { flex: 1, padding: "12px 14px", fontSize: 14, border: "none", outline: "none", background: "transparent", color: "#171717" };

  // ── SUCCESS ──
  if (view === "success") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <CheckCircle2 size={40} style={{ color: "#16a34a" }} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#171717", marginBottom: 8 }}>OS Finalizada!</h2>
        <p style={{ fontSize: 14, color: "#64748b", textAlign: "center", marginBottom: 24 }}>Ordem registrada com sucesso.</p>
        <button onClick={() => setView("idle")} style={{
          background: `linear-gradient(135deg, ${P.yellowLight}, ${P.yellow})`, color: "#1a1a1a",
          fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 14, border: "none", cursor: "pointer",
          boxShadow: "0 4px 14px rgba(234,179,8,0.3)",
        }}>Escanear Novo QR Code</button>
      </div>
    );
  }

  // ── FORM ──
  if (view === "form") {
    return (
      <div style={{ paddingBottom: 24 }}>
        {/* Form header */}
        <div style={{
          background: `linear-gradient(135deg, ${P.dark}, ${P.darkAlt})`,
          padding: "16px 20px", textAlign: "center",
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "0.05em", margin: 0 }}>ORDEM DE SERVIÇO</h2>
        </div>
        {simular && (
          <div style={{ background: "#faf5ff", borderBottom: "1px dashed #c4b5fd", color: "#6d28d9", fontSize: 11.5, fontWeight: 600, padding: "7px 16px", textAlign: "center" }}>
            Teste: o FINALIZAR mostra o que seria gravado e não grava nada.
          </div>
        )}

        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Info card */}
          <div style={card}>
            {[
              { label: "Empresa", value: scannedCompany || "—" },
              { label: "ID Código", value: scannedIdCodigo, bold: true },
              { label: "ID Nome", value: scannedIdNome || "—" },
              { label: "Data Hora", value: scannedDateTime },
            ].map((f, i) => (
              <div key={i} style={{ marginBottom: i < 3 ? 12 : 0, paddingBottom: i < 3 ? 12 : 0, borderBottom: i < 3 ? "1px solid #f1f5f9" : "none" }}>
                <span style={labelStyle}>{f.label}</span>
                <p style={{ fontSize: 14, fontWeight: f.bold ? 700 : 400, color: f.bold ? P.yellow : "#171717", margin: 0 }}>{f.value}</p>
              </div>
            ))}
          </div>

          {/* Map card */}
          <div style={card}>
            <span style={labelStyle}>Endereço</span>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{scannedAddress || "Localização atual"}</p>
            {location ? (
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", height: 180 }}>
                <iframe title="Localização" width="100%" height="180" style={{ border: 0 }} loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.005},${location.latitude - 0.003},${location.longitude + 0.005},${location.latitude + 0.003}&layer=mapnik&marker=${location.latitude},${location.longitude}`} />
              </div>
            ) : (
              <div style={{ borderRadius: 12, border: "1px solid #e2e8f0", height: 180, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <MapPin size={24} style={{ color: "#cbd5e1", margin: "0 auto 4px" }} />
                  <p style={{ fontSize: 12, color: "#94a3b8" }}>{loadingLocation ? "Obtendo localização..." : locationError || "GPS indisponível"}</p>
                  {locationError && <button onClick={getLocation} style={{ fontSize: 12, color: "#2563eb", background: "none", border: "none", cursor: "pointer", marginTop: 4 }}>Tentar novamente</button>}
                </div>
              </div>
            )}
          </div>

          {/* Form fields card */}
          <div style={{ ...card, display: "flex", flexDirection: "column", gap: 16 }}>
            {checklistAtivo && (
              <button type="button" onClick={() => { setSemAcesso((v) => !v); setMostrarFaltantes(false); }} style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                border: `1.5px dashed ${semAcesso ? "#94a3b8" : "#f97316"}`,
                background: semAcesso ? "#f8fafc" : "rgba(249,115,22,0.06)",
                color: semAcesso ? "#475569" : "#c2410c",
                borderRadius: 12, padding: 11, fontSize: 12.5, fontWeight: 800, letterSpacing: "0.02em", cursor: "pointer",
              }}>
                <XCircle size={15} /> {semAcesso ? "VOLTAR AO CHECKLIST" : "NÃO CONSEGUI ACESSO"}
              </button>
            )}
            <div ref={operatorRef} style={{ position: "relative" }}>
              <span style={labelStyle}>Nome do Responsável</span>
              <div data-faltando={(checklistAtivo && mostrarFaltantes && !temResponsavel) || undefined}
                style={{ ...inputWrap, borderColor: showOperatorList ? "#eab308" : (checklistAtivo && mostrarFaltantes && !temResponsavel) ? "#fca5a5" : "#e2e8f0" }}>
                <div style={inputIcon}><User size={18} style={{ color: "#94a3b8" }} /></div>
                <input type="text" value={responsibleName}
                  onChange={e => { setResponsibleName(e.target.value); setOperatorSearch(e.target.value); setShowOperatorList(true); }}
                  onFocus={() => setShowOperatorList(true)}
                  placeholder="Selecione ou digite um nome" style={inputField} />
                <div onClick={() => setShowOperatorList(!showOperatorList)} style={{ padding: "0 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <ChevronDown size={16} style={{ color: "#94a3b8", transition: "transform .15s", transform: showOperatorList ? "rotate(180deg)" : "none" }} />
                </div>
              </div>
              {showOperatorList && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                  background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12,
                  marginTop: 4, maxHeight: 200, overflowY: "auto",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                }}>
                  {operators
                    .filter(op => !operatorSearch || op.name.toLowerCase().includes(operatorSearch.toLowerCase()))
                    .map(op => (
                      <div key={op.id} onClick={() => { setResponsibleName(op.name); setShowOperatorList(false); }}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px 4px 14px", fontSize: 14, color: "#171717", cursor: "pointer", borderBottom: "1px solid #f1f5f9" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <span style={{ flex: 1, padding: "6px 0" }}>{op.name}</span>
                        <button type="button" aria-label={`Excluir ${op.name}`} title="Excluir da lista"
                          onClick={(e) => { e.stopPropagation(); setOperadorParaExcluir({ id: op.id, name: op.name }); }}
                          style={{
                            flexShrink: 0, width: 34, height: 34, borderRadius: 8, border: "none", background: "transparent",
                            color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.background = "#fef2f2"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "transparent"; }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  {operatorSearch && !operators.some(op => op.name.toLowerCase() === operatorSearch.toLowerCase()) && (
                    <div onClick={async () => {
                      try {
                        await addOperator.mutateAsync(operatorSearch.trim());
                        setResponsibleName(operatorSearch.trim());
                        setShowOperatorList(false);
                        toast.success(`"${operatorSearch.trim()}" adicionado!`);
                      } catch { toast.error("Erro ao adicionar operador"); }
                    }}
                      style={{ padding: "10px 14px", fontSize: 14, color: "#eab308", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#fffbeb")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <Plus size={16} /> Adicionar "{operatorSearch.trim()}"
                    </div>
                  )}
                  {!operatorSearch && operators.length === 0 && (
                    <div style={{ padding: "10px 14px", fontSize: 13, color: "#94a3b8" }}>Nenhum operador cadastrado</div>
                  )}
                </div>
              )}
            </div>
            <div>
              <span style={labelStyle}>Tipo de Serviço</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Higienização", "Manutenção", "Inspeção", "Reparo", "Limpeza Geral"].map((tipo) => {
                  const selected = serviceTypes.includes(tipo);
                  return (
                    <button key={tipo} type="button" onClick={() => {
                      setServiceTypes(prev => checklistAtivo
                        ? (selected ? [] : [tipo])
                        : (selected ? prev.filter(t => t !== tipo) : [...prev, tipo]));
                    }} style={{
                      padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                      border: selected ? "none" : "1.5px solid #e2e8f0",
                      background: selected ? "linear-gradient(135deg, #facc15, #eab308)" : "#fff",
                      color: selected ? "#1a1a1a" : "#64748b",
                      cursor: "pointer", transition: "all .15s",
                      boxShadow: selected ? "0 2px 8px rgba(234,179,8,0.3)" : "none",
                    }}>
                      {tipo}
                    </button>
                  );
                })}
              </div>
            </div>
            {checklistAtivo && (semAcesso ? (
              <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: 12 }}>
                <span style={{ ...labelStyle, color: "#c2410c" }}>Comprovação da falta de acesso</span>
                <textarea value={motivoSemAcesso} onChange={(e) => setMotivoSemAcesso(e.target.value)} rows={2}
                  placeholder="Motivo: porta trancada, área interditada, operação em andamento..."
                  style={{
                    width: "100%", boxSizing: "border-box", border: `1px solid ${mostrarFaltantes && !motivoSemAcesso.trim() ? "#fca5a5" : "#e2e8f0"}`,
                    borderRadius: 8, padding: "8px 10px", fontSize: 13, resize: "none", outline: "none", marginBottom: 8,
                    fontFamily: "inherit", color: "#171717",
                  }} />
                <FotoInput label="Foto comprovando" obrigatoria foto={fotoSemAcesso} onChange={setFotoSemAcesso} />
              </div>
            ) : (
              <>
                <div>
                  <span style={labelStyle}>Checklist da cabine</span>
                  <ChecklistOperador
                    template={template}
                    carregando={statusTemplate === "pending" && fetchTemplate !== "paused"}
                    semConexao={statusTemplate === "pending" && fetchTemplate === "paused"}
                    erro={statusTemplate === "error"}
                    onRecarregar={() => recarregarTemplate()}
                    respostas={respostas}
                    onResposta={(itemId, status) => setRespostas((r) => ({ ...r, [itemId]: status }))}
                    notas={notas}
                    onNota={(itemId, nota) => setNotas((n) => ({ ...n, [itemId]: nota }))}
                    mostrarFaltantes={mostrarFaltantes}
                  />
                </div>
                <div>
                  <span style={labelStyle}>Anormalidades e quebras</span>
                  {avulsas.map((a, i) => (
                    <div key={a.tempId} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, marginBottom: 8, background: "#f8fafc" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>Anormalidade {i + 1}</span>
                        <button type="button" aria-label="Remover anormalidade"
                          onClick={() => { if (a.foto) URL.revokeObjectURL(a.foto.previewUrl); setAvulsas((l) => l.filter((x) => x.tempId !== a.tempId)); }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: 2 }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <textarea value={a.descricao} rows={2} placeholder="Ex: tampa do vaso quebrada, torneira vazando"
                        onChange={(e) => setAvulsas((l) => l.map((x) => x.tempId === a.tempId ? { ...x, descricao: e.target.value } : x))}
                        style={{
                          width: "100%", boxSizing: "border-box", border: "1px solid #e2e8f0", borderRadius: 8,
                          padding: "8px 10px", fontSize: 13, resize: "none", outline: "none", marginBottom: 8,
                          fontFamily: "inherit", color: "#171717", background: "#fff",
                        }} />
                      <FotoInput label="Foto" foto={a.foto}
                        onChange={(foto) => setAvulsas((l) => l.map((x) => x.tempId === a.tempId ? { ...x, foto } : x))} />
                    </div>
                  ))}
                  {avulsas.length < MAX_ANORMALIDADES_AVULSAS ? (
                    <button type="button"
                      onClick={() => setAvulsas((l) => [...l, { tempId: crypto.randomUUID(), descricao: "", foto: null }])}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6, border: "1.5px solid #e2e8f0", background: "#fff",
                        borderRadius: 9, padding: "8px 12px", fontSize: 12, fontWeight: 700, color: "#475569", cursor: "pointer",
                      }}>
                      <Plus size={14} /> Adicionar anormalidade
                    </button>
                  ) : (
                    <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Máximo de {MAX_ANORMALIDADES_AVULSAS} por ordem de serviço.</p>
                  )}
                </div>
              </>
            ))}
            <div>
              <span style={labelStyle}>Observação</span>
              <div style={{ ...inputWrap, alignItems: "flex-start" }}>
                <div style={inputIcon}><MessageSquare size={18} style={{ color: "#94a3b8" }} /></div>
                <textarea value={observation} onChange={e => setObservation(e.target.value)} rows={3} placeholder="Observações adicionais..."
                  style={{ ...inputField, resize: "none" }} />
              </div>
            </div>
          </div>

          {/* Buttons */}
          {/* No modo dev o contador e o FINALIZAR ficam presos acima da barra de navegacao,
              como no prototipo A: o operador ve quanto falta sem rolar ate o fim.
              fixed e nao sticky: o <main> do OperadorLayout tem overflow-auto e vira o container
              do sticky, mas quem rola e o documento (a raiz e min-h-screen), entao o sticky
              ficava preso numa caixa que nunca se move. 68px e a altura medida da barra. */}
          {checklistAtivo && (
            <div data-rodape-checklist style={{
              position: "fixed", left: 0, right: 0, bottom: "calc(68px + env(safe-area-inset-bottom, 0px))",
              zIndex: 40, padding: "10px 16px 8px",
              background: "rgba(245,245,245,0.96)", backdropFilter: "blur(6px)", borderTop: "1px solid #e2e8f0",
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              {!semAcesso && totalItens > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 20, overflow: "hidden" }}>
                    <div style={{ width: `${(respondidos / totalItens) * 100}%`, height: "100%", background: checklistCompleto ? "#16a34a" : "#eab308", transition: "width .2s" }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#171717", whiteSpace: "nowrap" }}>{respondidos}/{totalItens} respondidos</span>
                </div>
              )}
              <button onClick={handleFinalize} disabled={submitting} style={{
                width: "100%", padding: 15, borderRadius: 14, border: "none", cursor: "pointer",
                background: !podeFinalizar ? "#cbd5e1" : semAcesso ? "linear-gradient(135deg, #fb923c, #ea580c)" : "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#fff", fontSize: 15, fontWeight: 800, letterSpacing: "0.03em",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: submitting ? 0.6 : 1, boxShadow: podeFinalizar ? "0 4px 14px rgba(22,163,74,0.25)" : "none",
              }}>
                {submitting ? <Loader2 size={22} className="animate-spin" />
                  : !podeFinalizar ? (!temResponsavel ? "FALTA O RESPONSÁVEL" : semAcesso ? "FALTA FOTO OU MOTIVO" : !templatePronto ? "AGUARDANDO CHECKLIST" : `FALTAM ${totalItens - respondidos} ITENS`)
                  : semAcesso ? "REGISTRAR SEM ACESSO" : "FINALIZAR"}
              </button>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
            {!checklistAtivo && (
              <button onClick={handleFinalize} disabled={submitting} style={{
                width: "100%", padding: 16, borderRadius: 14, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff",
                fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: submitting ? 0.6 : 1, boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
              }}>
                {submitting ? <Loader2 size={22} className="animate-spin" /> : "FINALIZAR"}
              </button>
            )}
            <button onClick={() => setView("idle")} style={{
              width: "100%", padding: 16, borderRadius: 14, border: "1px solid #e2e8f0",
              background: "#fff", color: "#64748b", fontSize: 16, fontWeight: 700, cursor: "pointer",
            }}>FECHAR</button>
          </div>
          {/* Compensa a altura do rodape fixo, senao o fim do formulario fica atras dele. */}
          {checklistAtivo && <div aria-hidden style={{ height: 76 }} />}
        </div>
        <ConfirmDialog
          open={!!operadorParaExcluir}
          onOpenChange={(o) => { if (!o) setOperadorParaExcluir(null); }}
          title="Excluir operador"
          description={`"${operadorParaExcluir?.name ?? ""}" sai da lista de responsáveis. As ordens de serviço já registradas com esse nome continuam intactas, e se o nome for adicionado de novo ele volta.`}
          onConfirm={() => {
            const alvo = operadorParaExcluir;
            if (!alvo) return;
            deleteOperator.mutate(alvo.id, {
              onSuccess: () => {
                toast.success(`"${alvo.name}" excluído da lista`);
                // Se o nome excluido era o responsavel escolhido, nao deixa ele ir para a OS.
                if (responsibleName.trim().toLowerCase() === alvo.name.toLowerCase()) setResponsibleName("");
              },
              onError: (err: any) => toast.error("Erro ao excluir: " + (err?.message || "tente novamente")),
            });
          }}
        />
        {simular && simulacao && (
          <SimulacaoEnvio
            payload={simulacao.payload}
            previews={simulacao.previews}
            cabine={`${scannedIdCodigo}${scannedIdNome ? ` · ${scannedIdNome}` : ""}`}
            empresa={scannedCompany}
            nomesItens={Object.fromEntries(itensTemplate.map((i) => [i.id, i.name]))}
            onClose={() => setSimulacao(null)}
          />
        )}
      </div>
    );
  }

  // ── SCANNING ──
  if (view === "scanning") {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ background: P.dark, borderRadius: 20, overflow: "hidden", position: "relative" }}>
          <div id={scannerContainerId} style={{ minHeight: 400 }} />
          <button onClick={stopScanner} style={{
            position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
            background: "#ef4444", color: "#fff", padding: "12px 32px", borderRadius: 14,
            fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", zIndex: 10,
            boxShadow: "0 4px 14px rgba(239,68,68,0.3)",
          }}>FECHAR</button>
        </div>
      </div>
    );
  }

  // ── IDLE ──
  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Stats strip */}
      <div style={{
        ...card, padding: "10px 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Hoje</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#2563eb" }}>{todayCount ?? "--"}</span>
        </div>
        <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Mês</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#16a34a" }}>{monthCount ?? "--"}</span>
        </div>
        <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <MapPin size={13} style={{ color: location ? "#16a34a" : "#ef4444" }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: location ? "#16a34a" : "#ef4444" }}>
            {loadingLocation ? "..." : location ? "OK" : "Off"}
          </span>
          {!location && !loadingLocation && (
            <button onClick={getLocation} style={{ fontSize: 9, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 600, textDecoration: "underline" }}>Ativar</button>
          )}
        </div>
      </div>

      {/* Camera area */}
      <div style={{
        background: `linear-gradient(160deg, ${P.dark} 0%, ${P.darkAlt} 100%)`,
        borderRadius: 18, overflow: "hidden", position: "relative",
      }}>
        <div id={scannerContainerId} style={{ height: 0, overflow: "hidden" }} />

        <div style={{ minHeight: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
          {cameraError ? (
            <>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <XCircle size={26} style={{ color: "#ef4444" }} />
              </div>
              <p style={{ color: "#fca5a5", fontSize: 12, textAlign: "center", marginBottom: 14 }}>{cameraError}</p>
              <button onClick={startScanner} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.1)", color: "#fff", padding: "10px 20px",
                borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", fontSize: 12, fontWeight: 600,
              }}>
                <RefreshCw size={14} /> Tentar Novamente
              </button>
            </>
          ) : (
            <>
              {/* Scan frame */}
              <div style={{ width: 140, height: 140, position: "relative", marginBottom: 16 }}>
                {[
                  { top: 0, left: 0, borderTop: `3px solid ${P.yellow}`, borderLeft: `3px solid ${P.yellow}`, borderRadius: "10px 0 0 0" },
                  { top: 0, right: 0, borderTop: `3px solid ${P.yellow}`, borderRight: `3px solid ${P.yellow}`, borderRadius: "0 10px 0 0" },
                  { bottom: 0, left: 0, borderBottom: `3px solid ${P.yellow}`, borderLeft: `3px solid ${P.yellow}`, borderRadius: "0 0 0 10px" },
                  { bottom: 0, right: 0, borderBottom: `3px solid ${P.yellow}`, borderRight: `3px solid ${P.yellow}`, borderRadius: "0 0 10px 0" },
                ].map((s, i) => (
                  <div key={i} style={{ position: "absolute", width: 32, height: 32, ...s } as React.CSSProperties} />
                ))}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Camera size={32} style={{ color: "rgba(255,255,255,0.2)" }} />
                </div>
              </div>

              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginBottom: 18 }}>Aponte para o QR Code</p>

              <button onClick={startScanner} style={{
                background: `linear-gradient(135deg, ${P.yellowLight}, ${P.yellow})`,
                color: "#1a1a1a", fontWeight: 800, fontSize: 14, padding: "14px 32px",
                borderRadius: 12, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                boxShadow: "0 4px 16px rgba(234,179,8,0.3)",
              }}>
                <Camera size={18} /> Abrir Câmera
              </button>
            </>
          )}
        </div>
      </div>

      {modoTeste && (
        <DevQrPicker
          open={devPickerOpen}
          onOpenChange={setDevPickerOpen}
          onSelect={(qr) => { setDevPickerOpen(false); handleQrScanned(`${qr.id_codigo}@${qr.id_nome}`, { viaSeletor: true }); }}
        />
      )}

      {/* O operador normalmente nao tem login. Se o aparelho tiver uma sessao (alguem do
          painel logado no mesmo navegador), mostra quem e. Quando o seletor de teste aparece
          (dev, ou admin em producao), a sessao ja aparece dentro dele. */}
      {!modoTeste && profile && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 11.5, color: "#64748b" }}>
          <User size={13} />
          <span>Logado como <b style={{ color: "#334155" }}>{profile.full_name}</b> ({profile.role})</span>
        </div>
      )}
    </div>
  );
}
