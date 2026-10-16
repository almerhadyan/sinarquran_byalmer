import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  RotateCcw,
  Repeat,
  X,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Qari } from '../types/quran';
import { RECITERS } from '../data/reciters';
import { getAyahAudioCandidates } from '../services/audioResolver';

interface AudioPlayerBarProps {
  currentTrack: {
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    audioUrl: string;
  } | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNextAyah: () => void;
  onPrevAyah: () => void;
  onClose: () => void;
  activeQari: Qari;
  onSelectQari: (qari: Qari) => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentTrack,
  isPlaying,
  onPlay,
  onPause,
  onNextAyah,
  onPrevAyah,
  onClose,
  activeQari,
  onSelectQari,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showQariMenu, setShowQariMenu] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Multi-tier fallback candidates
  const [candidateList, setCandidateList] = useState<string[]>([]);
  const [candidateIndex, setCandidateIndex] = useState<number>(0);

  // Whenever track or active Qari changes, compute guaranteed candidates
  useEffect(() => {
    if (!currentTrack) {
      setCandidateList([]);
      setCandidateIndex(0);
      setLoadError(null);
      return;
    }

    const candidates = getAyahAudioCandidates(
      currentTrack.surahNumber,
      currentTrack.ayahNumber,
      activeQari,
      currentTrack.audioUrl
    );

    setCandidateList(candidates);
    setCandidateIndex(0);
    setLoadError(null);
    setIsBuffering(true);
  }, [currentTrack?.surahNumber, currentTrack?.ayahNumber, activeQari.id]);

  // Sync audio src from candidate list
  useEffect(() => {
    if (!audioRef.current || candidateList.length === 0) return;

    const targetUrl = candidateList[candidateIndex];
    if (!targetUrl) return;

    if (audioRef.current.src !== targetUrl) {
      audioRef.current.src = targetUrl;
      audioRef.current.load();
    }

    if (isPlaying) {
      setIsBuffering(true);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsBuffering(false);
            setLoadError(null);
          })
          .catch((err) => {
            setIsBuffering(false);
            // Autoplay restriction or network error
            if (err.name === 'NotAllowedError') {
              console.warn('Autoplay restricted by browser policy. User click needed.');
            }
          });
      }
    } else {
      audioRef.current.pause();
    }
  }, [candidateList, candidateIndex, isPlaying]);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Format time mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleAudioEnded = () => {
    if (isLooping) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      onNextAyah();
    }
  };

  // Robust error recovery: try next CDN candidate
  const handleAudioError = () => {
    console.warn(`Audio candidate #${candidateIndex} failed: ${candidateList[candidateIndex]}`);
    if (candidateIndex < candidateList.length - 1) {
      // Try next candidate
      setCandidateIndex((prev) => prev + 1);
    } else {
      setIsBuffering(false);
      setLoadError('Audio gagal dimuat dari server. Coba qari lain atau periksa koneksi.');
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [0.75, 1, 1.25, 1.5];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    setPlaybackRate(rates[nextIdx]);
  };

  const retryPlayback = () => {
    setLoadError(null);
    setCandidateIndex(0);
    if (audioRef.current) {
      audioRef.current.load();
      onPlay();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#141d18]/95 backdrop-blur-md border-t border-emerald-900/60 text-white px-4 sm:px-8 py-3 shadow-2xl">
      <audio
        ref={audioRef}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setLoadError(null);
        }}
        onError={handleAudioError}
        onEnded={handleAudioEnded}
      />

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Track Information & Qari Selector */}
        <div className="flex items-center gap-3.5 w-full sm:w-1/3 justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-900 border border-emerald-800 flex items-center justify-center font-bold text-amber-300 text-xs shrink-0 font-mono">
              {currentTrack.surahNumber}:{currentTrack.ayahNumber}
            </div>

            <div className="min-w-0">
              <p className="font-serif font-bold text-sm text-white truncate">
                QS. {currentTrack.surahName} : {currentTrack.ayahNumber}
              </p>

              {/* Qari selector trigger */}
              <div className="relative">
                <button
                  onClick={() => setShowQariMenu(!showQariMenu)}
                  className="text-xs text-emerald-300 hover:text-white truncate block text-left transition-colors cursor-pointer"
                >
                  {activeQari.name} ▾
                </button>

                {showQariMenu && (
                  <div className="absolute bottom-7 left-0 bg-stone-900 border border-stone-700 rounded-xl p-2 w-64 shadow-xl z-50 text-xs max-h-60 overflow-y-auto">
                    <p className="text-[10px] uppercase font-mono text-stone-400 px-2 py-1">
                      Pilih Qari / Syeikh Murottal:
                    </p>
                    {RECITERS.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          onSelectQari(r);
                          setShowQariMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                          activeQari.id === r.id
                            ? 'bg-emerald-900 text-white font-semibold'
                            : 'text-stone-300 hover:bg-stone-800'
                        }`}
                      >
                        <span className="truncate">{r.name}</span>
                        <span className="text-[10px] text-stone-400 font-mono shrink-0 ml-1">
                          {r.country}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="sm:hidden p-1.5 text-stone-400 hover:text-white rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Playback Controls & Progress Bar */}
        <div className="flex flex-col items-center w-full sm:w-1/2 max-w-xl">
          <div className="flex items-center gap-4 mb-1">
            {/* Loop Toggle */}
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                isLooping ? 'text-amber-300 bg-emerald-900' : 'text-stone-400 hover:text-white'
              }`}
              title={isLooping ? 'Ulangi ayat aktif' : 'Putar berlanjut ke ayat berikutnya'}
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>

            {/* Previous Ayah */}
            <button
              onClick={onPrevAyah}
              className="p-1.5 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="Ayat Sebelumnya"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play / Pause Primary Button */}
            <button
              onClick={isPlaying ? onPause : onPlay}
              className="w-9 h-9 rounded-full bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white flex items-center justify-center transition-transform hover:scale-105 shadow-md cursor-pointer relative"
              title={isPlaying ? 'Jeda' : 'Putar'}
            >
              {isBuffering ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Next Ayah */}
            <button
              onClick={onNextAyah}
              className="p-1.5 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title="Ayat Selanjutnya"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Speed Toggle */}
            <button
              onClick={cyclePlaybackRate}
              className="px-2 py-1 text-[11px] font-mono rounded bg-emerald-950/80 text-stone-300 hover:text-white border border-emerald-900 cursor-pointer"
              title="Ubah Kecepatan Suara"
            >
              {playbackRate}x
            </button>
          </div>

          {/* Progress Seekbar */}
          <div className="w-full flex items-center gap-2 text-[11px] font-mono text-stone-400">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <span>{formatTime(duration)}</span>
          </div>

          {/* Error Notice & Retry */}
          {loadError && (
            <div className="flex items-center gap-2 mt-1 text-[11px] text-amber-300">
              <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{loadError}</span>
              <button
                onClick={retryPlayback}
                className="underline hover:text-white cursor-pointer ml-1 font-semibold"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>

        {/* Right: Volume & Dismiss */}
        <div className="hidden sm:flex items-center justify-end gap-3 w-1/3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (audioRef.current) {
                  const nextMuted = !isMuted;
                  audioRef.current.muted = nextMuted;
                  setIsMuted(nextMuted);
                }
              }}
              className="text-stone-400 hover:text-white cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVolume(val);
                if (audioRef.current) {
                  audioRef.current.volume = val;
                  if (val > 0 && isMuted) {
                    audioRef.current.muted = false;
                    setIsMuted(false);
                  }
                }
              }}
              className="w-20 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            title="Tutup Pemutar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
