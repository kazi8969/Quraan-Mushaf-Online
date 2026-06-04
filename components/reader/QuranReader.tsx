'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuran } from '@/contexts/QuranContext';
import { PageView } from './PageView';
import { ReaderNavbar } from './ReaderNavbar';
import { ReaderSidebar } from './ReaderSidebar';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { SearchModal } from '@/components/search/SearchModal';
import { SettingsPanel } from './SettingsPanel';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TOTAL_PAGES } from '@/lib/quran-api';

export function QuranReader() {
  const { state, goToPage, saveProgress } = useQuran();
  const { currentPage, settings } = state;
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'forward' | 'backward'>('forward');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const flipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const navigatePage = useCallback((direction: 'forward' | 'backward') => {
    if (isFlipping) return;
    const isMobileView = window.innerWidth < 1024;
    const step = isMobileView ? 1 : 2;
    const newPage = direction === 'forward'
      ? Math.min(TOTAL_PAGES, currentPage + step)
      : Math.max(1, currentPage - step);
    if (newPage === currentPage) return;
    setFlipDirection(direction);
    setIsFlipping(true);
    if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    flipTimeoutRef.current = setTimeout(() => {
      goToPage(newPage);
      setIsFlipping(false);
      saveProgress(newPage);
    }, 300);
  }, [isFlipping, currentPage, goToPage, saveProgress]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        // In Arabic (RTL), right arrow = previous page, left arrow = next page
        navigatePage(e.key === 'ArrowLeft' ? 'forward' : 'backward');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigatePage]);

  // Desktop: show left page (even) and right page (odd)
  // Quran pages: right page is odd (like a real mushaf)
  const rightPage = currentPage % 2 === 1 ? currentPage : currentPage - 1;
  const leftPage = rightPage + 1;

  return (
    <div className="quran-reader-root min-h-screen bg-reader-bg flex flex-col overflow-hidden">
      <ReaderNavbar
        onMenuClick={() => setSidebarOpen(true)}
        onSearchClick={() => setSearchOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
        currentPage={currentPage}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <ReaderSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main reader area */}
        <main className="flex-1 flex items-center justify-center p-2 md:p-4 lg:p-6 min-h-0">
          <div className="book-container relative w-full max-w-6xl mx-auto">
            {/* Book shadow */}
            <div className="absolute inset-0 book-shadow rounded-lg pointer-events-none" />

            <div
              className={cn(
                'book-spread flex relative rounded-lg overflow-hidden',
                'transition-opacity duration-300',
                isFlipping && 'opacity-80'
              )}
            >
              {/* Desktop: two-page spread */}
              {!isMobile ? (
                <>
                  {/* Right page (in Arabic, right side comes first) */}
                  <div
                    className={cn(
                      'page-wrapper flex-1 relative',
                      isFlipping && flipDirection === 'backward' && 'page-flip-backward',
                      isFlipping && flipDirection === 'forward' && 'page-flip-forward'
                    )}
                  >
                    <PageView pageNumber={rightPage} side="right" />
                  </div>
                  {/* Spine */}
                  <div className="book-spine w-3 bg-gradient-to-r from-stone-300 via-stone-200 to-stone-300 dark:from-stone-700 dark:via-stone-600 dark:to-stone-700 shadow-inner flex-shrink-0" />
                  {/* Left page */}
                  <div
                    className={cn(
                      'page-wrapper flex-1 relative',
                      isFlipping && flipDirection === 'forward' && 'page-flip-forward',
                      isFlipping && flipDirection === 'backward' && 'page-flip-backward'
                    )}
                  >
                    {leftPage <= TOTAL_PAGES ? (
                      <PageView pageNumber={leftPage} side="left" />
                    ) : (
                      <div className="w-full h-full mushaf-page flex items-center justify-center">
                        <p className="text-stone-400 font-amiri text-2xl">نهاية القرآن الكريم</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Mobile: single page */
                <div className="w-full">
                  <PageView pageNumber={currentPage} side="single" />
                </div>
              )}
            </div>

            {/* Navigation arrows */}
            <button
              onClick={() => navigatePage('backward')}
              disabled={currentPage <= 1 || isFlipping}
              className={cn(
                'nav-arrow nav-arrow-right',
                'absolute right-0 top-1/2 -translate-y-1/2 translate-x-12',
                'w-10 h-10 rounded-full bg-emerald-800/90 dark:bg-emerald-700/90',
                'text-amber-100 shadow-lg',
                'flex items-center justify-center',
                'transition-all duration-200 hover:bg-emerald-700 hover:scale-110',
                'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100',
                'z-10',
                'max-lg:translate-x-0 max-lg:right-2 max-lg:top-auto max-lg:bottom-4'
              )}
              aria-label="Previous page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigatePage('forward')}
              disabled={currentPage >= TOTAL_PAGES || isFlipping}
              className={cn(
                'nav-arrow nav-arrow-left',
                'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12',
                'w-10 h-10 rounded-full bg-emerald-800/90 dark:bg-emerald-700/90',
                'text-amber-100 shadow-lg',
                'flex items-center justify-center',
                'transition-all duration-200 hover:bg-emerald-700 hover:scale-110',
                'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100',
                'z-10',
                'max-lg:-translate-x-0 max-lg:left-2 max-lg:top-auto max-lg:bottom-4'
              )}
              aria-label="Next page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </main>
      </div>

      {/* Audio player - fixed at bottom */}
      <AudioPlayer />

      {/* Modals */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
