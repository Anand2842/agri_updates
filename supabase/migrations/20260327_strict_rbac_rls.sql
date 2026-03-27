-- 1. Create helper functions for explicit role checking via profiles

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN user_role IN ('admin', 'moderator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Categories Table RLS Fix
-- Migration: 20260120_categories_and_authors.sql
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;

CREATE POLICY "Admins can insert categories" ON categories FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update categories" ON categories FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can delete categories" ON categories FOR DELETE TO authenticated USING (public.is_admin());


-- 3. Authors Table RLS Fix 
-- Migration: 20260112_create_authors.sql
DROP POLICY IF EXISTS "Admins can insert authors" ON authors;
DROP POLICY IF EXISTS "Admins can update authors" ON authors;
DROP POLICY IF EXISTS "Admins can delete authors" ON authors;

CREATE POLICY "Admins can insert authors" ON authors FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update authors" ON authors FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can delete authors" ON authors FOR DELETE TO authenticated USING (public.is_admin());


-- 4. Hubs Table RLS Fix
-- Migration: add_hubs_table.sql
DROP POLICY IF EXISTS "Admins can insert hubs" ON hubs;
DROP POLICY IF EXISTS "Admins can update hubs" ON hubs;
DROP POLICY IF EXISTS "Admins can delete hubs" ON hubs;

CREATE POLICY "Admins can insert hubs" ON hubs FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update hubs" ON hubs FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can delete hubs" ON hubs FOR DELETE TO authenticated USING (public.is_admin());


-- 5. Posts Table RLS Fix
-- Migration: 20260121_fix_rls_security.sql
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON posts;

CREATE POLICY "Staff can insert posts" ON posts FOR INSERT TO authenticated WITH CHECK (public.is_staff());


-- 6. Ads Table RLS Fix
-- Migration: create_ads_table.sql
DROP POLICY IF EXISTS "Admins can insert ads" ON ads;
DROP POLICY IF EXISTS "Admins can update ads" ON ads;
DROP POLICY IF EXISTS "Admins can delete ads" ON ads;

CREATE POLICY "Admins can insert ads" ON ads FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update ads" ON ads FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can delete ads" ON ads FOR DELETE TO authenticated USING (public.is_admin());
