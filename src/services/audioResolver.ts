import { Qari } from '../types/quran';

/**
 * Utility to format numbers to 3 digits (e.g. 1 -> "001")
 */
export const pad3 = (num: number): string => num.toString().padStart(3, '0');

/**
 * Sanitize any legacy or broken audio URLs
 */
export const sanitizeAudioUrl = (url: string): string => {
  if (!url) return '';
  return url
    .replace('https://equran.nos.wjv-1.neo.id/', 'https://cdn.equran.id/')
    .replace('http://', 'https://');
};

/**
 * Get prioritized candidate URLs for a single Ayah audio.
 * If candidate #1 fails or 404s, player seamlessly falls back to #2 and #3.
 */
export const getAyahAudioCandidates = (
  surahNumber: number,
  ayahNumber: number,
  qari: Qari,
  apiAudioUrl?: string
): string[] => {
  const s = pad3(surahNumber);
  const a = pad3(ayahNumber);
  const code = `${s}${a}`;

  const candidates: string[] = [];

  // If a direct URL was passed from the API and sanitized, consider it first
  if (apiAudioUrl) {
    const clean = sanitizeAudioUrl(apiAudioUrl);
    if (clean && !candidates.includes(clean)) {
      candidates.push(clean);
    }
  }

  // Qari specific CDN candidates
  switch (qari.id) {
    case 'misyari':
      candidates.push(
        `https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/${code}.mp3`,
        `https://verses.quran.com/Alafasy/mp3/${code}.mp3`,
        `https://everyayah.com/data/Alafasy_128kbps/${code}.mp3`
      );
      break;

    case 'sudais':
      candidates.push(
        `https://cdn.equran.id/audio-partial/Abdurrahman-as-Sudais/${code}.mp3`,
        `https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/${code}.mp3`
      );
      break;

    case 'juhany':
      candidates.push(
        `https://cdn.equran.id/audio-partial/Abdullah-Al-Juhany/${code}.mp3`,
        `https://everyayah.com/data/Abdullaah_3awwaad_Al-Juhaynee_128kbps/${code}.mp3`
      );
      break;

    case 'qasim':
      candidates.push(
        `https://cdn.equran.id/audio-partial/Abdul-Muhsin-Al-Qasim/${code}.mp3`,
        `https://everyayah.com/data/Muhsin_Al_Qasim_192kbps/${code}.mp3`
      );
      break;

    case 'dossari':
      candidates.push(
        `https://cdn.equran.id/audio-partial/Ibrahim-Al-Dossari/${code}.mp3`,
        `https://everyayah.com/data/Ibrahim_Akhdar_32kbps/${code}.mp3`
      );
      break;

    case 'yasser':
      candidates.push(
        `https://cdn.equran.id/audio-partial/Yasser-Al-Dosari/${code}.mp3`,
        `https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/${code}.mp3`
      );
      break;

    case 'husary':
      candidates.push(
        `https://everyayah.com/data/Husary_128kbps/${code}.mp3`,
        `https://everyayah.com/data/Husary_Mujawwad_128kbps/${code}.mp3`
      );
      break;

    case 'muaiqly':
      candidates.push(
        `https://everyayah.com/data/MaherAlMuaiqly128kbps/${code}.mp3`
      );
      break;

    case 'ghamdi':
      candidates.push(
        `https://everyayah.com/data/Ghamadi_40kbps/${code}.mp3`
      );
      break;

    case 'shatri':
      candidates.push(
        `https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps/${code}.mp3`
      );
      break;

    default:
      candidates.push(
        `https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/${code}.mp3`,
        `https://verses.quran.com/Alafasy/mp3/${code}.mp3`
      );
      break;
  }

  // Universal ultimate fallback (Alafasy & Husary)
  const universalFallbacks = [
    `https://verses.quran.com/Alafasy/mp3/${code}.mp3`,
    `https://everyayah.com/data/Husary_128kbps/${code}.mp3`,
  ];

  for (const fb of universalFallbacks) {
    if (!candidates.includes(fb)) {
      candidates.push(fb);
    }
  }

  return candidates;
};

/**
 * Get prioritized candidate URLs for Full Surah recitation
 */
export const getFullSurahAudioCandidates = (surahNumber: number, qari: Qari): string[] => {
  const s = pad3(surahNumber);
  const candidates: string[] = [];

  switch (qari.id) {
    case 'misyari':
      candidates.push(
        `https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/${s}.mp3`,
        `https://server8.mp3quran.net/afs/${s}.mp3`
      );
      break;
    case 'sudais':
      candidates.push(
        `https://cdn.equran.id/audio-full/Abdurrahman-as-Sudais/${s}.mp3`,
        `https://server11.mp3quran.net/sds/${s}.mp3`
      );
      break;
    case 'juhany':
      candidates.push(
        `https://cdn.equran.id/audio-full/Abdullah-Al-Juhany/${s}.mp3`
      );
      break;
    case 'qasim':
      candidates.push(
        `https://cdn.equran.id/audio-full/Abdul-Muhsin-Al-Qasim/${s}.mp3`
      );
      break;
    case 'dossari':
      candidates.push(
        `https://cdn.equran.id/audio-full/Ibrahim-Al-Dossari/${s}.mp3`
      );
      break;
    case 'yasser':
      candidates.push(
        `https://cdn.equran.id/audio-full/Yasser-Al-Dosari/${s}.mp3`,
        `https://server11.mp3quran.net/yasser/${s}.mp3`
      );
      break;
    case 'husary':
      candidates.push(
        `https://server13.mp3quran.net/husr/${s}.mp3`
      );
      break;
    case 'muaiqly':
      candidates.push(
        `https://server12.mp3quran.net/maher/${s}.mp3`
      );
      break;
    case 'ghamdi':
      candidates.push(
        `https://server7.mp3quran.net/ghamdi/${s}.mp3`
      );
      break;
    case 'shatri':
      candidates.push(
        `https://server11.mp3quran.net/shatri/${s}.mp3`
      );
      break;
    default:
      candidates.push(
        `https://cdn.equran.id/audio-full/Misyari-Rasyid-Al-Afasi/${s}.mp3`,
        `https://server8.mp3quran.net/afs/${s}.mp3`
      );
      break;
  }

  // Backup fallback
  candidates.push(`https://server8.mp3quran.net/afs/${s}.mp3`);
  return candidates;
};
