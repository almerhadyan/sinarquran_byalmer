import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Bookmark,
  Volume2,
  BookOpen,
  Sparkles,
  CheckCircle,
  Copy,
  Check,
  X,
  Eye,
  Sliders
} from 'lucide-react';
import { Ayah, SurahDetail, Qari, MemorizationStatus } from '../types/quran';
import { getAyahAudioCandidates } from '../services/audioResolver';

interface MushafPageViewProps {
  surah: SurahDetail;
  currentPlayingAyah: { surahNumber: number; ayahNumber: number } | null;
  isPlaying: boolean;
  onPlayAyah: (surahNumber: number, ayahNumber: number, audioUrl: string) => void;
  onPauseAudio: () => void;
  activeQari: Qari;
  onSaveBookmark: (ayah: Ayah, surah: SurahDetail) => void;
  isAyahBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
  tahfidzStatus: Record<string, MemorizationStatus>;
  onUpdateTahfidzStatus: (surahNumber: number, ayahNumber: number, status: MemorizationStatus) => void;
}

// Convert western digits to Eastern Arabic numerals (١, ٢, ٣...)
const toArabicNumeral = (num: number): string => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num
    .toString()
    .split('')
    .map((d) => arabicDigits[parseInt(d, 10)] || d)
    .join('');
};

export const MushafPageView: React.FC<MushafPageViewProps> = ({
  surah,
  currentPlayingAyah,
  isPlaying,
  onPlayAyah,
  onPauseAudio,
  activeQari,
  onSaveBookmark,
  isAyahBookmarked,
  tahfidzStatus,
  onUpdateTahfidzStatus,
}) => {
  // Reading preferences
  const [paperTheme, setPaperTheme] = useState<'cream' | 'white' | 'night'>('cream');
  const [mushafFontSize, setMushafFontSize] = useState<number>(34); // in px
  const [activeSelectedAyah, setActiveSelectedAyah] = useState<Ayah | null>(null);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);

  // Pagination for physical page experience:
  // Roughly 7-10 verses per page depending on verse length, or page-by-page view
  const versesPerPage = useMemo(() => {
    // If long surah like Al-Baqarah, 10 verses per page; if short surah <= 15 verses, 1 page
    if (surah.jumlahAyat <= 15) return surah.jumlahAyat;
    if (surah.jumlahAyat <= 40) return 10;
    return 12;
  }, [surah.jumlahAyat]);

  const totalPages = Math.ceil(surah.ayat.length / versesPerPage);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Current page verses
  const pageVerses = useMemo(() => {
    const start = (currentPage - 1) * versesPerPage;
    return surah.ayat.slice(start, start + versesPerPage);
  }, [surah.ayat, currentPage, versesPerPage]);

  // Jump page if audio advances to a verse on another page
  React.useEffect(() => {
    if (currentPlayingAyah && currentPlayingAyah.surahNumber === surah.nomor) {
      const targetAyahIndex = surah.ayat.findIndex(
        (a) => a.nomorAyat === currentPlayingAyah.ayahNumber
      );
      if (targetAyahIndex !== -1) {
        const pageOfAyah = Math.floor(targetAyahIndex / versesPerPage) + 1;
        if (pageOfAyah !== currentPage) {
          setCurrentPage(pageOfAyah);
        }
      }
    }
  }, [currentPlayingAyah, surah.nomor, surah.ayat, versesPerPage, currentPage]);

  const handleCopyAyah = (ayah: Ayah) => {
    const textToCopy = `${ayah.teksArab}\n\n"${ayah.teksIndonesia}"\n(QS. ${surah.namaLatin} : ${ayah.nomorAyat})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAyah(ayah.nomorAyat);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  const getAudioUrl = (ayah: Ayah): string => {
    const candidates = getAyahAudioCandidates(
      surah.nomor,
      ayah.nomorAyat,
      activeQari,
      ayah.audio?.[activeQari.code]
    );
    return candidates[0] || '';
  };

  // Background and styling based on paperTheme
  const themeStyles = {
    cream: {
      container: 'bg-[#FBF7EE] text-[#1C1917] border-[#E8DFCE]',
      outerFrame: 'border-[#D8C7A9] shadow-[0_4px_30px_rgba(100,75,40,0.08)]',
      innerBorder: 'border-[#E2D5BE]',
      headerBand: 'bg-[#F3EBDA] border-[#D8C7A9] text-[#2D241E]',
      ayahHighlight: 'bg-amber-200/40 text-stone-900 ring-1 ring-amber-400/50',
      playingHighlight: 'bg-emerald-200/50 text-emerald-950 ring-2 ring-emerald-600/60 font-semibold',
      ornament: 'text-amber-800/80',
    },
    white: {
      container: 'bg-white text-stone-900 border-stone-200',
      outerFrame: 'border-stone-300 shadow-[0_4px_25px_rgba(0,0,0,0.06)]',
      innerBorder: 'border-stone-200',
      headerBand: 'bg-stone-50 border-stone-300 text-stone-900',
      ayahHighlight: 'bg-stone-100 text-stone-900 ring-1 ring-stone-300',
      playingHighlight: 'bg-emerald-100 text-emerald-950 ring-2 ring-emerald-600 font-semibold',
      ornament: 'text-emerald-800',
    },
    night: {
      container: 'bg-[#0E1713] text-[#E7EFE9] border-[#1E3027]',
      outerFrame: 'border-[#1E3027] shadow-[0_4px_35px_rgba(0,0,0,0.6)]',
      innerBorder: 'border-[#192A22]',
      headerBand: 'bg-[#15241D] border-[#22392E] text-[#DCE7E0]',
      ayahHighlight: 'bg-[#192A22] text-amber-200 ring-1 ring-amber-500/40',
      playingHighlight: 'bg-emerald-900/60 text-emerald-100 ring-2 ring-emerald-400 font-semibold',
      ornament: 'text-amber-400',
    },
  }[paperTheme];

  return (
    <div className="space-y-6">
      {/* Mushaf Reading Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-stone-100/90 rounded-xl border border-stone-200/80 text-xs">
        {/* Paper Theme Picker */}
        <div className="flex items-center gap-1.5">
          <span className="text-stone-500 font-medium mr-1 hidden sm:inline">Nuansa Kertas:</span>
          <button
            onClick={() => setPaperTheme('cream')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              paperTheme === 'cream'
                ? 'bg-[#FBF7EE] text-stone-900 font-bold border border-amber-300 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#E8DFCE] border border-amber-600/40" />
            <span>Krem Mushaf</span>
          </button>

          <button
            onClick={() => setPaperTheme('white')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              paperTheme === 'white'
                ? 'bg-white text-stone-900 font-bold border border-stone-300 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-stone-300" />
            <span>Putih Bersih</span>
          </button>

          <button
            onClick={() => setPaperTheme('night')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              paperTheme === 'night'
                ? 'bg-[#15241D] text-white font-bold border border-emerald-600 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#0E1713] border border-emerald-500/50" />
            <span>Malam Khusyuk</span>
          </button>
        </div>

        {/* Font Size & Page Controls */}
        <div className="flex items-center gap-3">
          {/* Font Scale */}
          <div className="flex items-center gap-1">
            <span className="text-stone-500 text-[11px] hidden sm:inline">Ukuran Huruf:</span>
            <button
              onClick={() => setMushafFontSize((prev) => Math.max(26, prev - 3))}
              className="px-2 py-1 bg-white hover:bg-stone-200 text-stone-700 font-bold rounded border border-stone-200 cursor-pointer"
              title="Perkecil Font"
            >
              A-
            </button>
            <span className="font-mono text-stone-600 text-[11px] px-1">{mushafFontSize}</span>
            <button
              onClick={() => setMushafFontSize((prev) => Math.min(48, prev + 3))}
              className="px-2 py-1 bg-white hover:bg-stone-200 text-stone-700 font-bold rounded border border-stone-200 cursor-pointer"
              title="Perbesar Font"
            >
              A+
            </button>
          </div>

          {/* Quick Info */}
          <span className="text-[11px] text-stone-500 font-mono hidden md:inline">
            Hal. {currentPage} / {totalPages}
          </span>
        </div>
      </div>

      {/* PHYSICAL MUSHAF BOOK PAGE CONTAINER */}
      <div
        className={`relative rounded-2xl border-2 p-6 sm:p-10 transition-colors duration-300 ${themeStyles.container} ${themeStyles.outerFrame}`}
      >
        {/* Ornate Double Border Frame (Like a Traditional Printed Quran Page) */}
        <div
          className={`border-2 rounded-xl p-5 sm:p-8 relative ${themeStyles.innerBorder}`}
        >
          {/* Subtle Islamic Corner Filigree Indicators */}
          <div className="absolute top-2 left-2 text-[10px] text-amber-700/60 font-serif select-none">
            ❖
          </div>
          <div className="absolute top-2 right-2 text-[10px] text-amber-700/60 font-serif select-none">
            ❖
          </div>
          <div className="absolute bottom-2 left-2 text-[10px] text-amber-700/60 font-serif select-none">
            ❖
          </div>
          <div className="absolute bottom-2 right-2 text-[10px] text-amber-700/60 font-serif select-none">
            ❖
          </div>

          {/* Top Page Header Band (Surah Title, Place & Verse Count) */}
          <div
            className={`border rounded-lg px-4 py-2.5 mb-6 text-center select-none ${themeStyles.headerBand}`}
          >
            <div className="flex items-center justify-between text-xs font-serif font-medium">
              <span className="text-xs tracking-wider opacity-80">
                {surah.tempatTurun} · {surah.jumlahAyat} Ayat
              </span>
              <span className="font-bold text-sm tracking-wide">
                سُوْرَةُ {surah.nama} ({surah.namaLatin})
              </span>
              <span className="text-xs tracking-wider opacity-80">
                Halaman {currentPage} / {totalPages}
              </span>
            </div>
          </div>

          {/* Bismillah Banner for Page 1 (except Surah 9 At-Taubah) */}
          {currentPage === 1 && surah.nomor !== 9 && (
            <div className="text-center pb-6 mb-4 border-b border-dashed border-stone-300/60">
              <p className="font-arabic text-3xl sm:text-4xl text-amber-900 dark:text-amber-200 tracking-wider">
                بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
              </p>
            </div>
          )}

          {/* CONTINUOUS QURANIC MUSHAF TEXT (Flowing smoothly like real paper page) */}
          <div className="text-right leading-[2.6] select-text">
            <p
              className="font-arabic text-justify tracking-normal inline"
              style={{
                fontSize: `${mushafFontSize}px`,
                lineHeight: '2.5',
              }}
            >
              {pageVerses.map((ayah) => {
                const isPlayingThisAyah =
                  currentPlayingAyah?.surahNumber === surah.nomor &&
                  currentPlayingAyah?.ayahNumber === ayah.nomorAyat &&
                  isPlaying;

                const isSelected = activeSelectedAyah?.nomorAyat === ayah.nomorAyat;

                return (
                  <span
                    key={ayah.nomorAyat}
                    id={`mushaf-ayah-${ayah.nomorAyat}`}
                    onClick={() => setActiveSelectedAyah(ayah)}
                    className={`inline px-1.5 py-0.5 rounded-lg transition-all duration-200 cursor-pointer ${
                      isPlayingThisAyah
                        ? themeStyles.playingHighlight
                        : isSelected
                        ? themeStyles.ayahHighlight
                        : 'hover:bg-amber-100/60 dark:hover:bg-emerald-950/40'
                    }`}
                    title={`Klik untuk melihat arti QS. ${surah.namaLatin} : ${ayah.nomorAyat}`}
                  >
                    {ayah.teksArab}
                    {/* Verse End Symbol (Medallion with eastern numeral: ۝١) */}
                    <span
                      className={`inline-flex items-center justify-center mx-1.5 text-[0.85em] font-arabic font-normal select-none ${themeStyles.ornament}`}
                    >
                      ۝{toArabicNumeral(ayah.nomorAyat)}
                    </span>
                  </span>
                );
              })}
            </p>
          </div>

          {/* Bottom Page Number Marker */}
          <div className="mt-8 pt-4 border-t border-stone-300/40 flex items-center justify-between text-xs text-stone-500 font-mono select-none">
            <span>Surat Ke-{surah.nomor}</span>
            <span className="font-semibold px-2 py-0.5 bg-stone-200/50 rounded text-stone-700">
              {currentPage}
            </span>
            <span>Juz Amma / Al-Qur'an Standar</span>
          </div>
        </div>

        {/* Page Turning Navigation Buttons */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 mt-6">
            <button
              onClick={() => {
                setCurrentPage((prev) => Math.max(1, prev - 1));
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
              disabled={currentPage <= 1}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentPage <= 1
                  ? 'opacity-40 cursor-not-allowed text-stone-400 bg-stone-100'
                  : 'bg-emerald-950 text-white hover:bg-emerald-900 shadow-xs'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Halaman Sebelumnya</span>
            </button>

            <span className="text-xs font-mono font-medium text-stone-600">
              {currentPage} dari {totalPages} Halaman
            </span>

            <button
              onClick={() => {
                setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
              disabled={currentPage >= totalPages}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentPage >= totalPages
                  ? 'opacity-40 cursor-not-allowed text-stone-400 bg-stone-100'
                  : 'bg-emerald-950 text-white hover:bg-emerald-900 shadow-xs'
              }`}
            >
              <span>Halaman Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* FLOATING TRANSLATION DRAWER / POPUP FOR SELECTED AYAH */}
      {activeSelectedAyah && (
        <div className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-8 sm:w-[480px] z-40 bg-white dark:bg-stone-900 rounded-2xl p-5 shadow-2xl border border-stone-300 dark:border-stone-700 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-emerald-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                {activeSelectedAyah.nomorAyat}
              </span>
              <div>
                <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
                  QS. {surah.namaLatin} : {activeSelectedAyah.nomorAyat}
                </h4>
                <p className="text-[11px] text-stone-500">
                  Terjemah Resmi Kemenag RI
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Play Audio Button */}
              <button
                onClick={() => {
                  const isThisPlaying =
                    currentPlayingAyah?.surahNumber === surah.nomor &&
                    currentPlayingAyah?.ayahNumber === activeSelectedAyah.nomorAyat &&
                    isPlaying;

                  if (isThisPlaying) {
                    onPauseAudio();
                  } else {
                    onPlayAyah(
                      surah.nomor,
                      activeSelectedAyah.nomorAyat,
                      getAudioUrl(activeSelectedAyah)
                    );
                  }
                }}
                className="p-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white transition-colors cursor-pointer"
                title="Dengarkan Suara Ayat Ini"
              >
                {currentPlayingAyah?.surahNumber === surah.nomor &&
                currentPlayingAyah?.ayahNumber === activeSelectedAyah.nomorAyat &&
                isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
              </button>

              {/* Bookmark */}
              <button
                onClick={() => onSaveBookmark(activeSelectedAyah, surah)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isAyahBookmarked(surah.nomor, activeSelectedAyah.nomorAyat)
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-stone-400 hover:text-amber-600 hover:bg-stone-100'
                }`}
                title="Tandai Bookmark"
              >
                <Bookmark
                  className={`w-4 h-4 ${
                    isAyahBookmarked(surah.nomor, activeSelectedAyah.nomorAyat)
                      ? 'fill-current'
                      : ''
                  }`}
                />
              </button>

              {/* Copy */}
              <button
                onClick={() => handleCopyAyah(activeSelectedAyah)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                title="Salin Ayat"
              >
                {copiedAyah === activeSelectedAyah.nomorAyat ? (
                  <Check className="w-4 h-4 text-emerald-700" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              {/* Dismiss */}
              <button
                onClick={() => setActiveSelectedAyah(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition-colors cursor-pointer ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Latin Transliteration */}
          <p className="text-xs text-emerald-900 dark:text-emerald-300 font-medium italic mb-2 leading-relaxed">
            {activeSelectedAyah.teksLatin}
          </p>

          {/* Translation */}
          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-light mb-3">
            "{activeSelectedAyah.teksIndonesia}"
          </p>

          {/* Tahfidz Status Selector inside Drawer */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
            <span className="text-[11px] text-stone-500">Status Hafalan:</span>
            <div className="flex items-center gap-1.5">
              {(['none', 'memorizing', 'mutqin'] as MemorizationStatus[]).map((st) => {
                const currentSt =
                  tahfidzStatus[`${surah.nomor}_${activeSelectedAyah.nomorAyat}`] || 'none';
                const isCurr = currentSt === st;
                return (
                  <button
                    key={st}
                    onClick={() =>
                      onUpdateTahfidzStatus(surah.nomor, activeSelectedAyah.nomorAyat, st)
                    }
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      isCurr
                        ? st === 'mutqin'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-400 font-bold'
                          : st === 'memorizing'
                          ? 'bg-amber-100 text-amber-900 border border-amber-400 font-bold'
                          : 'bg-stone-200 text-stone-900 font-bold'
                        : 'text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    {st === 'none' ? 'Belum' : st === 'memorizing' ? 'Dihafal' : 'Mutqin'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
