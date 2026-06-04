'use client';

import { createContext, useContext, useEffect, useReducer, useCallback, ReactNode } from 'react';
import { Surah, ReaderSettings, TranslationLanguage, Bookmark, FavoriteAyah, ReadingProgress } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { fetchSurahs } from '@/lib/quran-api';

interface QuranState {
  currentPage: number;
  surahs: Surah[];
  settings: ReaderSettings;
  bookmarks: Bookmark[];
  favorites: FavoriteAyah[];
  progress: ReadingProgress | null;
  userId: string | null;
  isLoading: boolean;
  highlightedVerseKey: string | null;
  playingVerseKey: string | null;
  isPlaying: boolean;
  currentAudioUrl: string | null;
}

type QuranAction =
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_SURAHS'; surahs: Surah[] }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<ReaderSettings> }
  | { type: 'SET_BOOKMARKS'; bookmarks: Bookmark[] }
  | { type: 'SET_FAVORITES'; favorites: FavoriteAyah[] }
  | { type: 'SET_PROGRESS'; progress: ReadingProgress }
  | { type: 'SET_USER'; userId: string | null }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_HIGHLIGHTED_VERSE'; verseKey: string | null }
  | { type: 'SET_PLAYING_VERSE'; verseKey: string | null; audioUrl?: string | null }
  | { type: 'SET_IS_PLAYING'; isPlaying: boolean };

const defaultSettings: ReaderSettings = {
  fontSize: 26,
  translationLanguage: 'en',
  showTranslation: false,
  showTransliteration: false,
  reciterId: 7,
};

function reducer(state: QuranState, action: QuranAction): QuranState {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, currentPage: action.page };
    case 'SET_SURAHS':
      return { ...state, surahs: action.surahs };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case 'SET_BOOKMARKS':
      return { ...state, bookmarks: action.bookmarks };
    case 'SET_FAVORITES':
      return { ...state, favorites: action.favorites };
    case 'SET_PROGRESS':
      return { ...state, progress: action.progress };
    case 'SET_USER':
      return { ...state, userId: action.userId };
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };
    case 'SET_HIGHLIGHTED_VERSE':
      return { ...state, highlightedVerseKey: action.verseKey };
    case 'SET_PLAYING_VERSE':
      return {
        ...state,
        playingVerseKey: action.verseKey,
        currentAudioUrl: action.audioUrl ?? null,
      };
    case 'SET_IS_PLAYING':
      return { ...state, isPlaying: action.isPlaying };
    default:
      return state;
  }
}

const initialState: QuranState = {
  currentPage: 1,
  surahs: [],
  settings: defaultSettings,
  bookmarks: [],
  favorites: [],
  progress: null,
  userId: null,
  isLoading: true,
  highlightedVerseKey: null,
  playingVerseKey: null,
  isPlaying: false,
  currentAudioUrl: null,
};

interface QuranContextValue {
  state: QuranState;
  goToPage: (page: number) => void;
  updateSettings: (settings: Partial<ReaderSettings>) => void;
  toggleBookmark: (pageNumber: number, surahName?: string, surahNameAr?: string) => Promise<void>;
  toggleFavorite: (ayah: Omit<FavoriteAyah, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  isBookmarked: (pageNumber: number) => boolean;
  isFavorited: (verseKey: string) => boolean;
  setHighlightedVerse: (verseKey: string | null) => void;
  setPlayingVerse: (verseKey: string | null, audioUrl?: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  saveProgress: (page: number, chapter?: number, verse?: number) => Promise<void>;
}

const QuranContext = createContext<QuranContextValue | null>(null);

export function QuranProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // Load saved settings from localStorage
    try {
      const saved = localStorage.getItem('quran-settings');
      if (saved) {
        dispatch({ type: 'UPDATE_SETTINGS', settings: JSON.parse(saved) });
      }
      const savedPage = localStorage.getItem('quran-last-page');
      if (savedPage) {
        dispatch({ type: 'SET_PAGE', page: parseInt(savedPage, 10) });
      }
    } catch {
      // ignore
    }

    // Load surahs
    fetchSurahs()
      .then((surahs) => dispatch({ type: 'SET_SURAHS', surahs }))
      .catch(console.error);

    // Auth listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id ?? null;
      dispatch({ type: 'SET_USER', userId: uid });
      if (uid) loadUserData(uid);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const uid = session?.user?.id ?? null;
      dispatch({ type: 'SET_USER', userId: uid });
      if (uid) loadUserData(uid);
      else {
        dispatch({ type: 'SET_BOOKMARKS', bookmarks: [] });
        dispatch({ type: 'SET_FAVORITES', favorites: [] });
      }
    });

    dispatch({ type: 'SET_LOADING', loading: false });
    return () => subscription.unsubscribe();
  }, []);

  async function loadUserData(uid: string) {
    const [bookmarksRes, favoritesRes, progressRes] = await Promise.all([
      supabase.from('bookmarks').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('favorite_ayahs').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('reading_progress').select('*').eq('user_id', uid).maybeSingle(),
    ]);
    if (bookmarksRes.data) dispatch({ type: 'SET_BOOKMARKS', bookmarks: bookmarksRes.data });
    if (favoritesRes.data) dispatch({ type: 'SET_FAVORITES', favorites: favoritesRes.data });
    if (progressRes.data) {
      dispatch({ type: 'SET_PROGRESS', progress: progressRes.data });
      dispatch({ type: 'SET_PAGE', page: progressRes.data.current_page });
    }
  }

  const goToPage = useCallback((page: number) => {
    const clamped = Math.max(1, Math.min(604, page));
    dispatch({ type: 'SET_PAGE', page: clamped });
    localStorage.setItem('quran-last-page', String(clamped));
  }, []);

  const updateSettings = useCallback((settings: Partial<ReaderSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings });
    try {
      const current = JSON.parse(localStorage.getItem('quran-settings') ?? '{}');
      localStorage.setItem('quran-settings', JSON.stringify({ ...current, ...settings }));
    } catch {
      // ignore
    }
  }, []);

  const toggleBookmark = useCallback(async (
    pageNumber: number,
    surahName?: string,
    surahNameAr?: string
  ) => {
    if (!state.userId) return;
    const existing = state.bookmarks.find((b) => b.page_number === pageNumber);
    if (existing) {
      await supabase.from('bookmarks').delete().eq('id', existing.id);
      dispatch({
        type: 'SET_BOOKMARKS',
        bookmarks: state.bookmarks.filter((b) => b.id !== existing.id),
      });
    } else {
      const { data } = await supabase.from('bookmarks').insert({
        user_id: state.userId,
        page_number: pageNumber,
        chapter_name_english: surahName ?? '',
        chapter_name_arabic: surahNameAr ?? '',
      }).select().maybeSingle();
      if (data) dispatch({ type: 'SET_BOOKMARKS', bookmarks: [data, ...state.bookmarks] });
    }
  }, [state.userId, state.bookmarks]);

  const toggleFavorite = useCallback(async (
    ayah: Omit<FavoriteAyah, 'id' | 'user_id' | 'created_at'>
  ) => {
    if (!state.userId) return;
    const existing = state.favorites.find((f) => f.verse_key === ayah.verse_key);
    if (existing) {
      await supabase.from('favorite_ayahs').delete().eq('id', existing.id);
      dispatch({
        type: 'SET_FAVORITES',
        favorites: state.favorites.filter((f) => f.id !== existing.id),
      });
    } else {
      const { data } = await supabase.from('favorite_ayahs').insert({
        user_id: state.userId,
        ...ayah,
      }).select().maybeSingle();
      if (data) dispatch({ type: 'SET_FAVORITES', favorites: [data, ...state.favorites] });
    }
  }, [state.userId, state.favorites]);

  const isBookmarked = useCallback((pageNumber: number) => {
    return state.bookmarks.some((b) => b.page_number === pageNumber);
  }, [state.bookmarks]);

  const isFavorited = useCallback((verseKey: string) => {
    return state.favorites.some((f) => f.verse_key === verseKey);
  }, [state.favorites]);

  const setHighlightedVerse = useCallback((verseKey: string | null) => {
    dispatch({ type: 'SET_HIGHLIGHTED_VERSE', verseKey });
  }, []);

  const setPlayingVerse = useCallback((verseKey: string | null, audioUrl?: string | null) => {
    dispatch({ type: 'SET_PLAYING_VERSE', verseKey, audioUrl });
  }, []);

  const setIsPlaying = useCallback((playing: boolean) => {
    dispatch({ type: 'SET_IS_PLAYING', isPlaying: playing });
  }, []);

  const saveProgress = useCallback(async (page: number, chapter = 1, verse = 1) => {
    if (!state.userId) return;
    const payload = {
      user_id: state.userId,
      current_page: page,
      current_chapter: chapter,
      current_verse: verse,
      last_read_at: new Date().toISOString(),
    };
    await supabase.from('reading_progress').upsert(payload, { onConflict: 'user_id' });
  }, [state.userId]);

  return (
    <QuranContext.Provider value={{
      state,
      goToPage,
      updateSettings,
      toggleBookmark,
      toggleFavorite,
      isBookmarked,
      isFavorited,
      setHighlightedVerse,
      setPlayingVerse,
      setIsPlaying,
      saveProgress,
    }}>
      {children}
    </QuranContext.Provider>
  );
}

export function useQuran() {
  const ctx = useContext(QuranContext);
  if (!ctx) throw new Error('useQuran must be used within QuranProvider');
  return ctx;
}
