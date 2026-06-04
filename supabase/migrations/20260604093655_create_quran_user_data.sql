/*
  # Quran Web App - User Data Schema

  ## Overview
  This migration creates all tables needed for the Quran Web Book application.
  It stores user-specific data such as bookmarks, reading progress, favorites,
  and reading history. Quran content itself is fetched from the Quran.com API.

  ## New Tables

  ### 1. `user_profiles`
  - Extended profile data for authenticated users
  - Stores preferences like font size, translation language, theme

  ### 2. `bookmarks`
  - User-saved page bookmarks with optional notes
  - References page number, surah, and ayah

  ### 3. `reading_progress`
  - Tracks the user's last read position (page number)
  - One record per user, updated on read

  ### 4. `favorite_ayahs`
  - User's favorited/starred individual ayahs
  - Stores chapter number, verse number, and Arabic text

  ### 5. `reading_history`
  - Log of reading sessions with timestamps
  - Used for analytics and "continue reading" feature

  ## Security
  - RLS enabled on ALL tables
  - Users can only access their own data
  - No cross-user data access possible
*/

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text DEFAULT '',
  font_size integer DEFAULT 24,
  translation_language text DEFAULT 'en',
  show_translation boolean DEFAULT true,
  show_transliteration boolean DEFAULT false,
  theme text DEFAULT 'light',
  reciter_id integer DEFAULT 7,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_number integer NOT NULL,
  chapter_number integer,
  verse_number integer,
  chapter_name_arabic text DEFAULT '',
  chapter_name_english text DEFAULT '',
  note text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS bookmarks_page_number_idx ON bookmarks(page_number);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks"
  ON bookmarks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Reading progress table (one row per user)
CREATE TABLE IF NOT EXISTS reading_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_page integer DEFAULT 1,
  current_chapter integer DEFAULT 1,
  current_verse integer DEFAULT 1,
  total_pages_read integer DEFAULT 0,
  last_read_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reading_progress_user_id_idx ON reading_progress(user_id);

ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON reading_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON reading_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON reading_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Favorite ayahs table
CREATE TABLE IF NOT EXISTS favorite_ayahs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_number integer NOT NULL,
  verse_number integer NOT NULL,
  verse_key text NOT NULL,
  arabic_text text DEFAULT '',
  translation_text text DEFAULT '',
  page_number integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, verse_key)
);

CREATE INDEX IF NOT EXISTS favorite_ayahs_user_id_idx ON favorite_ayahs(user_id);
CREATE INDEX IF NOT EXISTS favorite_ayahs_verse_key_idx ON favorite_ayahs(verse_key);

ALTER TABLE favorite_ayahs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorite_ayahs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorite_ayahs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorite_ayahs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Reading history table
CREATE TABLE IF NOT EXISTS reading_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_number integer NOT NULL,
  chapter_number integer,
  session_date date DEFAULT CURRENT_DATE,
  read_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reading_history_user_id_idx ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS reading_history_session_date_idx ON reading_history(session_date);

ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history"
  ON reading_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON reading_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own history"
  ON reading_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
