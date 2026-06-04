'use client';

import { useState, useEffect, useCallback } from 'react';
import { searchQuran } from '@/lib/quran-api';
import { useQuran } from '@/contexts/QuranContext';
import { cn } from '@/lib/utils';
import { Search, X, Loader2, BookOpen } from 'lucide-react';

interface SearchModalProps {
  onClose: () => void;
}

export function SearchModal({ onClose }: SearchModalProps) {
  const { state, goToPage, setHighlightedVerse } = useQuran();
  const { surahs } = state;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    verse_key: string;
    text: string;
    page_number: number;
    chapter_id: number;
    verse_number: number;
    highlighted?: { text?: string };
  }[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [surahFilter, setSurahFilter] = useState('');

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchQuran(q.trim(), 1, 20);
      setResults(data.results ?? []);
      setTotalCount(data.total_count ?? 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 400);
    return () => clearTimeout(t);
  }, [query, doSearch]);

  // Surah jump
  const filteredSurahs = surahFilter
    ? surahs.filter(
        (s) =>
          s.name_simple.toLowerCase().includes(surahFilter.toLowerCase()) ||
          s.name_arabic.includes(surahFilter) ||
          s.name_translation.toLowerCase().includes(surahFilter.toLowerCase()) ||
          String(s.id) === surahFilter
      )
    : [];

  function handleResultClick(pageNumber: number, verseKey: string) {
    goToPage(pageNumber);
    setHighlightedVerse(verseKey);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-200 dark:border-stone-700">
          <Search className="w-5 h-5 text-stone-400 flex-shrink-0" />
          <input
            type="text"
            value={query || surahFilter}
            onChange={(e) => {
              const val = e.target.value;
              // Detect if it's Arabic
              if (/[\u0600-\u06FF]/.test(val)) {
                setQuery(val);
                setSurahFilter('');
              } else {
                setSurahFilter(val);
                setQuery('');
              }
            }}
            placeholder="Search surah, ayah, or Arabic text..."
            className="flex-1 text-base font-inter bg-transparent outline-none text-stone-800 dark:text-stone-100 placeholder:text-stone-400"
            autoFocus
            dir="auto"
          />
          {loading && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin flex-shrink-0" />}
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* Surah results */}
          {filteredSurahs.length > 0 && (
            <div className="p-2">
              <p className="text-[10px] text-stone-400 font-inter px-2 py-1 uppercase tracking-wider">Surahs</p>
              {filteredSurahs.slice(0, 5).map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    goToPage(s.pages[0]);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-stone-800 transition-colors text-right"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-stone-700 text-emerald-800 dark:text-emerald-300 text-xs font-inter flex items-center justify-center flex-shrink-0">
                    {s.id}
                  </span>
                  <div className="flex-1">
                    <p className="font-amiri text-base text-stone-800 dark:text-stone-100">{s.name_arabic}</p>
                    <p className="text-xs text-stone-500 font-inter">{s.name_simple} — {s.name_translation}</p>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-inter">p.{s.pages[0]}</span>
                </button>
              ))}
            </div>
          )}

          {/* Arabic text search results */}
          {results.length > 0 && (
            <div className="p-2">
              <p className="text-[10px] text-stone-400 font-inter px-2 py-1 uppercase tracking-wider">
                Verses ({totalCount} total)
              </p>
              {results.map((r) => {
                const surah = surahs.find((s) => s.id === r.chapter_id);
                return (
                  <button
                    key={r.verse_key}
                    onClick={() => handleResultClick(r.page_number, r.verse_key)}
                    className="w-full flex flex-col gap-1 px-3 py-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-stone-800 transition-colors text-right mb-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone-400 font-inter">
                        {surah?.name_simple} • {r.verse_key} • p.{r.page_number}
                      </span>
                      <BookOpen className="w-3 h-3 text-emerald-500" />
                    </div>
                    <p
                      className="font-amiri text-sm text-stone-800 dark:text-stone-100 leading-relaxed line-clamp-3"
                      dir="rtl"
                      dangerouslySetInnerHTML={{
                        __html: r.highlighted?.text ?? r.text,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!loading && query && results.length === 0 && !filteredSurahs.length && (
            <div className="py-12 text-center">
              <p className="text-stone-400 font-inter text-sm">No results found for &quot;{query}&quot;</p>
            </div>
          )}

          {/* Initial state */}
          {!query && !surahFilter && (
            <div className="py-8 px-4">
              <p className="text-stone-400 font-inter text-sm text-center mb-4">
                Search by surah name, ayah number, or Arabic text
              </p>
              <div className="grid grid-cols-2 gap-2">
                {['Al-Fatiha', 'Al-Baqarah', 'Yasin', 'Al-Kahf', 'Al-Mulk', 'Al-Rahman'].map((name) => (
                  <button
                    key={name}
                    onClick={() => setSurahFilter(name)}
                    className="text-left text-sm px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors font-inter"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
