export interface Surah {
  id: number;
  revelation_place: 'makkah' | 'madinah';
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  name_translation: string;
  verses_count: number;
  pages: [number, number];
}

export interface Verse {
  id: number;
  verse_number: number;
  verse_key: string;
  hizb_number: number;
  rub_el_hizb_number: number;
  ruku_number: number;
  manzil_number: number;
  sajdah_described: boolean;
  page_number: number;
  juz_number: number;
  text_uthmani: string;
  text_uthmani_tajweed?: string;
  words?: Word[];
  translations?: Translation[];
  audio?: VerseAudio;
}

export interface Word {
  id: number;
  position: number;
  audio_url: string | null;
  char_type_name: string;
  line_number: number;
  page_number: number;
  text: string;
  text_uthmani: string;
  translation?: {
    text: string;
    language_name: string;
  };
  transliteration?: {
    text: string;
    language_name: string;
  };
}

export interface Translation {
  id: number;
  resource_id: number;
  text: string;
  resource_name?: string;
  language_name?: string;
}

export interface VerseAudio {
  url: string;
  duration: number;
  segments?: number[][];
}

export interface Juz {
  id: number;
  juz_number: number;
  verse_mapping: Record<string, string>;
  first_verse_id: number;
  last_verse_id: number;
  verses_count: number;
}

export interface PageData {
  page_number: number;
  verses: Verse[];
  meta: {
    filters: {
      page_number: number;
    };
    next_page: number | null;
  };
}

export interface SearchResult {
  query: string;
  total_count: number;
  current_page: number;
  per_page: number;
  results: {
    id: number;
    verse_key: string;
    text: string;
    page_number: number;
    chapter_id: number;
    verse_number: number;
    highlighted?: {
      text: string;
      translations?: string[];
    };
  }[];
}

export interface Reciter {
  id: number;
  reciter_name: string;
  style: {
    name: string;
    description: string;
  } | null;
  translated_name: {
    name: string;
    language_name: string;
  };
}

export interface AudioFile {
  id: number;
  chapter_id: number;
  file_size: number;
  format: string;
  audio_url: string;
  duration: number;
}

// User data types
export interface Bookmark {
  id: string;
  user_id: string;
  page_number: number;
  chapter_number?: number;
  verse_number?: number;
  chapter_name_arabic?: string;
  chapter_name_english?: string;
  note?: string;
  created_at: string;
}

export interface ReadingProgress {
  id: string;
  user_id: string;
  current_page: number;
  current_chapter: number;
  current_verse: number;
  total_pages_read: number;
  last_read_at: string;
}

export interface FavoriteAyah {
  id: string;
  user_id: string;
  chapter_number: number;
  verse_number: number;
  verse_key: string;
  arabic_text: string;
  translation_text: string;
  page_number: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  display_name: string;
  font_size: number;
  translation_language: string;
  show_translation: boolean;
  show_transliteration: boolean;
  theme: string;
  reciter_id: number;
}

export type TranslationLanguage = 'en' | 'bn';

export interface ReaderSettings {
  fontSize: number;
  translationLanguage: TranslationLanguage;
  showTranslation: boolean;
  showTransliteration: boolean;
  reciterId: number;
}

export const TRANSLATION_IDS: Record<TranslationLanguage, number> = {
  en: 131, // Dr. Mustafa Khattab (The Clear Quran)
  bn: 161, // Muhiuddin Khan (Bengali)
};

export const DEFAULT_RECITER_ID = 7; // Mishari Rashid Al-`Afasy
