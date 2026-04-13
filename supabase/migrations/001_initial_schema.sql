-- Enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'gestor', 'operador');

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  address TEXT,
  city TEXT,
  state TEXT DEFAULT 'SP',
  zip_code TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  phone TEXT,
  email TEXT,
  contract_info TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User profiles (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'operador',
  phone TEXT,
  company_id UUID REFERENCES companies(id),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Locations
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Service types
CREATE TABLE service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- QR Codes (cabins)
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id),
  id_codigo TEXT NOT NULL,
  id_nome TEXT NOT NULL,
  qr_value TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, id_codigo)
);

-- Work Orders
CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number BIGINT GENERATED ALWAYS AS IDENTITY,
  bubble_id TEXT UNIQUE,
  company_id UUID REFERENCES companies(id),
  qr_code_id UUID REFERENCES qr_codes(id),
  employee_id UUID REFERENCES profiles(id),
  service_type_id UUID REFERENCES service_types(id),
  qr_code_data TEXT,
  id_codigo TEXT,
  id_nome TEXT,
  company_name TEXT,
  company_address TEXT,
  responsible_name TEXT,
  service_type TEXT,
  observation TEXT,
  photo_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  geo_accuracy DOUBLE PRECISION,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_work_orders_company ON work_orders(company_id);
CREATE INDEX idx_work_orders_employee ON work_orders(employee_id);
CREATE INDEX idx_work_orders_qr_code ON work_orders(qr_code_id);
CREATE INDEX idx_work_orders_completed ON work_orders(completed_at DESC);
CREATE INDEX idx_work_orders_date_range ON work_orders(company_id, completed_at DESC);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email, 'operador');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_qr_codes_updated_at BEFORE UPDATE ON qr_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Dashboard stats function
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_company_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'os_today', (SELECT COUNT(*) FROM work_orders WHERE company_id = p_company_id AND completed_at::date = CURRENT_DATE),
    'os_month', (SELECT COUNT(*) FROM work_orders WHERE company_id = p_company_id AND completed_at >= date_trunc('month', CURRENT_DATE)),
    'active_cabins', (SELECT COUNT(*) FROM qr_codes WHERE company_id = p_company_id AND is_active = TRUE),
    'active_employees', (SELECT COUNT(*) FROM profiles WHERE company_id = p_company_id AND is_active = TRUE AND role = 'operador')
  );
$$ LANGUAGE sql STABLE;

-- OS per day function
CREATE OR REPLACE FUNCTION get_os_per_day(p_company_id UUID, p_days INT DEFAULT 30)
RETURNS TABLE(date DATE, count BIGINT) AS $$
  SELECT completed_at::date AS date, COUNT(*) AS count
  FROM work_orders
  WHERE company_id = p_company_id AND completed_at >= CURRENT_DATE - p_days
  GROUP BY completed_at::date
  ORDER BY date;
$$ LANGUAGE sql STABLE;

-- SLA alerts function
CREATE OR REPLACE FUNCTION get_sla_alerts(p_company_id UUID, p_threshold_hours INT DEFAULT 4)
RETURNS TABLE(qr_code_id UUID, id_codigo TEXT, id_nome TEXT, last_cleaned TIMESTAMPTZ, hours_since DOUBLE PRECISION) AS $$
  SELECT q.id, q.id_codigo, q.id_nome,
         MAX(wo.completed_at) AS last_cleaned,
         EXTRACT(EPOCH FROM (now() - MAX(wo.completed_at))) / 3600 AS hours_since
  FROM qr_codes q
  LEFT JOIN work_orders wo ON wo.qr_code_id = q.id
  WHERE q.company_id = p_company_id AND q.is_active = TRUE
  GROUP BY q.id, q.id_codigo, q.id_nome
  HAVING MAX(wo.completed_at) IS NULL
     OR EXTRACT(EPOCH FROM (now() - MAX(wo.completed_at))) / 3600 > p_threshold_hours
  ORDER BY hours_since DESC NULLS FIRST;
$$ LANGUAGE sql STABLE;
