import React, { useState } from 'react';
import { X, Bell, BellRing, Volume2, VolumeX, Sparkles, Check, Clock, Plus, Trash2 } from 'lucide-react';
import { ReminderConfig } from '../types/quran';
import { notificationService, DAILY_AYAT_INSPIRATIONS } from '../services/notificationService';

interface DailyReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ReminderConfig;
  onSaveConfig: (newConfig: ReminderConfig) => void;
}

export const DailyReminderModal: React.FC<DailyReminderModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [localConfig, setLocalConfig] = useState<ReminderConfig>(config);
  const [newCustomTime, setNewCustomTime] = useState<string>('06:00');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [testSent, setTestSent] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    if (typeof Notification !== 'undefined') {
      setNotificationPermission(Notification.permission);
    }
    if (granted) {
      notificationService.triggerTestNotification();
    }
  };

  const handleToggleTime = (time: string) => {
    setLocalConfig((prev) => {
      const exists = prev.times.includes(time);
      const updatedTimes = exists
        ? prev.times.filter((t) => t !== time)
        : [...prev.times, time].sort();
      return { ...prev, times: updatedTimes };
    });
  };

  const handleAddCustomTime = () => {
    if (!newCustomTime || localConfig.times.includes(newCustomTime)) return;
    setLocalConfig((prev) => ({
      ...prev,
      times: [...prev.times, newCustomTime].sort(),
    }));
  };

  const handleRemoveTime = (time: string) => {
    setLocalConfig((prev) => ({
      ...prev,
      times: prev.times.filter((t) => t !== time),
    }));
  };

  const handleTestNow = () => {
    notificationService.triggerTestNotification();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    onClose();
  };

  const PRESETS = [
    { key: '05:00', label: 'Waktu Subuh (05:00)', desc: 'Awali pagi dengan tilawah dan dzikir pagi penyejuk jiwa.' },
    { key: '09:30', label: 'Waktu Dhuha (09:30)', desc: 'Penyegar di sela aktivitas belajar atau bekerja.' },
    { key: '12:30', label: 'Waktu Dzuhur (12:30)', desc: 'Tilawah 1 lembar setelah shalat fardhu siang.' },
    { key: '18:15', label: 'Waktu Maghrib (18:15)', desc: 'Waktu utama tadabbur ayat dan muraja\'ah hafalan.' },
    { key: '20:30', label: 'Waktu Isya & Sebelum Tidur (20:30)', desc: 'Menghafal & membaca Al-Mulk sebagai pelindung malam.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
              <BellRing className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Pengingat Harian & Konsistensi
              </h3>
              <p className="text-xs text-stone-500 font-light">
                Notifikasi lembut agar senantiasa istiqomah membaca & menghafal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Main Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <span className="text-sm font-semibold text-stone-900 block">
                Status Pengingat Harian
              </span>
              <span className="text-xs text-stone-500 font-light">
                Aktifkan jadwal notifikasi otomatis
              </span>
            </div>

            <button
              onClick={() => setLocalConfig((p) => ({ ...p, enabled: !p.enabled }))}
              className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                localConfig.enabled ? 'bg-emerald-800 justify-end' : 'bg-stone-300 justify-start'
              }`}
            >
              <div className="w-4.5 h-4.5 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          {/* Browser Notification Permission Banner */}
          {notificationPermission !== 'granted' && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs">
              <p className="font-semibold text-amber-950 mb-1">
                Izin Notifikasi Belum Diaktifkan
              </p>
              <p className="text-stone-600 mb-3 font-light leading-relaxed">
                Agar notifikasi pengingat muncul di layar HP atau laptop Anda secara otomatis, izinkan akses notifikasi browser.
              </p>
              <button
                onClick={handleRequestPermission}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Izinkan Notifikasi Sekarang
              </button>
            </div>
          )}

          {/* Target Harian */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-xs font-semibold text-stone-800 block mb-2">
              Target Baca & Hafal Harian:
            </span>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[3, 5, 10, 20].map((num) => (
                <button
                  key={num}
                  onClick={() => setLocalConfig((p) => ({ ...p, dailyAyatTarget: num }))}
                  className={`py-2 rounded-lg font-medium border transition-colors cursor-pointer ${
                    localConfig.dailyAyatTarget === num
                      ? 'bg-emerald-900 border-emerald-900 text-white shadow-xs'
                      : 'bg-white border-stone-200 hover:border-emerald-800 text-stone-700'
                  }`}
                >
                  {num} Ayat/hari
                </button>
              ))}
            </div>
          </div>

          {/* Preset Tilawah Times */}
          <div>
            <span className="text-xs font-semibold text-stone-800 uppercase tracking-wider block mb-2">
              Pilihan Waktu Utama Tilawah:
            </span>
            <div className="space-y-2">
              {PRESETS.map((preset) => {
                const isSelected = localConfig.times.includes(preset.key);
                return (
                  <div
                    key={preset.key}
                    onClick={() => handleToggleTime(preset.key)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-700/60 text-emerald-950'
                        : 'bg-white border-stone-200 hover:border-stone-300 text-stone-800'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-xs leading-none mb-1">
                        {preset.label}
                      </p>
                      <p className="text-[11px] text-stone-500 font-light">
                        {preset.desc}
                      </p>
                    </div>

                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-emerald-800 border-emerald-800 text-white'
                        : 'border-stone-300 bg-stone-50'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Time Adder */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-xs font-semibold text-stone-800 block mb-2">
              Tambah Jam Notifikasi Khusus:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={newCustomTime}
                onChange={(e) => setNewCustomTime(e.target.value)}
                className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
              <button
                onClick={handleAddCustomTime}
                className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah
              </button>
            </div>

            {/* List of active scheduled times */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {localConfig.times.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-200 text-stone-800 rounded-md text-xs font-mono"
                >
                  <Clock className="w-3 h-3 text-emerald-800" />
                  {t}
                  <button
                    onClick={() => handleRemoveTime(t)}
                    className="text-stone-400 hover:text-rose-600 cursor-pointer ml-0.5"
                    title="Hapus Waktu"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            <div className="flex items-center gap-2">
              {localConfig.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-800" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-400" />
              )}
              <span className="text-stone-700 font-medium">
                Suara Chime Notifikasi Islami
              </span>
            </div>

            <button
              onClick={() => setLocalConfig((p) => ({ ...p, soundEnabled: !p.soundEnabled }))}
              className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                localConfig.soundEnabled
                  ? 'bg-emerald-800 text-white'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              {localConfig.soundEnabled ? 'Aktif' : 'Hening'}
            </button>
          </div>

          {/* Test Notification Button */}
          <div className="pt-2">
            <button
              onClick={handleTestNow}
              className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 border border-stone-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{testSent ? 'Notifikasi Terkirim!' : 'Uji Coba Bunyi & Notifikasi Sekarang'}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-5 mt-5 border-t border-stone-200 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
};
