import {
  Surah,
  PageData,
  SearchResult,
  Reciter,
  AudioFile,
  Verse,
  TRANSLATION_IDS,
  TranslationLanguage,
} from './types';

const BASE_URL = 'https://api.quran.com/api/v4';

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Quran API error: ${res.status} ${path}`);
  return res.json();
}

export async function fetchSurahs(): Promise<Surah[]> {
  const data = await apiFetch<{ chapters: Surah[] }>('/chapters', { language: 'en' });
  return data.chapters;
}

export async function fetchSurah(id: number): Promise<Surah> {
  const data = await apiFetch<{ chapter: Surah }>(`/chapters/${id}`, { language: 'en' });
  return data.chapter;
}

export async function fetchPageVerses(
  pageNumber: number,
  translationLanguage: TranslationLanguage = 'en'
): Promise<PageData> {
  const translationId = TRANSLATION_IDS[translationLanguage];
  const data = await apiFetch<{ verses: Verse[]; meta: PageData['meta'] }>(
    `/verses/by_page/${pageNumber}`,
    {
      words: 'false',
      translations: String(translationId),
      audio: '7',
      fields: 'text_uthmani,verse_key,verse_number,page_number,juz_number,hizb_number,ruku_number,sajdah_described',
      per_page: '50',
      page: '1',
    }
  );
  return {
    page_number: pageNumber,
    verses: data.verses,
    meta: data.meta,
  };
}

export async function fetchVersesByChapter(
  chapterNumber: number,
  translationLanguage: TranslationLanguage = 'en',
  page = 1
): Promise<{ verses: Verse[]; meta: { total_count: number; current_page: number; next_page: number | null } }> {
  const translationId = TRANSLATION_IDS[translationLanguage];
  return apiFetch<{
    verses: Verse[];
    meta: { total_count: number; current_page: number; next_page: number | null };
  }>(`/verses/by_chapter/${chapterNumber}`, {
    words: 'false',
    translations: String(translationId),
    fields: 'text_uthmani,verse_key,verse_number,page_number,juz_number',
    per_page: '50',
    page: String(page),
  });
}

export async function searchQuran(
  query: string,
  page = 1,
  perPage = 20
): Promise<SearchResult> {
  return apiFetch<SearchResult>('/search', {
    q: query,
    size: String(perPage),
    page: String(page),
    language: 'en',
  });
}

export async function fetchReciters(): Promise<Reciter[]> {
  const data = await apiFetch<{ audio_files: Reciter[] }>('/resources/recitations', {
    language: 'en',
  });
  return data.audio_files;
}

export async function fetchChapterAudio(
  reciterId: number,
  chapterId: number
): Promise<AudioFile> {
  const data = await apiFetch<{ audio_file: AudioFile }>(
    `/chapter_recitations/${reciterId}/${chapterId}`
  );
  return data.audio_file;
}

export async function fetchVerseAudioFiles(
  reciterId: number,
  chapterId: number
): Promise<{ audio_files: { verse_key: string; url: string; duration: number }[] }> {
  return apiFetch(`/recitations/${reciterId}/by_chapter/${chapterId}`, {
    per_page: '300',
    page: '1',
  });
}

// Map verse_key to page number using the verse data
export function getPageFromVerseKey(verseKey: string, surahs: Surah[]): number {
  const [chapterStr] = verseKey.split(':');
  const chapter = parseInt(chapterStr, 10);
  const surah = surahs.find((s) => s.id === chapter);
  return surah?.pages[0] ?? 1;
}

export const TOTAL_PAGES = 604;
export const TOTAL_SURAHS = 114;
