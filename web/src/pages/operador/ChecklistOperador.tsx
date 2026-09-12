import type { ChecklistCategory } from "@/hooks/useChecklistCatalog";
import { FotoInput } from "./FotoInput";
import type { NotaReprovado, RespostaStatus } from "./checklistTypes";

interface ChecklistOperadorProps {
  template: ChecklistCategory[];
  carregando: boolean;
  /** Consulta pausada por falta de rede: o React Query retoma sozinho quando a conexao volta. */
  semConexao: boolean;
  erro: boolean;
  onRecarregar: () => void;
  respostas: Record<string, RespostaStatus>;
  onResposta: (itemId: string, status: RespostaStatus) => void;
  notas: Record<string, NotaReprovado>;
  onNota: (itemId: string, nota: NotaReprovado) => void;
  /** Liga depois de uma tentativa de finalizar com item em branco: pinta os faltantes. */
  mostrarFaltantes: boolean;
}

const OPCOES: { valor: RespostaStatus; rotulo: string; cor: string; fundo: string; texto: string }[] = [
  { valor: "ok", rotulo: "OK", cor: "#16a34a", fundo: "rgba(22,163,74,0.10)", texto: "#15803d" },
  { valor: "nao_ok", rotulo: "Não", cor: "#ef4444", fundo: "rgba(239,68,68,0.10)", texto: "#b91c1c" },
  { valor: "nao_aplica", rotulo: "N/A", cor: "#94a3b8", fundo: "rgba(148,163,184,0.14)", texto: "#475569" },
];

/**
 * Checklist no arranjo A do prototipo: todas as categorias abertas na mesma tela,
 * nenhum item pre-marcado. Pre-marcar tudo OK vira carimbo automatico e destroi o
 * valor do relatorio, entao o operador responde item por item.
 * Componente sem estado proprio: tudo mora no ScannerPage, que monta o payload.
 */
export function ChecklistOperador({
  template, carregando, semConexao, erro, onRecarregar, respostas, onResposta, notas, onNota, mostrarFaltantes,
}: ChecklistOperadorProps) {
  const labelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px",
  };

  if (carregando) {
    return <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Carregando checklist...</p>;
  }
  // Sem isto, consulta pausada ou com erro caia no ramo abaixo e dizia que nao havia itens.
  if (semConexao || erro) {
    return (
      <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: 12 }}>
        <p style={{ fontSize: 13, color: "#b91c1c", margin: "0 0 8px", fontWeight: 600 }}>
          {semConexao ? "Sem conexão. O checklist carrega assim que a rede voltar." : "Não foi possível carregar o checklist."}
        </p>
        <button type="button" onClick={onRecarregar} style={{
          border: "1.5px solid #fecaca", background: "#fff", borderRadius: 9, padding: "7px 12px",
          fontSize: 12, fontWeight: 700, color: "#b91c1c", cursor: "pointer",
        }}>
          Tentar novamente
        </button>
      </div>
    );
  }
  if (template.length === 0) {
    return (
      <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
        Nenhum item de checklist ativo. Cadastre no painel, em Checklists.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {template.map((cat) => {
        const respondidos = cat.items.filter((i) => respostas[i.id]).length;
        return (
          <div key={cat.id}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={labelStyle}>{cat.name}</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: respondidos === cat.items.length ? "#16a34a" : "#eab308" }}>
                {respondidos}/{cat.items.length}
              </span>
            </div>

            {cat.items.map((item, idx) => {
              const atual = respostas[item.id];
              const faltando = mostrarFaltantes && !atual;
              const nota = notas[item.id] || { descricao: "", foto: null };
              return (
                <div key={item.id}>
                  <div data-faltando={faltando || undefined} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "9px 6px",
                    borderBottom: idx < cat.items.length - 1 || atual === "nao_ok" ? "1px solid #f1f5f9" : "none",
                    borderRadius: 8,
                    background: faltando ? "rgba(239,68,68,0.06)" : "transparent",
                    outline: faltando ? "1.5px solid #fca5a5" : "none",
                  }}>
                    <span style={{ flex: 1, fontSize: 14, color: "#171717", fontWeight: 500 }}>{item.name}</span>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      {OPCOES.map((op) => {
                        const ativo = atual === op.valor;
                        return (
                          <button key={op.valor} type="button" onClick={() => onResposta(item.id, op.valor)}
                            aria-pressed={ativo}
                            style={{
                              minWidth: 42, padding: "7px 9px", borderRadius: 9, fontSize: 12, fontWeight: 700,
                              border: `1.5px solid ${ativo ? op.cor : "#e2e8f0"}`,
                              background: ativo ? op.fundo : "#fff",
                              color: ativo ? op.texto : "#94a3b8",
                              cursor: "pointer", transition: "all .12s",
                            }}>
                            {op.rotulo}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {atual === "nao_ok" && (
                    <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: 10, margin: "6px 0 8px" }}>
                      <div style={{ fontSize: 10.5, fontWeight: 800, color: "#c2410c", marginBottom: 6, textTransform: "uppercase" }}>
                        {item.name} reprovado: o que houve?
                      </div>
                      <textarea value={nota.descricao} rows={2} placeholder="Descreva o problema"
                        onChange={(e) => onNota(item.id, { ...nota, descricao: e.target.value })}
                        style={{
                          width: "100%", boxSizing: "border-box", border: "1px solid #e2e8f0", borderRadius: 8,
                          padding: "8px 10px", fontSize: 13, resize: "none", outline: "none", marginBottom: 8,
                          fontFamily: "inherit", color: "#171717",
                        }} />
                      <FotoInput label="Anexar foto" foto={nota.foto} onChange={(foto) => onNota(item.id, { ...nota, foto })} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
