'use client';

import { useState, useEffect, useMemo } from 'react';
import { NUMBER_BANK } from '@/data/numbers';
import { useWorkspaceStore } from '@/store/workspace-store';
import { Trophy, Flame, Target, Star, Eye, Brain, Zap, Award, Crown, Sparkles } from 'lucide-react';

interface AchievementsPanelProps {
  numberId: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'digits' | 'streak' | 'mastery' | 'exploration';
  check: (ctx: AchievementContext) => boolean;
}

interface AchievementContext {
  allProgress: Record<string, ProgressData>;
  panelTypesOpened: string[];
}

interface ProgressData {
  digitsLearned: number;
  currentStreak: number;
  bestStreak: number;
  totalPracticeTime: number;
  lastPracticeDate: string | null;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Learn 10 digits of any number',
    icon: <Target className="w-6 h-6" />,
    category: 'digits',
    check: (ctx) => Object.values(ctx.allProgress).some(p => p.digitsLearned >= 10),
  },
  {
    id: 'half-century',
    name: 'Half Century',
    description: 'Learn 50 digits of any number',
    icon: <Star className="w-6 h-6" />,
    category: 'digits',
    check: (ctx) => Object.values(ctx.allProgress).some(p => p.digitsLearned >= 50),
  },
  {
    id: 'century-club',
    name: 'Century Club',
    description: 'Learn 100 digits of any number',
    icon: <Trophy className="w-6 h-6" />,
    category: 'digits',
    check: (ctx) => Object.values(ctx.allProgress).some(p => p.digitsLearned >= 100),
  },
  {
    id: 'pi-pioneer',
    name: 'Pi Pioneer',
    description: 'Learn 50 digits of Pi',
    icon: <Award className="w-6 h-6" />,
    category: 'digits',
    check: (ctx) => (ctx.allProgress['pi']?.digitsLearned ?? 0) >= 50,
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Maintain a 3-day streak',
    icon: <Flame className="w-6 h-6" />,
    category: 'streak',
    check: (ctx) => Object.values(ctx.allProgress).some(p => p.bestStreak >= 3),
  },
  {
    id: 'committed',
    name: 'Committed',
    description: 'Maintain a 7-day streak',
    icon: <Flame className="w-6 h-6" />,
    category: 'streak',
    check: (ctx) => Object.values(ctx.allProgress).some(p => p.bestStreak >= 7),
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Maintain a 30-day streak',
    icon: <Crown className="w-6 h-6" />,
    category: 'streak',
    check: (ctx) => Object.values(ctx.allProgress).some(p => p.bestStreak >= 30),
  },
  {
    id: 'perfect-recall',
    name: 'Perfect Recall',
    description: 'Score 100% on a recall test',
    icon: <Brain className="w-6 h-6" />,
    category: 'mastery',
    check: (ctx) => {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('perfect-recall-achieved') : null;
      return saved === 'true';
    },
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Open 5 different panel types',
    icon: <Eye className="w-6 h-6" />,
    category: 'exploration',
    check: (ctx) => ctx.panelTypesOpened.length >= 5,
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Open all panel types at least once',
    icon: <Sparkles className="w-6 h-6" />,
    category: 'exploration',
    check: (ctx) => ctx.panelTypesOpened.length >= 13,
  },
];

function getAchievementContext(): AchievementContext {
  const allProgress: Record<string, ProgressData> = {};
  
  // Gather progress for all numbers
  const allIds = [...NUMBER_BANK.map(c => c.id)];
  // Also check for custom numbers
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('progress-')) {
      const id = key.replace('progress-', '');
      if (!allIds.includes(id)) allIds.push(id);
    }
  }
  
  for (const id of allIds) {
    const saved = localStorage.getItem(`progress-${id}`);
    if (saved) {
      try {
        allProgress[id] = JSON.parse(saved);
      } catch { /* ignore */ }
    }
  }

  // Panel types opened
  const panelTypesOpenedRaw = localStorage.getItem('panel-types-opened');
  const panelTypesOpened: string[] = panelTypesOpenedRaw ? JSON.parse(panelTypesOpenedRaw) : [];

  return { allProgress, panelTypesOpened };
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  digits: { label: '🔢 Digit Milestones', color: 'var(--primary)' },
  streak: { label: '🔥 Streaks', color: 'var(--warning)' },
  mastery: { label: '🧠 Mastery', color: 'var(--success)' },
  exploration: { label: '🗺️ Exploration', color: 'var(--info, var(--primary))' },
};

export function AchievementsPanel({ numberId }: AchievementsPanelProps) {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [prevUnlocked, setPrevUnlocked] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load previously unlocked
    const saved = localStorage.getItem('achievements-unlocked');
    const prev = saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
    setPrevUnlocked(prev);

    // Check current state
    const ctx = getAchievementContext();
    const nowUnlocked = new Set<string>();
    
    for (const achievement of ACHIEVEMENTS) {
      if (achievement.check(ctx)) {
        nowUnlocked.add(achievement.id);
      }
    }
    
    setUnlockedIds(nowUnlocked);

    // Save newly unlocked
    const newlyUnlocked = [...nowUnlocked].filter(id => !prev.has(id));
    if (newlyUnlocked.length > 0) {
      localStorage.setItem('achievements-unlocked', JSON.stringify([...nowUnlocked]));
      // Dispatch event for toast notifications
      for (const id of newlyUnlocked) {
        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        if (achievement) {
          window.dispatchEvent(new CustomEvent('achievement-unlocked', { 
            detail: { id: achievement.id, name: achievement.name, description: achievement.description } 
          }));
        }
      }
    }
  }, []);

  const unlockedCount = unlockedIds.size;
  const totalCount = ACHIEVEMENTS.length;

  const categories = useMemo(() => {
    const grouped: Record<string, Achievement[]> = {};
    for (const a of ACHIEVEMENTS) {
      if (!grouped[a.category]) grouped[a.category] = [];
      grouped[a.category].push(a);
    }
    return grouped;
  }, []);

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Achievements</h2>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[var(--primary)]/20 text-[var(--primary)] rounded-full text-sm font-mono">
            {unlockedCount} / {totalCount}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-3 bg-[var(--surface)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--success)] transition-all duration-700"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Achievement categories */}
      <div className="space-y-8">
        {Object.entries(categories).map(([category, achievements]) => {
          const catInfo = CATEGORY_LABELS[category] || { label: category, color: 'var(--primary)' };
          
          return (
            <div key={category}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                {catInfo.label}
              </h3>
              <div className="space-y-3">
                {achievements.map(achievement => {
                  const isUnlocked = unlockedIds.has(achievement.id);
                  const isNew = isUnlocked && !prevUnlocked.has(achievement.id);
                  
                  return (
                    <div
                      key={achievement.id}
                      className={`
                        p-4 rounded-lg border transition-all duration-300
                        ${isUnlocked 
                          ? 'bg-[var(--success)]/10 border-[var(--success)]' 
                          : 'bg-[var(--surface)] border-[var(--border)] opacity-60'
                        }
                        ${isNew ? 'ring-2 ring-[var(--success)] animate-pulse' : ''}
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`
                          p-2 rounded-lg
                          ${isUnlocked 
                            ? 'bg-[var(--success)]/20 text-[var(--success)]' 
                            : 'bg-[var(--surface-hover)] text-[var(--text-muted)]'
                          }
                        `}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isUnlocked ? 'text-[var(--success)]' : ''}`}>
                              {achievement.name}
                            </span>
                            {isUnlocked && <span className="text-[var(--success)]">✓</span>}
                            {isNew && (
                              <span className="px-2 py-0.5 text-xs bg-[var(--success)]/20 text-[var(--success)] rounded-full animate-fade-in">
                                NEW
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-[var(--text-muted)]">
                            {achievement.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
