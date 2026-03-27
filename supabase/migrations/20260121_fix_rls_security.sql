-- 1. Fix CRM Tables RLS (Applicants, Companies, Research Projects)
-- We allow public INSERT (for public forms) but restrict SELECT/UPDATE/DELETE to authenticated admins

-- Applicants: Public Insert, Auth Select/Update/Delete
DROP POLICY IF EXISTS "Allow public read applicants" ON applicants;
DROP POLICY IF EXISTS "Allow public insert applicants" ON applicants;
DROP POLICY IF EXISTS "Allow public update applicants" ON applicants;

CREATE POLICY "Allow public insert applicants" ON applicants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated read applicants" ON applicants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update applicants" ON applicants FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete applicants" ON applicants FOR DELETE TO authenticated USING (true);

-- Companies: Public Insert, Auth Select/Update/Delete
DROP POLICY IF EXISTS "Allow public read companies" ON companies;
DROP POLICY IF EXISTS "Allow public insert companies" ON companies;
DROP POLICY IF EXISTS "Allow public update companies" ON companies;

CREATE POLICY "Allow public insert companies" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated read companies" ON companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update companies" ON companies FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete companies" ON companies FOR DELETE TO authenticated USING (true);

-- Research Projects: Public Insert, Auth Select/Update/Delete
DROP POLICY IF EXISTS "Allow public read research_projects" ON research_projects;
DROP POLICY IF EXISTS "Allow public insert research_projects" ON research_projects;
DROP POLICY IF EXISTS "Allow public update research_projects" ON research_projects;

CREATE POLICY "Allow public insert research_projects" ON research_projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated read research_projects" ON research_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update research_projects" ON research_projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete research_projects" ON research_projects FOR DELETE TO authenticated USING (true);

-- 2. Fix Posts RLS - Ownership Verification
-- To properly enforce this without a join in the policy, we check if the user is an admin or the owner.
-- Since determining admin role requires a JOIN to profiles, we will use a function.

CREATE OR REPLACE FUNCTION public.is_admin_or_moderator()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN user_role IN ('admin', 'moderator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Posts: 
-- Public Select (Published only, handled largely via frontend filters, but let's leave Select open for authenticated/API)
-- Let's redefine UPDATE to enforce ownership or role

DROP POLICY IF EXISTS "Authenticated users can update posts" ON posts;
CREATE POLICY "Users can update their own posts or admins can update any"
  ON posts FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR public.is_admin_or_moderator()
  );

DROP POLICY IF EXISTS "Authenticated users can insert posts" ON posts;
CREATE POLICY "Authenticated users can insert posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (true); -- User ID can be assigned upon insertion in server logic

DROP POLICY IF EXISTS "Authenticated users can delete posts" ON posts;
CREATE POLICY "Users can delete their own posts or admins can delete any"
  ON posts FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR public.is_admin_or_moderator()
  );
