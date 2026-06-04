'use client';

import { memo } from 'react';

interface SurahHeaderProps {
  surah: {
    id: number;
    name_arabic: string;
    name_simple: string;
    name_translation: string;
    revelation_place: string;
    verses_count: number;
  };
}

export const SurahHeader = memo(function SurahHeader({ surah }: SurahHeaderProps) {
  return (
    <div className="surah-header my-2 text-center">
      <div className="surah-header-ornament relative flex items-center justify-center py-1">
        <div className="surah-header-line flex-1 h-px bg-gradient-to-r from-transparent via-[var(--page-border)] to-transparent" />
        <div className="surah-header-box mx-2 px-6 py-2 border border-[var(--page-border)] rounded relative">
          {/* Corner ornaments */}
          <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--page-gold)]" />
          <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--page-gold)]" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--page-gold)]" />
          <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--page-gold)]" />
          <p className="text-[var(--page-gold)] font-amiri text-lg leading-none">
            {surah.name_arabic}
          </p>
          <p className="text-[var(--page-meta)] font-inter text-[10px] mt-0.5 tracking-wide">
            {surah.name_simple} • {surah.revelation_place === 'makkah' ? 'Makki' : 'Madani'} • {surah.verses_count} Ayahs
          </p>
        </div>
        <div className="surah-header-line flex-1 h-px bg-gradient-to-l from-transparent via-[var(--page-border)] to-transparent" />
      </div>
    </div>
  );
});
