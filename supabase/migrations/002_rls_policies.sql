-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles policies
CREATE POLICY profiles_select ON profiles FOR SELECT USING (
  id = auth.uid() OR (auth.user_role() IN ('admin', 'gestor') AND company_id = auth.user_company_id())
);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (
  id = auth.uid() OR auth.user_role() = 'admin'
);
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (true);

-- Companies policies
CREATE POLICY companies_select ON companies FOR SELECT USING (
  id = auth.user_company_id() OR auth.user_role() = 'admin'
);
CREATE POLICY companies_insert ON companies FOR INSERT WITH CHECK (auth.user_role() = 'admin');
CREATE POLICY companies_update ON companies FOR UPDATE USING (auth.user_role() = 'admin');
CREATE POLICY companies_delete ON companies FOR DELETE USING (auth.user_role() = 'admin');

-- Locations policies
CREATE POLICY locations_select ON locations FOR SELECT USING (company_id = auth.user_company_id());
CREATE POLICY locations_insert ON locations FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'gestor'));
CREATE POLICY locations_update ON locations FOR UPDATE USING (auth.user_role() IN ('admin', 'gestor'));
CREATE POLICY locations_delete ON locations FOR DELETE USING (auth.user_role() = 'admin');

-- QR Codes policies
CREATE POLICY qr_codes_select ON qr_codes FOR SELECT USING (company_id = auth.user_company_id());
CREATE POLICY qr_codes_insert ON qr_codes FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'gestor'));
CREATE POLICY qr_codes_update ON qr_codes FOR UPDATE USING (auth.user_role() IN ('admin', 'gestor'));
CREATE POLICY qr_codes_delete ON qr_codes FOR DELETE USING (auth.user_role() = 'admin');

-- Work Orders policies
CREATE POLICY work_orders_select ON work_orders FOR SELECT USING (company_id = auth.user_company_id());
CREATE POLICY work_orders_insert ON work_orders FOR INSERT WITH CHECK (company_id = auth.user_company_id());
CREATE POLICY work_orders_update ON work_orders FOR UPDATE USING (auth.user_role() IN ('admin', 'gestor'));
CREATE POLICY work_orders_delete ON work_orders FOR DELETE USING (auth.user_role() = 'admin');

-- Service Types policies
CREATE POLICY service_types_select ON service_types FOR SELECT USING (true);
CREATE POLICY service_types_insert ON service_types FOR INSERT WITH CHECK (auth.user_role() = 'admin');
CREATE POLICY service_types_update ON service_types FOR UPDATE USING (auth.user_role() = 'admin');
