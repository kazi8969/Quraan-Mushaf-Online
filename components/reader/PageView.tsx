'use client';

import { useEffect, useState, memo } from 'react';
import { fetchPageVerses } from '@/lib/quran-api';
import { Verse, PageData } from '@/lib/types';
import { useQuran } from '@/contexts/QuranContext';
import { AyahDisplay } from './AyahDisplay';
import { BismillahHeader } from './BismillahHeader';
import { SurahHeader } from './SurahHeader';
import { cn } from '@/lib/utils';

interface PageViewProps {
  pageNumber: number;
  side: 'left' | 'right' | 'single';
}

function groupVersesBySurah(verses: Verse[]): Map<number, Verse[]> {
  const map = new Map<number, Verse[]>();
  for (const v of verses) {
    const [chStr] = v.verse_key.split(':');
    const ch = parseInt(chStr, 10);
    if (!map.has(ch)) map.set(ch, []);
    map.get(ch)!.push(v);
  }
  return map;
}

export const PageView = memo(function PageView({ pageNumber, side }: PageViewProps) {
  const { state } = useQuran();
  const { settings, surahs } = state;
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchPageVerses(pageNumber, settings.translationLanguage)
      .then((data) => {
        if (!cancelled) {
          setPageData(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [pageNumber, settings.translationLanguage]);

  const isRightPage = side === 'right' || side === 'single';

  return (
    <div
      className={cn(
        'mushaf-page relative flex flex-col',
        'bg-[var(--page-bg)] text-[var(--page-text)]',
        'select-text',
        side === 'right' && 'rounded-l-sm',
        side === 'left' && 'rounded-r-sm',
      )}
      style={{ minHeight: '100%' }}
    >
      {/* Outer ornamental border */}
      <div className="mushaf-border-outer absolute inset-2" />
      {/* Inner border */}
      <div className="mushaf-border-inner absolute inset-3" />

      {/* Page content */}
      <div className="relative z-10 flex flex-col h-full px-8 py-6 md:px-10 md:py-7">
        {/* Page top decoration */}
        <div className="flex items-center justify-between mb-1">
          {isRightPage ? (
            <>
              <span className="text-[10px] text-[var(--page-meta)] font-inter tracking-wide">
                {pageData?.verses[0] ? getSurahName(pageData.verses[0], surahs) : ''}
              </span>
              <span className="text-[10px] text-[var(--page-meta)] font-inter tracking-wide">
                صفحة {pageNumber}
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] text-[var(--page-meta)] font-inter tracking-wide">
                {pageData?.verses[0] ? `الجزء ${pageData.verses[0].juz_number}` : ''}
              </span>
              <span className="text-[10px] text-[var(--page-meta)] font-inter tracking-wide">
                {pageData?.verses[0] ? getSurahName(pageData.verses[0], surahs) : ''}
              </span>
            </>
          )}
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <PageSkeleton />
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-red-400 font-inter">Failed to load page</p>
            </div>
          ) : pageData ? (
            <PageContent
              pageData={pageData}
              surahs={surahs}
              settings={settings}
              pageNumber={pageNumber}
            />
          ) : null}
        </div>

        {/* Page number at bottom */}
        <div className="mt-1 flex justify-center">
          <div className="page-number-ornament">
            <span className="text-[11px] font-amiri text-[var(--page-meta)]">
              {pageNumber}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

function getSurahName(verse: Verse, surahs: { id: number; name_simple: string; name_arabic: string }[]) {
  const [chStr] = verse.verse_key.split(':');
  const ch = parseInt(chStr, 10);
  const surah = surahs.find((s) => s.id === ch);
  return surah?.name_simple ?? '';
}

interface PageContentProps {
  pageData: PageData;
  surahs: {
    id: number;
    name_simple: string;
    name_arabic: string;
    bismillah_pre: boolean;
    name_translation: string;
    revelation_place: string;
    verses_count: number;
  }[];
  settings: { fontSize: number; showTranslation: boolean; translationLanguage: string };
  pageNumber: number;
}

function PageContent({ pageData, surahs, settings, pageNumber }: PageContentProps) {
  const surahGroups = groupVersesBySurah(pageData.verses);
  const entries = Array.from(surahGroups.entries());

  return (
    <div className="quran-text-container flex-1 overflow-hidden" dir="rtl">
      {entries.map(([chapterNum, verses], groupIdx) => {
        const surah = surahs.find((s) => s.id === chapterNum);
        const isFirstVerseOfSurah = verses[0]?.verse_number === 1;
        return (
          <div key={chapterNum} className={cn(groupIdx > 0 && 'mt-3')}>
            {isFirstVerseOfSurah && surah && (
              <>
                <SurahHeader surah={surah} />
                {surah.bismillah_pre && chapterNum !== 1 && chapterNum !== 9 && (
                  <BismillahHeader />
                )}
              </>
            )}
            <div
              className="ayah-text-block"
              style={{ fontSize: `${settings.fontSize}px`, lineHeight: '2.2' }}
            >
              {verses.map((verse) => (
                <AyahDisplay
                  key={verse.verse_key}
                  verse={verse}
                  showTranslation={settings.showTranslation}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="flex-1 space-y-3 animate-pulse p-2" dir="rtl">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded w-full" />
          <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded w-11/12 mr-auto" />
        </div>
      ))}
    </div>
  );
}
