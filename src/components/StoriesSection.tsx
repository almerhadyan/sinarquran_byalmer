import React, { useState } from 'react';
import { BookOpen, Sparkles, ArrowRight, ExternalLink, Scroll, HeartHandshake } from 'lucide-react';
import { QuranStory } from '../types/quran';
import { QURAN_STORIES } from '../data/quranStories';
import manuscriptImg from '../assets/images/quran_manuscript_gold_1792149227497.jpg';

interface StoriesSectionProps {
  onSelectSurah: (nomor: number) => void;
}

export const StoriesSection: React.FC<StoriesSectionProps> = ({ onSelectSurah }) => {
  const [selectedStory, setSelectedStory] = useState<QuranStory | null>(QURAN_STORIES[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Kisah Nabi', 'Peristiwa Sejarah', 'Hikmah & Perumpamaan'];

  const filteredStories = selectedCategory === 'all'
    ? QURAN_STORIES
    : QURAN_STORIES.filter((s) => s.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Top Section Header with Archival Manuscript Image */}
      <div className="relative overflow-hidden rounded-2xl bg-stone-900 text-white border border-stone-800 p-6 sm:p-10 mb-8 shadow-md">
        <div className="absolute inset-0 z-0">
          <img
            src={manuscriptImg}
            alt="Historical Quran Manuscript"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25 object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/90 to-stone-900/50" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-widest text-amber-300/90 mb-2">
            Khazanah Hikmah & Asbabun Nuzul
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mb-3">
            Kisah-Kisah Teladan Terbaik dalam Al-Qur'an
          </h2>
          <p className="text-stone-300 text-sm leading-relaxed font-light mb-6">
            Al-Qur'an memuat <em>Ahsanul Qashash</em> (sebaik-baik kisah). Bukan sekadar riwayat masa lampau, melainkan lentera abadi yang mendidik jiwa, memuat sebab turunnya wahyu, dan pedoman menghadapi realitas hidup manusia.
          </p>

          {/* Category Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'Semua Kisah' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Stories List (Left) + Detailed Reader (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: List of Stories (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">
            Daftar Cerita & Hikmah ({filteredStories.length})
          </h3>

          <div className="space-y-3">
            {filteredStories.map((story) => {
              const isSelected = selectedStory?.id === story.id;
              return (
                <div
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className={`p-4.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950 text-white border-emerald-900 shadow-sm'
                      : 'bg-white hover:bg-stone-50 border-stone-200/90 text-stone-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`text-[11px] font-medium ${isSelected ? 'text-amber-300' : 'text-emerald-800'}`}>
                      {story.category}
                    </span>
                    <span className="font-arabic text-lg font-normal opacity-90">
                      {story.arabicTitle}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-base mb-1.5 leading-snug">
                    {story.title}
                  </h4>

                  <p className={`text-xs line-clamp-2 leading-relaxed mb-3 font-light ${
                    isSelected ? 'text-stone-300' : 'text-stone-500'
                  }`}>
                    {story.summary}
                  </p>

                  <div className={`pt-2.5 border-t flex items-center justify-between text-xs ${
                    isSelected ? 'border-emerald-900 text-stone-400' : 'border-stone-100 text-stone-400'
                  }`}>
                    <span>Surat {story.surahName} ({story.surahNumber}) · {story.verseRange}</span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-stone-400'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Story Reader (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedStory ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-xs sticky top-20">
              {/* Header */}
              <div className="border-b border-stone-200 pb-5 mb-6">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                    {selectedStory.category}
                  </span>
                  <button
                    onClick={() => onSelectSurah(selectedStory.surahNumber)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Baca Surat {selectedStory.surahName}</span>
                  </button>
                </div>

                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mb-2 leading-tight">
                  {selectedStory.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-stone-500 font-light">
                  <span>Surat {selectedStory.surahName} (Surat Ke-{selectedStory.surahNumber})</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedStory.verseRange}</span>
                </div>
              </div>

              {/* Asbabun Nuzul Box */}
              {selectedStory.asbabunNuzul && (
                <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 mb-6 text-xs text-stone-700">
                  <h4 className="font-bold text-amber-950 mb-1.5 flex items-center gap-1.5">
                    <Scroll className="w-3.5 h-3.5 text-amber-700" />
                    Asbabun Nuzul (Sebab Turunnya Ayat / Surat)
                  </h4>
                  <p className="leading-relaxed font-light text-stone-700">
                    {selectedStory.asbabunNuzul}
                  </p>
                </div>
              )}

              {/* Narrative Story Body */}
              <div className="space-y-4 mb-8 text-stone-700 leading-relaxed text-sm font-light">
                {selectedStory.fullStory.map((paragraph, idx) => (
                  <p key={idx} className={idx === 0 ? 'first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-2.5 first-letter:text-emerald-950' : ''}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Lessons & Wisdoms (Hikmah & Ibroh) */}
              <div className="pt-6 border-t border-stone-200">
                <h4 className="font-serif font-bold text-base text-stone-900 mb-3 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-emerald-800" />
                  Hikmah & Pelajaran Hidup (Tadabbur)
                </h4>
                <div className="space-y-2.5">
                  {selectedStory.lessons.map((lesson, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 font-light">
                      <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-900 font-bold font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed">{lesson}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500">
              Pilihlah salah satu cerita di sisi kiri untuk membaca narasi lengkap dan tadabburnya.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
