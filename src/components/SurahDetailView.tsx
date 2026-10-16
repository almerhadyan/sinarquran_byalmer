import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Bookmark,
  Share2,
  Copy,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  BookOpen,
  Volume2,
  Sparkles,
  Check,
  Maximize2,
  BookText,
  List
} from 'lucide-react';
import { Ayah, SurahDetail, TafsirDetail, MemorizationStatus, Qari } from '../types/quran';
import { quranApi } from '../services/quranApi';
import { getAyahAudioCandidates } from '../services/audioResolver';
import { MushafPageView } from './MushafPageView';

interface SurahDetailViewProps {
  surahNumber: number;
  onBack: () => void;
  onSelectSurah: (nomor: number) => void;
  currentPlayingAyah: { surahNumber: number; ayahNumber: number } | null;
  isPlaying: boolean;
  onPlayAyah: (surahNumber: number, ayahNumber: number, audioUrl: string) => void;
  onPauseAudio: () => void;
  activeQari: Qari;
  onSaveBookmark: (ayah: Ayah, surah: SurahDetail) => void;
  isAyahBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
  tahfidzStatus: Record<string, MemorizationStatus>;
  onUpdateTahfidzStatus: (surahNumber: number, ayahNumber: number, status: MemorizationStatus) => void;
  onSetLastRead: (surahNumber: number, surahName: string, ayahNumber: number) => void;
}

export const SurahDetailView: React.FC<SurahDetailViewProps> = ({
  surahNumber,
  onBack,
  onSelectSurah,
  currentPlayingAyah,
  isPlaying,
  onPlayAyah,
  onPauseAudio,
  activeQari,
  onSaveBookmark,
  isAyahBookmarked,
  tahfidzStatus,
  onUpdateTahfidzStatus,
  onSetLastRead,
}) => {
  const [detail, setDetail] = useState<SurahDetail | null>(null);
  const [tafsir, setTafsir] = useState<TafsirDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'baca' | 'tahfidz' | 'tafsir' | 'kisah'>('baca');
  const [readingLayout, setReadingLayout] = useState<'mushaf' | 'list'>('mushaf');

  // Display toggles
  const [showLatin, setShowLatin] = useState<boolean>(true);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [arabicFontSize, setArabicFontSize] = useState<number>(32); // in px
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);

  // Tahfidz specific states
  const [hideArabicMode, setHideArabicMode] = useState<boolean>(false);
  const [revealedAyahs, setRevealedAyahs] = useState<Set<number>>(new Set());
  const [repeatCount, setRepeatCount] = useState<number>(3);
  const [pauseSeconds, setPauseSeconds] = useState<number>(2);
  const [quizMode, setQuizMode] = useState<boolean>(false);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Fetch surah detail & tafsir
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function loadData() {
      try {
        const surahData = await quranApi.getSurahDetail(surahNumber);
        if (isMounted) {
          setDetail(surahData);
          onSetLastRead(surahData.nomor, surahData.namaLatin, 1);
        }

        // Fetch tafsir lazily or in background
        const tafsirData = await quranApi.getTafsir(surahNumber);
        if (isMounted) {
          setTafsir(tafsirData);
        }
      } catch (err) {
        console.error('Failed to load surah:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    // Reset tahfidz reveal on surah change
    setRevealedAyahs(new Set());
    setQuizMode(false);
    setQuizIndex(0);

    return () => {
      isMounted = false;
    };
  }, [surahNumber]);

  // Handle Ayah reveal in Tahfidz mode
  const toggleRevealAyah = (ayahNum: number) => {
    setRevealedAyahs((prev) => {
      const next = new Set(prev);
      if (next.has(ayahNum)) {
        next.delete(ayahNum);
      } else {
        next.add(ayahNum);
      }
      return next;
    });
  };

  const handleCopyAyah = (ayah: Ayah) => {
    const textToCopy = `${ayah.teksArab}\n\n"${ayah.teksIndonesia}"\n(QS. ${detail?.namaLatin} : ${ayah.nomorAyat})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAyah(ayah.nomorAyat);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  // Helper to pick audio URL based on active Qari with multi-tier candidate resolution
  const getAudioUrl = (ayah: Ayah): string => {
    const candidates = getAyahAudioCandidates(
      detail?.nomor || surahNumber,
      ayah.nomorAyat,
      activeQari,
      ayah.audio?.[activeQari.code]
    );
    return candidates[0] || '';
  };

  if (loading && !detail) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-12 text-stone-500">
        <div className="w-10 h-10 border-3 border-stone-200 border-t-emerald-800 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Memuat Surat Standar Kemenag RI...</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-stone-200 max-w-lg mx-auto">
        <p className="text-stone-700 mb-4">Gagal memuat surat. Silakan coba kembali.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-900 text-white text-xs font-semibold rounded-lg"
        >
          Kembali ke Daftar Surat
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Top Navigation Row: Back and Prev/Next Surah */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-emerald-950 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/70 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Daftar Surat</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          {detail.suratSebelumnya && typeof detail.suratSebelumnya === 'object' ? (
            <button
              onClick={() => {
                if (typeof detail.suratSebelumnya === 'object' && detail.suratSebelumnya) {
                  onSelectSurah(detail.suratSebelumnya.nomor);
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-emerald-800 text-stone-700 hover:text-emerald-950 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{detail.suratSebelumnya.namaLatin}</span>
              <span className="sm:hidden">Sebelumnya</span>
            </button>
          ) : (
            <span className="px-3 py-1.5 text-stone-300">Awal Mushaf</span>
          )}

          {detail.suratSelanjutnya && typeof detail.suratSelanjutnya === 'object' ? (
            <button
              onClick={() => {
                if (typeof detail.suratSelanjutnya === 'object' && detail.suratSelanjutnya) {
                  onSelectSurah(detail.suratSelanjutnya.nomor);
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-emerald-800 text-stone-700 hover:text-emerald-950 transition-colors cursor-pointer"
            >
              <span className="hidden sm:inline">{detail.suratSelanjutnya.namaLatin}</span>
              <span className="sm:hidden">Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="px-3 py-1.5 text-stone-300">Akhir Mushaf</span>
          )}
        </div>
      </div>

      {/* Surah Header Card */}
      <div className="bg-emerald-950 text-white rounded-2xl p-6 sm:p-8 mb-8 border border-emerald-900 shadow-md relative overflow-hidden">
        <div className="relative z-10 text-center">
          <p className="text-xs uppercase tracking-widest text-amber-300/80 mb-1 font-mono">
            Surat Ke-{detail.nomor}
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mb-1 text-white">
            {detail.namaLatin}
          </h2>
          <p className="font-arabic text-3xl sm:text-4xl text-amber-200 mb-3 font-normal">
            {detail.nama}
          </p>

          {/* Zero-Pill Unboxed Metadata */}
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-200/90 mb-4 font-light">
            <span>{detail.arti}</span>
            <span aria-hidden="true">·</span>
            <span>{detail.tempatTurun}</span>
            <span aria-hidden="true">·</span>
            <span>{detail.jumlahAyat} Ayat</span>
            <span aria-hidden="true">·</span>
            <span>Qari: {activeQari.name}</span>
          </div>

          <p className="text-xs text-stone-300/90 max-w-xl mx-auto leading-relaxed font-light mb-5">
            {detail.deskripsi}
          </p>

          {/* Quick Play Surah Button */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <button
              onClick={() => {
                if (isPlaying && currentPlayingAyah?.surahNumber === detail.nomor) {
                  onPauseAudio();
                } else {
                  const firstAyah = detail.ayat[0];
                  if (firstAyah) {
                    onPlayAyah(detail.nomor, firstAyah.nomorAyat, getAudioUrl(firstAyah));
                  }
                }
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              {isPlaying && currentPlayingAyah?.surahNumber === detail.nomor ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Jeda Murottal ({activeQari.name})</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Putar Surat {detail.namaLatin} ({activeQari.name})</span>
                </>
              )}
            </button>
          </div>

          {/* Bismillah Header (except Surah 9 At-Taubah) */}
          {detail.nomor !== 9 && (
            <div className="pt-4 border-t border-emerald-900/80">
              <p className="font-arabic text-2xl sm:text-3xl text-amber-100 tracking-wider">
                بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mode Switcher Tabs (Buttons with click handlers) */}
      <div className="flex items-center justify-between gap-2 p-1.5 bg-stone-200/70 rounded-xl mb-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('baca')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'baca'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Mode Baca
          </button>

          <button
            onClick={() => setActiveTab('tahfidz')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tahfidz'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Mode Menghafal (Tahfidz)
          </button>

          <button
            onClick={() => setActiveTab('tafsir')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tafsir'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Tafsir Kemenag
          </button>

          <button
            onClick={() => setActiveTab('kisah')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'kisah'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Asbabun Nuzul & Makna
          </button>
        </div>

        {/* Font Size & Display Options (Available on Mode Baca) */}
        {activeTab === 'baca' && (
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-stone-300 text-xs">
            <span className="text-stone-500 text-[11px]">Ukuran Arab:</span>
            <button
              onClick={() => setArabicFontSize((prev) => Math.max(24, prev - 4))}
              className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-300 text-stone-700 font-bold flex items-center justify-center cursor-pointer"
              title="Perkecil Font Arab"
            >
              A-
            </button>
            <span className="font-mono text-[11px] text-stone-600">{arabicFontSize}</span>
            <button
              onClick={() => setArabicFontSize((prev) => Math.min(48, prev + 4))}
              className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-300 text-stone-700 font-bold flex items-center justify-center cursor-pointer"
              title="Perbesar Font Arab"
            >
              A+
            </button>
          </div>
        )}
      </div>

      {/* SUB-PANEL: Settings Bar for Mode Baca */}
      {activeTab === 'baca' && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-stone-50 border border-stone-200/80 rounded-xl mb-6 text-xs text-stone-600">
          {/* Segmented Control: Halaman Mushaf vs Daftar Ayat */}
          <div className="flex items-center gap-1 bg-stone-200/80 p-0.5 rounded-lg">
            <button
              onClick={() => setReadingLayout('mushaf')}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                readingLayout === 'mushaf'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <BookText className="w-3.5 h-3.5" />
              <span>Halaman Mushaf</span>
            </button>
            <button
              onClick={() => setReadingLayout('list')}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                readingLayout === 'list'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Daftar Ayat & Terjemah</span>
            </button>
          </div>

          {readingLayout === 'list' && (
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showLatin}
                  onChange={(e) => setShowLatin(e.target.checked)}
                  className="rounded text-emerald-800 focus:ring-emerald-700 w-3.5 h-3.5"
                />
                <span>Tampilkan Latin</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showTranslation}
                  onChange={(e) => setShowTranslation(e.target.checked)}
                  className="rounded text-emerald-800 focus:ring-emerald-700 w-3.5 h-3.5"
                />
                <span>Tampilkan Terjemahan</span>
              </label>
            </div>
          )}

          <div className="text-[11px] text-stone-500 font-light hidden sm:inline">
            {readingLayout === 'mushaf'
              ? 'Tampilan Lembaran Mushaf Rasm Usmani (Klik ayat untuk arti & audio)'
              : 'Standar Rasm Usmani & Terjemah Kemenag RI'}
          </div>
        </div>
      )}

      {/* SUB-PANEL: Settings Bar for Mode Tahfidz */}
      {activeTab === 'tahfidz' && (
        <div className="p-5 bg-amber-50/70 border border-amber-200/80 rounded-xl mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h4 className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-700" />
                Alat Latihan Menghafal Al-Qur'an (Tahfidz)
              </h4>
              <p className="text-xs text-stone-600 font-light">
                Gunakan teknik masking (pengaburan ayat) dan pengulangan audio murottal berulang-ulang untuk memperkuat ingatan.
              </p>
            </div>

            <button
              onClick={() => setQuizMode(!quizMode)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                quizMode
                  ? 'bg-emerald-900 text-white'
                  : 'bg-white border border-stone-300 text-stone-800 hover:bg-stone-50'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {quizMode ? 'Tutup Kuis' : 'Tes Sambung Ayat'}
            </button>
          </div>

          {!quizMode ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-amber-200/60 text-xs">
              {/* Masking Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-100">
                <span className="font-medium text-stone-700">Tutup Teks Arab:</span>
                <button
                  onClick={() => setHideArabicMode(!hideArabicMode)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer flex items-center gap-1 ${
                    hideArabicMode
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {hideArabicMode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {hideArabicMode ? 'Tertutup (Klik utk buka)' : 'Terbuka'}
                </button>
              </div>

              {/* Repetition Count */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-100">
                <span className="font-medium text-stone-700">Ulangi Audio:</span>
                <select
                  value={repeatCount}
                  onChange={(e) => setRepeatCount(Number(e.target.value))}
                  className="bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs text-stone-800 font-semibold"
                >
                  <option value={1}>1x Pengulangan</option>
                  <option value={3}>3x (Disarankan)</option>
                  <option value={5}>5x Pengulangan</option>
                  <option value={7}>7x Pengulangan</option>
                  <option value={10}>10x Pengulangan</option>
                </select>
              </div>

              {/* Pause Interval */}
              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-100">
                <span className="font-medium text-stone-700">Jeda Melafalkan:</span>
                <select
                  value={pauseSeconds}
                  onChange={(e) => setPauseSeconds(Number(e.target.value))}
                  className="bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs text-stone-800 font-semibold"
                >
                  <option value={1}>1 Detik</option>
                  <option value={2}>2 Detik (Normal)</option>
                  <option value={3}>3 Detik</option>
                  <option value={5}>5 Detik (Lafalkan)</option>
                </select>
              </div>
            </div>
          ) : (
            /* Interactive Verse Quiz */
            <div className="bg-white p-4 rounded-xl border border-amber-200">
              <div className="flex items-center justify-between mb-3 text-xs text-stone-500">
                <span>Soal {quizIndex + 1} dari {Math.min(10, detail.ayat.length)}</span>
                <span className="font-medium text-amber-900">Tebak Lanjutan Ayat Berikutnya:</span>
              </div>

              {detail.ayat[quizIndex] && (
                <div>
                  <div className="p-4 bg-stone-50 rounded-lg mb-4 text-center border border-stone-200">
                    <p className="text-xs text-stone-400 mb-1">Ayat Ke-{detail.ayat[quizIndex].nomorAyat}</p>
                    <p className="font-arabic text-2xl text-stone-900 mb-2">
                      {detail.ayat[quizIndex].teksArab}
                    </p>
                    <p className="text-xs text-stone-500 italic">
                      "{detail.ayat[quizIndex].teksIndonesia}"
                    </p>
                  </div>

                  <p className="text-xs font-bold text-stone-700 mb-2">Pilih Lanjutan Ayat yang Benar:</p>
                  <div className="space-y-2 mb-4">
                    {/* Next correct ayah option + 2 distractor options */}
                    {[
                      detail.ayat[quizIndex + 1] || detail.ayat[0],
                      detail.ayat[(quizIndex + 3) % detail.ayat.length],
                      detail.ayat[(quizIndex + 5) % detail.ayat.length],
                    ]
                      .sort(() => (quizIndex % 2 === 0 ? 0.5 - Math.random() : -0.5 + Math.random()))
                      .map((opt, idx) => {
                        const isCorrect = opt.nomorAyat === (detail.ayat[quizIndex].nomorAyat + 1);
                        const isSelected = selectedQuizOption === idx;

                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedQuizOption(idx);
                              if (isCorrect) {
                                setQuizFeedback('correct');
                              } else {
                                setQuizFeedback('wrong');
                              }
                            }}
                            className={`w-full text-right p-3 rounded-lg border text-sm font-arabic transition-all cursor-pointer ${
                              isSelected
                                ? isCorrect
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                                  : 'bg-rose-50 border-rose-500 text-rose-950'
                                : 'bg-stone-50 border-stone-200 hover:border-emerald-800 text-stone-800'
                            }`}
                          >
                            <span className="font-arabic text-xl block mb-1">{opt.teksArab}</span>
                            <span className="text-[11px] text-stone-500 font-sans block text-left">
                              Ayat {opt.nomorAyat}: {opt.teksIndonesia.slice(0, 70)}...
                            </span>
                          </button>
                        );
                      })}
                  </div>

                  {quizFeedback && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-stone-100 text-xs">
                      <span className={`font-semibold ${quizFeedback === 'correct' ? 'text-emerald-800' : 'text-rose-800'}`}>
                        {quizFeedback === 'correct' ? 'Maa syaa Allah, jawaban Anda benar!' : 'Afwan, jawaban kurang tepat. Coba perhatikan lagi urutan ayatnya.'}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedQuizOption(null);
                          setQuizFeedback(null);
                          setQuizIndex((prev) => (prev + 1) % Math.min(10, detail.ayat.length));
                        }}
                        className="px-3 py-1 bg-emerald-900 text-white rounded font-medium cursor-pointer"
                      >
                        Soal Berikutnya
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Mode Baca (Mushaf Page or List) & Mode Tahfidz */}
      {activeTab === 'baca' && readingLayout === 'mushaf' ? (
        <MushafPageView
          surah={detail}
          currentPlayingAyah={currentPlayingAyah}
          isPlaying={isPlaying}
          onPlayAyah={onPlayAyah}
          onPauseAudio={onPauseAudio}
          activeQari={activeQari}
          onSaveBookmark={onSaveBookmark}
          isAyahBookmarked={isAyahBookmarked}
          tahfidzStatus={tahfidzStatus}
          onUpdateTahfidzStatus={onUpdateTahfidzStatus}
        />
      ) : (activeTab === 'baca' || activeTab === 'tahfidz') ? (
        <div className="space-y-4">
          {detail.ayat.map((ayah) => {
            const isPlayingThisAyah =
              currentPlayingAyah?.surahNumber === detail.nomor &&
              currentPlayingAyah?.ayahNumber === ayah.nomorAyat &&
              isPlaying;

            const isBookmarked = isAyahBookmarked(detail.nomor, ayah.nomorAyat);
            const statusKey = `${detail.nomor}_${ayah.nomorAyat}`;
            const memStatus = tahfidzStatus[statusKey] || 'none';
            const isMasked = hideArabicMode && !revealedAyahs.has(ayah.nomorAyat);

            return (
              <div
                key={ayah.nomorAyat}
                id={`ayah-${ayah.nomorAyat}`}
                className={`bg-white rounded-xl p-5 sm:p-6 border transition-all duration-200 ${
                  isPlayingThisAyah
                    ? 'border-emerald-700/80 bg-emerald-50/20 shadow-md ring-1 ring-emerald-700/30'
                    : 'border-stone-200/80 hover:border-stone-300 shadow-xs'
                }`}
              >
                {/* Verse Header Row: Number & Utility Actions */}
                <div className="flex items-center justify-between gap-3 mb-4 pb-2.5 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 text-stone-800 font-mono font-semibold text-xs flex items-center justify-center tabular-nums">
                      {ayah.nomorAyat}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">
                      QS. {detail.namaLatin} : {ayah.nomorAyat}
                    </span>
                  </div>

                  {/* Actions: Audio, Bookmark, Copy, Status */}
                  <div className="flex items-center gap-1">
                    {/* Audio Play/Pause Button */}
                    <button
                      onClick={() => {
                        if (isPlayingThisAyah) {
                          onPauseAudio();
                        } else {
                          onPlayAyah(detail.nomor, ayah.nomorAyat, getAudioUrl(ayah));
                        }
                      }}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        isPlayingThisAyah
                          ? 'bg-emerald-900 text-white'
                          : 'text-stone-500 hover:text-emerald-900 hover:bg-stone-100'
                      }`}
                      title={isPlayingThisAyah ? 'Hentikan Audio' : `Putar Audio Ayat ${ayah.nomorAyat}`}
                    >
                      {isPlayingThisAyah ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                    </button>

                    {/* Bookmark Button */}
                    <button
                      onClick={() => onSaveBookmark(ayah, detail)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        isBookmarked
                          ? 'text-amber-600 bg-amber-50'
                          : 'text-stone-400 hover:text-amber-600 hover:bg-stone-100'
                      }`}
                      title={isBookmarked ? 'Tersimpan di Bookmark' : 'Tandai Ayat Ini'}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopyAyah(ayah)}
                      className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      title="Salin Ayat & Terjemah"
                    >
                      {copiedAyah === ayah.nomorAyat ? (
                        <Check className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {/* Tahfidz Status Selector (Interactive button) */}
                    <div className="relative group ml-1">
                      <button
                        onClick={() => {
                          const nextStatus: MemorizationStatus =
                            memStatus === 'none'
                              ? 'memorizing'
                              : memStatus === 'memorizing'
                              ? 'mutqin'
                              : 'none';
                          onUpdateTahfidzStatus(detail.nomor, ayah.nomorAyat, nextStatus);
                        }}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                          memStatus === 'mutqin'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : memStatus === 'memorizing'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                        title="Klik untuk mengubah status hafalan (Belum -> Sedang Dihafal -> Mutqin)"
                      >
                        {memStatus === 'mutqin' && <CheckCircle className="w-3 h-3 text-emerald-800" />}
                        {memStatus === 'memorizing' && <Sparkles className="w-3 h-3 text-amber-700" />}
                        <span>
                          {memStatus === 'mutqin'
                            ? 'Mutqin'
                            : memStatus === 'memorizing'
                            ? 'Dihafal'
                            : '+ Hafalkan'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Arabic Verse Text */}
                <div className="mb-4 text-right">
                  {isMasked ? (
                    <div
                      onClick={() => toggleRevealAyah(ayah.nomorAyat)}
                      className="p-6 bg-stone-100/80 rounded-xl text-center cursor-pointer hover:bg-stone-200/70 border border-dashed border-stone-300 transition-colors"
                    >
                      <EyeOff className="w-5 h-5 text-stone-400 mx-auto mb-1" />
                      <span className="text-xs font-medium text-stone-600">
                        Ayat {ayah.nomorAyat} Disembunyikan (Klik di sini untuk mengintip/membuka)
                      </span>
                    </div>
                  ) : (
                    <p
                      className="font-arabic text-stone-900 leading-[2.2] tracking-wide select-text"
                      style={{ fontSize: `${arabicFontSize}px` }}
                    >
                      {ayah.teksArab}
                      <span className="inline-block mx-2 text-emerald-800 font-serif text-lg font-normal">
                        ۝{ayah.nomorAyat}
                      </span>
                    </p>
                  )}
                </div>

                {/* Latin Transliteration */}
                {showLatin && !isMasked && (
                  <p className="text-xs text-emerald-900/80 font-medium italic mb-2 leading-relaxed">
                    {ayah.teksLatin}
                  </p>
                )}

                {/* Indonesian Translation (Kemenag) */}
                {showTranslation && (
                  <p className="text-sm text-stone-700 leading-relaxed font-light">
                    {ayah.teksIndonesia}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* TAB CONTENT: Tafsir Kemenag */}
      {activeTab === 'tafsir' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-xs">
          <div className="mb-6 pb-4 border-b border-stone-200">
            <h3 className="font-serif font-bold text-xl text-stone-900 mb-1">
              Tafsir Lengkap Kemenag RI: Surat {detail.namaLatin}
            </h3>
            <p className="text-xs text-stone-500 font-light">
              Diterbitkan oleh Lajnah Pentashihan Mushaf Al-Qur'an Kementerian Agama Republik Indonesia.
            </p>
          </div>

          {tafsir ? (
            <div className="space-y-6">
              {tafsir.tafsir.map((t) => (
                <div key={t.ayat} className="pb-6 border-b border-stone-100 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-md bg-stone-100 text-stone-800 font-mono text-xs flex items-center justify-center font-bold">
                      {t.ayat}
                    </span>
                    <span className="text-xs font-semibold text-emerald-950">
                      Tafsir Ayat Ke-{t.ayat}
                    </span>
                  </div>
                  <div className="text-sm text-stone-700 leading-loose font-light prose max-w-none">
                    {t.teks}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-stone-500">
              <div className="w-8 h-8 border-2 border-stone-200 border-t-emerald-800 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs">Memuat data tafsir resmi Kemenag...</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Asbabun Nuzul & Kisah */}
      {activeTab === 'kisah' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-xs">
          <div className="mb-6 pb-4 border-b border-stone-200">
            <h3 className="font-serif font-bold text-xl text-stone-900 mb-1">
              Asbabun Nuzul & Makna Surat {detail.namaLatin}
            </h3>
            <p className="text-xs text-stone-500 font-light">
              Latar belakang diturunkannya wahyu, konteks historis, dan nilai-nilai tadabbur.
            </p>
          </div>

          <div className="space-y-6 text-sm text-stone-700 leading-relaxed font-light">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <h4 className="font-bold text-stone-900 text-sm mb-2">Pokok Kandungan & Tema Utama</h4>
              <p className="text-stone-700 leading-relaxed">{detail.deskripsi}</p>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 text-sm mb-2">Klasifikasi Turunnya Surat</h4>
              <p className="text-stone-700 leading-relaxed">
                Surat ini tergolong <strong className="font-semibold text-emerald-950">{detail.tempatTurun}</strong>, 
                terdiri dari {detail.jumlahAyat} ayat. Surat-surat Makkiyah menitikberatkan pada penanaman akidah tauhid, 
                penguatan mental kaum mukminin, dan kepastian hari akhir, sedangkan surat Madaniyah memuat syariat hukum dan tata kelola umat.
              </p>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <h4 className="font-bold text-emerald-950 text-sm mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-800" />
                Keutamaan Membaca & Menghafal Surat {detail.namaLatin}
              </h4>
              <p className="text-emerald-900 text-xs leading-relaxed">
                Rasulullah SAW bersabda bahwa setiap satu huruf yang dibaca dari Kitabullah bernilai satu kebaikan, 
                dan satu kebaikan dilipatgandakan menjadi sepuluh kali lipatnya. Membaca dan menghafalnya secara istiqomah 
                akan menjadi syafaat penolong di hari kiamat.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
