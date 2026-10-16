import React from 'react';
import { Play, CheckCircle2, BookOpen } from 'lucide-react';
import { SurahMeta } from '../types/quran';

interface SurahListCardProps {
  surah: SurahMeta;
  onSelect: (nomor: number) => void;
  onQuickPlay: (surah: SurahMeta, e: React.MouseEvent) => void;
  isPlayingThisSurah: boolean;
  mutqinAyatCount?: number;
}

export const SurahListCard: React.FC<SurahListCardProps> = ({
  surah,
  onSelect,
  onQuickPlay,
  isPlayingThisSurah,
  mutqinAyatCount = 0,
}) => {
  return (
    <div
      onClick={() => onSelect(surah.nomor)}
      className="group bg-white hover:bg-stone-50/90 border border-stone-200/90 hover:border-emerald-700/40 rounded-xl p-4.5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
    >
      <div>
        {/* Top Row: Surah Number and Arabic Name */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-3">
            {/* Number Emblem */}
            <div className="w-9 h-9 rounded-lg bg-stone-100 group-hover:bg-emerald-50 text-stone-700 group-hover:text-emerald-900 border border-stone-200/70 group-hover:border-emerald-200 flex items-center justify-center font-mono font-semibold text-xs tabular-nums transition-colors shrink-0">
              {surah.nomor}
            </div>

            <div>
              <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-emerald-950 transition-colors">
                {surah.namaLatin}
              </h3>
              <p className="text-xs text-stone-500 font-normal">
                {surah.arti}
              </p>
            </div>
          </div>

          {/* Arabic Calligraphic Name */}
          <div className="text-right">
            <span className="font-arabic text-xl text-stone-800 group-hover:text-emerald-900 transition-colors font-medium">
              {surah.nama}
            </span>
          </div>
        </div>

        {/* Short Description excerpt */}
        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3 font-light">
          {surah.deskripsi}
        </p>
      </div>

      {/* Bottom Row: Zero-Pill Unboxed Metadata & Action Buttons */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <span>{surah.tempatTurun}</span>
          <span aria-hidden="true">·</span>
          <span>{surah.jumlahAyat} Ayat</span>
          {mutqinAyatCount > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {mutqinAyatCount}/{surah.jumlahAyat}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => onQuickPlay(surah, e)}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              isPlayingThisSurah
                ? 'bg-emerald-800 text-white'
                : 'text-stone-400 hover:text-emerald-900 hover:bg-stone-100'
            }`}
            title="Dengarkan Murottal Surat Ini"
          >
            <Play className={`w-3.5 h-3.5 ${isPlayingThisSurah ? 'fill-current' : ''}`} />
          </button>

          <span className="text-stone-300">|</span>

          <span className="text-[11px] font-medium text-emerald-900 group-hover:underline flex items-center gap-0.5">
            <BookOpen className="w-3 h-3" />
            Buka
          </span>
        </div>
      </div>
    </div>
  );
};
