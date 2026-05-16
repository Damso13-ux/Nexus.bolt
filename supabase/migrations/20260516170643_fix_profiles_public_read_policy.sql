/*
  # Fix profiles RLS for public author info

  1. Security Changes
    - Add SELECT policy on `profiles` for anonymous and authenticated users
      to read basic author info (needed for article author display)
    - This allows reading profiles that are referenced as article authors
    - Policy is scoped: only profiles that are authors of published articles can be read

  2. Important Notes
    - Without this policy, article queries with author joins fail silently
      for non-admin users due to RLS blocking profile reads
    - The existing "Users can read own profile" policy remains unchanged
*/

CREATE POLICY "Anyone can read author profiles"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM articles
      WHERE articles.author_id = profiles.id
        AND articles.is_published = true
    )
  );
