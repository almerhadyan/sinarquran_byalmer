export interface SurahMeta {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: 'Mekah' | 'Madinah';
  arti: string;
  deskripsi: string;
  audioFull?: Record<string, string>;
}

export interface Ayah {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: Record<string, string>;
}

export interface SurahDetail extends SurahMeta {
  ayat: Ayah[];
  suratSebelumnya?: {
    nomor: number;
    namaLatin: string;
  } | false;
  suratSelanjutnya?: {
    nomor: number;
    namaLatin: string;
  } | false;
}

export interface TafsirAyat {
  ayat: number;
  teks: string;
}

export interface TafsirDetail {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  tafsir: TafsirAyat[];
}

export interface Qari {
  id: string;
  code: string; // '01' to '05' for equran api, or audio CDN key
  name: string;
  arabicName: string;
  country: string;
  style: string;
  description: string;
}

export interface QuranStory {
  id: string;
  title: string;
  arabicTitle: string;
  category: 'Kisah Nabi' | 'Peristiwa Sejarah' | 'Hikmah & Perumpamaan';
  surahNumber: number;
  surahName: string;
  verseRange: string;
  summary: string;
  fullStory: string[];
  lessons: string[];
  asbabunNuzul?: string;
  imageKey?: string;
}

export type MemorizationStatus = 'none' | 'memorizing' | 'mutqin';

export interface TahfidzRecord {
  surahNumber: number;
  ayahNumber: number;
  status: MemorizationStatus;
  lastReviewed: string; // ISO date
  repeatCount: number;
}

export interface ReminderConfig {
  enabled: boolean;
  times: string[]; // e.g. ['05:00', '18:30']
  presetLabels: { [key: string]: boolean };
  soundEnabled: boolean;
  lastNotifiedDate?: string;
  currentStreak: number;
  lastActiveDate: string;
  dailyAyatTarget: number;
}

export interface LastReadPosition {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  timestamp: string;
}

export interface BookmarkAyah {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  teksArab: string;
  teksIndonesia: string;
  createdAt: string;
  note?: string;
}
