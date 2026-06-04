'use client';

import { useState } from 'react';
import { useQuran } from '@/contexts/QuranContext';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import {
  Menu, Search, Settings, Bookmark, BookOpen,
  Sun, Moon, Book, User, LogOut
} from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { TOTAL_PAGES } from '@/lib/quran-api';

interface ReaderNavbarProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
  onSettingsClick: () => void;
  currentPage: number;
}

export function ReaderNavbar({
  onMenuClick,
  onSearchClick,
  onSettingsClick,
  currentPage,
}: ReaderNavbarProps) {
  const { state, goToPage, isBookmarked, toggleBookmark } = useQuran();
  const { theme, setTheme } = useTheme();
  const [pageInput, setPageInput] = useState('');
  const [showPageJump, setShowPageJump] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const currentSurah = state.surahs.find(
    (s) => s.pages[0] <= currentPage && s.pages[1] >= currentPage
  );
  const bookmarked = isBookmarked(currentPage);

  function handlePageJump(e: React.FormEvent) {
    e.preventDefault();
    const p = parseInt(pageInput, 10);
    if (p >= 1 && p <= TOTAL_PAGES) {
      goToPage(p);
      setShowPageJump(false);
      setPageInput('');
    }
  }

  return (
    <header className="reader-navbar h-14 flex items-center justify-between px-4 bg-emerald-900/95 dark:bg-stone-900/95 backdrop-blur-sm border-b border-emerald-800/50 dark:border-stone-700/50 shadow-sm z-30 flex-shrink-0">
      {/* Left side */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="navbar-btn"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center gap-2 mr-2">
          <Book className="w-4 h-4 text-amber-400" />
          <span className="text-amber-100 font-amiri text-lg leading-none">القرآن الكريم</span>
        </div>
      </div>

      {/* Center - surah name and page info */}
      <div className="flex flex-col items-center">
        {currentSurah && (
          <p className="text-amber-200 font-amiri text-base leading-none" dir="rtl">
            {currentSurah.name_arabic}
          </p>
        )}
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-amber-400/70 text-[10px] font-inter tracking-wide">
            Page {currentPage} / {TOTAL_PAGES}
          </span>
          {currentSurah && (
            <span className="text-amber-400/50 text-[10px] font-inter">
              • Juz {getJuzForSurah(currentSurah.id)}
            </span>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setShowPageJump(!showPageJump)}
          className="navbar-btn"
          aria-label="Go to page"
        >
          <BookOpen className="w-4 h-4" />
        </button>
        <button
          onClick={() => toggleBookmark(currentPage, currentSurah?.name_simple, currentSurah?.name_arabic)}
          className={cn('navbar-btn', bookmarked && 'text-amber-400')}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this page'}
        >
          <Bookmark className={cn('w-4 h-4', bookmarked && 'fill-current')} />
        </button>
        <button onClick={onSearchClick} className="navbar-btn" aria-label="Search">
          <Search className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="navbar-btn"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button onClick={onSettingsClick} className="navbar-btn" aria-label="Settings">
          <Settings className="w-4 h-4" />
        </button>
        {state.userId ? (
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              toast.success('Signed out');
            }}
            className="navbar-btn"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setShowAuth(true)}
            className="navbar-btn"
            aria-label="Sign in"
          >
            <User className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Auth modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Page jump popover */}
      {showPageJump && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-white dark:bg-stone-800 rounded-lg shadow-xl border border-stone-200 dark:border-stone-700 p-3 z-50 w-56">
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-2 text-center font-inter">
            Jump to Page (1–{TOTAL_PAGES})
          </p>
          <form onSubmit={handlePageJump} className="flex gap-2">
            <input
              type="number"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              min={1}
              max={TOTAL_PAGES}
              placeholder="Page #"
              className="flex-1 text-sm border border-stone-300 dark:border-stone-600 rounded px-2 py-1 bg-transparent dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-inter"
              autoFocus
            />
            <button
              type="submit"
              className="bg-emerald-700 text-white text-xs px-3 py-1 rounded hover:bg-emerald-600 transition-colors font-inter"
            >
              Go
            </button>
          </form>
        </div>
      )}
    </header>
  );
}

// Simplified juz lookup
function getJuzForSurah(surahId: number): number {
  const juzMap: Record<number, number> = {
    1: 1, 2: 1, 3: 3, 4: 4, 5: 6, 6: 7, 7: 8, 8: 10, 9: 10, 10: 11,
    11: 11, 12: 12, 13: 13, 14: 13, 15: 14, 16: 14, 17: 15, 18: 15,
    19: 16, 20: 16, 21: 17, 22: 17, 23: 18, 24: 18, 25: 18, 26: 19,
    27: 19, 28: 20, 29: 20, 30: 21, 31: 21, 32: 21, 33: 21, 34: 22,
    35: 22, 36: 22, 37: 23, 38: 23, 39: 23, 40: 24, 41: 24, 42: 25,
    43: 25, 44: 25, 45: 25, 46: 26, 47: 26, 48: 26, 49: 26, 50: 26,
    51: 26, 52: 27, 53: 27, 54: 27, 55: 27, 56: 27, 57: 27, 58: 28,
    59: 28, 60: 28, 61: 28, 62: 28, 63: 28, 64: 28, 65: 28, 66: 28,
    67: 29, 68: 29, 69: 29, 70: 29, 71: 29, 72: 29, 73: 29, 74: 29,
    75: 29, 76: 29, 77: 29, 78: 30, 79: 30, 80: 30, 81: 30, 82: 30,
    83: 30, 84: 30, 85: 30, 86: 30, 87: 30, 88: 30, 89: 30, 90: 30,
    91: 30, 92: 30, 93: 30, 94: 30, 95: 30, 96: 30, 97: 30, 98: 30,
    99: 30, 100: 30, 101: 30, 102: 30, 103: 30, 104: 30, 105: 30,
    106: 30, 107: 30, 108: 30, 109: 30, 110: 30, 111: 30, 112: 30,
    113: 30, 114: 30,
  };
  return juzMap[surahId] ?? 1;
}
