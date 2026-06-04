import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          display_name: string;
          font_size: number;
          translation_language: string;
          show_translation: boolean;
          show_transliteration: boolean;
          theme: string;
          reciter_id: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          page_number: number;
          chapter_number: number | null;
          verse_number: number | null;
          chapter_name_arabic: string;
          chapter_name_english: string;
          note: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookmarks']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['bookmarks']['Insert']>;
      };
      reading_progress: {
        Row: {
          id: string;
          user_id: string;
          current_page: number;
          current_chapter: number;
          current_verse: number;
          total_pages_read: number;
          last_read_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reading_progress']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['reading_progress']['Insert']>;
      };
      favorite_ayahs: {
        Row: {
          id: string;
          user_id: string;
          chapter_number: number;
          verse_number: number;
          verse_key: string;
          arabic_text: string;
          translation_text: string;
          page_number: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['favorite_ayahs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['favorite_ayahs']['Insert']>;
      };
      reading_history: {
        Row: {
          id: string;
          user_id: string;
          page_number: number;
          chapter_number: number | null;
          session_date: string;
          read_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reading_history']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['reading_history']['Insert']>;
      };
    };
  };
};
