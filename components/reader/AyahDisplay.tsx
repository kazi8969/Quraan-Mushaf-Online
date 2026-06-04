'use client';

import { useState, useCallback, memo } from 'react';
import { Verse } from '@/lib/types';
import { useQuran } from '@/contexts/QuranContext';
import { cn } from '@/lib/utils';
import { Heart, Bookmark, Play, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

interface AyahDisplayProps {
  verse: Verse;
  showTranslation: boolean;
}

const AYAH_END_MARK = '\u06DD'; // Arabic end of ayah marker

function getAyahNumber(num: number): string {
  const arabicNums = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map((d) => arabicNums[parseInt(d)]).join('');
}

export const AyahDisplay = memo(function AyahDisplay({ verse, showTranslation }: AyahDisplayProps) {
  const { state, toggleFavorite, isFavorited, setPlayingVerse, setHighlightedVerse } = useQuran();
  const { highlightedVerseKey, playingVerseKey, isPlaying } = state;
  const [showActions, setShowActions] = useState(false);

  const isHighlighted = highlightedVerseKey === verse.verse_key;
  const isCurrentlyPlaying = playingVerseKey === verse.verse_key && isPlaying;
  const favorited = isFavorited(verse.verse_key);

  const translationText = verse.translations?.[0]?.text ?? '';

  const handleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!state.userId) {
      toast.error('Sign in to save favorites');
      return;
    }
    await toggleFavorite({
      chapter_number: parseInt(verse.verse_key.split(':')[0], 10),
      verse_number: verse.verse_number,
      verse_key: verse.verse_key,
      arabic_text: verse.text_uthmani,
      translation_text: translationText,
      page_number: verse.page_number,
    });
    toast.success(favorited ? 'Removed from favorites' : 'Added to favorites');
  }, [state.userId, verse, toggleFavorite, favorited, translationText]);

  const handlePlayVerse = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPlayingVerse(verse.verse_key);
    setHighlightedVerse(verse.verse_key);
  }, [verse.verse_key, setPlayingVerse, setHighlightedVerse]);

  return (
    <span
      className={cn(
        'ayah-inline relative group cursor-pointer',
        'transition-colors duration-200',
        isHighlighted && 'ayah-highlighted',
        isCurrentlyPlaying && 'ayah-playing'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => setHighlightedVerse(isHighlighted ? null : verse.verse_key)}
    >
      {/* Arabic text inline with end marker */}
      <span className="font-amiri text-[var(--page-text)]">
        {verse.text_uthmani}
        <span className="ayah-number-marker inline-block mx-1 text-[var(--page-gold)]">
          {AYAH_END_MARK}{getAyahNumber(verse.verse_number)}
        </span>
      </span>

      {/* Inline actions - appear on hover */}
      {showActions && (
        <span
          className="ayah-actions absolute -top-8 right-0 flex items-center gap-1 bg-[var(--page-bg)] border border-[var(--page-border)] rounded-full px-2 py-1 shadow-lg z-20"
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <button
            onClick={handlePlayVerse}
            className="p-0.5 text-[var(--page-meta)] hover:text-emerald-600 transition-colors"
            title="Play recitation"
          >
            <Play className="w-3 h-3" />
          </button>
          <button
            onClick={handleFavorite}
            className={cn(
              'p-0.5 transition-colors',
              favorited ? 'text-rose-500' : 'text-[var(--page-meta)] hover:text-rose-500'
            )}
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={cn('w-3 h-3', favorited && 'fill-current')} />
          </button>
          <span className="text-[9px] text-[var(--page-meta)] font-inter ml-0.5">
            {verse.verse_key}
          </span>
        </span>
      )}

      {/* Juz/Hizb markers */}
      {verse.verse_number === 1 && verse.juz_number > 0 && (
        <span className="juz-marker absolute -right-6 top-0 text-[9px] text-[var(--page-gold)] font-inter writing-vertical">
          {verse.juz_number}
        </span>
      )}

      {/* Translation */}
      {showTranslation && translationText && isHighlighted && (
        <span className="block mt-1 mb-2 text-right" dir="ltr">
          <span
            className="text-[var(--page-translation)] font-inter text-xs leading-relaxed bg-amber-50/50 dark:bg-stone-800/50 px-2 py-1 rounded border-r-2 border-amber-400 inline-block max-w-full"
            dangerouslySetInnerHTML={{ __html: translationText }}
          />
        </span>
      )}
    </span>
  );
});
