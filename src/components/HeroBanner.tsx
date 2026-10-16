import React from 'react';
import { Search, Sparkles, BookOpen, Compass } from 'lucide-react';
import heroImg from '../assets/images/quran_sanctuary_hero_1792149225824.jpg';

interface HeroBannerProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFilter: 'all' | 'makkiyah' | 'madaniyah' | 'juz30' | 'populer';
  setSelectedFilter: (filter: 'all' | 'makkiyah' | 'madaniyah' | 'juz30' | 'populer') => void;
  onSelectSurah: (nomor: number) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  setSearchQuery,
  selectedFilter,
  setSelectedFilter,
  onSelectSurah,
}) => {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-stone-900 text-stone-100 border border-stone-800/80 mb-10 shadow-lg">
      {/* Background Image with Measured Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImg}
          alt="Al-Qur'an Karim Sanctuary"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-35 object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/80 to-transparent" />
      </div>

      <div className="relative z-10 px-6 sm:px-12 py-10 sm:py-14 max-w-4xl">
        {/* Subtle Arabic Verse Header */}
        <div className="mb-4">
          <p className="font-arabic text-xl sm:text-2xl text-amber-200/90 tracking-wide font-normal">
            وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِنْ مُدَّكِرٍ
          </p>
          <div className="flex items-center gap-2 text-xs text-stone-400 mt-1.5 font-light">
            <span>Standar Kemenag RI</span>
            <span aria-hidden="true">·</span>
            <span>Audio Syeikh Dunia</span>
            <span aria-hidden="true">·</span>
            <span>Tafsir & Mode Menghafal</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight text-balance leading-tight mb-4">
          Membaca, Menghafal, & Menghayati Kalam Ilahi
        </h1>

        <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl font-light mb-8">
          Akses 114 surat lengkap dengan terjemahan resmi Kementerian Agama RI, tilawah audio dari syeikh-syeikh terkemuka di dunia, tafsir tahlili, kisah hikmah, dan metode tahfidz bertahap dengan pengingat harian istiqomah.
        </p>

        {/* Integrated Search Input */}
        <div className="relative max-w-xl mb-6">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari surat... (cth: Al-Kahf, Yasin, Al-Mulk, atau ayat)"
            className="w-full pl-12 pr-4 py-3 bg-stone-900/90 border border-stone-700/80 rounded-xl text-white placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-white px-2 py-1 rounded bg-stone-800"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Filter Segmented Control (Buttons with click handlers) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-stone-400 font-medium mr-1 hidden sm:inline">Pilihan:</span>
          
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 hover:text-white'
            }`}
          >
            Semua 114 Surat
          </button>

          <button
            onClick={() => setSelectedFilter('populer')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'populer'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Surat Pilihan
          </button>

          <button
            onClick={() => setSelectedFilter('juz30')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'juz30'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-stone-400" />
            Juz 'Amma (Juz 30)
          </button>

          <button
            onClick={() => setSelectedFilter('makkiyah')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedFilter === 'makkiyah'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 hover:text-white'
            }`}
          >
            Makkiyah
          </button>

          <button
            onClick={() => setSelectedFilter('madaniyah')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedFilter === 'madaniyah'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 hover:text-white'
            }`}
          >
            Madaniyah
          </button>
        </div>

        {/* Quick Jump Shortcuts for Popular Surahs */}
        <div className="mt-5 pt-4 border-t border-stone-800/80 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-400">
          <span className="flex items-center gap-1 text-stone-400">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            Lompat Cepat:
          </span>
          <button onClick={() => onSelectSurah(18)} className="hover:text-amber-200 transition-colors underline-offset-4 hover:underline">
            Al-Kahf (18)
          </button>
          <span aria-hidden="true">·</span>
          <button onClick={() => onSelectSurah(36)} className="hover:text-amber-200 transition-colors underline-offset-4 hover:underline">
            Yasin (36)
          </button>
          <span aria-hidden="true">·</span>
          <button onClick={() => onSelectSurah(55)} className="hover:text-amber-200 transition-colors underline-offset-4 hover:underline">
            Ar-Rahman (55)
          </button>
          <span aria-hidden="true">·</span>
          <button onClick={() => onSelectSurah(56)} className="hover:text-amber-200 transition-colors underline-offset-4 hover:underline">
            Al-Waqi'ah (56)
          </button>
          <span aria-hidden="true">·</span>
          <button onClick={() => onSelectSurah(67)} className="hover:text-amber-200 transition-colors underline-offset-4 hover:underline">
            Al-Mulk (67)
          </button>
        </div>
      </div>
    </section>
  );
};
