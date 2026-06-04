'use client';

import { useQuran } from '@/contexts/QuranContext';
import { cn } from '@/lib/utils';
import { X, Type, Globe, Headphones, Eye, EyeOff, BookOpen } from 'lucide-react';
import { TranslationLanguage } from '@/lib/types';

interface SettingsPanelProps {
  onClose: () => void;
}

const RECITERS = [
  { id: 7, name: 'Mishary Rashid Al-Afasy' },
  { id: 1, name: 'AbdulSamad - Murattal' },
  { id: 2, name: 'AbdulBasit - Mujawwad' },
  { id: 3, name: 'Minshawi - Murattal' },
  { id: 9, name: 'Mahmoud Khalil Al-Husary' },
  { id: 11, name: 'Muhammad Siddiq Al-Minshawi' },
];

const FONT_SIZES = [20, 22, 24, 26, 28, 32, 36, 40];

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { state, updateSettings } = useQuran();
  const { settings } = state;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-700 bg-emerald-900/5 dark:bg-emerald-900/20">
          <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 font-inter">
            Settings
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Font size */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-emerald-600" />
              <h3 className="font-medium text-stone-700 dark:text-stone-300 text-sm font-inter">
                Arabic Font Size
              </h3>
              <span className="ml-auto text-emerald-700 dark:text-emerald-400 text-sm font-inter font-semibold">
                {settings.fontSize}px
              </span>
            </div>
            <input
              type="range"
              min={18}
              max={44}
              step={2}
              value={settings.fontSize}
              onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value, 10) })}
              className="w-full h-2 accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-stone-400 font-inter">Small</span>
              <span className="text-[10px] text-stone-400 font-inter">Large</span>
            </div>
            {/* Preview */}
            <div className="mt-2 p-3 bg-amber-50 dark:bg-stone-800 rounded-lg text-center border border-amber-100 dark:border-stone-700">
              <p
                className="font-amiri text-stone-800 dark:text-stone-100"
                dir="rtl"
                style={{ fontSize: `${settings.fontSize}px`, lineHeight: '1.8' }}
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            </div>
          </div>

          {/* Translation */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-emerald-600" />
              <h3 className="font-medium text-stone-700 dark:text-stone-300 text-sm font-inter">
                Translation
              </h3>
              <button
                onClick={() => updateSettings({ showTranslation: !settings.showTranslation })}
                className={cn(
                  'ml-auto px-3 py-1 rounded-full text-xs font-inter transition-colors',
                  settings.showTranslation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
                )}
              >
                {settings.showTranslation ? 'On' : 'Off'}
              </button>
            </div>

            {settings.showTranslation && (
              <div className="flex gap-2">
                {(['en', 'bn'] as TranslationLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => updateSettings({ translationLanguage: lang })}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-sm font-inter transition-colors border',
                      settings.translationLanguage === lang
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-transparent text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-emerald-400'
                    )}
                  >
                    {lang === 'en' ? 'English' : 'বাংলা'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reciter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Headphones className="w-4 h-4 text-emerald-600" />
              <h3 className="font-medium text-stone-700 dark:text-stone-300 text-sm font-inter">
                Reciter
              </h3>
            </div>
            <div className="space-y-1.5">
              {RECITERS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => updateSettings({ reciterId: r.id })}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm font-inter transition-colors',
                    settings.reciterId === r.id
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                  )}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-inter text-sm transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
