import { ALL_SURAHS } from '../data/surahList';
import { Ayah, SurahDetail, SurahMeta, TafsirDetail } from '../types/quran';
import { sanitizeAudioUrl } from './audioResolver';

const BASE_URL = 'https://equran.id/api/v2';
const FALLBACK_URL = 'https://quran-api-id.vercel.app';

// Local cache for fetched surah details and tafsir
const surahCache = new Map<number, SurahDetail>();
const tafsirCache = new Map<number, TafsirDetail>();

const sanitizeDetailAudio = (detail: SurahDetail): SurahDetail => {
  if (detail.audioFull) {
    for (const key of Object.keys(detail.audioFull)) {
      detail.audioFull[key] = sanitizeAudioUrl(detail.audioFull[key]);
    }
  }
  if (detail.ayat) {
    for (const a of detail.ayat) {
      if (a.audio) {
        for (const key of Object.keys(a.audio)) {
          a.audio[key] = sanitizeAudioUrl(a.audio[key]);
        }
      }
    }
  }
  return detail;
};

// Pre-cached Al-Fatihah with valid CDN audio endpoints
const AL_FATIHAH_PRELOAD: SurahDetail = {
  nomor: 1,
  nama: 'الفاتحة',
  namaLatin: 'Al-Fatihah',
  jumlahAyat: 7,
  tempatTurun: 'Mekah',
  arti: 'Pembukaan',
  deskripsi: 'Surat Al-Fatihah (Pembukaan) adalah surat pembuka Al-Qur\'an dan menjadi rukun bacaan dalam setiap rakaat shalat.',
  suratSebelumnya: false,
  suratSelanjutnya: { nomor: 2, namaLatin: 'Al-Baqarah' },
  audioFull: {
    '01': 'https://cdn.equran.id/audio-full/Abdullah-Al-Juhany/001.mp3',
    '02': 'https://cdn.equran.id/audio-full/Abdul-Muhsin-Al-Qasim/001.mp3',
    '03': 'https://cdn.equran.id/audio-full/Abdurrahman-as-Sudais/001.mp3',
    '04': 'https://cdn.equran.id/audio-full/Ibrahim-Al-Dossari/001.mp3',
    '05': 'https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/001.mp3',
  },
  ayat: [
    {
      nomorAyat: 1,
      teksArab: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ',
      teksLatin: 'bismillāhir-raḥmānir-raḥīm(i).',
      teksIndonesia: 'Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.',
      audio: {
        '01': 'https://cdn.equran.id/audio-partial/Abdullah-Al-Juhany/001001.mp3',
        '02': 'https://cdn.equran.id/audio-partial/Abdul-Muhsin-Al-Qasim/001001.mp3',
        '03': 'https://cdn.equran.id/audio-partial/Abdurrahman-as-Sudais/001001.mp3',
        '04': 'https://cdn.equran.id/audio-partial/Ibrahim-Al-Dossari/001001.mp3',
        '05': 'https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/001001.mp3',
      },
    },
    {
      nomorAyat: 2,
      teksArab: 'اَلْحَمْدُ لِلّٰهِ رَبِّ الْعٰلَمِيْنَۙ',
      teksLatin: 'al-ḥamdu lillāhi rabbil-\'ālamīn(a).',
      teksIndonesia: 'Segala puji bagi Allah, Tuhan semesta alam,',
      audio: {
        '01': 'https://cdn.equran.id/audio-partial/Abdullah-Al-Juhany/001002.mp3',
        '02': 'https://cdn.equran.id/audio-partial/Abdul-Muhsin-Al-Qasim/001002.mp3',
        '03': 'https://cdn.equran.id/audio-partial/Abdurrahman-as-Sudais/001002.mp3',
        '04': 'https://cdn.equran.id/audio-partial/Ibrahim-Al-Dossari/001002.mp3',
        '05': 'https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/001002.mp3',
      },
    },
    {
      nomorAyat: 3,
      teksArab: 'الرَّحْمٰنِ الرَّحِيْمِۙ',
      teksLatin: 'ar-raḥmānir-raḥīm(i).',
      teksIndonesia: 'Yang Maha Pengasih lagi Maha Penyayang,',
      audio: {
        '01': 'https://cdn.equran.id/audio-partial/Abdullah-Al-Juhany/001003.mp3',
        '02': 'https://cdn.equran.id/audio-partial/Abdul-Muhsin-Al-Qasim/001003.mp3',
        '03': 'https://cdn.equran.id/audio-partial/Abdurrahman-as-Sudais/001003.mp3',
        '04': 'https://cdn.equran.id/audio-partial/Ibrahim-Al-Dossari/001003.mp3',
        '05': 'https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/001003.mp3',
      },
    },
    {
      nomorAyat: 4,
      teksArab: 'مٰلِكِ يَوْمِ الدِّيْنِۗ',
      teksLatin: 'māliki yaumid-dīn(i).',
      teksIndonesia: 'Pemilik hari Pembalasan.',
      audio: {
        '01': 'https://cdn.equran.id/audio-partial/Abdullah-Al-Juhany/001004.mp3',
        '02': 'https://cdn.equran.id/audio-partial/Abdul-Muhsin-Al-Qasim/001004.mp3',
        '03': 'https://cdn.equran.id/audio-partial/Abdurrahman-as-Sudais/001004.mp3',
        '04': 'https://cdn.equran.id/audio-partial/Ibrahim-Al-Dossari/001004.mp3',
        '05': 'https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/001004.mp3',
      },
    },
    {
      nomorAyat: 5,
      teksArab: 'اِيَّاكَ نَعْبُدُ وَاِيَّاكَ نَسْتَعِيْنُۗ',
      teksLatin: 'iyyāka na\'budu wa iyyāka nasta\'īn(u).',
      teksIndonesia: 'Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami memohon pertolongan.',
      audio: {
        '01': 'https://cdn.equran.id/audio-partial/Abdullah-Al-Juhany/001005.mp3',
        '02': 'https://cdn.equran.id/audio-partial/Abdul-Muhsin-Al-Qasim/001005.mp3',
        '03': 'https://cdn.equran.id/audio-partial/Abdurrahman-as-Sudais/001005.mp3',
        '04': 'https://cdn.equran.id/audio-partial/Ibrahim-Al-Dossari/001005.mp3',
        '05': 'https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/001005.mp3',
      },
    },
    {
      nomorAyat: 6,
      teksArab: 'اِهْدِنَا الصِّرَاطَ الْمُسْتَقِيْمَۙ',
      teksLatin: 'ihdinaṣ-ṣirāṭal-mustaqīm(a).',
      teksIndonesia: 'Tunjukilah kami jalan yang lurus,',
      audio: {
        '01': 'https://cdn.equran.id/audio-partial/Abdullah-Al-Juhany/001006.mp3',
        '02': 'https://cdn.equran.id/audio-partial/Abdul-Muhsin-Al-Qasim/001006.mp3',
        '03': 'https://cdn.equran.id/audio-partial/Abdurrahman-as-Sudais/001006.mp3',
        '04': 'https://cdn.equran.id/audio-partial/Ibrahim-Al-Dossari/001006.mp3',
        '05': 'https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/001006.mp3',
      },
    },
    {
      nomorAyat: 7,
      teksArab: 'صِرَاطَ الَّذِيْنَ اَنْعَمْتَ عَلَيْهِمْ ەۙ غَيْرِ الْمَغْضُوْبِ عَلَيْهِمْ وَلَا الضَّاۤلِّيْنَ ࣖ',
      teksLatin: 'ṣirāṭal-lażīna an\'amta \'alaihim, gairil-magḍūbi \'alaihim wa laḍ-ḍāllīn(a).',
      teksIndonesia: '(yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat.',
      audio: {
        '01': 'https://cdn.equran.id/audio-partial/Abdullah-Al-Juhany/001007.mp3',
        '02': 'https://cdn.equran.id/audio-partial/Abdul-Muhsin-Al-Qasim/001007.mp3',
        '03': 'https://cdn.equran.id/audio-partial/Abdurrahman-as-Sudais/001007.mp3',
        '04': 'https://cdn.equran.id/audio-partial/Ibrahim-Al-Dossari/001007.mp3',
        '05': 'https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/001007.mp3',
      },
    },
  ],
};

// Seed Al-Fatihah into cache immediately
surahCache.set(1, AL_FATIHAH_PRELOAD);

export const quranApi = {
  /**
   * Get list of all 114 Surahs
   */
  async getAllSurahs(): Promise<SurahMeta[]> {
    try {
      const res = await fetch(`${BASE_URL}/surat`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch {
      // Fallback seamlessly to bundled 114 surahs
    }
    return ALL_SURAHS;
  },

  /**
   * Get detailed Surah with full verses, Indonesian translation, latin, and audio
   */
  async getSurahDetail(nomor: number): Promise<SurahDetail> {
    if (surahCache.has(nomor)) {
      return surahCache.get(nomor)!;
    }

    // Check localStorage
    try {
      const local = localStorage.getItem(`surah_${nomor}`);
      if (local) {
        const parsed = JSON.parse(local) as SurahDetail;
        const sanitized = sanitizeDetailAudio(parsed);
        surahCache.set(nomor, sanitized);
        return sanitized;
      }
    } catch {
      // ignore storage error
    }

    try {
      const res = await fetch(`${BASE_URL}/surat/${nomor}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const detail = sanitizeDetailAudio(json.data as SurahDetail);
          surahCache.set(nomor, detail);
          try {
            localStorage.setItem(`surah_${nomor}`, JSON.stringify(detail));
          } catch {
            // storage quota
          }
          return detail;
        }
      }
    } catch {
      // Primary API failed, try secondary fallback
    }

    try {
      const resFallback = await fetch(`${FALLBACK_URL}/surahs/${nomor}`);
      if (resFallback.ok) {
        const json = await resFallback.json();
        const meta = ALL_SURAHS.find((s) => s.nomor === nomor);
        if (json && meta) {
          const ayatList: Ayah[] = (json.ayahs || []).map((a: any) => ({
            nomorAyat: a.ayah || a.number?.inSurah || 1,
            teksArab: a.arab || a.text?.ar || '',
            teksLatin: a.latin || a.text?.read || '',
            teksIndonesia: a.translation || a.translation?.id || '',
            audio: {
              '05': a.audio?.url || `https://verses.quran.com/Alafasy/mp3/${String(nomor).padStart(3, '0')}${String(a.ayah || 1).padStart(3, '0')}.mp3`,
            },
          }));

          const constructed: SurahDetail = {
            ...meta,
            ayat: ayatList,
            suratSebelumnya: nomor > 1 ? { nomor: nomor - 1, namaLatin: ALL_SURAHS[nomor - 2].namaLatin } : false,
            suratSelanjutnya: nomor < 114 ? { nomor: nomor + 1, namaLatin: ALL_SURAHS[nomor].namaLatin } : false,
          };
          surahCache.set(nomor, constructed);
          return constructed;
        }
      }
    } catch {
      // fallback error
    }

    // If completely offline and uncached, return meta with notice
    const meta = ALL_SURAHS.find((s) => s.nomor === nomor) || ALL_SURAHS[0];
    return {
      ...meta,
      ayat: [
        {
          nomorAyat: 1,
          teksArab: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ',
          teksLatin: 'Bismillāhir-raḥmānir-raḥīm',
          teksIndonesia: 'Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.',
          audio: { '05': `https://verses.quran.com/Alafasy/mp3/${String(nomor).padStart(3, '0')}001.mp3` },
        },
      ],
    };
  },

  /**
   * Get Kemenag official Tafsir (Tafsir Wajiz & Tahlili)
   */
  async getTafsir(nomor: number): Promise<TafsirDetail | null> {
    if (tafsirCache.has(nomor)) {
      return tafsirCache.get(nomor)!;
    }

    try {
      const res = await fetch(`${BASE_URL}/tafsir/${nomor}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const detail = json.data as TafsirDetail;
          tafsirCache.set(nomor, detail);
          return detail;
        }
      }
    } catch {
      // Fallback
    }

    return null;
  },
};
