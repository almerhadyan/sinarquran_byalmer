import { ReminderConfig } from '../types/quran';

const STORAGE_KEY = 'quran_reminder_config';

export const DAILY_AYAT_INSPIRATIONS = [
  {
    arab: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    latin: 'Alā biżikrillāhi taṭma\'innul-qulūb',
    arti: 'Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.',
    surah: 'Ar-Ra\'d : 28',
  },
  {
    arab: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
    latin: 'Fa inna ma\'al-\'usri yusrā',
    arti: 'Maka sesungguhnya bersama kesulitan ada kemudahan.',
    surah: 'Asy-Syarh : 5',
  },
  {
    arab: 'وَقُلْ رَبِّ زِدْنِي عِلْمًا',
    latin: 'Wa qur-rabbi zidnī \'ilmā',
    arti: 'Dan katakanlah: Ya Tuhanku, tambahkanlah kepadaku ilmu pengetahuan.',
    surah: 'Thaha : 114',
  },
  {
    arab: 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِنْ مُدَّكِرٍ',
    latin: 'Wa laqad yassarnal-qur\'āna liż-żikri fahal mim-muddakir',
    arti: 'Dan sungguh telah Kami mudahkan Al-Qur\'an untuk peringatan, maka adakah yang mau mengambil pelajaran?',
    surah: 'Al-Qamar : 17',
  },
  {
    arab: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ',
    latin: 'Wa iżā sa\'alaka \'ibādī \'annī fa innī qarīb',
    arti: 'Dan apabila hamba-hamba-Ku bertanya kepadamu tentang Aku, maka sesungguhnya Aku adalah dekat.',
    surah: 'Al-Baqarah : 186',
  },
];

export const DEFAULT_REMINDER_CONFIG: ReminderConfig = {
  enabled: true,
  times: ['05:00', '18:30'],
  presetLabels: {
    subuh: true,
    dhuha: false,
    maghrib: true,
    isya: false,
  },
  soundEnabled: true,
  currentStreak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  dailyAyatTarget: 5,
};

export const notificationService = {
  getConfig(): ReminderConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_REMINDER_CONFIG, ...JSON.parse(raw) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_REMINDER_CONFIG;
  },

  saveConfig(config: ReminderConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // storage quota
    }
  },

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  },

  playChime(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const now = ctx.currentTime;
      // Gentle harmonious Islamic prayer chime tone (harmonic bell: 528Hz and 792Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(528, now); // Solfeggio frequency for peace
      osc1.frequency.exponentialRampToValueAtTime(264, now + 1.6);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(792, now);
      osc2.frequency.exponentialRampToValueAtTime(396, now + 1.6);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.3, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.8);
      osc2.stop(now + 1.8);
    } catch {
      // AudioContext may be restricted before user gesture
    }
  },

  sendNotification(title: string, body: string): void {
    const config = this.getConfig();
    if (config.soundEnabled) {
      this.playChime();
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      } catch {
        // notification error
      }
    }
  },

  triggerTestNotification(): void {
    const randomAyat = DAILY_AYAT_INSPIRATIONS[Math.floor(Math.random() * DAILY_AYAT_INSPIRATIONS.length)];
    this.sendNotification(
      'Waktunya Tilawah & Muraja\'ah Al-Qur\'an',
      `"${randomAyat.arti}" — (QS. ${randomAyat.surah}). Luangkan 5 menit untuk membaca hari ini!`
    );
  },

  updateStreak(): { streak: number; isNewDay: boolean } {
    const config = this.getConfig();
    const today = new Date().toISOString().split('T')[0];
    const last = config.lastActiveDate;

    if (last === today) {
      return { streak: config.currentStreak, isNewDay: false };
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let newStreak = config.currentStreak;

    if (last === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1; // Reset if missed a day
    }

    config.currentStreak = newStreak;
    config.lastActiveDate = today;
    this.saveConfig(config);

    return { streak: newStreak, isNewDay: true };
  },
};
