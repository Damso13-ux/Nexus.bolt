/*
  # Fix recursive RLS on profiles by using a SECURITY DEFINER function

  1. Changes
    - Create `is_admin()` function with SECURITY DEFINER to bypass RLS when checking admin role
    - Replace all admin-checking policies across all tables to use `is_admin()` instead of
      subquerying profiles (which caused recursive RLS evaluation and silent failures)
    - This fixes: articles not loading for authenticated users, profile not loading,
      admin pages not accessible

  2. Affected Tables
    - profiles: "Admins can read all profiles" policy
    - articles: all 4 admin policies
    - article_tags: admin insert/delete policies  
    - article_views: admin read policy
    - categories: admin insert/update/delete policies
    - tags: admin insert/update/delete policies
    - newsletters: admin insert/update policies

  3. Security
    - `is_admin()` uses SECURITY DEFINER to read profiles without RLS
    - Function is owned by postgres and only checks the current auth.uid()
    - All existing policies are dropped and recreated with the new function
*/

-- Create a SECURITY DEFINER function to check admin without RLS recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ========== PROFILES ==========
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin());

-- ========== ARTICLES ==========
DROP POLICY IF EXISTS "Admins can read all articles" ON articles;
CREATE POLICY "Admins can read all articles"
  ON articles FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can insert articles" ON articles;
CREATE POLICY "Admins can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update articles" ON articles;
CREATE POLICY "Admins can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete articles" ON articles;
CREATE POLICY "Admins can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (is_admin());

-- ========== ARTICLE_TAGS ==========
DROP POLICY IF EXISTS "Admins can insert article_tags" ON article_tags;
CREATE POLICY "Admins can insert article_tags"
  ON article_tags FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete article_tags" ON article_tags;
CREATE POLICY "Admins can delete article_tags"
  ON article_tags FOR DELETE
  TO authenticated
  USING (is_admin());

-- ========== ARTICLE_VIEWS ==========
DROP POLICY IF EXISTS "Admins can read all views" ON article_views;
CREATE POLICY "Admins can read all views"
  ON article_views FOR SELECT
  TO authenticated
  USING (is_admin());

-- ========== CATEGORIES ==========
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update categories" ON categories;
CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (is_admin());

-- ========== TAGS ==========
DROP POLICY IF EXISTS "Admins can insert tags" ON tags;
CREATE POLICY "Admins can insert tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update tags" ON tags;
CREATE POLICY "Admins can update tags"
  ON tags FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete tags" ON tags;
CREATE POLICY "Admins can delete tags"
  ON tags FOR DELETE
  TO authenticated
  USING (is_admin());

-- ========== NEWSLETTERS ==========
DROP POLICY IF EXISTS "Admins can manage newsletters" ON newsletters;
CREATE POLICY "Admins can insert newsletters"
  ON newsletters FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can update newsletters" ON newsletters;
CREATE POLICY "Admins can update newsletters"
  ON newsletters FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
