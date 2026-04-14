import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Camera, MapPin, CheckCircle2, XCircle, Loader2,
  RefreshCw, User, List, MessageSquare,
} from "lucide-react";

interface GeoPosition { latitude: number; longitude: number; accuracy: number; }
type ViewState = "idle" | "scanning" | "form" | "success";
interface QrRecord { id: string; company_id: string; id_codigo: string; id_nome: string; }
interface CompanyRecord { name: string; address: string; }

/* Colors aligned with DS */
const P = { yellow: "#eab308", yellowLight: "#facc15", dark: "#1a1a2e", darkAlt: "#0f3460" };

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

  const [todayCount, setTodayCount] = useState<number | null>(null);
  const [monthCount, setMonthCount] = useState<number | null>(null);

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

  const handleQrScanned = async (data: string) => {
    const parts = data.split("|");
    const idCodigo = parts[0] || data;
    const idNome = parts[1] || "";
    setScannedIdCodigo(idCodigo); setScannedIdNome(idNome);
    setScannedCompany(""); setScannedAddress("");
    setScannedDateTime(new Date().toLocaleString("pt-BR"));
    setResponsibleName(""); setServiceTypes([]); setObservation("");
    setQrRecord(null); setCompanyRecord(null);

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

  const handleFinalize = async () => {
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
            <div>
              <span style={labelStyle}>Nome do Responsável</span>
              <div style={inputWrap}>
                <div style={inputIcon}><User size={18} style={{ color: "#94a3b8" }} /></div>
                <input type="text" value={responsibleName} onChange={e => setResponsibleName(e.target.value)} placeholder="Nome completo" style={inputField} />
              </div>
            </div>
            <div>
              <span style={labelStyle}>Tipo de Serviço</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Higienização", "Manutenção", "Inspeção", "Reparo", "Limpeza Geral"].map((tipo) => {
                  const selected = serviceTypes.includes(tipo);
                  return (
                    <button key={tipo} type="button" onClick={() => {
                      setServiceTypes(prev => selected ? prev.filter(t => t !== tipo) : [...prev, tipo]);
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
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
            <button onClick={handleFinalize} disabled={submitting} style={{
              width: "100%", padding: 16, borderRadius: 14, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff",
              fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: submitting ? 0.6 : 1, boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
            }}>
              {submitting ? <Loader2 size={22} className="animate-spin" /> : "FINALIZAR"}
            </button>
            <button onClick={() => setView("idle")} style={{
              width: "100%", padding: 16, borderRadius: 14, border: "1px solid #e2e8f0",
              background: "#fff", color: "#64748b", fontSize: 16, fontWeight: 700, cursor: "pointer",
            }}>FECHAR</button>
          </div>
        </div>
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
    </div>
  );
}
