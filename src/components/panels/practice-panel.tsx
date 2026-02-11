'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { NUMBER_BANK, getDigitsOnly } from '@/data/numbers';
import { useWorkspaceStore } from '@/store/workspace-store';
import { updateProgress } from '@/utils/progress-utils';
import { RotateCcw, Play, Pause, Eye, EyeOff } from 'lucide-react';

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
  const [showReference, setShowReference] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Settings
  const [startDigit, setStartDigit] = useState(1);
  const [goalCount, setGoalCount] = useState(100);
  const [showSettings, setShowSettings] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const number = useMemo(() => {
    const builtIn = NUMBER_BANK.find(c => c.id === numberId);
    if (builtIn) return builtIn;
    return customNumbers.find(c => c.id === numberId);
  }, [numberId, customNumbers]);

  const fullDigits = useMemo(() => {
    if (!number) return '';
    return number ? getDigitsOnly(number) : '';
  }, [number]);

  const targetDigits = useMemo(() => {
    const start = Math.max(0, startDigit - 1);
    return fullDigits.slice(start, start + goalCount);
  }, [fullDigits, startDigit, goalCount]);

  // Adjust goal count if it exceeds available digits
  useEffect(() => {
    const maxAvailable = fullDigits.length - (startDigit - 1);
    if (goalCount > maxAvailable && maxAvailable > 0) {
      setGoalCount(maxAvailable);
    }
  }, [startDigit, fullDigits.length]);

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

  const saveStats = useCallback(() => {
    if (currentTime === 0 || userInput.length === 0) return;

    const durationSeconds = Math.max(1, Math.floor(currentTime / 1000));
    const dpm = Math.round((userInput.length / currentTime) * 60000);
    const accuracyVal = Math.round((userInput.length / (userInput.length + mistakes.length)) * 100) || 100;

    const newSession = {
      date: new Date().toISOString(),
      duration: durationSeconds,
      digitsTyped: userInput.length,
      accuracy: accuracyVal,
      dpm: dpm,
    };

    const storageKey = `stats-${numberId}`;
    try {
      const saved = localStorage.getItem(storageKey);
      let stats = saved ? JSON.parse(saved) : {
        sessions: [],
        totalDigitsTyped: 0,
        totalTime: 0,
        averageAccuracy: 0,
        averageDpm: 0,
        bestDpm: 0,
      };

      stats.sessions.push(newSession);
      stats.totalDigitsTyped += newSession.digitsTyped;
      stats.totalTime += newSession.duration;
      
      // Recalc averages
      stats.averageAccuracy = Math.round(
        stats.sessions.reduce((acc: number, s: any) => acc + s.accuracy, 0) / stats.sessions.length
      );
      stats.averageDpm = Math.round(
        stats.sessions.reduce((acc: number, s: any) => acc + s.dpm, 0) / stats.sessions.length
      );
      stats.bestDpm = Math.max(stats.bestDpm, dpm);

      localStorage.setItem(storageKey, JSON.stringify(stats));

      // Update progress and streak
      const durationSeconds = Math.floor(currentTime / 1000);
      updateProgress(numberId, {
        practiceTime: durationSeconds, // We'll store seconds consistently
        dpm: dpm,
        accuracy: accuracyVal,
      });
    } catch (err) {
      console.error('Failed to save stats:', err);
    }
  }, [currentTime, userInput.length, mistakes.length, numberId]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const newDigit = value[value.length - 1];
    const position = value.length - 1;

    // Start timer on first input
    if (!isActive && value.length === 1 && !isCompleted) {
      setIsActive(true);
      setStartTime(Date.now());
      setShowSettings(false); // Auto-hide settings on start
    }

    // Check if the new digit is correct
    if (newDigit && targetDigits[position] !== newDigit) {
      setMistakes(prev => [...prev, position]);
      return;
    }

    setUserInput(value);

    // Check completion
    if (value.length >= targetDigits.length) {
      setIsActive(false);
      setIsCompleted(true);
      // We need to trigger save here, but we need updated state. 
      // Since saving depends on currentTime which updates via interval, 
      // we'll trigger it in a useEffect or just pass current calculated time.
    }
  }, [isActive, targetDigits, isCompleted]);

  // Trigger save on completion
  useEffect(() => {
    if (isCompleted) {
      saveStats();
    }
  }, [isCompleted]); // saveStats is stable enough or we can omit it from deps if careful

  const reset = () => {
    setUserInput('');
    setIsActive(false);
    setStartTime(null);
    setCurrentTime(0);
    setMistakes([]);
    setIsCompleted(false);
    setShowSettings(true);
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const togglePause = () => {
    if (isCompleted) return;
    
    if (isActive) {
      setIsActive(false);
    } else {
      setIsActive(true);
      setShowSettings(false);
      if (!startTime) {
        setStartTime(Date.now());
      }
      inputRef.current?.focus();
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Practice Typing - {number.name}
        </h2>
        <div className="flex items-center gap-4">
          <button onClick={togglePause} className="btn btn-secondary" disabled={isCompleted}>
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button onClick={reset} className="btn btn-ghost">
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button 
            onClick={() => setShowReference(!showReference)} 
            className="btn btn-ghost"
            title={showReference ? "Hide reference" : "Show reference"}
          >
            {showReference ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showReference ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && !isActive && !isCompleted && (
        <div className="mb-6 p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] animate-fade-in">
          <div className="flex gap-6 items-end">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Start Digit</label>
              <input 
                type="number" 
                min="1" 
                max={fullDigits.length}
                value={startDigit}
                onChange={(e) => setStartDigit(Math.max(1, parseInt(e.target.value) || 1))}
                className="input w-24"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Goal (Digits)</label>
              <input 
                type="number" 
                min="1" 
                max={MAX_GOAL}
                value={goalCount}
                onChange={(e) => setGoalCount(Math.max(1, parseInt(e.target.value) || 10))}
                className="input w-24"
              />
            </div>
            <div className="text-sm text-[var(--text-muted)] pb-2">
              Practicing digits {startDigit} to {Math.min(fullDigits.length, startDigit + goalCount - 1)}
            </div>
          </div>
        </div>
      )}

      {/* Completion Banner */}
      {isCompleted && (
        <div className="mb-6 p-6 bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-xl text-center animate-scale-in">
          <h3 className="text-2xl font-bold text-[var(--success)] mb-2">Goal Reached!</h3>
          <p className="text-[var(--text-muted)] mb-4">Great job! Session saved to statistics.</p>
          <div className="flex justify-center gap-8">
            <div>
              <div className="text-2xl font-mono font-bold">{digitsPerMinute}</div>
              <div className="text-xs uppercase tracking-wider opacity-70">DPM</div>
            </div>
            <div>
              <div className="text-2xl font-mono font-bold">{accuracy}%</div>
              <div className="text-xs uppercase tracking-wider opacity-70">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-mono font-bold">{formatTime(currentTime)}</div>
              <div className="text-xs uppercase tracking-wider opacity-70">Time</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] text-center">
          <div className="text-2xl font-mono font-bold">{userInput.length} / {targetDigits.length}</div>
          <div className="text-xs text-[var(--text-muted)]">Progress</div>
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
      {showReference && !isCompleted && (
        <div className="mb-4 p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
          <div className="text-xs text-[var(--text-muted)] mb-2">Reference</div>
          <div className="font-mono text-sm leading-relaxed tracking-wider overflow-x-auto whitespace-nowrap">
            {targetDigits.split('').map((digit, i) => (
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
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="text-xs text-[var(--text-muted)] mb-2">Type the digits:</div>
        
        {!isCompleted ? (
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInput}
            className="input font-mono text-2xl tracking-widest py-6 mb-4"
            placeholder={isActive ? "Type..." : "Press Start or type to begin"}
            autoFocus
            disabled={isCompleted}
          />
        ) : (
           <div className="input font-mono text-2xl tracking-widest py-6 mb-4 bg-[var(--surface-hover)] opacity-50 cursor-not-allowed">
             {userInput}
           </div>
        )}
        
        {/* Visual feedback for input */}
        <div className="flex-1 overflow-auto p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
          <div className="font-mono text-xl leading-loose tracking-widest break-words">
             {/* Show typed digits */}
            {userInput.split('').map((digit, i) => (
              <span key={i} className="text-[var(--success)]">{digit}</span>
            ))}
            {/* Cursor */}
            {!isCompleted && <span className="text-[var(--primary)] animate-pulse">|</span>}
            {/* Show remaining digits ghosted */}
            <span className="text-[var(--text-muted)] opacity-30">
              {targetDigits.slice(userInput.length)}
            </span>
          </div>
        </div>
      </div>

      {/* Mistakes */}
      {mistakes.length > 0 && (
        <div className="mt-4 text-sm text-[var(--error)]">
          {mistakes.length} mistakes made
        </div>
      )}
    </div>
  );
}

const MAX_GOAL = 1000;
