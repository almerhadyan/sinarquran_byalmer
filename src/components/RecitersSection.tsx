import React from 'react';
import { Volume2, Check, Play, UserCheck, Sparkles, Globe2, Music2 } from 'lucide-react';
import { Qari } from '../types/quran';
import { RECITERS } from '../data/reciters';

interface RecitersSectionProps {
  activeQari: Qari;
  onSelectQari: (qari: Qari) => void;
  onPlaySurahSample: (qari: Qari, surahNomor: number) => void;
}

export const RecitersSection: React.FC<RecitersSectionProps> = ({
  activeQari,
  onSelectQari,
  onPlaySurahSample,
}) => {
  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="bg-emerald-950 text-white rounded-2xl p-6 sm:p-10 mb-8 border border-emerald-900 shadow-sm">
        <div className="max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-widest text-amber-300/90 mb-2">
            Murottal Berkualitas Tinggi
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mb-3 text-white">
            Para Syeikh & Qari Terkemuka Dunia
          </h2>
          <p className="text-emerald-100/90 text-sm leading-relaxed font-light mb-6">
            Dengarkan lantunan ayat suci Al-Qur'an dengan berbagai ragam maqamat, tajwid tartil murni standar sanad dunia, dan irama syahdu dari para imam Dua Tanah Suci (Haramain) serta pakar qiraat internasional.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-900/80 border border-emerald-800 text-xs text-amber-200">
            <UserCheck className="w-4 h-4 text-amber-300" />
            <span>Qari Aktif Saat Ini: <strong>{activeQari.name}</strong></span>
          </div>
        </div>
      </div>

      {/* Reciters Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {RECITERS.map((qari) => {
          const isActive = activeQari.id === qari.id;

          return (
            <div
              key={qari.id}
              className={`rounded-2xl p-6 border transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-emerald-800 shadow-md ring-1 ring-emerald-800/30'
                  : 'bg-white border-stone-200/90 hover:border-stone-300 shadow-xs'
              }`}
            >
              <div>
                {/* Header row: Country & Arabic Calligraphy */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-medium text-stone-500 flex items-center gap-1">
                    <Globe2 className="w-3 h-3 text-stone-400" />
                    {qari.country}
                  </span>
                  <span className="font-arabic text-lg text-stone-700 font-normal">
                    {qari.arabicName}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-lg text-stone-900 mb-1 leading-snug">
                  {qari.name}
                </h3>

                <p className="text-xs font-medium text-emerald-800 mb-2">
                  {qari.style}
                </p>

                <p className="text-xs text-stone-600 leading-relaxed font-light mb-4">
                  {qari.description}
                </p>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectQari(qari)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-900 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Qari Terpilih
                    </>
                  ) : (
                    'Pilih Qari Ini'
                  )}
                </button>

                {/* Quick Audio Sample Play */}
                <button
                  onClick={() => onPlaySurahSample(qari, 1)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-emerald-950 font-medium hover:bg-stone-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Dengarkan Contoh Al-Fatihah"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Sampel Al-Fatihah</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
