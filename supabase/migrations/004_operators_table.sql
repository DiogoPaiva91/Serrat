-- Simple operators table for name suggestions in scanner
CREATE TABLE operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_id UUID REFERENCES companies(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_operators_name ON operators (LOWER(name));
CREATE INDEX idx_operators_active ON operators (is_active) WHERE is_active = TRUE;

-- Seed from existing work_orders responsible_name
INSERT INTO operators (name, company_id)
SELECT DISTINCT responsible_name, company_id
FROM work_orders
WHERE responsible_name IS NOT NULL AND responsible_name != ''
ON CONFLICT DO NOTHING;

-- RLS disabled for now
