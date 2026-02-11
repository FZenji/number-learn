'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { NUMBER_BANK, getDigitsOnly } from '@/data/numbers';
import { useWorkspaceStore } from '@/store/workspace-store';
import { Play, Pause, SkipForward, SkipBack, Settings, Volume2, VolumeX } from 'lucide-react';

interface SequencePanelProps {
  numberId: string;
}

// Simple tone generator for digit sounds
const playDigitSound = (digit: string, isMuted: boolean) => {
  if (isMuted || typeof window === 'undefined') return;
  
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Different frequency for each digit (pentatonic scale base)
    const frequencies: Record<string, number> = {
      '0': 261.63,  // C4
      '1': 293.66,  // D4
      '2': 329.63,  // E4
      '3': 392.00,  // G4
      '4': 440.00,  // A4
      '5': 523.25,  // C5
      '6': 587.33,  // D5
      '7': 659.25,  // E5
      '8': 783.99,  // G5
      '9': 880.00,  // A5
    };
    
    oscillator.frequency.value = frequencies[digit] || 440;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch {
    // Audio not supported or blocked
  }
};

export function SequencePanel({ numberId }: SequencePanelProps) {
  const { customNumbers } = useWorkspaceStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // ms per digit
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const number = useMemo(() => {
    const builtIn = NUMBER_BANK.find(c => c.id === numberId);
    if (builtIn) return builtIn;
    return customNumbers.find(c => c.id === numberId);
  }, [numberId, customNumbers]);

  const digits = useMemo(() => {
    if (!number) return '';
    return getDigitsOnly(number);
  }, [number]);

  const currentDigit = digits[currentIndex] || '';

  // Play sound when digit changes
  useEffect(() => {
    if (currentDigit) {
      playDigitSound(currentDigit, isMuted);
    }
  }, [currentDigit, currentIndex, isMuted]);

  // Auto-play logic
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= digits.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, speed, digits.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;
    
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        setCurrentIndex(prev => Math.min(prev + 1, digits.length - 1));
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        setCurrentIndex(prev => Math.max(prev - 1, 0));
        break;
      case ' ':
        e.preventDefault();
        setIsPlaying(prev => !prev);
        break;
    }
  }, [digits.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const goNext = () => {
    setCurrentIndex(prev => Math.min(prev + 1, digits.length - 1));
  };

  const goPrev = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const jumpToStart = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  if (!number) {
    return <div className="text-[var(--text-muted)]">Number not found</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          Sequence Practice - {number.name}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="btn btn-ghost p-2"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`btn btn-ghost p-2 ${showSettings ? 'bg-[var(--surface-active)]' : ''}`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="mb-4 p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] animate-fade-in">
          <div className="flex items-center gap-4">
            <label className="text-sm text-[var(--text-muted)]">Speed (ms):</label>
            <input
              type="range"
              min={200}
              max={2000}
              step={100}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-mono w-16">{speed}ms</span>
          </div>
        </div>
      )}

      {/* Current digit display */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-4">
          <span className="text-8xl font-mono font-bold text-[var(--primary)]">
            {currentDigit}
          </span>
        </div>
        <div className="mt-2 text-[var(--text-muted)]">
          Position: <span className="font-mono font-semibold">{currentIndex + 1}</span> / {digits.length}
        </div>
      </div>

      {/* Numpad */}
      <div className="flex justify-center mb-6">
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''].map((d, i) => (
            d ? (
              <div
                key={i}
                className={`
                  w-16 h-16 flex items-center justify-center text-2xl font-mono font-bold rounded-xl
                  transition-all duration-150
                  ${currentDigit === d 
                    ? 'bg-[var(--primary)] text-white scale-110 shadow-lg shadow-[var(--primary-glow)]' 
                    : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]'
                  }
                `}
              >
                {d}
              </div>
            ) : (
              <div key={i} className="w-16 h-16" />
            )
          ))}
        </div>
      </div>

      {/* Digit carousel */}
      <div className="mb-6 px-4">
        <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-4 overflow-hidden">
          <div className="flex justify-center items-center gap-1 font-mono text-lg">
            {/* Show 5 digits before and after current */}
            {Array.from({ length: 11 }, (_, i) => {
              const idx = currentIndex - 5 + i;
              const digit = digits[idx];
              const isCurrent = idx === currentIndex;
              
              if (idx < 0 || idx >= digits.length) {
                return <span key={i} className="w-6 text-center opacity-0">0</span>;
              }
              
              return (
                <span
                  key={i}
                  className={`
                    w-6 text-center transition-all
                    ${isCurrent 
                      ? 'text-[var(--primary)] text-2xl font-bold' 
                      : Math.abs(idx - currentIndex) <= 2
                        ? 'text-[var(--text-secondary)]'
                        : 'text-[var(--text-muted)]'
                    }
                  `}
                >
                  {digit}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={jumpToStart}
          className="btn btn-secondary p-3"
          title="Jump to start"
        >
          <SkipBack className="w-5 h-5" />
        </button>
        <button
          onClick={goPrev}
          className="btn btn-secondary p-3"
          title="Previous (←/↓)"
          disabled={currentIndex === 0}
        >
          <SkipBack className="w-5 h-5" />
        </button>
        <button
          onClick={togglePlay}
          className={`btn p-4 rounded-full ${isPlaying ? 'btn-secondary' : 'btn-primary'}`}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        <button
          onClick={goNext}
          className="btn btn-secondary p-3"
          title="Next (→/↑)"
          disabled={currentIndex >= digits.length - 1}
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Help text */}
      <div className="text-center text-sm text-[var(--text-muted)]">
        <p>Use <span className="kbd">←</span><span className="kbd">↓</span> to go back, <span className="kbd">→</span><span className="kbd">↑</span> to advance, <span className="kbd">Space</span> to play/pause</p>
      </div>
    </div>
  );
}
