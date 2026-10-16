import React from 'react';
import { BookOpen, Bookmark, Bell, Volume2, Sparkles } from 'lucide-react';
import { LastReadPosition } from '../types/quran';

interface NavbarProps {
  activeTab: 'surah' | 'tahfidz' | 'stories' | 'reciters';
  setActiveTab: (tab: 'surah' | 'tahfidz' | 'stories' | 'reciters') => void;
  lastRead: LastReadPosition | null;
  onOpenLastRead: () => void;
  onOpenReminderModal: () => void;
  streakCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lastRead,
  onOpenLastRead,
  onOpenReminderModal,
  streakCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element, no badges/pill attachments) */}
        <button
          onClick={() => setActiveTab('surah')}
          className="text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-sm"
        >
          <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-emerald-950 group-hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 block">
            Al-Qur'an Karim
          </span>
        </button>

        {/* Zone 2: 4-5 Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <button
            onClick={() => setActiveTab('surah')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-emerald-900 pb-1 cursor-pointer ${
              activeTab === 'surah'
                ? 'text-emerald-900 font-semibold border-b-2 border-emerald-800'
                : 'text-stone-600'
            }`}
          >
            Daftar Surat
          </button>

          <button
            onClick={() => setActiveTab('tahfidz')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-emerald-900 pb-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tahfidz'
                ? 'text-emerald-900 font-semibold border-b-2 border-emerald-800'
                : 'text-stone-600'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            Mode Tahfidz
          </button>

          <button
            onClick={() => setActiveTab('stories')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-emerald-900 pb-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'stories'
                ? 'text-emerald-900 font-semibold border-b-2 border-emerald-800'
                : 'text-stone-600'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-stone-500" />
            Kisah & Hikmah
          </button>

          <button
            onClick={() => setActiveTab('reciters')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-emerald-900 pb-1 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reciters'
                ? 'text-emerald-900 font-semibold border-b-2 border-emerald-800'
                : 'text-stone-600'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-stone-500" />
            Qari Dunia
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Quick Utilities */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenReminderModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-emerald-900 bg-stone-100/80 hover:bg-stone-200/60 rounded-md transition-colors cursor-pointer"
            title="Atur Notifikasi Pengingat Harian & Target Konsistensi"
          >
            <Bell className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">Pengingat</span>
            {streakCount > 0 && (
              <span className="text-[11px] font-mono text-amber-800 font-semibold tabular-nums ml-0.5">
                {streakCount}d
              </span>
            )}
          </button>

          {lastRead ? (
            <button
              onClick={onOpenLastRead}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 active:bg-emerald-950 rounded-md transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Bookmark className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>{lastRead.surahName} : {lastRead.ayahNumber}</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('tahfidz')}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 active:bg-emerald-950 rounded-md transition-colors shadow-xs cursor-pointer whitespace-nowrap shrink-0"
            >
              Mulai Menghafal
            </button>
          )}
        </div>
      </div>

      {/* Mobile Secondary Tab Navigation Bar */}
      <div className="flex md:hidden items-center justify-between gap-1 mt-2.5 pt-2 border-t border-stone-200/60 text-xs font-medium text-stone-600 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('surah')}
          className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
            activeTab === 'surah' ? 'bg-stone-200/80 text-emerald-950 font-semibold' : 'hover:text-stone-900'
          }`}
        >
          Daftar Surat
        </button>
        <button
          onClick={() => setActiveTab('tahfidz')}
          className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
            activeTab === 'tahfidz' ? 'bg-stone-200/80 text-emerald-950 font-semibold' : 'hover:text-stone-900'
          }`}
        >
          Tahfidz
        </button>
        <button
          onClick={() => setActiveTab('stories')}
          className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
            activeTab === 'stories' ? 'bg-stone-200/80 text-emerald-950 font-semibold' : 'hover:text-stone-900'
          }`}
        >
          Kisah Al-Qur'an
        </button>
        <button
          onClick={() => setActiveTab('reciters')}
          className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
            activeTab === 'reciters' ? 'bg-stone-200/80 text-emerald-950 font-semibold' : 'hover:text-stone-900'
          }`}
        >
          Qari Dunia
        </button>
      </div>
    </header>
  );
};
