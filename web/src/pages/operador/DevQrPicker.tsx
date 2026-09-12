import { useQuery } from "@tanstack/react-query";
import { FlaskConical, ChevronDown, Loader2, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

export interface DevQr {
  id: string;
  id_codigo: string;
  id_nome: string;
  company: { name: string } | null;
}

interface DevQrPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (qr: DevQr) => void;
}

const EM_DEV = import.meta.env.DEV;

/**
 * Atalho de teste: escolher a cabine sem camera.
 * Montado so no modo de teste (modoTeste no ScannerPage): sempre no dev server, e em
 * producao so para admin logado. O que abre por aqui sempre simula, entao o atalho nao
 * gera OS sem a leitura do QR na cabine. Escolher uma cabine dispara o mesmo
 * handleQrScanned da leitura real, entao o teste passa pela busca de verdade.
 * Query propria porque o useQrCodes exige perfil logado e o operador e anonimo.
 */
export function DevQrPicker({ open, onOpenChange, onSelect }: DevQrPickerProps) {
  // No dev server a pagina do operador herda a sessao do painel (mesma origem, mesmo
  // localStorage). Mostrar quem esta logado evita confundir: o operador real e anonimo,
  // entao um teste que funciona aqui como admin pode falhar la por permissao.
  const { profile, session } = useAuth();

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["dev-qr-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("qr_codes")
        .select("id, id_codigo, id_nome, company:companies(name)")
        .eq("is_active", true)
        .order("id_codigo");
      if (error) throw error;
      return (data || []) as unknown as DevQr[];
    },
    enabled: open,
  });

  return (
    <div style={{ border: "1.5px dashed #c4b5fd", borderRadius: 16, background: "#faf5ff", overflow: "hidden" }}>
      <button type="button" onClick={() => onOpenChange(!open)} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "11px 14px 6px",
        background: "none", border: "none", cursor: "pointer", color: "#6d28d9", fontSize: 12.5, fontWeight: 700,
      }}>
        <FlaskConical size={15} />
        <span style={{ flex: 1, textAlign: "left" }}>{EM_DEV ? "Modo dev" : "Modo de teste"}: escolher cabine sem câmera</span>
        <ChevronDown size={15} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </button>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "0 14px 10px 37px", fontSize: 11, color: "#7c3aed", lineHeight: 1.4 }}>
        <User size={12} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>
          {profile ? (
            <>Logado como <b>{profile.full_name}</b> ({profile.role}). Os testes usam esta sessão; o operador real não tem login.</>
          ) : session ? (
            <>Sessão ativa, perfil ainda não carregado.</>
          ) : (
            <>Sem login, igual ao operador em produção.</>
          )}
        </span>
      </div>

      {open && (
        <div style={{ padding: "0 12px 12px" }}>
          <p style={{ fontSize: 11, color: "#7c3aed", margin: "0 0 10px", lineHeight: 1.4 }}>
            {EM_DEV ? "Só aparece no dev server." : "Só aparece para admin logado."} Abre o formulário como se o QR tivesse sido lido. O FINALIZAR aqui é simulação e não grava nada.
          </p>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 12 }}>
              <Loader2 size={18} className="animate-spin" style={{ color: "#7c3aed" }} />
            </div>
          ) : error ? (
            <p style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>Não foi possível carregar as cabines: {(error as any)?.message}</p>
          ) : data.length === 0 ? (
            <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Nenhuma cabine ativa cadastrada.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 6, maxHeight: 260, overflowY: "auto" }}>
              {data.map((qr) => (
                <button key={qr.id} type="button" onClick={() => onSelect(qr)} style={{
                  textAlign: "left", background: "#fff", border: "1px solid #ddd6fe", borderRadius: 10,
                  padding: "8px 10px", cursor: "pointer",
                }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: "#171717" }}>{qr.id_codigo}</div>
                  <div style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {qr.id_nome}{qr.company?.name ? ` · ${qr.company.name}` : ""}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
