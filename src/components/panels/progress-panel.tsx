'use client';

import { useState, useMemo, useEffect } from 'react';
import { MATH_CONSTANTS, getDigitsOnly } from '@/data/numbers';
import { useWorkspaceStore } from '@/store/workspace-store';
import { TrendingUp, Edit2, Check, Flame, Target } from 'lucide-react';

interface ProgressPanelProps {
  numberId: string;
}

interface ProgressData {
  digitsLearned: number;
  currentStreak: number;
  bestStreak: number;
  totalPracticeTime: number;
  lastPracticeDate: string | null;
  chunksmastered: number[];
  customTarget?: number;
}

export function ProgressPanel({ numberId }: ProgressPanelProps) {
  const { customNumbers } = useWorkspaceStore();
  const [progress, setProgress] = useState<ProgressData>({
    digitsLearned: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalPracticeTime: 0,
    lastPracticeDate: null,
    chunksmastered: [],
    customTarget: undefined,
  });
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState('');

  const number = useMemo(() => {
    const builtIn = MATH_CONSTANTS.find(c => c.id === numberId);
    if (builtIn) return builtIn;
    return customNumbers.find(c => c.id === numberId);
  }, [numberId, customNumbers]);

  const storageKey = `progress-${numberId}`;

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setProgress(JSON.parse(saved));
    }
  }, [storageKey]);

  // Calculate streak
  const isActiveToday = useMemo(() => {
    if (!progress.lastPracticeDate) return false;
    const today = new Date().toDateString();
    return progress.lastPracticeDate === today;
  }, [progress.lastPracticeDate]);

  if (!number) {
    return <div className="text-[var(--text-muted)]">Number not found</div>;
  }

  const totalDigits = number ? getDigitsOnly(number).length : 1000;

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          Progress - {number.name}
        </h2>
        <div className="flex items-center gap-2">
          {isActiveToday && (
            <span className="px-3 py-1 bg-[var(--success)]/20 text-[var(--success)] rounded-full text-sm">
              Active today ✓
            </span>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <div className="text-3xl font-bold font-mono">{progress.digitsLearned}</div>
          <div className="text-sm text-[var(--text-muted)]">Digits Learned</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[var(--warning)]/20 flex items-center justify-center">
            <Flame className="w-6 h-6 text-[var(--warning)]" />
          </div>
          <div className="text-3xl font-bold font-mono">{progress.currentStreak}</div>
          <div className="text-sm text-[var(--text-muted)]">Day Streak</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[var(--success)]/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[var(--success)]" />
          </div>
          <div className="text-3xl font-bold font-mono">{progress.bestStreak}</div>
          <div className="text-sm text-[var(--text-muted)]">Best Streak</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <div className="text-3xl font-bold font-mono">
            {Math.round((progress.digitsLearned / totalDigits) * 100)}%
          </div>
          <div className="text-sm text-[var(--text-muted)]">Complete</div>
        </div>
      </div>

      {/* Custom Target */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold">Your Target</h3>
          {isEditingTarget ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={totalDigits}
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                className="input w-24 py-1"
                placeholder="100"
                autoFocus
              />
              <button
                onClick={() => {
                  const target = Math.min(Math.max(1, parseInt(targetInput) || 100), totalDigits);
                  const newProgress = { ...progress, customTarget: target };
                  setProgress(newProgress);
                  localStorage.setItem(storageKey, JSON.stringify(newProgress));
                  setIsEditingTarget(false);
                }}
                className="btn btn-primary p-1"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTargetInput(String(progress.customTarget || 100));
                setIsEditingTarget(true);
              }}
              className="btn btn-ghost p-1"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {progress.customTarget ? (
          <>
            <div className="flex justify-between text-sm text-[var(--text-muted)] mb-2">
              <span>Progress to target</span>
              <span>{progress.digitsLearned} / {progress.customTarget} digits</span>
            </div>
            <div className="h-6 bg-[var(--surface)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--success)] transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${Math.min(100, (progress.digitsLearned / progress.customTarget) * 100)}%` }}
              >
                {progress.digitsLearned >= progress.customTarget && (
                  <span className="text-xs font-bold">🎉</span>
                )}
              </div>
            </div>
            {progress.digitsLearned >= progress.customTarget && (
              <div className="mt-2 text-center text-[var(--success)] font-medium animate-fade-in">
                🎉 Target reached! Set a new goal to keep going!
              </div>
            )}
          </>
        ) : (
          <div className="p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] text-center text-[var(--text-muted)]">
            Set a custom target to track your goal!
          </div>
        )}
      </div>

      {/* Overall Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-[var(--text-muted)] mb-2">
          <span>Overall Progress</span>
          <span>{progress.digitsLearned} / {totalDigits} digits</span>
        </div>
        <div className="h-4 bg-[var(--surface)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--success)] transition-all duration-500"
            style={{ width: `${Math.min(100, (progress.digitsLearned / totalDigits) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
