'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuran } from '@/contexts/QuranContext';
import { cn } from '@/lib/utils';
import { X, BookOpen, Bookmark, Heart, History, ChevronDown, ChevronRight } from 'lucide-react';

interface ReaderSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'surahs' | 'juz' | 'bookmarks' | 'favorites';

export function ReaderSidebar({ isOpen, onClose }: ReaderSidebarProps) {
  const { state, goToPage } = useQuran();
  const { surahs, bookmarks, favorites } = state;
  const [activeTab, setActiveTab] = useState<Tab>('surahs');
  const [expandedJuz, setExpandedJuz] = useState<number | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function navigateTo(page: number) {
    goToPage(page);
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          'fixed top-0 right-0 h-full w-80 bg-white dark:bg-stone-900 z-50',
          'shadow-2xl flex flex-col',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-emerald-900 dark:bg-stone-800 border-b border-emerald-800/50">
          <h2 className="text-amber-200 font-amiri text-xl">فهرس القرآن</h2>
          <button
            onClick={onClose}
            className="text-amber-300 hover:text-white transition-colors p-1"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
          {([
            { id: 'surahs', label: 'السور', icon: BookOpen },
            { id: 'juz', label: 'الأجزاء', icon: BookOpen },
            { id: 'bookmarks', label: 'علامات', icon: Bookmark },
            { id: 'favorites', label: 'المفضلة', icon: Heart },
          ] as { id: Tab; label: string; icon: typeof BookOpen }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex-1 py-2 text-xs font-inter transition-colors flex flex-col items-center gap-0.5',
                activeTab === id
                  ? 'text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'surahs' && (
            <div className="py-1">
              {surahs.map((surah) => (
                <button
                  key={surah.id}
                  onClick={() => navigateTo(surah.pages[0])}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 dark:hover:bg-stone-800 transition-colors text-right group"
                >
                  <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-stone-700 text-emerald-800 dark:text-emerald-300 text-xs font-inter flex items-center justify-center flex-shrink-0">
                    {surah.id}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-amiri text-base text-stone-800 dark:text-stone-100 leading-none">
                      {surah.name_arabic}
                    </p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 font-inter mt-0.5 truncate">
                      {surah.name_simple} • {surah.verses_count} ayahs
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-inter flex-shrink-0">
                    p.{surah.pages[0]}
                  </span>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'juz' && (
            <div className="py-1">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => {
                const juzSurahs = surahs.filter((s) => {
                  // Approximate juz mapping
                  const page = s.pages[0];
                  const juzStartPage = Math.ceil((juz - 1) * (604 / 30));
                  const juzEndPage = Math.ceil(juz * (604 / 30));
                  return page >= juzStartPage && page <= juzEndPage;
                });
                return (
                  <div key={juz}>
                    <button
                      onClick={() => setExpandedJuz(expandedJuz === juz ? null : juz)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-emerald-50 dark:hover:bg-stone-800 transition-colors"
                    >
                      <span className="font-amiri text-stone-800 dark:text-stone-100 text-base">
                        الجزء {getArabicNumber(juz)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const page = Math.round((juz - 1) * (604 / 30)) + 1;
                            navigateTo(Math.max(1, page));
                          }}
                          className="text-[10px] text-emerald-600 dark:text-emerald-400 font-inter"
                        >
                          Go
                        </button>
                        {expandedJuz === juz ? (
                          <ChevronDown className="w-3 h-3 text-stone-400" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-stone-400" />
                        )}
                      </div>
                    </button>
                    {expandedJuz === juz && (
                      <div className="bg-stone-50 dark:bg-stone-800/30 pl-8">
                        {juzSurahs.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => navigateTo(s.pages[0])}
                            className="w-full text-right py-1.5 px-4 text-sm text-stone-600 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors font-amiri"
                          >
                            {s.name_arabic}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="py-1">
              {bookmarks.length === 0 ? (
                <EmptyState message="No bookmarks yet" icon={Bookmark} />
              ) : (
                bookmarks.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => navigateTo(b.page_number)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 dark:hover:bg-stone-800 transition-colors text-right border-b border-stone-100 dark:border-stone-800"
                  >
                    <Bookmark className="w-4 h-4 text-amber-500 fill-current flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-amiri text-sm text-stone-800 dark:text-stone-100">
                        {b.chapter_name_arabic || `Page ${b.page_number}`}
                      </p>
                      <p className="text-[10px] text-stone-500 font-inter mt-0.5">
                        Page {b.page_number} • {new Date(b.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="py-1">
              {favorites.length === 0 ? (
                <EmptyState message="No favorite ayahs yet" icon={Heart} />
              ) : (
                favorites.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => navigateTo(f.page_number)}
                    className="w-full flex flex-col gap-1 px-4 py-3 hover:bg-emerald-50 dark:hover:bg-stone-800 transition-colors text-right border-b border-stone-100 dark:border-stone-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-inter">
                        {f.verse_key}
                      </span>
                      <Heart className="w-3 h-3 text-rose-500 fill-current" />
                    </div>
                    <p className="font-amiri text-sm text-stone-800 dark:text-stone-100 leading-relaxed line-clamp-2">
                      {f.arabic_text}
                    </p>
                    {f.translation_text && (
                      <p className="text-[10px] text-stone-500 font-inter text-left leading-relaxed line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: f.translation_text }}
                      />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function EmptyState({ message, icon: Icon }: { message: string; icon: typeof Bookmark }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-stone-400">
      <Icon className="w-8 h-8 mb-3 opacity-40" />
      <p className="text-sm font-inter">{message}</p>
    </div>
  );
}

function getArabicNumber(n: number): string {
  const arabic = ['', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس',
    'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر',
    'الثاني عشر', 'الثالث عشر', 'الرابع عشر', 'الخامس عشر', 'السادس عشر',
    'السابع عشر', 'الثامن عشر', 'التاسع عشر', 'العشرون', 'الحادي والعشرون',
    'الثاني والعشرون', 'الثالث والعشرون', 'الرابع والعشرون', 'الخامس والعشرون',
    'السادس والعشرون', 'السابع والعشرون', 'الثامن والعشرون', 'التاسع والعشرون', 'الثلاثون'];
  return arabic[n] ?? String(n);
}
