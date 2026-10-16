import React, { useState, useEffect, useMemo } from 'react';
import {
  SurahMeta,
  Ayah,
  SurahDetail,
  Qari,
  LastReadPosition,
  BookmarkAyah,
  MemorizationStatus,
  ReminderConfig
} from './types/quran';
import { ALL_SURAHS } from './data/surahList';
import { RECITERS } from './data/reciters';
import { quranApi } from './services/quranApi';
import { notificationService } from './services/notificationService';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { SurahListCard } from './components/SurahListCard';
import { SurahDetailView } from './components/SurahDetailView';
import { TahfidzHub } from './components/TahfidzHub';
import { StoriesSection } from './components/StoriesSection';
import { RecitersSection } from './components/RecitersSection';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { DailyReminderModal } from './components/DailyReminderModal';
import { getAyahAudioCandidates } from './services/audioResolver';
import { BookOpen, Sparkles, Heart, Bell } from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'surah' | 'tahfidz' | 'stories' | 'reciters'>('surah');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'makkiyah' | 'madaniyah' | 'juz30' | 'populer'>('all');

  // Reciter
  const [activeQari, setActiveQari] = useState<Qari>(RECITERS[0]); // Default Misyari

  // Audio Playback
  const [currentTrack, setCurrentTrack] = useState<{
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    audioUrl: string;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Bookmarks & Last Read
  const [bookmarks, setBookmarks] = useState<BookmarkAyah[]>(() => {
    try {
      const saved = localStorage.getItem('quran_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [lastRead, setLastRead] = useState<LastReadPosition | null>(() => {
    try {
      const saved = localStorage.getItem('quran_last_read');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Tahfidz Progress
  const [tahfidzStatus, setTahfidzStatus] = useState<Record<string, MemorizationStatus>>(() => {
    try {
      const saved = localStorage.getItem('quran_tahfidz_status');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Reminder Configuration & Modal
  const [reminderConfig, setReminderConfig] = useState<ReminderConfig>(() =>
    notificationService.getConfig()
  );
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);
  const [streakCount, setStreakCount] = useState<number>(reminderConfig.currentStreak);

  // Initialize Daily Streak & Reminder background checker
  useEffect(() => {
    const { streak } = notificationService.updateStreak();
    setStreakCount(streak);

    // Interval to check daily reminder time
    const interval = setInterval(() => {
      const config = notificationService.getConfig();
      if (!config.enabled) return;

      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${currentHours}:${currentMinutes}`;
      const todayStr = now.toISOString().split('T')[0];

      if (config.times.includes(timeStr) && config.lastNotifiedDate !== `${todayStr}_${timeStr}`) {
        notificationService.triggerTestNotification();
        config.lastNotifiedDate = `${todayStr}_${timeStr}`;
        notificationService.saveConfig(config);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Save Bookmarks to localStorage
  const handleSaveBookmark = (ayah: Ayah, surah: SurahDetail) => {
    const isAlready = bookmarks.some(
      (b) => b.surahNumber === surah.nomor && b.ayahNumber === ayah.nomorAyat
    );

    let updated: BookmarkAyah[];
    if (isAlready) {
      updated = bookmarks.filter(
        (b) => !(b.surahNumber === surah.nomor && b.ayahNumber === ayah.nomorAyat)
      );
    } else {
      const newItem: BookmarkAyah = {
        id: `${surah.nomor}_${ayah.nomorAyat}`,
        surahNumber: surah.nomor,
        surahName: surah.namaLatin,
        ayahNumber: ayah.nomorAyat,
        teksArab: ayah.teksArab,
        teksIndonesia: ayah.teksIndonesia,
        createdAt: new Date().toISOString(),
      };
      updated = [newItem, ...bookmarks];
    }

    setBookmarks(updated);
    try {
      localStorage.setItem('quran_bookmarks', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const isAyahBookmarked = (surahNumber: number, ayahNumber: number): boolean => {
    return bookmarks.some((b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber);
  };

  // Set Last Read
  const handleSetLastRead = (surahNumber: number, surahName: string, ayahNumber: number) => {
    const pos: LastReadPosition = {
      surahNumber,
      surahName,
      ayahNumber,
      timestamp: new Date().toISOString(),
    };
    setLastRead(pos);
    try {
      localStorage.setItem('quran_last_read', JSON.stringify(pos));
    } catch {
      // ignore
    }
  };

  // Update Tahfidz status
  const handleUpdateTahfidzStatus = (
    surahNumber: number,
    ayahNumber: number,
    status: MemorizationStatus
  ) => {
    const key = `${surahNumber}_${ayahNumber}`;
    setTahfidzStatus((prev) => {
      const updated = { ...prev, [key]: status };
      try {
        localStorage.setItem('quran_tahfidz_status', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Select and switch Qari
  const handleSelectQari = (qari: Qari) => {
    setActiveQari(qari);
    if (currentTrack) {
      const candidates = getAyahAudioCandidates(
        currentTrack.surahNumber,
        currentTrack.ayahNumber,
        qari
      );
      setCurrentTrack({
        ...currentTrack,
        audioUrl: candidates[0],
      });
      setIsPlaying(true);
    }
  };

  // Play Ayah Audio
  const handlePlayAyah = (surahNumber: number, ayahNumber: number, audioUrl: string) => {
    const surah = ALL_SURAHS.find((s) => s.nomor === surahNumber);
    setCurrentTrack({
      surahNumber,
      surahName: surah ? surah.namaLatin : `Surat ${surahNumber}`,
      ayahNumber,
      audioUrl,
    });
    setIsPlaying(true);
  };

  // Play Full Surah / Quick sample
  const handleQuickPlaySurah = async (surah: SurahMeta, e: React.MouseEvent, qariOverride?: Qari) => {
    e.stopPropagation();
    const qari = qariOverride || activeQari;
    const candidates = getAyahAudioCandidates(surah.nomor, 1, qari);
    handlePlayAyah(surah.nomor, 1, candidates[0]);
  };

  // Next Ayah Handler
  const handleNextAyah = async () => {
    if (!currentTrack) return;
    try {
      const detail = await quranApi.getSurahDetail(currentTrack.surahNumber);
      const nextAyahNum = currentTrack.ayahNumber + 1;
      const nextAyah = detail.ayat.find((a) => a.nomorAyat === nextAyahNum);

      if (nextAyah) {
        const candidates = getAyahAudioCandidates(
          currentTrack.surahNumber,
          nextAyahNum,
          activeQari,
          nextAyah.audio?.[activeQari.code]
        );
        handlePlayAyah(currentTrack.surahNumber, nextAyahNum, candidates[0]);

        // Auto-scroll to ayah element if in view
        const el = document.getElementById(`ayah-${nextAyahNum}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (currentTrack.surahNumber < 114) {
        // Advance to next surah first verse
        const nextSurahNum = currentTrack.surahNumber + 1;
        const candidates = getAyahAudioCandidates(nextSurahNum, 1, activeQari);
        handlePlayAyah(nextSurahNum, 1, candidates[0]);
      } else {
        setIsPlaying(false);
      }
    } catch {
      setIsPlaying(false);
    }
  };

  // Previous Ayah Handler
  const handlePrevAyah = async () => {
    if (!currentTrack || currentTrack.ayahNumber <= 1) return;
    try {
      const prevAyahNum = currentTrack.ayahNumber - 1;
      const candidates = getAyahAudioCandidates(
        currentTrack.surahNumber,
        prevAyahNum,
        activeQari
      );
      handlePlayAyah(currentTrack.surahNumber, prevAyahNum, candidates[0]);

      const el = document.getElementById(`ayah-${prevAyahNum}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch {
      // ignore
    }
  };

  // Filtered Surahs
  const filteredSurahs = useMemo(() => {
    return ALL_SURAHS.filter((surah) => {
      // Search query check
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        surah.namaLatin.toLowerCase().includes(q) ||
        surah.arti.toLowerCase().includes(q) ||
        surah.nomor.toString() === q;

      if (!matchesSearch) return false;

      // Filter category check
      if (selectedFilter === 'makkiyah') return surah.tempatTurun === 'Mekah';
      if (selectedFilter === 'madaniyah') return surah.tempatTurun === 'Madinah';
      if (selectedFilter === 'juz30') return surah.nomor >= 78;
      if (selectedFilter === 'populer')
        return [1, 18, 36, 55, 56, 67, 112, 113, 114].includes(surah.nomor);

      return true;
    });
  }, [searchQuery, selectedFilter]);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 3-Zone Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedSurahNumber(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        lastRead={lastRead}
        onOpenLastRead={() => {
          if (lastRead) {
            setSelectedSurahNumber(lastRead.surahNumber);
            setActiveTab('surah');
          }
        }}
        onOpenReminderModal={() => setIsReminderModalOpen(true)}
        streakCount={streakCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 pt-6">
        {/* VIEW 1: Surah Detail Page */}
        {selectedSurahNumber !== null ? (
          <SurahDetailView
            surahNumber={selectedSurahNumber}
            onBack={() => setSelectedSurahNumber(null)}
            onSelectSurah={(nomor) => {
              setSelectedSurahNumber(nomor);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentPlayingAyah={
              currentTrack
                ? { surahNumber: currentTrack.surahNumber, ayahNumber: currentTrack.ayahNumber }
                : null
            }
            isPlaying={isPlaying}
            onPlayAyah={handlePlayAyah}
            onPauseAudio={() => setIsPlaying(false)}
            activeQari={activeQari}
            onSaveBookmark={handleSaveBookmark}
            isAyahBookmarked={isAyahBookmarked}
            tahfidzStatus={tahfidzStatus}
            onUpdateTahfidzStatus={handleUpdateTahfidzStatus}
            onSetLastRead={handleSetLastRead}
          />
        ) : (
          <>
            {/* VIEW 2: Tab 'surah' (Surah Directory & Hero) */}
            {activeTab === 'surah' && (
              <div>
                <HeroBanner
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedFilter={selectedFilter}
                  setSelectedFilter={setSelectedFilter}
                  onSelectSurah={(nomor) => setSelectedSurahNumber(nomor)}
                />

                {/* Section Title & Surah Count */}
                <div className="flex items-center justify-between pb-3 mb-6 border-b border-stone-200">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                    Daftar 114 Surat Al-Qur'an
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-stone-500 font-light">
                    <span>Menampilkan {filteredSurahs.length} Surat</span>
                    <span aria-hidden="true">·</span>
                    <span>Standar Kemenag RI</span>
                  </div>
                </div>

                {/* Surahs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">
                  {filteredSurahs.map((surah) => {
                    // Count mutqin ayahs for this surah
                    const mutqinCount = Object.entries(tahfidzStatus).filter(
                      ([key, status]) => key.startsWith(`${surah.nomor}_`) && status === 'mutqin'
                    ).length;

                    return (
                      <SurahListCard
                        key={surah.nomor}
                        surah={surah}
                        onSelect={(nomor) => {
                          setSelectedSurahNumber(nomor);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        onQuickPlay={handleQuickPlaySurah}
                        isPlayingThisSurah={
                          currentTrack?.surahNumber === surah.nomor && isPlaying
                        }
                        mutqinAyatCount={mutqinCount}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 3: Tab 'tahfidz' (Memorization Center) */}
            {activeTab === 'tahfidz' && (
              <TahfidzHub
                tahfidzStatus={tahfidzStatus}
                onSelectSurah={(nomor) => {
                  setSelectedSurahNumber(nomor);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                streakCount={streakCount}
              />
            )}

            {/* VIEW 4: Tab 'stories' (Stories & Asbabun Nuzul) */}
            {activeTab === 'stories' && (
              <StoriesSection
                onSelectSurah={(nomor) => {
                  setSelectedSurahNumber(nomor);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* VIEW 5: Tab 'reciters' (World-famous Qaris) */}
            {activeTab === 'reciters' && (
              <RecitersSection
                activeQari={activeQari}
                onSelectQari={handleSelectQari}
                onPlaySurahSample={(qari, surahNomor) => {
                  handleSelectQari(qari);
                  const candidates = getAyahAudioCandidates(surahNomor, 1, qari);
                  handlePlayAyah(surahNomor, 1, candidates[0]);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Bottom Audio Player Bar */}
      <AudioPlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onNextAyah={handleNextAyah}
        onPrevAyah={handlePrevAyah}
        onClose={() => {
          setIsPlaying(false);
          setCurrentTrack(null);
        }}
        activeQari={activeQari}
        onSelectQari={handleSelectQari}
      />

      {/* Daily Reminder Modal */}
      <DailyReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        config={reminderConfig}
        onSaveConfig={(newConfig) => {
          setReminderConfig(newConfig);
          notificationService.saveConfig(newConfig);
        }}
      />

      {/* Quiet Editorial Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-stone-100/60 py-8 px-4 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-800">Al-Qur'an Karim Indonesia</span>
            <span aria-hidden="true">·</span>
            <span>Standar Mushaf & Terjemah Kementerian Agama Republik Indonesia</span>
          </div>

          <div className="flex items-center gap-4 text-stone-500 font-light">
            <span>Audio Murottal Syeikh Internasional</span>
            <span aria-hidden="true">·</span>
            <span>Mode Tahfidz & Pengingat Harian Istiqomah</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
