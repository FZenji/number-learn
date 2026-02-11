'use client';

import { useState, useMemo, useEffect } from 'react';
import { NUMBER_BANK } from '@/data/numbers';
import { useWorkspaceStore } from '@/store/workspace-store';
import { BarChart3, Clock, Target, Zap } from 'lucide-react';

interface StatisticsPanelProps {
  numberId: string;
}

interface SessionRecord {
  date: string;
  duration: number;
  digitsTyped: number;
  accuracy: number;
  dpm: number;
}

interface StatsData {
  sessions: SessionRecord[];
  totalDigitsTyped: number;
  totalTime: number;
  averageAccuracy: number;
  averageDpm: number;
  bestDpm: number;
}

export function StatisticsPanel({ numberId }: StatisticsPanelProps) {
  const { customNumbers } = useWorkspaceStore();
  const [stats, setStats] = useState<StatsData>({
    sessions: [],
    totalDigitsTyped: 0,
    totalTime: 0,
    averageAccuracy: 0,
    averageDpm: 0,
    bestDpm: 0,
  });

  const number = useMemo(() => {
    const builtIn = NUMBER_BANK.find(c => c.id === numberId);
    if (builtIn) return builtIn;
    return customNumbers.find(c => c.id === numberId);
  }, [numberId, customNumbers]);

  const storageKey = `stats-${numberId}`;

  // Load stats
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setStats(JSON.parse(saved));
    }
    // No fake data generation - start with empty state
  }, [storageKey]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const maxDigits = Math.max(...stats.sessions.map(s => s.digitsTyped), 1);

  if (!number) {
    return <div className="text-[var(--text-muted)]">Number not found</div>;
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          Statistics - {number.name}
        </h2>
      </div>

      {/* Empty state */}
      {stats.sessions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 mb-6 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Statistics Yet</h3>
          <p className="text-[var(--text-muted)] text-center max-w-sm mb-6">
            Start practicing to see your statistics here. Use the Practice panel to begin your learning journey.
          </p>
          <div className="text-sm text-[var(--text-muted)]">
            Press <span className="kbd mx-1">T</span> then select <strong>Practice</strong> to begin
          </div>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
                <span className="text-sm text-[var(--text-muted)]">Total Digits</span>
              </div>
              <div className="text-2xl font-bold font-mono">{stats.totalDigitsTyped.toLocaleString()}</div>
            </div>
            
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-[var(--primary)]" />
                <span className="text-sm text-[var(--text-muted)]">Total Time</span>
              </div>
              <div className="text-2xl font-bold">{formatDuration(stats.totalTime)}</div>
            </div>
            
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-[var(--success)]" />
                <span className="text-sm text-[var(--text-muted)]">Avg Accuracy</span>
              </div>
              <div className="text-2xl font-bold text-[var(--success)]">{stats.averageAccuracy}%</div>
            </div>
            
            <div className="card">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-[var(--warning)]" />
                <span className="text-sm text-[var(--text-muted)]">Best DPM</span>
              </div>
              <div className="text-2xl font-bold text-[var(--warning)]">{stats.bestDpm}</div>
            </div>
          </div>

          {/* Chart - simple bar chart */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Last 7 Days</h3>
            <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-4">
              <div className="flex items-end justify-between gap-2 h-40">
                {stats.sessions.map((session, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-[var(--primary)] rounded-t transition-all hover:bg-[var(--primary-hover)]"
                      style={{ 
                        height: `${(session.digitsTyped / maxDigits) * 100}%`,
                        minHeight: '4px',
                      }}
                      title={`${session.digitsTyped} digits`}
                    />
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(session.date).toLocaleDateString('en', { weekday: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between text-sm text-[var(--text-muted)]">
                <span>Digits typed per day</span>
                <span>Avg: {stats.averageDpm} DPM</span>
              </div>
            </div>
          </div>

          {/* Session history */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Session History</h3>
            <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left p-3 text-[var(--text-muted)] font-medium">Date</th>
                    <th className="text-right p-3 text-[var(--text-muted)] font-medium">Duration</th>
                    <th className="text-right p-3 text-[var(--text-muted)] font-medium">Digits</th>
                    <th className="text-right p-3 text-[var(--text-muted)] font-medium">Accuracy</th>
                    <th className="text-right p-3 text-[var(--text-muted)] font-medium">DPM</th>
                  </tr>
                </thead>
                <tbody>
                  {[...stats.sessions].reverse().map((session, i) => (
                    <tr key={i} className="border-b border-[var(--border)] last:border-0">
                      <td className="p-3">{new Date(session.date).toLocaleDateString()}</td>
                      <td className="p-3 text-right font-mono">{formatDuration(session.duration)}</td>
                      <td className="p-3 text-right font-mono">{session.digitsTyped}</td>
                      <td className="p-3 text-right font-mono">
                        <span className={session.accuracy >= 90 ? 'text-[var(--success)]' : ''}>
                          {session.accuracy}%
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono">
                        <span className={session.dpm === stats.bestDpm ? 'text-[var(--warning)]' : ''}>
                          {session.dpm}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
