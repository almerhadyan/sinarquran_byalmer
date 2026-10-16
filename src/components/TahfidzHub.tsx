import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Award,
  Play,
  RotateCcw,
  BookOpen,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  Target
} from 'lucide-react';
import { MemorizationStatus, SurahMeta } from '../types/quran';
import { ALL_SURAHS } from '../data/surahList';
import peaceImg from '../assets/images/quran_memorization_peace_1792149227269.jpg';

interface TahfidzHubProps {
  tahfidzStatus: Record<string, MemorizationStatus>;
  onSelectSurah: (nomor: number) => void;
  streakCount: number;
}

export const TahfidzHub: React.FC<TahfidzHubProps> = ({
  tahfidzStatus,
  onSelectSurah,
  streakCount,
}) => {
  // Count mutqin and memorizing ayahs
  const allEntries = Object.entries(tahfidzStatus);
  const mutqinCount = allEntries.filter(([_, status]) => status === 'mutqin').length;
  const memorizingCount = allEntries.filter(([_, status]) => status === 'memorizing').length;

  // Global Quiz State
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState<number>(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);

  // Sample curated quiz questions for Juz 30 & Popular Surahs
  const QUIZ_QUESTIONS = [
    {
      surah: 'Al-Ikhlas (112)',
      promptArab: 'قُلْ هُوَ اللّٰهُ اَحَدٌۚ',
      promptLatin: 'Qul huwallāhu aḥad',
      options: [
        { arab: 'اَللّٰهُ الصَّمَدُۚ', latin: 'Allāhuṣ-ṣamad', correct: true },
        { arab: 'لَمْ يَلِدْ وَلَمْ يُوْلَدْۙ', latin: 'Lam yalid wa lam yūlad', correct: false },
        { arab: 'وَلَمْ يَكُنْ لَّهٗ كُفُوًا اَحَدٌ', latin: 'Wa lam yakul lahū kufuwan aḥad', correct: false },
      ],
    },
    {
      surah: 'Al-Falaq (113)',
      promptArab: 'قُلْ اَعُوْذُ بِرَبِّ الْفَلَقِۙ',
      promptLatin: 'Qul a\'ūżu birabbil-falaq',
      options: [
        { arab: 'مِنْ شَرِّ مَا خَلَقَۙ', latin: 'Min syarri mā khalaq', correct: true },
        { arab: 'وَمِنْ شَرِّ غَاسِقٍ اِذَا وَقَبَۙ', latin: 'Wa min syarri gāsiqin iżā waqab', correct: false },
        { arab: 'وَمِنْ شَرِّ النَّفّٰثٰتِ فِى الْعُقَدِۙ', latin: 'Wa min syarrin-naffāṡāti fil-\'uqad', correct: false },
      ],
    },
    {
      surah: 'An-Nas (114)',
      promptArab: 'قُلْ اَعُوْذُ بِرَبِّ النَّاسِۙ',
      promptLatin: 'Qul a\'ūżu birabbin-nās',
      options: [
        { arab: 'مَلِكِ النَّاسِۙ', latin: 'Malikin-nās', correct: true },
        { arab: 'اِلٰهِ النَّاسِۙ', latin: 'Ilāhin-nās', correct: false },
        { arab: 'مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِۙ', latin: 'Min syarril-waswāsil-khannās', correct: false },
      ],
    },
    {
      surah: 'Al-Kautsar (108)',
      promptArab: 'اِنَّآ اَعْطَيْنٰكَ الْكَوْثَرَۗ',
      promptLatin: 'Innā a\'ṭainākal-kauṡar',
      options: [
        { arab: 'فَصَلِّ لِرَبِّكَ وَانْحَرْۗ', latin: 'Faṣalli lirabbika wan-ḥar', correct: true },
        { arab: 'اِنَّ شَانِئَكَ هُوَ الْاَبْتَرُ', latin: 'Inna syāni\'aka huwal-abtar', correct: false },
        { arab: 'لَكُمْ دِيْنُكُمْ وَلِيَ دِيْنِ', latin: 'Lakum dīnukum wa liya dīn', correct: false },
      ],
    },
    {
      surah: 'Adh-Dhuha (93)',
      promptArab: 'وَالضُّحٰىۙ',
      promptLatin: 'Waḍ-ḍuḥā',
      options: [
        { arab: 'وَالَّيْلِ اِذَا سَجٰىۙ', latin: 'Wal-laili iżā sajā', correct: true },
        { arab: 'مَا وَدَّعَكَ رَبُّكَ وَمَا قَلٰىۗ', latin: 'Mā wadda\'aka rabbuka wa mā qalā', correct: false },
        { arab: 'وَلَلْاٰخِرَةُ خَيْرٌ لَّكَ مِنَ الْاُوْلٰىۗ', latin: 'Wa lal-ākhiratu khairul laka minal-ūlā', correct: false },
      ],
    },
  ];

  const currentQ = QUIZ_QUESTIONS[quizQuestionIndex];

  const handleSelectQuizOption = (idx: number, isCorrect: boolean) => {
    if (quizAnswered) return;
    setQuizSelectedOption(idx);
    setQuizAnswered(true);
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (quizQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setQuizQuestionIndex((prev) => prev + 1);
      setQuizSelectedOption(null);
      setQuizAnswered(false);
    } else {
      // Quiz completed
      setQuizQuestionIndex(QUIZ_QUESTIONS.length);
    }
  };

  const restartQuiz = () => {
    setQuizQuestionIndex(0);
    setQuizScore(0);
    setQuizSelectedOption(null);
    setQuizAnswered(false);
    setQuizStarted(true);
  };

  // Popular Tahfidz packages
  const juzAmmaSurahs = ALL_SURAHS.filter((s) => s.nomor >= 78);
  const popularSurahs = ALL_SURAHS.filter((s) => [67, 56, 55, 36, 18].includes(s.nomor));

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Top Banner with Peaceful Atmosphere Image */}
      <div className="relative overflow-hidden rounded-2xl bg-stone-900 text-white border border-stone-800 p-6 sm:p-10 mb-8 shadow-md">
        <div className="absolute inset-0 z-0">
          <img
            src={peaceImg}
            alt="Tahfidz Al-Qur'an Sanctuary"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25 object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/90 to-stone-900/40" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-amber-300/90 mb-2 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pusat Tahfidz & Muraja'ah Mandiri</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight mb-3">
            Hafalkan Kalam Ilahi, Perkuat Ingatan Hati
          </h2>

          <p className="text-stone-300 text-sm leading-relaxed font-light mb-6">
            Rasulullah SAW bersabda: <em>"Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya."</em> (HR. Bukhari). 
            Gunakan metode pengulangan (tikrar), penutupan teks bertahap, dan kuis sambung ayat untuk menjaga kemutqinan hafalan Anda.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-800 text-xs">
            <div>
              <p className="text-stone-400 text-[11px] mb-0.5">Ayat Mutqin (Lancar)</p>
              <p className="text-2xl font-serif font-bold text-emerald-400 tabular-nums">
                {mutqinCount}
              </p>
            </div>

            <div>
              <p className="text-stone-400 text-[11px] mb-0.5">Sedang Dihafal</p>
              <p className="text-2xl font-serif font-bold text-amber-400 tabular-nums">
                {memorizingCount}
              </p>
            </div>

            <div>
              <p className="text-stone-400 text-[11px] mb-0.5">Konsistensi Tilawah</p>
              <p className="text-2xl font-serif font-bold text-white tabular-nums flex items-center gap-1">
                {streakCount} <span className="text-xs font-normal text-stone-400">Hari</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Quiz & Packages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Interactive Verse Continuity Quiz (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-stone-200">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-800" />
                  Kuis Sambung Ayat (Uji Kelancaran)
                </h3>
                <p className="text-xs text-stone-500 font-light">
                  Uji hafalan Anda dengan memilih kelanjutan ayat yang benar secara langsung.
                </p>
              </div>

              {!quizStarted && (
                <button
                  onClick={() => setQuizStarted(true)}
                  className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Mulai Kuis
                </button>
              )}
            </div>

            {!quizStarted ? (
              <div className="text-center py-10 px-4 bg-stone-50 rounded-xl border border-stone-200/70">
                <Target className="w-10 h-10 text-emerald-800 mx-auto mb-3 opacity-80" />
                <h4 className="font-serif font-bold text-stone-900 text-base mb-1">
                  Siap Menguji Ketajaman Hafalan Anda?
                </h4>
                <p className="text-xs text-stone-600 max-w-md mx-auto mb-5 leading-relaxed font-light">
                  Selesaikan 5 soal sambung ayat dari surat-surat Juz 'Amma. Setiap soal akan menguji ingatan urutan ayat dan makhraj lafal.
                </p>
                <button
                  onClick={() => setQuizStarted(true)}
                  className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Mulai Tes Sambung Ayat Sekarang
                </button>
              </div>
            ) : quizQuestionIndex < QUIZ_QUESTIONS.length ? (
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 mb-4 pb-2 border-b border-stone-100">
                  <span className="font-mono">
                    Pertanyaan {quizQuestionIndex + 1} dari {QUIZ_QUESTIONS.length}
                  </span>
                  <span className="text-emerald-800 font-semibold">
                    Surat: {currentQ.surah}
                  </span>
                </div>

                {/* Prompt Card */}
                <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 text-center mb-6">
                  <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium block mb-2">
                    Lafal Ayat Pertama:
                  </span>
                  <p className="font-arabic text-3xl sm:text-4xl text-stone-900 mb-2 leading-relaxed">
                    {currentQ.promptArab}
                  </p>
                  <p className="text-xs text-stone-500 italic">
                    "{currentQ.promptLatin}"
                  </p>
                </div>

                <p className="text-xs font-bold text-stone-700 mb-3">
                  Pilihlah sambungan ayat berikutnya yang benar:
                </p>

                <div className="space-y-3 mb-6">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = quizSelectedOption === idx;
                    let btnStyle = 'bg-stone-50 border-stone-200 hover:border-emerald-800 text-stone-800';

                    if (quizAnswered) {
                      if (opt.correct) {
                        btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                      } else if (isSelected && !opt.correct) {
                        btnStyle = 'bg-rose-50 border-rose-400 text-rose-950';
                      } else {
                        btnStyle = 'opacity-50 bg-stone-50 border-stone-200 text-stone-400';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={quizAnswered}
                        onClick={() => handleSelectQuizOption(idx, opt.correct)}
                        className={`w-full text-right p-4 rounded-xl border transition-all cursor-pointer ${btnStyle}`}
                      >
                        <p className="font-arabic text-2xl leading-relaxed mb-1">
                          {opt.arab}
                        </p>
                        <p className="text-xs font-sans text-left text-stone-500">
                          {opt.latin}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {quizAnswered && (
                  <div className="flex items-center justify-between p-4 bg-stone-100 rounded-xl">
                    <span className="text-xs font-semibold text-stone-700">
                      {currentQ.options[quizSelectedOption!]?.correct
                        ? '✅ Maa syaa Allah! Sambungan ayat Anda benar.'
                        : '❌ Kurang tepat. Perhatikan tanda ayat dan bunyinya.'}
                    </span>
                    <button
                      onClick={handleNextQuestion}
                      className="px-4 py-2 bg-emerald-900 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 cursor-pointer"
                    >
                      {quizQuestionIndex === QUIZ_QUESTIONS.length - 1 ? 'Lihat Hasil' : 'Lanjut Soal'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Quiz Finished */
              <div className="text-center py-8 px-4 bg-stone-50 rounded-xl border border-stone-200">
                <Award className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                <h4 className="font-serif font-bold text-stone-900 text-xl mb-1">
                  Kuis Selesai!
                </h4>
                <p className="text-stone-600 text-xs mb-4">
                  Skor Anda: <strong className="text-emerald-900 font-bold text-sm">{quizScore} / {QUIZ_QUESTIONS.length}</strong> Benar
                </p>
                <div className="p-3 bg-white rounded-lg border border-stone-200 max-w-xs mx-auto mb-5 text-xs text-stone-600">
                  {quizScore === QUIZ_QUESTIONS.length
                    ? 'Mumtaz! Hafalan surat pendek Anda sangat kuat dan mutqin.'
                    : 'Bagus! Terus ulangi hafalan setiap hari untuk mempertahankan kekuatan ingatan.'}
                </div>
                <button
                  onClick={restartQuiz}
                  className="px-4 py-2 bg-emerald-900 text-white text-xs font-semibold rounded-lg hover:bg-emerald-800 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Ulangi Kuis
                </button>
              </div>
            )}
          </div>

          {/* Curated Package: Juz 'Amma (Surat 78 - 114) */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  Target Hafalan: Juz 'Amma (Juz 30)
                </h3>
                <p className="text-xs text-stone-500 font-light">
                  37 Surat Pendek yang paling sering dibaca dalam shalat sehari-hari.
                </p>
              </div>
              <span className="text-xs text-stone-500 font-mono">
                37 Surat
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {juzAmmaSurahs.map((surah) => {
                return (
                  <button
                    key={surah.nomor}
                    onClick={() => onSelectSurah(surah.nomor)}
                    className="p-3 text-left bg-stone-50 hover:bg-emerald-50/60 rounded-xl border border-stone-200 hover:border-emerald-700/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[11px] font-semibold text-stone-500 group-hover:text-emerald-900">
                        {surah.nomor}
                      </span>
                      <span className="font-arabic text-base text-stone-800 group-hover:text-emerald-950">
                        {surah.nama}
                      </span>
                    </div>
                    <p className="font-semibold text-xs text-stone-900 group-hover:text-emerald-950 truncate">
                      {surah.namaLatin}
                    </p>
                    <p className="text-[11px] text-stone-500 font-light">
                      {surah.jumlahAyat} Ayat
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Popular Surahs & 3T Method Guidance */}
        <div className="space-y-6">
          {/* Top 5 High-Merit Surahs */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs">
            <h3 className="font-serif font-bold text-base text-stone-900 mb-1">
              Surat Pilihan Utama untuk Dihafal
            </h3>
            <p className="text-xs text-stone-500 font-light mb-4">
              Surat-surat berkeutamaan agung dalam hadits shahih.
            </p>

            <div className="space-y-2.5">
              {popularSurahs.map((surah) => (
                <div
                  key={surah.nomor}
                  onClick={() => onSelectSurah(surah.nomor)}
                  className="p-3.5 bg-stone-50 hover:bg-emerald-50/60 rounded-xl border border-stone-200/90 hover:border-emerald-800/40 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-stone-700 group-hover:text-emerald-900">
                        {surah.nomor}.
                      </span>
                      <h4 className="font-semibold text-xs text-stone-900 group-hover:text-emerald-950">
                        Surat {surah.namaLatin}
                      </h4>
                    </div>
                    <p className="text-[11px] text-stone-500 font-light mt-0.5">
                      {surah.arti} · {surah.jumlahAyat} Ayat
                    </p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-900 group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>
          </div>

          {/* 3T Method Guide (Talaqqi, Tafahhum, Tikrar) */}
          <div className="bg-emerald-950 text-white rounded-2xl p-6 border border-emerald-900 shadow-xs">
            <h3 className="font-serif font-bold text-base text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Metode Emas 3T Para Huffadz
            </h3>
            <p className="text-xs text-emerald-200/90 font-light mb-4 leading-relaxed">
              Panduan para ulama agar hafalan melekat kuat di dalam dada:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-900/60 rounded-lg border border-emerald-800">
                <p className="font-bold text-amber-200 mb-0.5">1. Talaqqi & Tasmi' (Mendengar)</p>
                <p className="text-stone-300 font-light leading-relaxed">
                  Dengarkan audio qari terpercaya (seperti Syeikh Al-Husary / Al-Afasy) berulang kali agar panjang-pendek tajwid tepat sebelum mulai melafalkan sendiri.
                </p>
              </div>

              <div className="p-3 bg-emerald-900/60 rounded-lg border border-emerald-800">
                <p className="font-bold text-amber-200 mb-0.5">2. Tafahhum (Memahami Makna)</p>
                <p className="text-stone-300 font-light leading-relaxed">
                  Baca terjemahan dan intisari ayat terlebih dahulu. Memahami alur kisah atau pesan hukum mempermudah otak mengingat urutan ayat.
                </p>
              </div>

              <div className="p-3 bg-emerald-900/60 rounded-lg border border-emerald-800">
                <p className="font-bold text-amber-200 mb-0.5">3. Tikrar (Pengulangan Konsisten)</p>
                <p className="text-stone-300 font-light leading-relaxed">
                  Ulangi satu ayat minimal 5-10 kali hingga lancar, sambungkan dengan ayat berikutnya, lalu gunakan dalam shalat fardhu dan shalat sunnah.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
