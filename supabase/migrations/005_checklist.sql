-- Checklist de higienizacao: catalogo global, respostas por OS, anormalidades com foto e status da OS.

-- ============================================================
-- 0. Pre-requisito: helpers de RLS
-- ============================================================
-- A 002_rls_policies.sql declara essas duas como auth.user_role() e auth.user_company_id(), mas
-- elas nunca chegaram a este banco, e o schema auth e bloqueado para escrita
-- (42501 permission denied for schema auth). Ficam em public, com prefixo
-- current_ para nao colidir com o enum user_role.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT role FROM profiles WHERE id = auth.uid();
$fn$;

CREATE OR REPLACE FUNCTION public.current_user_company_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT company_id FROM profiles WHERE id = auth.uid();
$fn$;

-- ============================================================
-- 1. Status da ordem de servico
-- ============================================================
-- TEXT com CHECK em vez de enum: ALTER TYPE ... ADD VALUE nao roda dentro de
-- transacao, o que quebraria o push. NOT NULL DEFAULT nao reescreve a tabela no
-- PG 11+, entao as linhas existentes viram 'concluida' de graca e o insert atual
-- do ScannerPage continua funcionando sem mudanca.
ALTER TABLE work_orders ADD COLUMN status TEXT NOT NULL DEFAULT 'concluida';

ALTER TABLE work_orders
  ADD CONSTRAINT work_orders_status_check CHECK (status IN ('concluida', 'sem_acesso'));

COMMENT ON COLUMN work_orders.status IS
  'concluida = higienizacao executada; sem_acesso = operador nao conseguiu acesso, exige foto em work_order_issues';

-- Parcial: quase tudo e 'concluida', so vale indexar a excecao.
CREATE INDEX idx_work_orders_status ON work_orders (status) WHERE status <> 'concluida';

-- ============================================================
-- 2. Catalogo global de checklist
-- ============================================================
-- Sem company_id de proposito: o catalogo e unico para todas as empresas,
-- mesmo padrao de service_types.
CREATE TABLE checklist_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES checklist_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (category_id, name)
);

CREATE INDEX idx_checklist_items_category ON checklist_items (category_id, sort_order);

CREATE TRIGGER update_checklist_categories_updated_at BEFORE UPDATE ON checklist_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON checklist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. Respostas do checklist, uma linha por item
-- ============================================================
-- Linha por item e nao JSONB porque o relatorio mensal agrupa por item
-- (count filter where status = 'nao_ok' group by item_name).
-- category_name e item_name sao snapshot, no mesmo estilo que work_orders ja
-- usa para company_name e id_codigo: renomear ou apagar um item do catalogo
-- nao pode corromper relatorio antigo.
CREATE TABLE work_order_checklist_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES checklist_items(id) ON DELETE SET NULL,
  category_name TEXT NOT NULL,
  item_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ok',
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT wo_answers_status_check CHECK (status IN ('ok', 'nao_ok', 'nao_aplica')),
  CONSTRAINT wo_answers_unique UNIQUE (work_order_id, item_id)
);

CREATE INDEX idx_wo_answers_work_order ON work_order_checklist_answers (work_order_id);
CREATE INDEX idx_wo_answers_item ON work_order_checklist_answers (item_id);
CREATE INDEX idx_wo_answers_reprovado ON work_order_checklist_answers (created_at DESC)
  WHERE status = 'nao_ok';

-- ============================================================
-- 4. Anormalidades e comprovacao de falta de acesso
-- ============================================================
-- As duas coisas na mesma tabela, separadas por kind: sao o mesmo objeto
-- (texto mais foto ligados a uma OS) e assim dividem a mesma politica de storage.
-- Uma foto por linha: duas quebras sao duas linhas.
CREATE TABLE work_order_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'anormalidade',
  checklist_item_id UUID REFERENCES checklist_items(id) ON DELETE SET NULL,
  item_name TEXT,
  description TEXT,
  photo_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT wo_issues_kind_check CHECK (kind IN ('anormalidade', 'sem_acesso')),
  CONSTRAINT wo_issues_photo_required CHECK (kind <> 'sem_acesso' OR photo_path IS NOT NULL)
);

CREATE INDEX idx_wo_issues_work_order ON work_order_issues (work_order_id);
CREATE INDEX idx_wo_issues_created ON work_order_issues (created_at DESC);
CREATE INDEX idx_wo_issues_kind ON work_order_issues (kind);

-- ============================================================
-- 5. RLS
-- ============================================================
ALTER TABLE checklist_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_checklist_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_issues ENABLE ROW LEVEL SECURITY;

-- Mesmo estilo dos helpers da secao 0.
-- SECURITY DEFINER para a policy da tabela filha nao esbarrar na RLS de work_orders.
CREATE OR REPLACE FUNCTION public.work_order_company_id(p_work_order_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT company_id FROM work_orders WHERE id = p_work_order_id;
$fn$;

-- Catalogo: leitura global e escrita so admin, mesmo padrao de service_types.
-- Diferenca proposital: service_types nao tem policy de DELETE, e por isso o
-- deleteMutation de useTiposDeServico apaga zero linhas em silencio. Aqui tem.
CREATE POLICY checklist_categories_select ON checklist_categories FOR SELECT USING (true);
CREATE POLICY checklist_categories_insert ON checklist_categories FOR INSERT WITH CHECK (public.current_user_role() = 'admin');
CREATE POLICY checklist_categories_update ON checklist_categories FOR UPDATE USING (public.current_user_role() = 'admin');
CREATE POLICY checklist_categories_delete ON checklist_categories FOR DELETE USING (public.current_user_role() = 'admin');

CREATE POLICY checklist_items_select ON checklist_items FOR SELECT USING (true);
CREATE POLICY checklist_items_insert ON checklist_items FOR INSERT WITH CHECK (public.current_user_role() = 'admin');
CREATE POLICY checklist_items_update ON checklist_items FOR UPDATE USING (public.current_user_role() = 'admin');
CREATE POLICY checklist_items_delete ON checklist_items FOR DELETE USING (public.current_user_role() = 'admin');

-- Respostas e anormalidades: leitura pela empresa da OS.
-- O ramo 'admin OR' e obrigatorio porque todo admin tem company_id nulo e
-- company_id = public.current_user_company_id() esconderia tudo dele.
-- Nao existe policy de INSERT para anon: quem grava pelo operador e a Edge
-- Function operador-finalizar-os, com service role, que ignora RLS.
CREATE POLICY work_order_checklist_answers_select ON work_order_checklist_answers FOR SELECT USING (
  public.current_user_role() = 'admin' OR public.work_order_company_id(work_order_id) = public.current_user_company_id()
);
CREATE POLICY work_order_checklist_answers_insert ON work_order_checklist_answers FOR INSERT WITH CHECK (
  public.current_user_role() IN ('admin', 'gestor')
);
CREATE POLICY work_order_checklist_answers_update ON work_order_checklist_answers FOR UPDATE USING (
  public.current_user_role() IN ('admin', 'gestor')
);
CREATE POLICY work_order_checklist_answers_delete ON work_order_checklist_answers FOR DELETE USING (
  public.current_user_role() = 'admin'
);

CREATE POLICY work_order_issues_select ON work_order_issues FOR SELECT USING (
  public.current_user_role() = 'admin' OR public.work_order_company_id(work_order_id) = public.current_user_company_id()
);
CREATE POLICY work_order_issues_insert ON work_order_issues FOR INSERT WITH CHECK (
  public.current_user_role() IN ('admin', 'gestor')
);
CREATE POLICY work_order_issues_update ON work_order_issues FOR UPDATE USING (
  public.current_user_role() IN ('admin', 'gestor')
);
CREATE POLICY work_order_issues_delete ON work_order_issues FOR DELETE USING (
  public.current_user_role() = 'admin'
);

-- ============================================================
-- 6. Seed do catalogo pedido pelo cliente
-- ============================================================
-- Vai dentro da migration e nao no seed.sql porque producao roda migration e
-- nao roda seed. UUID sintetico seguindo a convencao do seed.sql
-- (a = companies, b = locations, c = service_types), entao d = categorias e e = itens.
INSERT INTO checklist_categories (id, name, description, sort_order) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Lavagem dos itens', 'Itens que exigem lavagem', 1),
  ('d0000000-0000-0000-0000-000000000002', 'Itens de limpeza',  'Superficies higienizadas', 2),
  ('d0000000-0000-0000-0000-000000000003', 'Itens de higiene',  'Reposicao de insumos', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO checklist_items (id, category_id, name, sort_order) VALUES
  ('e0000000-0000-0000-0000-000000000101', 'd0000000-0000-0000-0000-000000000001', 'Pia', 1),
  ('e0000000-0000-0000-0000-000000000102', 'd0000000-0000-0000-0000-000000000001', 'Vaso sanitário', 2),
  ('e0000000-0000-0000-0000-000000000103', 'd0000000-0000-0000-0000-000000000001', 'Mictório', 3),
  ('e0000000-0000-0000-0000-000000000104', 'd0000000-0000-0000-0000-000000000001', 'Lixeira', 4),
  ('e0000000-0000-0000-0000-000000000201', 'd0000000-0000-0000-0000-000000000002', 'Porta', 1),
  ('e0000000-0000-0000-0000-000000000202', 'd0000000-0000-0000-0000-000000000002', 'Janela', 2),
  ('e0000000-0000-0000-0000-000000000203', 'd0000000-0000-0000-0000-000000000002', 'Piso', 3),
  ('e0000000-0000-0000-0000-000000000204', 'd0000000-0000-0000-0000-000000000002', 'Paredes', 4),
  ('e0000000-0000-0000-0000-000000000301', 'd0000000-0000-0000-0000-000000000003', 'Papel higiênico', 1),
  ('e0000000-0000-0000-0000-000000000302', 'd0000000-0000-0000-0000-000000000003', 'Papel toalha', 2),
  ('e0000000-0000-0000-0000-000000000303', 'd0000000-0000-0000-0000-000000000003', 'Sabonete líquido', 3),
  ('e0000000-0000-0000-0000-000000000304', 'd0000000-0000-0000-0000-000000000003', 'Saco de lixo', 4)
ON CONFLICT (id) DO NOTHING;
