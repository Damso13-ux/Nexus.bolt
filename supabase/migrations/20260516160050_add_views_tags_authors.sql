/*
  # Add views tracking, tags, and multi-author support

  1. New Tables
    - `article_views`
      - `id` (uuid, primary key)
      - `article_id` (uuid, FK to articles)
      - `user_id` (uuid, nullable, FK to profiles)
      - `viewed_at` (timestamptz)
      - `session_id` (text) - for anonymous view deduplication
    - `tags`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `created_at` (timestamptz)
    - `article_tags`
      - `article_id` (uuid, FK to articles)
      - `tag_id` (uuid, FK to tags)
      - Primary key on (article_id, tag_id)
    - `reading_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to profiles)
      - `article_id` (uuid, FK to articles)
      - `read_at` (timestamptz)
      - `progress` (integer, 0-100) - reading progress percentage
      - Unique on (user_id, article_id)

  2. Modified Tables
    - `profiles`
      - Add `avatar_url` (text) - profile picture URL
      - Add `bio` (text) - short biography
      - Add `preferred_categories` (text[]) - preferred category slugs
      - Add `dark_mode` (boolean) - UI preference
      - Add `author_slug` (text, unique) - for multi-author public pages

  3. Security
    - Enable RLS on all new tables
    - article_views: anyone can insert, admins can read all
    - tags: anyone can read, admins can CRUD
    - article_tags: anyone can read, admins can CRUD
    - reading_history: users manage own

  4. Indexes
    - article_views on article_id, viewed_at
    - tags on slug
    - reading_history on user_id
*/

-- article_views table
CREATE TABLE IF NOT EXISTS article_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  session_id text,
  viewed_at timestamptz DEFAULT now()
);

ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a view"
  ON article_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon can record a view"
  ON article_views FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Admins can read all views"
  ON article_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can read own views"
  ON article_views FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_article_views_article ON article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_date ON article_views(viewed_at DESC);

-- tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tags"
  ON tags FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can update tags"
  ON tags FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can delete tags"
  ON tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- article_tags junction table
CREATE TABLE IF NOT EXISTS article_tags (
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read article_tags"
  ON article_tags FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert article_tags"
  ON article_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can delete article_tags"
  ON article_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- reading_history table
CREATE TABLE IF NOT EXISTS reading_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  read_at timestamptz DEFAULT now(),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  UNIQUE(user_id, article_id)
);

ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own history"
  ON reading_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own history"
  ON reading_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own history"
  ON reading_history FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_reading_history_user ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_article ON reading_history(article_id);

-- Add new columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio text DEFAULT '';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferred_categories'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferred_categories text[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'dark_mode'
  ) THEN
    ALTER TABLE profiles ADD COLUMN dark_mode boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'author_slug'
  ) THEN
    ALTER TABLE profiles ADD COLUMN author_slug text UNIQUE;
  END IF;
END $$;

-- Seed some default tags
INSERT INTO tags (name, slug) VALUES
  ('Bitcoin', 'bitcoin'),
  ('Ethereum', 'ethereum'),
  ('IA Générative', 'ia-generative'),
  ('Machine Learning', 'machine-learning'),
  ('Bourse', 'bourse'),
  ('Trading', 'trading'),
  ('Ransomware', 'ransomware'),
  ('Vie privée', 'vie-privee'),
  ('Blockchain', 'blockchain'),
  ('Régulation', 'regulation'),
  ('Startup', 'startup'),
  ('Open Source', 'open-source')
ON CONFLICT (name) DO NOTHING;

-- Create a view for article view counts (convenience)
CREATE OR REPLACE VIEW article_view_counts AS
SELECT
  article_id,
  COUNT(*) as view_count,
  COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_views
FROM article_views
GROUP BY article_id;
