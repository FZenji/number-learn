'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { MATH_CONSTANTS, getDigitsOnly } from '@/data/numbers';
import { useWorkspaceStore } from '@/store/workspace-store';
import { RotateCcw, Play, Pause } from 'lucide-react';

interface PracticePanelProps {
  numberId: string;
}

export function PracticePanel({ numberId }: PracticePanelProps) {
  const { customNumbers } = useWorkspaceStore();
  const [userInput, setUserInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [mistakes, setMistakes] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const number = useMemo(() => {
    const builtIn = MATH_CONSTANTS.find(c => c.id === numberId);
    if (builtIn) return builtIn;
    return customNumbers.find(c => c.id === numberId);
  }, [numberId, customNumbers]);

  const digits = useMemo(() => {
    if (!number) return '';
    return number ? getDigitsOnly(number) : '';
  }, [number]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && startTime) {
      interval = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const newDigit = value[value.length - 1];
    const position = value.length - 1;

    // Start timer on first input
    if (!isActive && value.length === 1) {
      setIsActive(true);
      setStartTime(Date.now());
    }

    // Check if the new digit is correct
    if (newDigit && digits[position] !== newDigit) {
      setMistakes(prev => [...prev, position]);
      // Don't add incorrect digits
      return;
    }

    setUserInput(value);
  }, [isActive, digits]);

  const reset = () => {
    setUserInput('');
    setIsActive(false);
    setStartTime(null);
    setCurrentTime(0);
    setMistakes([]);
    inputRef.current?.focus();
  };

  const togglePause = () => {
    if (isActive) {
      setIsActive(false);
    } else {
      setIsActive(true);
      if (!startTime) {
        setStartTime(Date.now());
      }
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const digitsPerMinute = useMemo(() => {
    if (currentTime === 0 || userInput.length === 0) return 0;
    return Math.round((userInput.length / currentTime) * 60000);
  }, [currentTime, userInput.length]);

  const accuracy = useMemo(() => {
    const totalAttempts = userInput.length + mistakes.length;
    if (totalAttempts === 0) return 100;
    return Math.round((userInput.length / totalAttempts) * 100);
  }, [userInput.length, mistakes.length]);

  if (!number) {
    return <div className="text-[var(--text-muted)]">Number not found</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          Practice Typing - {number.name}
        </h2>
        <div className="flex items-center gap-4">
          <button onClick={togglePause} className="btn btn-secondary">
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button onClick={reset} className="btn btn-ghost">
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] text-center">
          <div className="text-2xl font-mono font-bold">{userInput.length}</div>
          <div className="text-xs text-[var(--text-muted)]">Digits</div>
        </div>
        <div className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] text-center">
          <div className="text-2xl font-mono font-bold">{formatTime(currentTime)}</div>
          <div className="text-xs text-[var(--text-muted)]">Time</div>
        </div>
        <div className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] text-center">
          <div className="text-2xl font-mono font-bold text-[var(--primary)]">{digitsPerMinute}</div>
          <div className="text-xs text-[var(--text-muted)]">DPM</div>
        </div>
        <div className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] text-center">
          <div className={`text-2xl font-mono font-bold ${accuracy >= 90 ? 'text-[var(--success)]' : accuracy >= 70 ? 'text-[var(--warning)]' : 'text-[var(--error)]'}`}>
            {accuracy}%
          </div>
          <div className="text-xs text-[var(--text-muted)]">Accuracy</div>
        </div>
      </div>

      {/* Reference display */}
      <div className="mb-4 p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
        <div className="text-xs text-[var(--text-muted)] mb-2">Reference (first 100 digits)</div>
        <div className="font-mono text-sm leading-relaxed tracking-wider overflow-x-auto">
          {digits.slice(0, 100).split('').map((digit, i) => (
            <span
              key={i}
              className={`
                ${i < userInput.length ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}
                ${i === userInput.length ? 'bg-[var(--primary)] text-white px-1 rounded' : ''}
              `}
            >
              {digit}
            </span>
          ))}
          {digits.length > 100 && <span className="text-[var(--text-muted)]">...</span>}
        </div>
      </div>

      {/* Input area */}
      <div className="flex-1 flex flex-col">
        <div className="text-xs text-[var(--text-muted)] mb-2">Type the digits:</div>
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInput}
          className="input font-mono text-2xl tracking-widest py-6"
          placeholder="Start typing..."
          autoFocus
        />
        
        {/* Visual feedback for input */}
        <div className="mt-4 flex-1 overflow-auto p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
          <div className="font-mono text-xl leading-loose tracking-widest">
            {userInput.split('').map((digit, i) => (
              <span key={i} className="digit-correct">{digit}</span>
            ))}
            <span className="digit-current animate-pulse">|</span>
          </div>
        </div>
      </div>

      {/* Mistakes */}
      {mistakes.length > 0 && (
        <div className="mt-4 text-sm text-[var(--text-muted)]">
          Mistakes at positions: {mistakes.slice(-5).map(m => m + 1).join(', ')}
          {mistakes.length > 5 && ` (+${mistakes.length - 5} more)`}
        </div>
      )}
    </div>
  );
}
