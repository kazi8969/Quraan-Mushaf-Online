'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuran } from '@/contexts/QuranContext';
import { cn } from '@/lib/utils';
import {
  BookOpen, Search, Headphones, Bookmark, Globe, Moon, Sun,
  ChevronLeft, Sparkles, LayoutGrid
} from 'lucide-react';
import { useTheme } from 'next-themes';

export default function LandingPage() {
  const { state, goToPage } = useQuran();
  const { surahs, progress } = state;
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const popularSurahs = [1, 2, 18, 36, 55, 67, 112, 113, 114];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-emerald-900 to-stone-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full border border-amber-400" />
          <div className="absolute top-10 left-10 w-[500px] h-[500px] rounded-full border border-amber-400/50" />
          <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full border border-amber-400/30" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-amber-300 hover:bg-white/20 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {/* Arabic title */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400/60" />
              <span className="text-amber-400/80 text-sm font-inter tracking-widest uppercase">
                The Holy Quran
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400/60" />
            </div>

            <h1 className="font-amiri text-7xl md:text-8xl text-amber-200 leading-none mb-4" dir="rtl">
              القرآن الكريم
            </h1>
            <p className="font-amiri text-2xl text-amber-400/80 leading-relaxed" dir="rtl">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>

          <p className="text-emerald-200/70 font-inter text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Read the Holy Quran in beautiful Mushaf format with translations, audio recitation, and search.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reader"
              className={cn(
                'inline-flex items-center gap-2 px-8 py-3.5 rounded-xl',
                'bg-amber-400 hover:bg-amber-300 text-emerald-900',
                'font-inter font-semibold text-base transition-all duration-200',
                'shadow-lg shadow-amber-400/25 hover:shadow-amber-400/40 hover:-translate-y-0.5'
              )}
            >
              <BookOpen className="w-5 h-5" />
              Open Mushaf
            </Link>
            {progress && (
              <button
                onClick={() => {
                  goToPage(progress.current_page);
                  window.location.href = '/reader';
                }}
                className={cn(
                  'inline-flex items-center gap-2 px-8 py-3.5 rounded-xl',
                  'bg-white/10 hover:bg-white/20 text-amber-200',
                  'font-inter font-semibold text-base transition-all duration-200',
                  'border border-white/20 hover:border-white/30'
                )}
              >
                Continue Reading (Page {progress.current_page})
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: BookOpen, title: 'Mushaf', desc: 'Authentic Uthmani text' },
            { icon: Globe, title: 'Translation', desc: 'English & Bengali' },
            { icon: Headphones, title: 'Audio', desc: 'Multiple reciters' },
            { icon: Search, title: 'Search', desc: 'Find any verse' },
            { icon: Bookmark, title: 'Bookmarks', desc: 'Save your place' },
            { icon: LayoutGrid, title: '114 Surahs', desc: '604 pages' },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/8 transition-colors"
            >
              <Icon className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-amber-100 font-inter font-medium text-sm">{title}</p>
              <p className="text-emerald-400/60 font-inter text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Surah Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-amber-200 font-amiri text-3xl" dir="rtl">
            سور القرآن
          </h2>
          <Link href="/reader" className="text-emerald-400 hover:text-emerald-300 text-sm font-inter transition-colors">
            View All →
          </Link>
        </div>

        {surahs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {surahs.map((surah) => (
              <Link
                key={surah.id}
                href="/reader"
                onClick={() => goToPage(surah.pages[0])}
                className="group bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-amber-400/10 hover:border-amber-400/30 transition-all duration-200 text-center"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-800/50 group-hover:bg-amber-400/20 text-emerald-300 group-hover:text-amber-300 text-xs font-inter flex items-center justify-center mx-auto mb-2 transition-colors">
                  {surah.id}
                </div>
                <p className="font-amiri text-amber-200 text-base leading-none mb-1" dir="rtl">
                  {surah.name_arabic}
                </p>
                <p className="text-emerald-400/60 text-[10px] font-inter truncate">
                  {surah.name_simple}
                </p>
                <p className="text-emerald-500/40 text-[9px] font-inter mt-0.5">
                  {surah.verses_count} ayahs
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-white/10 mx-auto mb-2" />
                <div className="h-5 bg-white/10 rounded mb-1" />
                <div className="h-3 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center">
        <p className="text-emerald-400/50 font-amiri text-xl mb-1" dir="rtl">
          وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ
        </p>
        <p className="text-emerald-500/40 text-xs font-inter">
          And We have certainly made the Quran easy for remembrance — Al-Qamar 17
        </p>
      </footer>
    </div>
  );
}
