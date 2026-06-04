'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuran } from '@/contexts/QuranContext';
import { fetchChapterAudio } from '@/lib/quran-api';
import { cn } from '@/lib/utils';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  ChevronUp, ChevronDown, Music2
} from 'lucide-react';

export function AudioPlayer() {
  const { state, setIsPlaying, setHighlightedVerse } = useQuran();
  const { surahs, settings, currentPage, isPlaying, playingVerseKey } = state;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSurahId, setCurrentSurahId] = useState<number | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);

  // Determine current surah from page
  const currentSurah = surahs.find(
    (s) => s.pages[0] <= currentPage && s.pages[1] >= currentPage
  );

  const loadSurahAudio = useCallback(async (surahId: number) => {
    setLoadingAudio(true);
    try {
      const audio = await fetchChapterAudio(settings.reciterId, surahId);
      setAudioUrl(audio.audio_url);
      setCurrentSurahId(surahId);
    } catch (err) {
      console.error('Failed to load audio:', err);
    } finally {
      setLoadingAudio(false);
    }
  }, [settings.reciterId]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'none';
    }
    const audio = audioRef.current;

    audio.addEventListener('timeupdate', () => {
      setProgress(audio.currentTime);
    });
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setHighlightedVerse(null);
    });

    return () => {
      audio.pause();
    };
  }, [setIsPlaying, setHighlightedVerse]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    audio.src = audioUrl;
    audio.load();
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  function handlePlayPause() {
    if (!audioUrl && currentSurah) {
      loadSurahAudio(currentSurah.id).then(() => setIsPlaying(true));
    } else {
      setIsPlaying(!isPlaying);
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const t = parseFloat(e.target.value);
    setProgress(t);
    if (audioRef.current) audioRef.current.currentTime = t;
  }

  function handlePrevSurah() {
    const id = (currentSurahId ?? currentSurah?.id ?? 1) - 1;
    if (id >= 1) loadSurahAudio(id).then(() => setIsPlaying(true));
  }

  function handleNextSurah() {
    const id = (currentSurahId ?? currentSurah?.id ?? 1) + 1;
    if (id <= 114) loadSurahAudio(id).then(() => setIsPlaying(true));
  }

  const activeSurah = surahs.find((s) => s.id === (currentSurahId ?? currentSurah?.id));
  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={cn(
        'audio-player fixed bottom-0 left-0 right-0 z-30',
        'bg-emerald-900/97 dark:bg-stone-900/97 backdrop-blur-sm',
        'border-t border-emerald-800/50 dark:border-stone-700/50',
        'transition-all duration-300',
        expanded ? 'pb-4' : 'pb-0'
      )}
    >
      {/* Progress bar */}
      <div className="h-0.5 bg-emerald-800/50">
        <div
          className="h-full bg-amber-400 transition-all duration-200"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Compact player */}
      <div className="flex items-center gap-3 px-4 h-12">
        {/* Surah info */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Music2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <div className="min-w-0">
            {activeSurah ? (
              <>
                <p className="text-amber-200 font-amiri text-sm leading-none truncate" dir="rtl">
                  {activeSurah.name_arabic}
                </p>
                <p className="text-amber-400/60 text-[10px] font-inter">
                  {isPlaying ? 'Playing' : 'Paused'}
                  {playingVerseKey && ` • ${playingVerseKey}`}
                </p>
              </>
            ) : (
              <p className="text-amber-400/60 text-[10px] font-inter">
                Select a surah to play
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevSurah}
            className="text-amber-300/70 hover:text-amber-300 transition-colors"
            aria-label="Previous surah"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={handlePlayPause}
            disabled={loadingAudio}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center transition-all',
              'bg-amber-400 hover:bg-amber-300 text-emerald-900',
              loadingAudio && 'opacity-60 cursor-not-allowed'
            )}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {loadingAudio ? (
              <span className="w-3 h-3 border-2 border-emerald-900/30 border-t-emerald-900 rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>
          <button
            onClick={handleNextSurah}
            className="text-amber-300/70 hover:text-amber-300 transition-colors"
            aria-label="Next surah"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMuted(!muted)}
            className="text-amber-300/70 hover:text-amber-300 transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-amber-300/70 hover:text-amber-300 transition-colors"
            aria-label={expanded ? 'Collapse player' : 'Expand player'}
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded player */}
      {expanded && (
        <div className="px-4 pb-2 space-y-3">
          {/* Seek bar */}
          <div className="flex items-center gap-2">
            <span className="text-amber-400/60 text-[10px] font-inter w-8">
              {formatTime(progress)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={progress}
              onChange={handleSeek}
              className="flex-1 h-1 accent-amber-400 cursor-pointer"
            />
            <span className="text-amber-400/60 text-[10px] font-inter w-8 text-right">
              {formatTime(duration)}
            </span>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-amber-400/60" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setMuted(false);
              }}
              className="w-24 h-1 accent-amber-400 cursor-pointer"
            />
            <span className="text-amber-400/60 text-[10px] font-inter">
              {Math.round((muted ? 0 : volume) * 100)}%
            </span>
          </div>

          {/* Surah selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {surahs.slice(0, 20).map((s) => (
              <button
                key={s.id}
                onClick={() => loadSurahAudio(s.id).then(() => setIsPlaying(true))}
                className={cn(
                  'flex-shrink-0 px-2 py-1 rounded text-[10px] font-inter transition-colors',
                  currentSurahId === s.id
                    ? 'bg-amber-400 text-emerald-900'
                    : 'bg-emerald-800/50 text-amber-300/70 hover:bg-emerald-700/50 hover:text-amber-300'
                )}
              >
                {s.name_simple}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
