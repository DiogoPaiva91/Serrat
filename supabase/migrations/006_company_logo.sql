-- Logo da empresa: coluna em companies mais o bucket publico que guarda o arquivo.

ALTER TABLE companies ADD COLUMN logo_url TEXT;

COMMENT ON COLUMN companies.logo_url IS
  'URL publica do logo no bucket company-logos. Aceita tambem URL externa colada a mao.';

-- ============================================================
-- Bucket
-- ============================================================
-- Publico de proposito: logo de cliente nao e dado sensivel, e leitura publica
-- dispensa signed URL em toda listagem e em todo PDF de relatorio.
-- A escrita continua fechada nas policies abaixo.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('company-logos', 'company-logos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Convencao de nome <recurso>_<acao>, igual as policies de tabela da 002.
CREATE POLICY company_logos_select ON storage.objects FOR SELECT USING (
  bucket_id = 'company-logos'
);

CREATE POLICY company_logos_insert ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'company-logos' AND public.current_user_role() = 'admin'
);

CREATE POLICY company_logos_update ON storage.objects FOR UPDATE USING (
  bucket_id = 'company-logos' AND public.current_user_role() = 'admin'
);

CREATE POLICY company_logos_delete ON storage.objects FOR DELETE USING (
  bucket_id = 'company-logos' AND public.current_user_role() = 'admin'
);
