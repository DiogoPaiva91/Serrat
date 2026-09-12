import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Search, X, Plus, Pencil, Trash2, ChevronUp, ChevronDown, ListChecks, AlertTriangle } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { useChecklistCatalog, type ChecklistCategory, type ChecklistItem } from "@/hooks/useChecklistCatalog";
import { ChecklistCategoryForm } from "@/components/forms/ChecklistCategoryForm";
import { ChecklistItemForm } from "@/components/forms/ChecklistItemForm";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { dsButton } from "@/pages/work-orders/WorkOrdersPage";
import { mensagemDeErro } from "@/lib/db-errors";

/* ═══ COLORS ═══ */
const LIGHT = {
  primary: "#eab308", primaryDark: "#ca8a04",
  azul: "#2563eb", verde: "#16a34a", laranja: "#f97316", vermelho: "#dc2626", roxo: "#7c3aed",
  cardBg: "#ffffff", cardBorder: "#e2e8f0",
  textTitle: "#171717", textBody: "#404040", textMuted: "#64748b", textLight: "#94a3b8",
  surfaceSoft: "#f8fafc",
};
const DARK = {
  primary: "#facc15", primaryDark: "#eab308",
  azul: "#60a5fa", verde: "#34d399", laranja: "#fb923c", vermelho: "#ef6b6b", roxo: "#a78bfa",
  cardBg: "#222222", cardBorder: "#2e2e2e",
  textTitle: "#fafafa", textBody: "#e2e2e8", textMuted: "#6b7280", textLight: "#4b5563",
  surfaceSoft: "#1e1e1e",
};

const cardRadius = "10px 10px 10px 18px";

/* ═══ ICONS ═══ */
const Ic = {
  checklist: (s: number, c: string) => (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="15" rx="2" stroke={c} strokeWidth="1.4" />
      <path d="M6.5 8.5l1.4 1.4 2.8-2.8M6.5 13l1.4 1.4 2.8-2.8" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 8.5h1.5M13 13h1.5" stroke={c} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
};

export function ChecklistsPage() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const C = dark ? DARK : LIGHT;

  const {
    data: categories, isLoading, isError, error,
    createCategoryMutation, updateCategoryMutation, deleteCategoryMutation,
    createItemMutation, updateItemMutation, deleteItemMutation,
    swapOrderMutation,
  } = useChecklistCatalog();

  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const [catFormOpen, setCatFormOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<ChecklistCategory | null>(null);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [itemDefaultCat, setItemDefaultCat] = useState<string>("");
  const [confirm, setConfirm] = useState<{ kind: "categoria" | "item"; id: string; name: string } | null>(null);

  const all = useMemo(() => categories || [], [categories]);

  /* Busca casa por categoria ou por item. Categoria que casa pelo nome mantem todos os itens. */
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all
      .filter((c) => showInactive || c.is_active)
      .map((c) => {
        const items = (c.items || []).filter((i) => showInactive || i.is_active);
        if (!q) return { ...c, items };
        const catMatch = c.name.toLowerCase().includes(q);
        return { ...c, items: catMatch ? items : items.filter((i) => i.name.toLowerCase().includes(q)) };
      })
      .filter((c) => !search.trim() || c.name.toLowerCase().includes(search.trim().toLowerCase()) || c.items.length > 0);
  }, [all, search, showInactive]);

  const totalItens = all.reduce((n, c) => n + (c.items?.length || 0), 0);
  const itensAtivos = all.reduce((n, c) => n + (c.items || []).filter((i) => i.is_active).length, 0);

  const heroStats = [
    { label: "Categorias", value: all.length, color: C.azul },
    { label: "Itens ativos", value: `${itensAtivos}/${totalItens}`, color: C.verde },
  ];

  /* ── Acoes ── */
  const handleCatSubmit = (data: { name: string; description: string }) => {
    if (editingCat) {
      updateCategoryMutation.mutate(
        { id: editingCat.id, ...data },
        { onSuccess: () => toast.success("Categoria atualizada"), onError: (e: any) => toast.error(mensagemDeErro(e)) }
      );
    } else {
      const sort_order = all.length ? Math.max(...all.map((c) => c.sort_order)) + 1 : 1;
      createCategoryMutation.mutate(
        { ...data, sort_order },
        { onSuccess: () => toast.success("Categoria criada"), onError: (e: any) => toast.error(mensagemDeErro(e)) }
      );
    }
    setCatFormOpen(false);
    setEditingCat(null);
  };

  const handleItemSubmit = (data: { name: string; category_id: string }) => {
    if (editingItem) {
      updateItemMutation.mutate(
        { id: editingItem.id, ...data },
        { onSuccess: () => toast.success("Item atualizado"), onError: (e: any) => toast.error(mensagemDeErro(e)) }
      );
    } else {
      const cat = all.find((c) => c.id === data.category_id);
      const sort_order = cat?.items?.length ? Math.max(...cat.items.map((i) => i.sort_order)) + 1 : 1;
      createItemMutation.mutate(
        { ...data, sort_order },
        { onSuccess: () => toast.success("Item criado"), onError: (e: any) => toast.error(mensagemDeErro(e)) }
      );
    }
    setItemFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = () => {
    if (!confirm) return;
    const mutation = confirm.kind === "categoria" ? deleteCategoryMutation : deleteItemMutation;
    mutation.mutate(confirm.id, {
      onSuccess: () => toast.success(`${confirm.kind === "categoria" ? "Categoria excluída" : "Item excluído"}`),
      onError: (e: any) => toast.error(mensagemDeErro(e)),
    });
    setConfirm(null);
  };

  const swap = (table: "checklist_categories" | "checklist_items", list: { id: string; sort_order: number }[], index: number, dir: -1 | 1) => {
    const a = list[index];
    const b = list[index + dir];
    if (!a || !b) return;
    swapOrderMutation.mutate({ table, a, b }, { onError: (e: any) => toast.error(mensagemDeErro(e)) });
  };

  /* ── Estilos locais ── */
  const cardStyle: React.CSSProperties = {
    background: dark ? "rgba(255,255,255,0.08)" : C.cardBg,
    backdropFilter: dark ? "blur(8px)" : undefined,
    border: `1px solid ${dark ? "rgba(255,255,255,0.10)" : C.cardBorder}`,
    borderRadius: cardRadius,
    boxShadow: dark ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
  };

  const arrowStyle = (disabled: boolean): React.CSSProperties => ({
    width: 20, height: 16, borderRadius: 4,
    border: `1px solid ${dark ? C.cardBorder : "#e2e8f0"}`,
    background: "transparent", color: C.textMuted,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.3 : 1,
    padding: 0, transition: "all .15s",
  });

  const iconBtn = (color: string): React.CSSProperties => ({
    width: 26, height: 26, borderRadius: 6,
    border: `1px solid ${dark ? C.cardBorder : "#e2e8f0"}`,
    background: "transparent", color,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", transition: "all .15s", padding: 0,
  });

  const Toggle = ({ on, onClick, title }: { on: boolean; onClick: () => void; title: string }) => (
    <span
      role="switch" aria-checked={on} title={title} onClick={onClick}
      style={{
        width: 34, height: 19, borderRadius: 20, flexShrink: 0, cursor: "pointer",
        background: on ? C.verde : (dark ? "#3f3f46" : "#cbd5e1"),
        position: "relative", transition: "background .15s",
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: on ? 17 : 2, width: 15, height: 15,
        borderRadius: "50%", background: "#fff", transition: "left .15s",
      }} />
    </span>
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: C.textBody }} className="space-y-5">
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.ds-btn:active{transform:scale(0.97)}`}</style>

      {/* ═══ HERO ═══ */}
      <div style={{
        background: dark
          ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
          : "linear-gradient(135deg, #1e3a5f 0%, #0f3460 40%, #1a1a2e 100%)",
        borderRadius: "16px 16px 16px 28px",
        padding: "24px 28px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, pointerEvents: "none" }}>
          <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none">
            <line x1="0" y1="20" x2="400" y2="100" stroke="white" strokeWidth="1" />
            <line x1="0" y1="60" x2="400" y2="30" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex shrink-0 items-center justify-center" style={{
              width: 52, height: 52, borderRadius: 14,
              background: `linear-gradient(135deg, ${C.primary}20, ${C.primaryDark}10)`,
              border: `1px solid ${C.primary}30`,
            }}>
              {Ic.checklist(24, C.primary)}
            </div>
            <div className="min-w-0">
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.2, margin: 0 }}>
                Check<span style={{ color: C.primary }}>lists</span>
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                Catalogo global de categorias e itens conferidos pelo operador
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {heroStats.map((s) => (
                <div key={s.label} style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "3px 10px", borderRadius: 20,
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
                  <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.45)" }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
            <Button
              onClick={() => { setEditingCat(null); setCatFormOpen(true); }}
              className="shrink-0 border-white/20 text-white hover:bg-white/10 bg-white/[0.08]"
              variant="outline"
            >
              <Plus className="h-4 w-4" /> Nova categoria
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ TOOLBAR ═══ */}
      <div style={cardStyle}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "12px 16px" }}>
          <div
            onClick={(e) => { const input = e.currentTarget.querySelector("input"); input?.focus(); }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              height: 35, minWidth: 200, maxWidth: 320, flex: 1,
              padding: "0 12px", borderRadius: 8, cursor: "text",
              border: `1.5px solid ${searchFocused ? C.primary : (dark ? C.cardBorder : "#CBD5E1")}`,
              boxShadow: searchFocused ? `0 0 0 3px ${C.primary}20` : "none",
              background: dark ? "transparent" : C.cardBg, transition: "all .15s",
            }}
          >
            <Search className="h-[15px] w-[15px] shrink-0" style={{ color: C.textMuted, opacity: 0.8 }} />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              placeholder="Buscar categoria ou item..."
              style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, color: C.textBody, minWidth: 0 }}
            />
            {search && (
              <span onClick={(e) => { e.stopPropagation(); setSearch(""); }} style={{ cursor: "pointer", opacity: 0.6, display: "flex" }}>
                <X className="h-[14px] w-[14px]" style={{ color: C.textMuted }} />
              </span>
            )}
          </div>

          <button className="ds-btn" style={dsButton(showInactive, C, dark)} onClick={() => setShowInactive((v) => !v)}>
            {showInactive ? "Ocultar inativos" : "Mostrar inativos"}
          </button>

          <div style={{ flex: 1 }} />

          <button
            className="ds-btn"
            style={dsButton(false, C, dark)}
            onClick={() => { setEditingItem(null); setItemDefaultCat(all[0]?.id || ""); setItemFormOpen(true); }}
            disabled={all.length === 0}
          >
            <Plus className="h-3.5 w-3.5" /> Novo item
          </button>
        </div>
      </div>

      {/* ═══ CATEGORIAS ═══ */}
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 w-full" style={{ borderRadius: cardRadius }} />)}
        </div>
      ) : isError ? (
        <div style={{ ...cardStyle, padding: "44px 24px", textAlign: "center" }}>
          <AlertTriangle className="h-9 w-9 mx-auto mb-3" style={{ color: C.laranja }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: C.textTitle, margin: 0 }}>Nao foi possivel carregar o catalogo</p>
          <p style={{ fontSize: 12, color: C.textMuted, margin: "4px 0 0" }}>{mensagemDeErro(error)}</p>
          <p style={{ fontSize: 11, color: C.textLight, margin: "10px 0 0" }}>
            Se a mensagem fala em tabela inexistente, a migration 005_checklist.sql ainda nao foi aplicada no banco.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div style={{ ...cardStyle, padding: "56px 24px", textAlign: "center" }}>
          <ListChecks className="h-9 w-9 mx-auto mb-3" style={{ color: C.textLight }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: C.textTitle, margin: 0 }}>
            {search ? "Nada encontrado" : "Nenhuma categoria cadastrada"}
          </p>
          <p style={{ fontSize: 12, color: C.textMuted, margin: "4px 0 0" }}>
            {search ? "Tente outro termo de busca" : "Crie a primeira categoria para montar o checklist do operador"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((cat, ci) => (
            <div key={cat.id} style={{ ...cardStyle, overflow: "hidden", opacity: cat.is_active ? 1 : 0.6 }}>
              {/* header da categoria */}
              <div style={{
                display: "flex", alignItems: "center", gap: 12, padding: "13px 16px",
                borderBottom: `1px solid ${dark ? C.cardBorder : "#f1f5f9"}`,
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <button style={arrowStyle(ci === 0)} disabled={ci === 0}
                    onClick={() => swap("checklist_categories", visible, ci, -1)} title="Subir categoria">
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button style={arrowStyle(ci === visible.length - 1)} disabled={ci === visible.length - 1}
                    onClick={() => swap("checklist_categories", visible, ci, 1)} title="Descer categoria">
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.textTitle }}>{cat.name}</div>
                  {cat.description && (
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>{cat.description}</div>
                  )}
                </div>

                <span style={{
                  fontSize: 10, fontWeight: 700, color: C.azul,
                  background: `${C.azul}12`, border: `1px solid ${C.azul}25`,
                  padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap",
                }}>
                  {cat.items.length} {cat.items.length === 1 ? "item" : "itens"}
                </span>

                <Toggle
                  on={cat.is_active}
                  title={cat.is_active ? "Desativar categoria" : "Ativar categoria"}
                  onClick={() => updateCategoryMutation.mutate(
                    { id: cat.id, is_active: !cat.is_active },
                    { onError: (e: any) => toast.error(mensagemDeErro(e)) }
                  )}
                />

                <button style={iconBtn(C.textMuted)} title="Editar categoria"
                  onClick={() => { setEditingCat(cat); setCatFormOpen(true); }}>
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button style={iconBtn(C.vermelho)} title="Excluir categoria"
                  onClick={() => setConfirm({ kind: "categoria", id: cat.id, name: cat.name })}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* itens */}
              {cat.items.length === 0 ? (
                <div style={{ padding: "20px 16px", fontSize: 12, color: C.textMuted, textAlign: "center" }}>
                  Nenhum item nesta categoria
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: dark ? "rgba(255,255,255,0.03)" : C.surfaceSoft }}>
                      {["Ordem", "Item", "Ativo", ""].map((h, i) => (
                        <th key={h || i} style={{
                          fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px",
                          color: C.textMuted, textAlign: i === 3 ? "right" : "left",
                          padding: "9px 16px", borderBottom: `1px solid ${dark ? C.cardBorder : "#f1f5f9"}`,
                          width: i === 0 ? 90 : i === 2 ? 70 : i === 3 ? 90 : undefined,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cat.items.map((item, ii) => (
                      <tr key={item.id} style={{ opacity: item.is_active ? 1 : 0.55 }}>
                        <td style={{ padding: "9px 16px", borderBottom: `1px solid ${dark ? C.cardBorder : "#f1f5f9"}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: C.textLight, width: 12 }}>{ii + 1}</span>
                            <button style={arrowStyle(ii === 0)} disabled={ii === 0}
                              onClick={() => swap("checklist_items", cat.items, ii, -1)} title="Subir item">
                              <ChevronUp className="h-3 w-3" />
                            </button>
                            <button style={arrowStyle(ii === cat.items.length - 1)} disabled={ii === cat.items.length - 1}
                              onClick={() => swap("checklist_items", cat.items, ii, 1)} title="Descer item">
                              <ChevronDown className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: "9px 16px", fontSize: 13, color: C.textBody, borderBottom: `1px solid ${dark ? C.cardBorder : "#f1f5f9"}` }}>
                          {item.name}
                        </td>
                        <td style={{ padding: "9px 16px", borderBottom: `1px solid ${dark ? C.cardBorder : "#f1f5f9"}` }}>
                          <Toggle
                            on={item.is_active}
                            title={item.is_active ? "Desativar item" : "Ativar item"}
                            onClick={() => updateItemMutation.mutate(
                              { id: item.id, is_active: !item.is_active },
                              { onError: (e: any) => toast.error(mensagemDeErro(e)) }
                            )}
                          />
                        </td>
                        <td style={{ padding: "9px 16px", borderBottom: `1px solid ${dark ? C.cardBorder : "#f1f5f9"}` }}>
                          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                            <button style={iconBtn(C.textMuted)} title="Editar item"
                              onClick={() => { setEditingItem(item); setItemFormOpen(true); }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button style={iconBtn(C.vermelho)} title="Excluir item"
                              onClick={() => setConfirm({ kind: "item", id: item.id, name: item.name })}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div style={{
                padding: "10px 16px",
                background: dark ? "rgba(255,255,255,0.02)" : C.surfaceSoft,
                borderTop: `1px solid ${dark ? C.cardBorder : "#f1f5f9"}`,
              }}>
                <button className="ds-btn" style={dsButton(false, C, dark)}
                  onClick={() => { setEditingItem(null); setItemDefaultCat(cat.id); setItemFormOpen(true); }}>
                  <Plus className="h-3.5 w-3.5" /> Adicionar item
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ChecklistCategoryForm
        open={catFormOpen}
        onOpenChange={(o) => { setCatFormOpen(o); if (!o) setEditingCat(null); }}
        initialData={editingCat ? { name: editingCat.name, description: editingCat.description || "" } : null}
        onSubmit={handleCatSubmit}
      />

      <ChecklistItemForm
        open={itemFormOpen}
        onOpenChange={(o) => { setItemFormOpen(o); if (!o) setEditingItem(null); }}
        initialData={editingItem
          ? { name: editingItem.name, category_id: editingItem.category_id }
          : { name: "", category_id: itemDefaultCat }}
        categories={all.map((c) => ({ id: c.id, name: c.name }))}
        onSubmit={handleItemSubmit}
      />

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => { if (!o) setConfirm(null); }}
        title={confirm?.kind === "categoria" ? "Excluir categoria" : "Excluir item"}
        description={
          confirm?.kind === "categoria"
            ? `"${confirm?.name}" e todos os itens dela serão excluídos. Os checklists já respondidos continuam intactos, com o nome do item preservado. Para tirar do celular sem excluir, use o botão de ativo.`
            : `"${confirm?.name}" será excluído do catálogo. Os checklists já respondidos continuam intactos, com o nome do item preservado. Para tirar do celular sem excluir, use o botão de ativo.`
        }
        onConfirm={handleDelete}
      />
    </div>
  );
}
