import { FlaskConical, X } from "lucide-react";
import type { FinalizarPayload } from "./checklistTypes";

interface SimulacaoEnvioProps {
  payload: FinalizarPayload;
  cabine: string;
  empresa: string;
  /** Previa das fotos, na mesma ordem de payload.issues. */
  previews: (string | null)[];
  /** Nome de cada item por id, so para o resumo ficar legivel. */
  nomesItens: Record<string, string>;
  onClose: () => void;
}

/**
 * Modo dev: mostra o que o FINALIZAR gravaria, sem gravar.
 * O dev server aponta para o banco de producao, entao um FINALIZAR de teste
 * viraria OS real no Dashboard e nos relatorios do cliente.
 */
export function SimulacaoEnvio({ payload, cabine, empresa, previews, nomesItens, onClose }: SimulacaoEnvioProps) {
  const cont = { ok: 0, nao_ok: 0, nao_aplica: 0 };
  for (const a of payload.answers) cont[a.status]++;
  const reprovados = payload.answers.filter((a) => a.status === "nao_ok");
  const semAcesso = payload.status === "sem_acesso";

  const card: React.CSSProperties = { background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: 14 };
  const label: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 };
  const linha: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, padding: "4px 0" };

  return (
    <div role="dialog" aria-modal="true" aria-label="Simulação de envio" onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 480, maxHeight: "calc(100vh - 32px)", overflowY: "auto",
        background: "#f5f5f5", borderRadius: 20, paddingBottom: 20,
        boxShadow: "0 24px 60px rgba(15,23,42,0.35)",
      }}>
        <div style={{
          position: "sticky", top: 0, zIndex: 1,
          background: "linear-gradient(135deg, #1a1a2e, #0f3460)", color: "#fff",
          padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, borderRadius: "20px 20px 0 0",
        }}>
          <FlaskConical size={18} style={{ color: "#facc15", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Simulação: isto seria gravado</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{cabine} · {empresa || "empresa não encontrada"}</div>
          </div>
          <button onClick={onClose} aria-label="Fechar" style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: 12, padding: "10px 12px", fontSize: 12.5, color: "#713f12", lineHeight: 1.45 }}>
            <b>{import.meta.env.DEV ? "Modo dev." : "Modo de teste."} Nada foi gravado no banco.</b> Na operação real, este mesmo pacote vai para a função
            <code style={{ fontSize: 11.5 }}> operador-finalizar-os</code>, que ainda não existe.
          </div>

          <div style={card}>
            <span style={label}>Ordem de serviço</span>
            <div style={linha}><span style={{ color: "#64748b" }}>Status</span>
              <b style={{ color: semAcesso ? "#c2410c" : "#15803d" }}>{semAcesso ? "Sem acesso" : "Concluída"}</b></div>
            <div style={linha}><span style={{ color: "#64748b" }}>Responsável</span><b>{payload.responsible_name || "não informado"}</b></div>
            <div style={linha}><span style={{ color: "#64748b" }}>Tipo de serviço</span><b>{payload.service_type_name || "não informado"}</b></div>
            <div style={linha}><span style={{ color: "#64748b" }}>GPS</span>
              <b>{payload.latitude != null ? `${payload.latitude.toFixed(5)}, ${payload.longitude?.toFixed(5)}` : "sem localização"}</b></div>
            {payload.observation && <div style={linha}><span style={{ color: "#64748b" }}>Observação</span><b style={{ textAlign: "right" }}>{payload.observation}</b></div>}
          </div>

          {!semAcesso && (
            <div style={card}>
              <span style={label}>Checklist: {payload.answers.length} respostas</span>
              <div style={{ display: "flex", gap: 8, marginBottom: reprovados.length ? 10 : 0 }}>
                {[
                  { n: cont.ok, r: "OK", c: "#15803d", b: "rgba(22,163,74,0.10)" },
                  { n: cont.nao_ok, r: "Não", c: "#b91c1c", b: "rgba(239,68,68,0.10)" },
                  { n: cont.nao_aplica, r: "N/A", c: "#475569", b: "rgba(148,163,184,0.14)" },
                ].map((x) => (
                  <div key={x.r} style={{ flex: 1, textAlign: "center", background: x.b, borderRadius: 10, padding: "8px 0" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: x.c }}>{x.n}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: x.c }}>{x.r}</div>
                  </div>
                ))}
              </div>
              {reprovados.map((r) => (
                <div key={r.item_id} style={{ fontSize: 12.5, color: "#b91c1c", padding: "3px 0" }}>
                  Reprovado: {nomesItens[r.item_id] || r.item_id}
                </div>
              ))}
            </div>
          )}

          {payload.issues.length > 0 && (
            <div style={card}>
              <span style={label}>{semAcesso ? "Comprovação de falta de acesso" : `Anormalidades: ${payload.issues.length}`}</span>
              {payload.issues.map((iss, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 0", borderTop: i ? "1px solid #f1f5f9" : "none" }}>
                  {previews[i] ? (
                    <img src={previews[i]!} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: 8, background: "#f1f5f9", flexShrink: 0, fontSize: 9, color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>sem foto</div>
                  )}
                  <div style={{ fontSize: 12.5, color: "#334155", lineHeight: 1.35 }}>
                    {iss.checklist_item_id && <b>{nomesItens[iss.checklist_item_id] || "Item"}: </b>}
                    {iss.description || <span style={{ color: "#94a3b8" }}>sem descrição</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={onClose} style={{
            width: "100%", padding: 14, borderRadius: 14, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg, #facc15, #eab308)", color: "#1a1a1a", fontSize: 15, fontWeight: 800,
          }}>
            Fechar e voltar
          </button>
        </div>
      </div>
    </div>
  );
}
