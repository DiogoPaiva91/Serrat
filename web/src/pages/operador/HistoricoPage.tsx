import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { RefreshCw, Inbox } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface WorkOrderRecord {
  id: string;
  id_codigo: string;
  id_nome: string;
  company_name: string;
  company_address: string;
  completed_at: string;
}

const P = { yellow: "#eab308", yellowLight: "#facc15", dark: "#1a1a2e", darkAlt: "#0f3460" };

export function HistoricoPage() {
  const [filter, setFilter] = useState<"hoje" | "semana" | "mes">("hoje");
  const [orders, setOrders] = useState<WorkOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) { setOrders([]); setLoading(false); return; }
      const now = new Date();
      let dateFrom: Date;
      if (filter === "hoje") dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      else if (filter === "semana") dateFrom = new Date(now.getTime() - 7 * 86400000);
      else dateFrom = new Date(now.getTime() - 30 * 86400000);

      const { data, error } = await supabase
        .from("work_orders")
        .select("id, id_codigo, id_nome, company_name, company_address, completed_at")
        .gte("completed_at", dateFrom.toISOString())
        .order("completed_at", { ascending: false })
        .limit(50);

      if (error) { console.error("[HISTORICO]", error); setOrders([]); }
      else setOrders(data || []);
    } catch (err) { console.error("[HISTORICO]", err); setOrders([]); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const todayCount = orders.filter((o) => {
    const d = new Date(o.completed_at);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
  }).length;

  const card: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0" };

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Stats card */}
      <div style={{ ...card, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderLeft: `3px solid ${P.yellow}` }}>
        <div>
          <p style={{ fontSize: 28, fontWeight: 800, color: P.yellow, margin: 0, lineHeight: 1 }}>{todayCount}</p>
          <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, margin: "4px 0 0", textTransform: "uppercase" }}>OS realizadas hoje</p>
        </div>
        <button onClick={fetchOrders} style={{
          width: 36, height: 36, borderRadius: 10, border: "1px solid #e2e8f0",
          background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "#94a3b8",
        }}>
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 8 }}>
        {(["hoje", "semana", "mes"] as const).map((f) => {
          const isActive = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              flex: 1, padding: "10px 0", borderRadius: 12, fontSize: 12, fontWeight: 700,
              border: isActive ? "none" : "1px solid #e2e8f0",
              background: isActive ? `linear-gradient(135deg, ${P.yellowLight}, ${P.yellow})` : "#fff",
              color: isActive ? "#1a1a1a" : "#64748b",
              cursor: "pointer", transition: "all .15s",
              boxShadow: isActive ? "0 4px 12px rgba(234,179,8,0.25)" : "none",
            }}>
              {f === "hoje" ? "Hoje" : f === "semana" ? "7 dias" : "30 dias"}
            </button>
          );
        })}
      </div>

      {/* Title */}
      <div style={{ textAlign: "center", padding: "4px 0" }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: P.yellow, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
          Ordens de Serviço Finalizadas
        </h3>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0" }}>
          <div style={{ width: 32, height: 32, border: `3px solid ${P.yellow}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <Inbox size={40} style={{ color: "#cbd5e1", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>Nenhuma OS neste periodo</p>
        </div>
      ) : (
        <div style={{ ...card, overflow: "hidden", padding: 0 }}>
          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "85px 1fr 95px",
            background: `linear-gradient(135deg, ${P.dark}, ${P.darkAlt})`,
          }}>
            <div style={{ padding: "10px 12px" }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0, lineHeight: 1.3 }}>Data<br />Hora</p>
            </div>
            <div style={{ padding: "10px 12px", textAlign: "center" }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0, lineHeight: 1.3 }}>Empresa<br /><span style={{ fontWeight: 400, color: "rgba(255,255,255,0.45)" }}>Endereco</span></p>
            </div>
            <div style={{ padding: "10px 12px", textAlign: "center" }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>QR Code</p>
            </div>
          </div>

          {/* Rows */}
          {orders.map((order, i) => (
            <div key={order.id} style={{
              display: "grid", gridTemplateColumns: "85px 1fr 95px",
              borderTop: "1px solid #f1f5f9",
              background: i % 2 === 0 ? "#fff" : "#fafbfc",
            }}>
              <div style={{ padding: "10px 12px" }}>
                <p style={{ fontSize: 11, color: "#64748b", margin: 0, lineHeight: 1.4, fontFamily: "monospace" }}>{formatDate(order.completed_at)}</p>
              </div>
              <div style={{ padding: "10px 12px", textAlign: "center" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#171717", margin: 0, lineHeight: 1.3 }}>{order.company_name || "—"}</p>
                <p style={{ fontSize: 9, color: "#94a3b8", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {order.company_address ? `${order.company_address.substring(0, 35)}...` : "—"}
                </p>
              </div>
              <div style={{ padding: "10px 12px", textAlign: "center" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: P.yellow, margin: 0 }}>{order.id_codigo}</p>
                <p style={{ fontSize: 10, color: "#94a3b8", margin: "2px 0 0" }}>{order.id_nome}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
